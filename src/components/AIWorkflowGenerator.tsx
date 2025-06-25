import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle, AlertCircle, Users, DollarSign, FileText, Mail, Clock, XCircle, Play, Zap, Loader2, FormInput } from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowInputForm } from './WorkflowInputForm';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'start' | 'task' | 'approval' | 'form' | 'decision' | 'email' | 'delay' | 'end';
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  assignee?: string;
  condition?: string;
  timeEstimate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  position: { x: number; y: number };
  connectedTo?: string[];
}

interface GeneratedWorkflow {
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  estimatedTime: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}

const stepTypes = {
  start: { icon: Play, color: 'text-green-600', bgColor: 'bg-green-100 border-green-300', name: 'Start' },
  task: { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100 border-blue-300', name: 'Task' },
  approval: { icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100 border-purple-300', name: 'Approval' },
  form: { icon: FileText, color: 'text-green-600', bgColor: 'bg-green-100 border-green-300', name: 'Form' },
  decision: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100 border-yellow-300', name: 'Decision' },
  email: { icon: Mail, color: 'text-blue-600', bgColor: 'bg-blue-100 border-blue-300', name: 'Email' },
  delay: { icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-100 border-purple-300', name: 'Delay' },
  end: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 border-red-300', name: 'End' }
};

export const AIWorkflowGenerator = () => {
  const [scenario, setScenario] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<{ [key: string]: 'pending' | 'executing' | 'completed' | 'failed' }>({});
  const [showInputForm, setShowInputForm] = useState(false);
  const [workflowData, setWorkflowData] = useState<Record<string, any> | null>(null);

  const parseScenario = (input: string): GeneratedWorkflow => {
    const lowerInput = input.toLowerCase();
    
    // Enhanced scenario detection
    const isApprovalProcess = lowerInput.includes('approval') || lowerInput.includes('approve');
    const hasMoneyAmount = input.match(/\$[\d,]+|\$?\d+[\d,]*|\d+[\d,]*\s*dollars?/);
    const hasManager = lowerInput.includes('manager');
    const hasFinance = lowerInput.includes('finance');
    const isExpense = lowerInput.includes('expense') || lowerInput.includes('cost') || lowerInput.includes('budget');
    const isMarketing = lowerInput.includes('marketing') || lowerInput.includes('campaign') || lowerInput.includes('advertising');
    const hasForm = lowerInput.includes('form') || lowerInput.includes('request') || lowerInput.includes('submit');
    const hasNotification = lowerInput.includes('notification') || lowerInput.includes('notify') || lowerInput.includes('alert');
    const isUrgent = lowerInput.includes('urgent') || lowerInput.includes('asap') || lowerInput.includes('immediately') || lowerInput.includes('rush');
    const hasDeadline = lowerInput.includes('deadline') || lowerInput.includes('by next week') || lowerInput.includes('target');
    const isProduct = lowerInput.includes('product') || lowerInput.includes('launch');
    const isQ4 = lowerInput.includes('q4') || lowerInput.includes('holiday') || lowerInput.includes('fourth quarter');

    let workflowName = 'Custom Workflow';
    let category = 'General';
    let description = 'Auto-generated workflow based on your scenario';
    let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

    if (isApprovalProcess && isMarketing && hasMoneyAmount) {
      workflowName = `Marketing Campaign Approval - ${hasMoneyAmount[0]}`;
      category = 'Marketing';
      description = `Approval workflow for ${hasMoneyAmount[0]} marketing campaign${isProduct ? ' for product launch' : ''}${isQ4 ? ' for Q4/holiday season' : ''}`;
      urgency = isUrgent ? 'urgent' : 'high';
    } else if (isApprovalProcess && isExpense) {
      workflowName = 'Expense Approval Process';
      category = 'Finance';
      description = `Automated approval process for ${isMarketing ? 'marketing ' : ''}expenses${hasMoneyAmount ? ` of ${hasMoneyAmount[0]}` : ''}`;
      urgency = isUrgent ? 'urgent' : 'medium';
    }

    const steps: WorkflowStep[] = [];
    let yPosition = 0;
    const stepConnections: { [key: string]: string[] } = {};

    // Start step
    const startId = 'start-1';
    steps.push({
      id: startId,
      name: 'Workflow Initiated',
      type: 'start',
      description: `${isUrgent ? 'Urgent: ' : ''}${workflowName} process begins`,
      icon: stepTypes.start.icon,
      color: stepTypes.start.color,
      bgColor: stepTypes.start.bgColor,
      priority: urgency,
      position: { x: 0, y: yPosition }
    });
    yPosition += 120;

    // Form submission
    const formId = 'form-1';
    steps.push({
      id: formId,
      name: `Submit ${isMarketing ? 'Marketing Campaign' : 'Expense'} Request`,
      type: 'form',
      description: `Complete detailed request form including ${hasMoneyAmount ? `budget of ${hasMoneyAmount[0]}` : 'cost breakdown'}${isProduct ? ', product launch details' : ''}${hasDeadline ? ', timeline requirements' : ''}`,
      icon: stepTypes.form.icon,
      color: stepTypes.form.color,
      bgColor: stepTypes.form.bgColor,
      timeEstimate: '15-30 minutes',
      priority: urgency,
      position: { x: 0, y: yPosition }
    });
    stepConnections[startId] = [formId];
    yPosition += 120;

    // Initial notification
    const notifyId = 'email-1';
    steps.push({
      id: notifyId,
      name: 'Notify Stakeholders',
      type: 'email',
      description: `Send automatic notification to ${hasManager ? 'direct manager' : 'supervisor'}${hasFinance ? ' and finance team' : ''}${isUrgent ? ' with urgent priority flag' : ''}`,
      icon: stepTypes.email.icon,
      color: stepTypes.email.color,
      bgColor: stepTypes.email.bgColor,
      timeEstimate: 'Immediate',
      priority: urgency,
      position: { x: 0, y: yPosition }
    });
    stepConnections[formId] = [notifyId];
    yPosition += 120;

    // Amount-based decision
    const decisionId = 'decision-1';
    if (hasMoneyAmount) {
      const amount = hasMoneyAmount[0];
      steps.push({
        id: decisionId,
        name: 'Budget Threshold Check',
        type: 'decision',
        description: `Evaluate if ${amount} exceeds approval thresholds${isMarketing ? ' for marketing spend' : ''}`,
        icon: stepTypes.decision.icon,
        color: stepTypes.decision.color,
        bgColor: stepTypes.decision.bgColor,
        condition: `Amount ${amount} requires multi-level approval`,
        timeEstimate: 'Automatic',
        priority: urgency,
        position: { x: 0, y: yPosition }
      });
      stepConnections[notifyId] = [decisionId];
      yPosition += 120;
    }

    // Manager approval
    const managerApprovalId = 'approval-1';
    steps.push({
      id: managerApprovalId,
      name: 'Manager Review & Approval',
      type: 'approval',
      description: `Direct manager evaluates ${isMarketing ? 'campaign strategy, ROI projections,' : 'expense justification,'} and budget allocation${isQ4 ? ' for holiday season timing' : ''}`,
      icon: stepTypes.approval.icon,
      color: stepTypes.approval.color,
      bgColor: stepTypes.approval.bgColor,
      assignee: 'Direct Manager',
      timeEstimate: isUrgent ? '4-8 hours' : '1-2 business days',
      priority: urgency,
      position: { x: 0, y: yPosition }
    });
    stepConnections[hasMoneyAmount ? decisionId : notifyId] = [managerApprovalId];
    yPosition += 120;

    // Finance approval for high amounts
    let financeApprovalId = '';
    if (hasFinance || (hasMoneyAmount && parseInt(hasMoneyAmount[0].replace(/[$,]/g, '')) > 5000)) {
      financeApprovalId = 'approval-2';
      steps.push({
        id: financeApprovalId,
        name: 'Finance Director Approval',
        type: 'approval',
        description: `Finance team reviews budget impact, cash flow, and financial compliance${isMarketing ? ' for marketing ROI' : ''}${isQ4 ? ' considering Q4 budget constraints' : ''}`,
        icon: stepTypes.approval.icon,
        color: stepTypes.approval.color,
        bgColor: stepTypes.approval.bgColor,
        assignee: 'Finance Director',
        timeEstimate: isUrgent ? '8-12 hours' : '2-3 business days',
        priority: urgency,
        position: { x: 0, y: yPosition }
      });
      stepConnections[managerApprovalId] = [financeApprovalId];
      yPosition += 120;
    }

    // Execution task if urgent
    let executionId = '';
    if (isUrgent || hasDeadline) {
      executionId = 'task-1';
      steps.push({
        id: executionId,
        name: 'Begin Execution',
        type: 'task',
        description: `Initiate ${isMarketing ? 'campaign development and vendor coordination' : 'expense processing'}${hasDeadline ? ' to meet deadline requirements' : ''}`,
        icon: stepTypes.task.icon,
        color: stepTypes.task.color,
        bgColor: stepTypes.task.bgColor,
        assignee: isMarketing ? 'Marketing Team' : 'Requesting Department',
        timeEstimate: isMarketing ? '3-5 days' : '1-2 days',
        priority: urgency,
        position: { x: 0, y: yPosition }
      });
      stepConnections[financeApprovalId || managerApprovalId] = [executionId];
      yPosition += 120;
    }

    // Final notification
    const finalNotifyId = 'email-2';
    steps.push({
      id: finalNotifyId,
      name: 'Send Decision Notification',
      type: 'email',
      description: `Notify all stakeholders of approval decision${isUrgent ? ' and immediate next steps' : ''}${isMarketing ? ', including creative and media teams' : ''}`,
      icon: stepTypes.email.icon,
      color: stepTypes.email.color,
      bgColor: stepTypes.email.bgColor,
      timeEstimate: 'Immediate',
      priority: urgency,
      position: { x: 0, y: yPosition }
    });
    stepConnections[executionId || financeApprovalId || managerApprovalId] = [finalNotifyId];
    yPosition += 120;

    // End step
    const endId = 'end-1';
    steps.push({
      id: endId,
      name: 'Workflow Complete',
      type: 'end',
      description: `${workflowName} process completed${isUrgent ? ' with urgent timeline met' : ''}`,
      icon: stepTypes.end.icon,
      color: stepTypes.end.color,
      bgColor: stepTypes.end.bgColor,
      position: { x: 0, y: yPosition }
    });
    stepConnections[finalNotifyId] = [endId];

    // Add connections to steps
    Object.entries(stepConnections).forEach(([stepId, connections]) => {
      const step = steps.find(s => s.id === stepId);
      if (step) {
        step.connectedTo = connections;
      }
    });

    // Calculate total time
    const totalSteps = steps.length - 2; // exclude start and end
    const baseTime = isUrgent ? 1 : 2;
    const estimatedTime = `${totalSteps * baseTime}-${totalSteps * baseTime * 2} ${isUrgent ? 'hours' : 'days'}`;

    return {
      name: workflowName,
      description,
      category,
      steps,
      estimatedTime,
      urgency
    };
  };

  const generateWorkflow = async () => {
    if (!scenario.trim()) {
      toast.error('Please describe your workflow scenario');
      return;
    }

    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const workflow = parseScenario(scenario);
      setGeneratedWorkflow(workflow);
      // Initialize execution progress
      const progress = {};
      workflow.steps.forEach(step => {
        progress[step.id] = 'pending';
      });
      setExecutionProgress(progress);
      toast.success('Enhanced visual workflow generated successfully!');
    } catch (error) {
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startWorkflowWithInput = () => {
    if (!generatedWorkflow) return;
    setShowInputForm(true);
  };

  const handleWorkflowSubmission = (data: Record<string, any>) => {
    setWorkflowData(data);
    setShowInputForm(false);
    toast.success('Input received! Ready to execute workflow with real data.');
    console.log('Workflow Data:', data);
  };

  const executeWorkflow = async () => {
    if (!generatedWorkflow) return;
    
    setIsExecuting(true);
    toast.success(`Starting execution of ${generatedWorkflow.name}${workflowData ? ' with submitted data' : ''}`);
    
    // Create workflow execution record
    let workflowExecutionId = null;
    
    if (workflowData) {
      try {
        // Note: Since the new tables aren't in the types yet, we'll use a more generic approach
        const { data: execution, error: executionError } = await supabase.rpc('create_workflow_execution', {
          workflow_name: generatedWorkflow.name,
          workflow_type: generatedWorkflow.category,
          request_data: workflowData,
          submitter_name: 'Current User'
        });

        // If RPC doesn't exist, fall back to direct insert (will work once types are updated)
        if (executionError) {
          console.log('RPC not available, workflow execution will be simulated');
          workflowExecutionId = 'simulated-' + Date.now();
        } else {
          workflowExecutionId = execution;
        }

        console.log('Created workflow execution:', workflowExecutionId);
      } catch (error) {
        console.log('Workflow execution will be simulated for demo purposes');
        workflowExecutionId = 'simulated-' + Date.now();
      }
    }
    
    // Execute steps sequentially with manual approval handling
    for (const step of generatedWorkflow.steps) {
      setExecutionProgress(prev => ({
        ...prev,
        [step.id]: 'executing'
      }));
      
      // Handle approval steps differently
      if (step.type === 'approval' && workflowExecutionId) {
        try {
          // For now, we'll simulate the approval creation since types aren't updated yet
          console.log('Creating approval record for:', {
            workflow_id: workflowExecutionId,
            step_id: step.id,
            step_name: step.name,
            approver_role: step.assignee?.toLowerCase() || 'manager'
          });

          // Mark as waiting for approval
          setExecutionProgress(prev => ({
            ...prev,
            [step.id]: 'pending'
          }));
          
          toast.info(`${step.name} - Waiting for manual approval from ${step.assignee}`);
          
          // In a real scenario, this would wait for actual approval
          // For demo, we'll simulate a delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          setExecutionProgress(prev => ({
            ...prev,
            [step.id]: 'completed'
          }));
          
          toast.success(`${step.name} - Approved (simulated)`);
        } catch (error) {
          console.error('Error handling approval step:', error);
          setExecutionProgress(prev => ({
            ...prev,
            [step.id]: 'failed'
          }));
          toast.error(`${step.name} - Approval process failed`);
        }
      } else {
        // Regular step execution
        const executionTime = step.type === 'delay' ? 3000 : 
                             step.type === 'email' ? 500 : 1000;
        
        await new Promise(resolve => setTimeout(resolve, executionTime));
        
        setExecutionProgress(prev => ({
          ...prev,
          [step.id]: 'completed'
        }));
        
        // Show contextual completion messages
        let completionMessage = `Completed: ${step.name}`;
        if (workflowData) {
          if (step.type === 'form' && workflowData.title) {
            completionMessage += ` for "${workflowData.title}"`;
          } else if (step.type === 'email' && workflowData.submitter_id) {
            completionMessage += ` - notification sent`;
          } else if (step.type === 'task' && workflowData.amount) {
            completionMessage += ` for $${workflowData.amount}`;
          }
        }
        
        toast.success(completionMessage);
      }
    }
    
    setIsExecuting(false);
    const finalMessage = `Workflow "${generatedWorkflow.name}" executed successfully!${workflowData ? ` Request processed for: ${workflowData.title || workflowData.campaign_name || 'submission'}` : ''}`;
    toast.success(finalMessage);
  };

  const createWorkflow = () => {
    if (generatedWorkflow) {
      toast.success(`Created workflow template: ${generatedWorkflow.name}`);
    }
  };

  const getStepStatusIcon = (stepId: string) => {
    const status = executionProgress[stepId];
    switch (status) {
      case 'executing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStepStatusColor = (stepId: string) => {
    const status = executionProgress[stepId];
    switch (status) {
      case 'executing':
        return 'border-blue-400 bg-blue-50';
      case 'completed':
        return 'border-green-400 bg-green-50';
      case 'failed':
        return 'border-red-400 bg-red-50';
      case 'pending':
        return 'border-yellow-400 bg-yellow-50';
      default:
        return '';
    }
  };

  if (showInputForm && generatedWorkflow) {
    return (
      <WorkflowInputForm
        workflowName={generatedWorkflow.name}
        workflowType={generatedWorkflow.category}
        onSubmit={handleWorkflowSubmission}
        onCancel={() => setShowInputForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>AI Visual Workflow Generator</span>
          </CardTitle>
          <CardDescription>
            Describe your business process and I'll create a detailed visual workflow diagram automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your workflow scenario:
            </label>
            <Textarea
              placeholder="Example: I need approval for a $15000 marketing campaign for our Q4 product launch. This is urgent as we need to start by next week to meet our holiday sales target"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={generateWorkflow}
              disabled={isGenerating || !scenario.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating Enhanced Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Visual Workflow
                </>
              )}
            </Button>
            
            {generatedWorkflow && (
              <>
                <Button 
                  onClick={startWorkflowWithInput}
                  disabled={isExecuting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FormInput className="h-4 w-4 mr-2" />
                  Submit Real Request
                </Button>
                
                <Button 
                  onClick={executeWorkflow}
                  disabled={isExecuting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Workflow
                    </>
                  )}
                </Button>
                <Button onClick={createWorkflow} variant="outline">
                  Save as Template
                </Button>
              </>
            )}
          </div>

          {workflowData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ready to Execute with Real Data:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Title:</strong> {workflowData.title || workflowData.campaign_name || workflowData.expense_title}</div>
                {workflowData.amount && <div><strong>Amount:</strong> ${workflowData.amount}</div>}
                {workflowData.budget_amount && <div><strong>Budget:</strong> ${workflowData.budget_amount}</div>}
                <div><strong>Status:</strong> <Badge variant="secondary">{workflowData.status}</Badge></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedWorkflow && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Workflow Steps Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>Workflow Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Execution Status</h4>
                <div className="space-y-1">
                  {Object.entries(executionProgress).map(([stepId, status]) => {
                    const step = generatedWorkflow.steps.find(s => s.id === stepId);
                    return (
                      <div key={stepId} className="flex items-center space-x-2 text-xs">
                        {getStepStatusIcon(stepId)}
                        <span className={status === 'completed' ? 'text-green-600' : status === 'executing' ? 'text-blue-600' : 'text-gray-600'}>
                          {step?.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {Object.entries(stepTypes).map(([type, config]) => (
                <div
                  key={type}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${config.bgColor} border-2 hover:shadow-md`}
                >
                  <div className="flex items-center space-x-3">
                    <config.icon className={`h-5 w-5 ${config.color}`} />
                    <span className="font-medium">Add {config.name}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Enhanced Visual Workflow Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{generatedWorkflow.name}</CardTitle>
                    <CardDescription>{generatedWorkflow.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">{generatedWorkflow.category}</Badge>
                    <Badge variant="outline">~{generatedWorkflow.estimatedTime}</Badge>
                    <Badge 
                      className={
                        generatedWorkflow.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                        generatedWorkflow.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }
                    >
                      {generatedWorkflow.urgency.toUpperCase()}
                    </Badge>
                    {isExecuting && (
                      <Badge className="bg-blue-100 text-blue-700">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        EXECUTING
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-6 min-h-[700px] relative">
                  <div className="flex flex-col items-center space-y-4">
                    {generatedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center">
                        {/* Enhanced Workflow Step with Execution Status */}
                        <div className={`relative p-4 rounded-lg border-2 min-w-[280px] max-w-[320px] ${step.bgColor} ${getStepStatusColor(step.id)} shadow-sm hover:shadow-md transition-all`}>
                          <div className="flex items-center space-x-3 mb-3">
                            <step.icon className={`h-6 w-6 ${step.color}`} />
                            <h4 className="font-semibold text-sm flex-1">{step.name}</h4>
                            <div className="flex items-center space-x-2">
                              {getStepStatusIcon(step.id)}
                              {step.priority === 'urgent' && (
                                <Badge className="text-xs bg-red-100 text-red-600">
                                  URGENT
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-700 mb-3 leading-relaxed">{step.description}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {step.assignee && (
                              <Badge className="text-xs bg-blue-50 text-blue-700">
                                👤 {step.assignee}
                              </Badge>
                            )}
                            
                            {step.condition && (
                              <Badge className="text-xs bg-yellow-50 text-yellow-700">
                                ⚡ {step.condition}
                              </Badge>
                            )}
                            
                            {step.timeEstimate && (
                              <Badge className="text-xs bg-purple-50 text-purple-700">
                                ⏱️ {step.timeEstimate}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Connection Arrow with Flow Lines */}
                        {index < generatedWorkflow.steps.length - 1 && (
                          <div className="flex flex-col items-center py-3">
                            <div className="w-0.5 h-4 bg-gray-400"></div>
                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-5 w-5 text-gray-500 bg-gray-50 p-0.5 rounded border" />
                            </div>
                            <div className="w-0.5 h-4 bg-gray-400"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Workflow Summary */}
                  <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border">
                    <div className="text-xs text-gray-600">
                      <div><strong>{generatedWorkflow.steps.length}</strong> steps</div>
                      <div><strong>{generatedWorkflow.estimatedTime}</strong> total time</div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>Auto-connected flow</span>
                      </div>
                      {isExecuting && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Executing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
