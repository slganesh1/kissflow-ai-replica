
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Play, Save, FileText, Bot, Mail, Database, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowInputForm } from './WorkflowInputForm';

interface AIWorkflowGeneratorProps {
  generatedWorkflow: any;
  setGeneratedWorkflow: (workflow: any) => void;
  workflowData: any;
  setWorkflowData: (data: any) => void;
}

export const AIWorkflowGenerator: React.FC<AIWorkflowGeneratorProps> = ({
  generatedWorkflow,
  setGeneratedWorkflow,
  workflowData,
  setWorkflowData
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState('');
  const [showInputForm, setShowInputForm] = useState(false);

  const workflowPrompts = [
    {
      title: 'Marketing Campaign Approval',
      description: 'Create a workflow for marketing campaign approval with budget review',
      prompt: 'Create a marketing campaign approval workflow that requires manager approval for campaigns over $5000 and finance director approval for campaigns over $15000',
      type: 'campaign_approval'
    },
    {
      title: 'Expense Reimbursement',
      description: 'Multi-step expense approval process with different thresholds',
      prompt: 'Create an expense reimbursement workflow with manager approval for expenses under $1000 and both manager and finance director approval for expenses over $1000',
      type: 'expense_approval'
    },
    {
      title: 'Purchase Order Process',
      description: 'Procurement workflow with vendor verification and approval',
      prompt: 'Create a purchase order workflow that includes vendor verification, budget check, manager approval, and procurement team processing',
      type: 'purchase_order'
    },
    {
      title: 'Content Review Pipeline',
      description: 'Content creation and review workflow with multiple stakeholders',
      prompt: 'Create a content review workflow that includes content creation, legal review, marketing approval, and final publishing',
      type: 'content_review'
    }
  ];

  const generateWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a workflow description');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI workflow generation with more detailed structure
      const workflowSteps = [];
      const approvalSteps = [];
      
      // Parse the prompt to determine workflow type and requirements
      const isExpenseWorkflow = prompt.toLowerCase().includes('expense') || selectedWorkflowType === 'expense_approval';
      const isCampaignWorkflow = prompt.toLowerCase().includes('campaign') || selectedWorkflowType === 'campaign_approval';
      const isPurchaseWorkflow = prompt.toLowerCase().includes('purchase') || selectedWorkflowType === 'purchase_order';
      
      // Generate initial workflow steps
      workflowSteps.push({
        id: 'step-1',
        name: 'Request Submission',
        type: 'form_input',
        description: 'User submits the initial request with required details',
        icon: FileText,
        status: 'pending'
      });

      // Add validation step
      workflowSteps.push({
        id: 'step-2',
        name: 'Automated Validation',
        type: 'validation',
        description: 'System validates request completeness and business rules',
        icon: Bot,
        status: 'pending'
      });

      // Add approval steps based on workflow type
      if (isExpenseWorkflow) {
        workflowSteps.push({
          id: 'step-3',
          name: 'Manager Review',
          type: 'approval',
          description: 'Direct manager reviews and approves the expense request',
          icon: CheckCircle2,
          status: 'pending',
          approver_role: 'manager'
        });
        
        approvalSteps.push({
          step_id: 'manager-approval',
          step_name: 'Manager Approval',
          approver_role: 'manager',
          required: true,
          order: 1
        });

        if (prompt.includes('1000') || prompt.includes('finance director')) {
          workflowSteps.push({
            id: 'step-4',
            name: 'Finance Director Approval',
            type: 'approval',
            description: 'Finance director approval required for amounts over $1000',
            icon: CheckCircle2,
            status: 'pending',
            approver_role: 'finance_director',
            condition: 'amount > 1000'
          });
          
          approvalSteps.push({
            step_id: 'finance-director-approval',
            step_name: 'Finance Director Approval',
            approver_role: 'finance_director',
            required: true,
            order: 2,
            condition: 'amount > 1000'
          });
        }
      } else if (isCampaignWorkflow) {
        workflowSteps.push({
          id: 'step-3',
          name: 'Marketing Manager Review',
          type: 'approval',
          description: 'Marketing manager reviews campaign strategy and budget',
          icon: CheckCircle2,
          status: 'pending',
          approver_role: 'manager'
        });
        
        approvalSteps.push({
          step_id: 'manager-approval',
          step_name: 'Marketing Manager Approval',
          approver_role: 'manager',
          required: true,
          order: 1
        });
      } else {
        // Generic approval step
        workflowSteps.push({
          id: 'step-3',
          name: 'Approval Required',
          type: 'approval',
          description: 'Manager approval required for this request',
          icon: CheckCircle2,
          status: 'pending',
          approver_role: 'manager'
        });
        
        approvalSteps.push({
          step_id: 'manager-approval',
          step_name: 'Manager Approval',
          approver_role: 'manager',
          required: true,
          order: 1
        });
      }

      // Add notification step
      workflowSteps.push({
        id: 'step-final',
        name: 'Completion Notification',
        type: 'notification',
        description: 'Send completion notification to all stakeholders',
        icon: Mail,
        status: 'pending'
      });

      const generatedWorkflowData = {
        id: `workflow-${Date.now()}`,
        name: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        description: prompt,
        type: selectedWorkflowType || 'custom',
        steps: workflowSteps,
        approvalSteps: approvalSteps,
        created_at: new Date().toISOString(),
        status: 'draft',
        triggers: ['manual', 'form_submission'],
        estimated_duration: `${workflowSteps.length * 2}-${workflowSteps.length * 4} hours`,
        complexity: workflowSteps.length > 4 ? 'high' : workflowSteps.length > 2 ? 'medium' : 'low'
      };

      setGeneratedWorkflow(generatedWorkflowData);
      setWorkflowData(generatedWorkflowData);
      
      toast.success('🎉 AI Workflow generated successfully!');
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSelect = (selectedPrompt: any) => {
    setPrompt(selectedPrompt.prompt);
    setSelectedWorkflowType(selectedPrompt.type);
  };

  const handleSubmitWorkflow = (formData: any) => {
    console.log('Submitting workflow with generated structure:', generatedWorkflow);
    console.log('Form data:', formData);
    
    const workflowToSubmit = {
      ...formData,
      workflowName: formData.workflowName || generatedWorkflow?.name,
      workflowType: formData.workflowType || generatedWorkflow?.type,
      generatedStructure: generatedWorkflow,
      approvalSteps: generatedWorkflow?.approvalSteps || []
    };
    
    // The WorkflowInputForm will handle the actual submission to Supabase
    toast.success('Workflow structure applied to form!');
    setShowInputForm(false);
  };

  if (showInputForm) {
    return (
      <WorkflowInputForm
        workflowName={generatedWorkflow?.name}
        workflowType={generatedWorkflow?.type}
        onSubmit={handleSubmitWorkflow}
        onCancel={() => setShowInputForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <span>AI Workflow Generator</span>
          </CardTitle>
          <CardDescription className="text-purple-100">
            Describe your business process and let AI create an intelligent workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Quick Templates */}
            <div>
              <Label className="text-base font-medium mb-3 block">📋 Quick Start Templates</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workflowPrompts.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-all duration-300 border-2 hover:border-purple-300">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.title}</h4>
                        <Badge variant="outline" className="text-xs">{template.type}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handlePromptSelect(template)}
                        className="w-full text-xs"
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div>
              <Label htmlFor="workflow-prompt" className="text-base font-medium">
                🤖 Describe Your Workflow
              </Label>
              <Textarea
                id="workflow-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your business process... For example: 'Create an expense approval workflow where expenses under $500 need manager approval, and expenses over $500 need both manager and finance director approval'"
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Workflow Type */}
            <div>
              <Label htmlFor="workflow-type" className="text-base font-medium">
                📂 Workflow Category
              </Label>
              <Select value={selectedWorkflowType} onValueChange={setSelectedWorkflowType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense_approval">Expense Approval</SelectItem>
                  <SelectItem value="campaign_approval">Campaign Approval</SelectItem>
                  <SelectItem value="purchase_order">Purchase Order</SelectItem>
                  <SelectItem value="content_review">Content Review</SelectItem>
                  <SelectItem value="budget_request">Budget Request</SelectItem>
                  <SelectItem value="custom">Custom Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateWorkflow} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Workflow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Workflow Display */}
      {generatedWorkflow && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-6 w-6" />
                <span>Generated Workflow</span>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {generatedWorkflow.complexity} complexity
              </Badge>
            </CardTitle>
            <CardDescription className="text-green-100">
              {generatedWorkflow.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Workflow Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{generatedWorkflow.steps.length}</div>
                  <div className="text-sm text-gray-600">Total Steps</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{generatedWorkflow.approvalSteps.length}</div>
                  <div className="text-sm text-gray-600">Approval Points</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{generatedWorkflow.estimated_duration}</div>
                  <div className="text-sm text-gray-600">Est. Duration</div>
                </div>
              </div>

              {/* Workflow Steps Visualization */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Workflow Steps
                </h4>
                <div className="space-y-3">
                  {generatedWorkflow.steps.map((step: any, index: number) => (
                    <div key={step.id} className="flex items-center space-x-4 p-3 bg-white/60 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <step.icon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{step.name}</span>
                          <Badge variant="outline" className="text-xs">{step.type}</Badge>
                          {step.approver_role && (
                            <Badge className="text-xs bg-orange-100 text-orange-800">
                              {step.approver_role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                        {step.condition && (
                          <p className="text-xs text-blue-600 mt-1">Condition: {step.condition}</p>
                        )}
                      </div>
                      {index < generatedWorkflow.steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowInputForm(true)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Create This Workflow
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setGeneratedWorkflow(null);
                    setPrompt('');
                  }}
                >
                  Generate New
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
