import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WorkflowStatus = Database['public']['Enums']['workflow_status'];
type ApprovalStatus = Database['public']['Enums']['approval_status'];

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'conditional' | 'parallel' | 'loop' | 'event';
  role?: string;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  // Enhanced workflow pattern support
  parallel_steps?: WorkflowStep[]; // For parallel execution
  loop_config?: {
    max_iterations: number;
    condition: { field: string; operator: string; value: any };
  };
  event_config?: {
    event_type: string;
    timeout_hours?: number;
  };
  depends_on?: string[]; // Step dependencies
  // Failure handling configuration
  failure_config?: {
    retry_attempts?: number;
    retry_delay_minutes?: number;
    on_failure: 'terminate' | 'continue' | 'escalate' | 'alternate_path';
    alternate_step_id?: string; // For alternate_path option
    escalation_role?: string; // For escalate option
  };
  // Approval specific failure handling
  approval_config?: {
    on_rejection: 'terminate' | 'escalate' | 'alternate_path' | 'continue';
    alternate_step_id?: string;
    escalation_role?: string;
    require_rejection_reason?: boolean;
  };
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  type: string;
  definition: {
    steps: WorkflowStep[];
    execution_mode?: 'sequential' | 'parallel' | 'conditional' | 'hybrid';
    global_timeout_hours?: number;
  };
}

export class WorkflowEngine {
  async executeWorkflow(workflowId: string): Promise<void> {
    console.log(`Starting workflow execution for: ${workflowId}`);
    
    try {
      // Get workflow details
      const { data: workflow, error: workflowError } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (workflowError || !workflow) {
        throw new Error(`Failed to fetch workflow: ${workflowError?.message}`);
      }

      // Set SLA deadline if not already set
      await this.setSLADeadline(workflow);

      // Get workflow template
      const template = await this.getWorkflowTemplate(workflow.workflow_type);
      if (!template) {
        throw new Error(`No template found for workflow type: ${workflow.workflow_type}`);
      }

      // Update workflow status to in_progress
      await this.updateWorkflowStatus(workflowId, 'in_progress');

      // Process each step
      await this.processWorkflowSteps(workflow, template);

      console.log(`Workflow ${workflowId} execution completed`);
    } catch (error) {
      console.error('Workflow execution failed:', error);
      await this.updateWorkflowStatus(workflowId, 'failed');
      await this.logWorkflowEvent(workflowId, null, 'execution_failed', 'system', { error: (error as Error).message });
    }
  }

  private async setSLADeadline(workflow: any): Promise<void> {
    // Skip if SLA deadline is already set
    if (workflow.sla_deadline) return;

    try {
      // Get SLA configuration for this workflow type
      const { data: slaConfig, error } = await supabase
        .from('workflow_sla_config')
        .select('sla_hours')
        .eq('workflow_type', workflow.workflow_type)
        .eq('step_type', 'approval')
        .single();

      if (error || !slaConfig) {
        console.log(`No SLA config found for ${workflow.workflow_type}, using default 24 hours`);
        // Use default 24 hours if no config found
        const deadline = new Date(workflow.created_at);
        deadline.setHours(deadline.getHours() + 24);
        
        await supabase
          .from('workflow_executions')
          .update({ 
            sla_deadline: deadline.toISOString(),
            sla_status: 'on_time'
          })
          .eq('id', workflow.id);
        return;
      }

      // Set deadline based on SLA configuration
      const deadline = new Date(workflow.created_at);
      deadline.setHours(deadline.getHours() + slaConfig.sla_hours);

      await supabase
        .from('workflow_executions')
        .update({ 
          sla_deadline: deadline.toISOString(),
          sla_status: 'on_time'
        })
        .eq('id', workflow.id);

      console.log(`SLA deadline set for workflow ${workflow.id}: ${deadline.toISOString()}`);
    } catch (error) {
      console.error('Error setting SLA deadline:', error);
    }
  }

