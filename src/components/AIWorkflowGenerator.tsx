
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle, AlertCircle, Users, DollarSign, FileText, Mail, Clock, XCircle, Play } from 'lucide-react';
import { toast } from 'sonner';

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
  position: { x: number; y: number };
}

interface GeneratedWorkflow {
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  estimatedTime: string;
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

  const parseScenario = (input: string): GeneratedWorkflow => {
    const lowerInput = input.toLowerCase();
    
    const isApprovalProcess = lowerInput.includes('approval');
    const hasMoneyAmount = lowerInput.match(/\$?\d+[\d,]*|\d+[\d,]*\s*dollars?/);
    const hasManager = lowerInput.includes('manager');
    const hasFinance = lowerInput.includes('finance');
    const isExpense = lowerInput.includes('expense') || lowerInput.includes('cost');
    const isMarketing = lowerInput.includes('marketing');
    const hasForm = lowerInput.includes('form') || lowerInput.includes('request');
    const hasNotification = lowerInput.includes('notification') || lowerInput.includes('notify');

    let workflowName = 'Custom Workflow';
    let category = 'General';
    let description = 'Auto-generated workflow based on your scenario';

    if (isApprovalProcess && isExpense) {
      workflowName = isMarketing ? 'Marketing Expense Approval' : 'Expense Approval Process';
      category = 'Finance';
      description = `Automated approval process for ${isMarketing ? 'marketing ' : ''}expenses${hasMoneyAmount ? ` over ${hasMoneyAmount[0]}` : ''}`;
    }

    const steps: WorkflowStep[] = [];
    let yPosition = 0;

    // Start step
    steps.push({
      id: 'start-1',
      name: 'Start',
      type: 'start',
      description: 'Workflow begins',
      icon: stepTypes.start.icon,
      color: stepTypes.start.color,
      bgColor: stepTypes.start.bgColor,
      position: { x: 0, y: yPosition }
    });
    yPosition += 120;

    // Form submission if mentioned
    if (hasForm) {
      steps.push({
        id: 'form-1',
        name: 'Submit Request Form',
        type: 'form',
        description: `User fills out ${isMarketing ? 'marketing ' : ''}expense request details`,
        icon: stepTypes.form.icon,
        color: stepTypes.form.color,
        bgColor: stepTypes.form.bgColor,
        position: { x: 0, y: yPosition }
      });
      yPosition += 120;
    }

    // Add notification step
    if (hasNotification && hasManager) {
      steps.push({
        id: 'email-1',
        name: 'Notify Manager',
        type: 'email',
        description: 'Send email notification to manager',
        icon: stepTypes.email.icon,
        color: stepTypes.email.color,
        bgColor: stepTypes.email.bgColor,
        position: { x: 0, y: yPosition }
      });
      yPosition += 120;
    }

    // Add decision if amount threshold is mentioned
    if (hasMoneyAmount) {
      steps.push({
        id: 'decision-1',
        name: 'Check Amount',
        type: 'decision',
        description: `Is amount over ${hasMoneyAmount[0]}?`,
        icon: stepTypes.decision.icon,
        color: stepTypes.decision.color,
        bgColor: stepTypes.decision.bgColor,
        condition: `Amount > ${hasMoneyAmount[0]}`,
        position: { x: 0, y: yPosition }
      });
      yPosition += 120;
    }

    // Add manager approval if mentioned
    if (hasManager) {
      steps.push({
        id: 'approval-1',
        name: 'Manager Approval',
        type: 'approval',
        description: 'Manager reviews and approves',
        icon: stepTypes.approval.icon,
        color: stepTypes.approval.color,
        bgColor: stepTypes.approval.bgColor,
        assignee: 'Direct Manager',
        position: { x: 0, y: yPosition }
      });
      yPosition += 120;
    }

    // Add finance approval if mentioned
    if (hasFinance) {
      steps.push({
        id: 'approval-2',
        name: 'Finance Approval',
        type: 'approval',
        description: 'Finance director final approval',
        icon: stepTypes.approval.icon,
        color: stepTypes.approval.color,
        bgColor: stepTypes.approval.bgColor,
        assignee: 'Finance Director',
        position: { x: 0, y: yPosition }
      });
      yPosition += 120;
    }

    // Add final notification
    steps.push({
      id: 'email-2',
      name: 'Send Final Notification',
      type: 'email',
      description: 'Notify requestor of decision',
      icon: stepTypes.email.icon,
      color: stepTypes.email.color,
      bgColor: stepTypes.email.bgColor,
      position: { x: 0, y: yPosition }
    });
    yPosition += 120;

    // End step
    steps.push({
      id: 'end-1',
      name: 'End',
      type: 'end',
      description: 'Workflow completed',
      icon: stepTypes.end.icon,
      color: stepTypes.end.color,
      bgColor: stepTypes.end.bgColor,
      position: { x: 0, y: yPosition }
    });

    return {
      name: workflowName,
      description,
      category,
      steps,
      estimatedTime: `${Math.max(1, steps.length - 2) * 2}-${Math.max(1, steps.length - 2) * 4} hours`
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
      toast.success('Visual workflow generated successfully!');
    } catch (error) {
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createWorkflow = () => {
    if (generatedWorkflow) {
      toast.success(`Created workflow: ${generatedWorkflow.name}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>AI Visual Workflow Generator</span>
          </CardTitle>
          <CardDescription>
            Describe your business process and I'll create a visual workflow diagram automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your workflow scenario:
            </label>
            <Textarea
              placeholder="Example: Create an approval process for marketing expenses over $1000 with manager and finance director approval steps, including form submission and email notifications"
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
                  Generating Visual Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Visual Workflow
                </>
              )}
            </Button>
            
            {generatedWorkflow && (
              <Button onClick={createWorkflow} variant="outline">
                Create This Workflow
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedWorkflow && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Workflow Steps Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>+ Add Workflow Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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

          {/* Visual Workflow Canvas */}
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-6 min-h-[600px] relative">
                  <div className="flex flex-col items-center space-y-4">
                    {generatedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center">
                        {/* Workflow Step */}
                        <div className={`relative p-4 rounded-lg border-2 min-w-[200px] ${step.bgColor} shadow-sm hover:shadow-md transition-all`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <step.icon className={`h-5 w-5 ${step.color}`} />
                            <h4 className="font-medium text-sm">{step.name}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                          
                          {step.assignee && (
                            <Badge className="text-xs bg-blue-50 text-blue-700 mb-1">
                              👤 {step.assignee}
                            </Badge>
                          )}
                          
                          {step.condition && (
                            <Badge className="text-xs bg-yellow-50 text-yellow-700">
                              ⚡ {step.condition}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Connection Arrow */}
                        {index < generatedWorkflow.steps.length - 1 && (
                          <div className="flex items-center justify-center py-2">
                            <div className="w-0.5 h-6 bg-gray-300"></div>
                            <ArrowRight className="h-4 w-4 text-gray-400 absolute bg-gray-50" />
                          </div>
                        )}
                      </div>
                    ))}
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
