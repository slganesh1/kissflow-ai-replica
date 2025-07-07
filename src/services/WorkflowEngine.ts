import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WorkflowStatus = Database['public']['Enums']['workflow_status'];
type ApprovalStatus = Database['public']['Enums']['approval_status'];

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'conditional';
  role?: string;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  type: string;
  definition: {
    steps: WorkflowStep[];
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
      definition: data.definition as unknown as { steps: WorkflowStep[] }
    };

    return template;
  }

  private async processWorkflowSteps(workflow: any, template: WorkflowTemplate): Promise<void> {
    const steps = template.definition.steps;
    
    for (const step of steps) {
      console.log(`Processing step: ${step.id} for workflow: ${workflow.id}`);
      
      if (!this.evaluateStepConditions(step, workflow.request_data)) {
        console.log(`Step ${step.id} conditions not met, skipping`);
        continue;
      }

      await this.processStep(workflow, step);
    }
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
    switch (step.type) {
      case 'approval':
        await this.createApprovalTask(workflow, step);
        break;
      case 'notification':
        await this.createNotificationTask(workflow, step);
        break;
      case 'conditional':
        break;
      default:
        console.log(`Unknown step type: ${step.type}`);
    }
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

      await this.checkWorkflowCompletion(approval.workflow_id!);

    } catch (error) {
      console.error('Approval processing failed:', error);
      throw error;
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