  private async getWorkflowTemplate(workflowType: string): Promise<WorkflowTemplate | null> {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('type', workflowType)
      .eq('active', true)
      .single();

    if (error || !data) {
      console.error('Template fetch error:', error);
      return null;
    }

    const template: WorkflowTemplate = {
      id: data.id,
      name: data.name,
      type: data.type,
      definition: {
        steps: (data.definition as any)?.steps || [],
        execution_mode: (data.definition as any)?.execution_mode || 'sequential',
        global_timeout_hours: (data.definition as any)?.global_timeout_hours
      }
    };

    return template;
  }

  private async processWorkflowSteps(workflow: any, template: WorkflowTemplate): Promise<void> {
    const steps = template.definition.steps;
    const executionMode = template.definition.execution_mode || 'sequential';
    
    switch (executionMode) {
      case 'parallel':
        await this.processParallelSteps(workflow, steps);
        break;
      case 'conditional':
        await this.processConditionalSteps(workflow, steps);
        break;
      case 'hybrid':
        await this.processHybridSteps(workflow, steps);
        break;
      default:
        await this.processSequentialSteps(workflow, steps);
    }
  }

  private async processSequentialSteps(workflow: any, steps: WorkflowStep[]): Promise<void> {
    for (const step of steps) {
      console.log(`Processing step: ${step.id} for workflow: ${workflow.id}`);
      
      if (!this.evaluateStepConditions(step, workflow.request_data)) {
        console.log(`Step ${step.id} conditions not met, skipping`);
        continue;
      }

      await this.processStep(workflow, step);
    }
  }

  private async processParallelSteps(workflow: any, steps: WorkflowStep[]): Promise<void> {
    const parallelPromises = steps
      .filter(step => this.evaluateStepConditions(step, workflow.request_data))
      .map(step => this.processStep(workflow, step));
    
    await Promise.all(parallelPromises);
  }

  private async processConditionalSteps(workflow: any, steps: WorkflowStep[]): Promise<void> {
    for (const step of steps) {
      if (this.evaluateStepConditions(step, workflow.request_data)) {
        console.log(`Conditional step ${step.id} conditions met, executing`);
        await this.processStep(workflow, step);
        break; // Execute only first matching condition
      }
    }
  }

  private async processHybridSteps(workflow: any, steps: WorkflowStep[]): Promise<void> {
    // Group steps by dependencies and parallel groups
    const stepGroups = this.groupStepsByDependencies(steps);
    
    for (const group of stepGroups) {
      if (group.length === 1) {
        const step = group[0];
        if (this.evaluateStepConditions(step, workflow.request_data)) {
          await this.processStep(workflow, step);
        }
      } else {
        // Process parallel group
        const parallelPromises = group
          .filter(step => this.evaluateStepConditions(step, workflow.request_data))
          .map(step => this.processStep(workflow, step));
        
        await Promise.all(parallelPromises);
      }
    }
  }

  private groupStepsByDependencies(steps: WorkflowStep[]): WorkflowStep[][] {
    // Simple grouping logic - can be enhanced based on dependencies
    const groups: WorkflowStep[][] = [];
    let currentGroup: WorkflowStep[] = [];
    
    for (const step of steps) {
      if (step.type === 'parallel' || (step.parallel_steps && step.parallel_steps.length > 0)) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
          currentGroup = [];
        }
        groups.push(step.parallel_steps || [step]);
      } else {
        currentGroup.push(step);
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }

  private evaluateStepConditions(step: WorkflowStep, requestData: any): boolean {
    if (!step.conditions || step.conditions.length === 0) {
      return true;
    }

    return step.conditions.every(condition => {
      const fieldValue = requestData[condition.field];
      const conditionValue = condition.value;

      switch (condition.operator) {
        case '>':
          return Number(fieldValue) > Number(conditionValue);
        case '<':
          return Number(fieldValue) < Number(conditionValue);
        case '>=':
          return Number(fieldValue) >= Number(conditionValue);
        case '<=':
          return Number(fieldValue) <= Number(conditionValue);
        case '==':
        case '=':
          return fieldValue == conditionValue;
        case '!=':
          return fieldValue != conditionValue;
        default:
          return true;
      }
    });
  }

