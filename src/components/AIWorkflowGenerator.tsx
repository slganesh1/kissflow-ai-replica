
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle, AlertCircle, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'approval' | 'condition' | 'action' | 'notification';
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  assignee?: string;
  condition?: string;
}

interface GeneratedWorkflow {
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  estimatedTime: string;
}

export const AIWorkflowGenerator = () => {
  const [scenario, setScenario] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);

  const parseScenario = (input: string): GeneratedWorkflow => {
    const lowerInput = input.toLowerCase();
    
    // Parse the scenario to extract key information
    const isApprovalProcess = lowerInput.includes('approval');
    const hasMoneyAmount = lowerInput.match(/\$?\d+[\d,]*|\d+[\d,]*\s*dollars?/);
    const hasManager = lowerInput.includes('manager');
    const hasFinance = lowerInput.includes('finance');
    const isExpense = lowerInput.includes('expense') || lowerInput.includes('cost');
    const isMarketing = lowerInput.includes('marketing');

    let workflowName = 'Custom Workflow';
    let category = 'General';
    let description = 'Auto-generated workflow based on your scenario';

    if (isApprovalProcess && isExpense) {
      workflowName = isMarketing ? 'Marketing Expense Approval' : 'Expense Approval Process';
      category = 'Finance';
      description = `Automated approval process for ${isMarketing ? 'marketing ' : ''}expenses${hasMoneyAmount ? ` over ${hasMoneyAmount[0]}` : ''}`;
    }

    const steps: WorkflowStep[] = [];

    // Start with trigger
    steps.push({
      id: 'trigger-1',
      name: 'Expense Request Submitted',
      type: 'trigger',
      description: `New ${isMarketing ? 'marketing ' : ''}expense request is submitted`,
      icon: DollarSign,
      color: 'bg-blue-100 text-blue-600'
    });

    // Add condition if amount threshold is mentioned
    if (hasMoneyAmount) {
      steps.push({
        id: 'condition-1',
        name: 'Check Amount Threshold',
        type: 'condition',
        description: `Check if expense amount exceeds ${hasMoneyAmount[0]}`,
        icon: AlertCircle,
        color: 'bg-yellow-100 text-yellow-600',
        condition: `Amount > ${hasMoneyAmount[0]}`
      });
    }

    // Add manager approval if mentioned
    if (hasManager) {
      steps.push({
        id: 'approval-1',
        name: 'Manager Approval',
        type: 'approval',
        description: 'Direct manager reviews and approves the expense request',
        icon: Users,
        color: 'bg-orange-100 text-orange-600',
        assignee: 'Direct Manager'
      });
    }

    // Add finance approval if mentioned
    if (hasFinance) {
      steps.push({
        id: 'approval-2',
        name: 'Finance Director Approval',
        type: 'approval',
        description: 'Finance director reviews and provides final approval',
        icon: Users,
        color: 'bg-purple-100 text-purple-600',
        assignee: 'Finance Director'
      });
    }

    // Add final notification
    steps.push({
      id: 'notification-1',
      name: 'Send Approval Notification',
      type: 'notification',
      description: 'Notify requestor of approval status and next steps',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    });

    return {
      name: workflowName,
      description,
      category,
      steps,
      estimatedTime: `${steps.length * 2}-${steps.length * 4} hours`
    };
  };

  const generateWorkflow = async () => {
    if (!scenario.trim()) {
      toast.error('Please describe your workflow scenario');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const workflow = parseScenario(scenario);
      setGeneratedWorkflow(workflow);
      toast.success('Workflow generated successfully!');
    } catch (error) {
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createWorkflow = () => {
    if (generatedWorkflow) {
      toast.success(`Created workflow: ${generatedWorkflow.name}`);
      // Here you would typically save the workflow or navigate to the builder
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>AI Workflow Generator</span>
          </CardTitle>
          <CardDescription>
            Describe your business process in natural language, and I'll create a workflow for you automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your workflow scenario:
            </label>
            <Textarea
              placeholder="Example: Create an approval process for marketing expenses over $1000 with manager and finance director approval steps"
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
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Workflow
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
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Generated Workflow Steps:</h4>
              
              <div className="space-y-3">
                {generatedWorkflow.steps.map((step, index) => (
                  <div key={step.id}>
                    <div className="flex items-center space-x-4 p-4 rounded-lg border">
                      <div className={`p-2 rounded-lg ${step.color}`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium">{step.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {step.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        
                        {step.assignee && (
                          <div className="mt-2">
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              Assignee: {step.assignee}
                            </Badge>
                          </div>
                        )}
                        
                        {step.condition && (
                          <div className="mt-2">
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">
                              Condition: {step.condition}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < generatedWorkflow.steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