  private async processStep(workflow: any, step: WorkflowStep): Promise<void> {
    try {
      await this.executeStepWithRetry(workflow, step);
    } catch (error) {
      console.error(`Step ${step.id} failed:`, error);
      await this.handleStepFailure(workflow, step, error as Error);
    }
  }

  private async executeStepWithRetry(workflow: any, step: WorkflowStep): Promise<void> {
    const maxRetries = step.failure_config?.retry_attempts || 0;
    const retryDelay = step.failure_config?.retry_delay_minutes || 5;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        switch (step.type) {
          case 'approval':
            await this.createApprovalTask(workflow, step);
            break;
          case 'notification':
            await this.createNotificationTask(workflow, step);
            break;
          case 'conditional':
            break;
          case 'parallel':
            await this.processParallelStep(workflow, step);
            break;
          case 'loop':
            await this.processLoopStep(workflow, step);
            break;
          case 'event':
            await this.processEventStep(workflow, step);
            break;
          default:
            console.log(`Unknown step type: ${step.type}`);
        }
        return; // Success, no need to retry
      } catch (error) {
        if (attempt < maxRetries) {
          console.log(`Step ${step.id} failed, retrying in ${retryDelay} minutes (attempt ${attempt + 1}/${maxRetries + 1})`);
          await this.logWorkflowEvent(
            workflow.id,
            step.id,
            'step_retry',
            'system',
            { attempt: attempt + 1, max_retries: maxRetries + 1, error: (error as Error).message }
          );
          // In a real implementation, you'd want to schedule the retry
          // For now, we'll just wait briefly and continue
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error; // Max retries exceeded
        }
      }
    }
  }

  private async handleStepFailure(workflow: any, step: WorkflowStep, error: Error): Promise<void> {
    const failureAction = step.failure_config?.on_failure || 'terminate';

    await this.logWorkflowEvent(
      workflow.id,
      step.id,
      'step_failed',
      'system',
      { 
        step_name: step.name, 
        error: error.message, 
        failure_action: failureAction 
      }
    );

    switch (failureAction) {
      case 'terminate':
        await this.updateWorkflowStatus(workflow.id, 'failed');
        await this.logWorkflowEvent(workflow.id, null, 'workflow_terminated', 'system', { 
          reason: 'Step failure', 
          failed_step: step.id 
        });
        break;

      case 'continue':
        console.log(`Continuing workflow despite step ${step.id} failure`);
        break;

      case 'escalate':
        await this.escalateStepFailure(workflow, step, error);
        break;

      case 'alternate_path':
        await this.executeAlternatePath(workflow, step);
        break;
    }
  }

  private async escalateStepFailure(workflow: any, step: WorkflowStep, error: Error): Promise<void> {
    const escalationRole = step.failure_config?.escalation_role || 'admin';

    // Create escalation record
    const escalationData = {
      workflow_id: workflow.id,
      escalated_from: 'system',
      escalated_to: escalationRole,
      escalation_reason: `Step failure: ${error.message}`,
      status: 'pending'
    };

    await supabase.from('workflow_escalations').insert(escalationData);

    // Create escalation task
    const taskData = {
      workflow_id: workflow.id,
      step_id: step.id,
      task_type: 'escalation',
      assigned_role: escalationRole,
      status: 'pending',
      priority: 2,
      data: {
        step_name: step.name,
        error_message: error.message,
        original_step_id: step.id,
        workflow_name: workflow.workflow_name
      }
    };

    await supabase.from('workflow_tasks').insert(taskData);

    await this.logWorkflowEvent(
      workflow.id,
      step.id,
      'step_escalated',
      'system',
      { escalated_to: escalationRole, reason: error.message }
    );
  }

  private async executeAlternatePath(workflow: any, step: WorkflowStep): Promise<void> {
    const alternateStepId = step.failure_config?.alternate_step_id;
    if (!alternateStepId) {
      console.warn(`No alternate path defined for step ${step.id}`);
      return;
    }

    // Get workflow template to find alternate step
    const template = await this.getWorkflowTemplate(workflow.workflow_type);
    if (!template) return;

    const alternateStep = this.findStepById(template.definition.steps, alternateStepId);
    if (alternateStep) {
      await this.logWorkflowEvent(
        workflow.id,
        step.id,
        'alternate_path_executed',
        'system',
        { alternate_step_id: alternateStepId }
      );
      await this.processStep(workflow, alternateStep);
    }
  }

  private findStepById(steps: WorkflowStep[], stepId: string): WorkflowStep | null {
    for (const step of steps) {
      if (step.id === stepId) return step;
      if (step.parallel_steps) {
        const found = this.findStepById(step.parallel_steps, stepId);
        if (found) return found;
      }
    }
    return null;
  }

  private async processParallelStep(workflow: any, step: WorkflowStep): Promise<void> {
    if (step.parallel_steps && step.parallel_steps.length > 0) {
      const parallelPromises = step.parallel_steps.map(parallelStep => 
        this.processStep(workflow, parallelStep)
      );
      await Promise.all(parallelPromises);
    }
    
    await this.logWorkflowEvent(
      workflow.id,
      step.id,
      'parallel_step_completed',
      'system',
      { step_name: step.name, parallel_count: step.parallel_steps?.length || 0 }
    );
  }

  private async processLoopStep(workflow: any, step: WorkflowStep): Promise<void> {
    const loopConfig = step.loop_config;
    if (!loopConfig) return;

    let iteration = 0;
    let shouldContinue = true;

    while (shouldContinue && iteration < loopConfig.max_iterations) {
      iteration++;
      console.log(`Loop step ${step.id} - iteration ${iteration}`);

      // Process the loop content (could be sub-steps)
      await this.logWorkflowEvent(
        workflow.id,
        step.id,
        'loop_iteration',
        'system',
        { iteration, step_name: step.name }
      );

      // Check loop condition
      shouldContinue = this.evaluateStepConditions(
        { ...step, conditions: [loopConfig.condition] },
        workflow.request_data
      );
    }

    await this.logWorkflowEvent(
      workflow.id,
      step.id,
      'loop_completed',
      'system',
      { total_iterations: iteration, step_name: step.name }
    );
  }

  private async processEventStep(workflow: any, step: WorkflowStep): Promise<void> {
    const eventConfig = step.event_config;
    if (!eventConfig) return;

    // Create event waiting task
    const taskData = {
      workflow_id: workflow.id,
      step_id: step.id,
      task_type: 'event_wait',
      status: 'pending',
      priority: 1,
      data: {
        step_name: step.name,
        event_type: eventConfig.event_type,
        timeout_hours: eventConfig.timeout_hours || 24,
        workflow_name: workflow.workflow_name
      },
      deadline: eventConfig.timeout_hours ? 
        new Date(Date.now() + eventConfig.timeout_hours * 60 * 60 * 1000).toISOString() : 
        null
    };

    const { error } = await supabase
      .from('workflow_tasks')
      .insert(taskData);

    if (error) {
      console.error('Failed to create event task:', error);
    }

    await this.logWorkflowEvent(
      workflow.id,
      step.id,
      'event_wait_created',
      'system',
      { event_type: eventConfig.event_type, step_name: step.name }
    );
  }

  private async createApprovalTask(workflow: any, step: WorkflowStep): Promise<void> {
    const approvalData = {
      workflow_id: workflow.id,
      step_id: step.id,
      step_name: step.name,
      approver_role: step.role || 'manager',
      status: 'pending' as ApprovalStatus,
      order_sequence: 1,
      assigned_at: new Date().toISOString()
    };

    const { error: approvalError } = await supabase
      .from('workflow_approvals')
      .insert(approvalData);

    if (approvalError) {
      throw new Error(`Failed to create approval task: ${approvalError.message}`);
    }

    const taskData = {
      workflow_id: workflow.id,
      step_id: step.id,
      task_type: 'approval',
      assigned_role: step.role || 'manager',
      status: 'pending',
      priority: 1,
      data: {
        step_name: step.name,
        workflow_name: workflow.workflow_name,
        request_data: workflow.request_data
      }
    };

    const { error: taskError } = await supabase
      .from('workflow_tasks')
      .insert(taskData);

    if (taskError) {
      console.error('Failed to create task:', taskError);
    }

    await this.logWorkflowEvent(
      workflow.id,
      step.id,
      'approval_task_created',
      'system',
      { approver_role: step.role, step_name: step.name }
    );
  }

  private async createNotificationTask(workflow: any, step: WorkflowStep): Promise<void> {
    const taskData = {
      workflow_id: workflow.id,
      step_id: step.id,
      task_type: 'notification',
      status: 'completed',
      priority: 1,
      data: {
        step_name: step.name,
        workflow_name: workflow.workflow_name,
        message: `Workflow ${workflow.workflow_name} has been processed`
      },
      completed_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('workflow_tasks')
      .insert(taskData);

    if (error) {
      console.error('Failed to create notification task:', error);
    }

    await this.logWorkflowEvent(
      workflow.id,
      step.id,
      'notification_sent',
      'system',
      { step_name: step.name }
    );
  }

  async processApproval(approvalId: string, decision: 'approved' | 'rejected', approverId: string, comments?: string): Promise<void> {
    console.log(`Processing approval: ${approvalId}, decision: ${decision}`);

    try {
      const { data: approval, error: updateError } = await supabase
        .from('workflow_approvals')
        .update({
          status: decision as ApprovalStatus,
          approver_id: approverId,
          approved_at: new Date().toISOString(),
          rejection_reason: decision === 'rejected' ? comments : null
        })
        .eq('id', approvalId)
        .select('*')
        .single();

      if (updateError || !approval) {
        throw new Error(`Failed to update approval: ${updateError?.message}`);
      }

      await supabase
        .from('workflow_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('workflow_id', approval.workflow_id)
        .eq('step_id', approval.step_id);

      await this.logWorkflowEvent(
        approval.workflow_id!,
        approval.step_id,
        `approval_${decision}`,
        approverId,
        { comments, step_name: approval.step_name }
      );

      // Handle approval rejection based on configuration
      if (decision === 'rejected') {
        await this.handleApprovalRejection(approval, comments);
      } else {
        await this.checkWorkflowCompletion(approval.workflow_id!);
      }

    } catch (error) {
      console.error('Approval processing failed:', error);
      throw error;
    }
  }

  private async handleApprovalRejection(approval: any, comments?: string): Promise<void> {
    // Get workflow template to find approval configuration
    const { data: workflow } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', approval.workflow_id)
      .single();

    if (!workflow) return;

    const template = await this.getWorkflowTemplate(workflow.workflow_type);
    if (!template) return;

    // Find the step configuration
    const step = this.findStepById(template.definition.steps, approval.step_id);
    if (!step || !step.approval_config) {
      // Default behavior: terminate workflow on rejection
      await this.updateWorkflowStatus(approval.workflow_id, 'failed');
      await this.logWorkflowEvent(
        approval.workflow_id,
        approval.step_id,
        'workflow_terminated_by_rejection',
        'system',
        { step_name: approval.step_name, rejection_reason: comments }
      );
      return;
    }

    const rejectionAction = step.approval_config.on_rejection;

    switch (rejectionAction) {
      case 'terminate':
        await this.updateWorkflowStatus(approval.workflow_id, 'failed');
        await this.logWorkflowEvent(
          approval.workflow_id,
          approval.step_id,
          'workflow_terminated_by_rejection',
          'system',
          { step_name: approval.step_name, rejection_reason: comments }
        );
        break;

      case 'escalate':
        await this.escalateRejectedApproval(approval, step, comments);
        break;

      case 'alternate_path':
        await this.executeAlternatePathForRejection(approval, step);
        break;

      case 'continue':
        // Continue with remaining approvals if any
        await this.checkWorkflowCompletion(approval.workflow_id);
        break;
    }
  }

  private async escalateRejectedApproval(approval: any, step: WorkflowStep, comments?: string): Promise<void> {
    const escalationRole = step.approval_config?.escalation_role || 'admin';

    // Create new approval for escalated role
    const escalatedApprovalData = {
      workflow_id: approval.workflow_id,
      step_id: approval.step_id,
      step_name: approval.step_name,
      approver_role: escalationRole,
      status: 'pending' as ApprovalStatus,
      order_sequence: approval.order_sequence + 1,
      assigned_at: new Date().toISOString()
    };

    await supabase.from('workflow_approvals').insert(escalatedApprovalData);

    // Create escalation record
    const escalationData = {
      workflow_id: approval.workflow_id,
      approval_id: approval.id,
      escalated_from: approval.approver_role,
      escalated_to: escalationRole,
      escalation_reason: `Approval rejected: ${comments || 'No reason provided'}`,
      status: 'pending'
    };

    await supabase.from('workflow_escalations').insert(escalationData);

    // Create escalation task
    const taskData = {
      workflow_id: approval.workflow_id,
      step_id: approval.step_id,
      task_type: 'approval',
      assigned_role: escalationRole,
      status: 'pending',
      priority: 2,
      data: {
        step_name: approval.step_name,
        escalated_from: approval.approver_role,
        rejection_reason: comments,
        workflow_name: approval.workflow_name
      }
    };

    await supabase.from('workflow_tasks').insert(taskData);

    await this.logWorkflowEvent(
      approval.workflow_id,
      approval.step_id,
      'approval_escalated_after_rejection',
      'system',
      { 
        escalated_to: escalationRole, 
        original_approver: approval.approver_role,
        rejection_reason: comments 
      }
    );
  }

  private async executeAlternatePathForRejection(approval: any, step: WorkflowStep): Promise<void> {
    const alternateStepId = step.approval_config?.alternate_step_id;
    if (!alternateStepId) {
      console.warn(`No alternate path defined for rejected approval in step ${step.id}`);
      return;
    }

    // Get workflow template to find alternate step
    const { data: workflow } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', approval.workflow_id)
      .single();

    if (!workflow) return;

    const template = await this.getWorkflowTemplate(workflow.workflow_type);
    if (!template) return;

    const alternateStep = this.findStepById(template.definition.steps, alternateStepId);
    if (alternateStep) {
      await this.logWorkflowEvent(
        approval.workflow_id,
        approval.step_id,
        'alternate_path_executed_after_rejection',
        'system',
        { alternate_step_id: alternateStepId, rejection_reason: approval.rejection_reason }
      );
      await this.processStep(workflow, alternateStep);
    }
  }

  private async checkWorkflowCompletion(workflowId: string): Promise<void> {
    const { data: pendingApprovals, error } = await supabase
      .from('workflow_approvals')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error checking pending approvals:', error);
      return;
    }

    if (!pendingApprovals || pendingApprovals.length === 0) {
      await this.updateWorkflowStatus(workflowId, 'completed');
      
      // Update SLA status to completed
      await supabase
        .from('workflow_executions')
        .update({ sla_status: 'completed' })
        .eq('id', workflowId);
        
      await this.logWorkflowEvent(workflowId, null, 'workflow_completed', 'system', {});
      console.log(`Workflow ${workflowId} completed successfully`);
    }
  }

  private async updateWorkflowStatus(workflowId: string, status: WorkflowStatus): Promise<void> {
    const { error } = await supabase
      .from('workflow_executions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId);

    if (error) {
      console.error('Failed to update workflow status:', error);
    }
  }

  private async logWorkflowEvent(
    workflowId: string,
    stepId: string | null,
    action: string,
    actor: string,
    details: any
  ): Promise<void> {
    const { error } = await supabase
      .from('workflow_execution_log')
      .insert({
        workflow_id: workflowId,
        step_id: stepId,
        action,
        actor,
        details
      });

    if (error) {
      console.error('Failed to log workflow event:', error);
    }
  }

  async getTasks(role?: string): Promise<any[]> {
    let query = supabase
      .from('workflow_tasks')
      .select(`
        *,
        workflow_executions!inner(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (role) {
      query = query.eq('assigned_role', role);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data || [];
  }
}

export const workflowEngine = new WorkflowEngine();
