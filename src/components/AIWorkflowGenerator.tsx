import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Play, Save, FileText, Bot, Mail, Database, Clock, ArrowRight, CheckCircle2, AlertCircle, DollarSign, Users, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

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

  const generateWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a workflow description');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Extract amount from prompt to determine approval complexity
      const amountMatch = prompt.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
      
      const workflowSteps = [];
      const approvalSteps = [];
      
      // Determine workflow type
      const isExpenseWorkflow = prompt.toLowerCase().includes('expense') || selectedWorkflowType === 'expense_approval';
      const isCampaignWorkflow = prompt.toLowerCase().includes('campaign') || selectedWorkflowType === 'campaign_approval' || prompt.toLowerCase().includes('marketing');
      const isPurchaseWorkflow = prompt.toLowerCase().includes('purchase') || selectedWorkflowType === 'purchase_order';
      
      // Step 1: Initial Request
      workflowSteps.push({
        id: 'step-1',
        name: 'Request Submission',
        type: 'form_input',
        description: 'User submits the initial request with detailed requirements and business justification',
        icon: FileText,
        status: 'pending',
        estimatedTime: '15 minutes'
      });

      // Step 2: Automated Analysis
      workflowSteps.push({
        id: 'step-2',
        name: 'AI Risk Assessment',
        type: 'ai_analysis',
        description: 'AI analyzes request for compliance, budget impact, and risk factors',
        icon: Bot,
        status: 'pending',
        estimatedTime: '2 minutes'
      });

      // Step 3: Document Validation
      workflowSteps.push({
        id: 'step-3',
        name: 'Document Validation',
        type: 'validation',
        description: 'System validates all required documents and supporting materials',
        icon: Shield,
        status: 'pending',
        estimatedTime: '5 minutes'
      });

      // Approval Logic Based on Amount and Type
      let approvalOrder = 4;

      if (isCampaignWorkflow || isExpenseWorkflow) {
        // Marketing Manager Approval (always required)
        workflowSteps.push({
          id: `step-${approvalOrder}`,
          name: 'Marketing Manager Approval',
          type: 'approval',
          description: 'Marketing manager reviews strategy alignment and campaign details',
          icon: CheckCircle2,
          status: 'pending',
          approver_role: 'marketing_manager',
          estimatedTime: '2-6 hours'
        });
        
        approvalSteps.push({
          step_id: 'marketing-manager-approval',
          step_name: 'Marketing Manager Approval',
          approver_role: 'marketing_manager',
          required: true,
          order: 1
        });
        approvalOrder++;

        // Finance Review for amounts over $10,000
        if (amount > 10000) {
          workflowSteps.push({
            id: `step-${approvalOrder}`,
            name: 'Finance Team Review',
            type: 'approval',
            description: 'Finance team reviews budget allocation and financial impact',
            icon: DollarSign,
            status: 'pending',
            approver_role: 'finance_analyst',
            condition: 'amount > $10,000',
            estimatedTime: '1-2 hours'
          });
          
          approvalSteps.push({
            step_id: 'finance-review',
            step_name: 'Finance Team Review',
            approver_role: 'finance_analyst',
            required: true,
            order: 2,
            condition: 'amount > $10,000'
          });
          approvalOrder++;
        }

        // Finance Director for amounts over $50,000
        if (amount > 50000) {
          workflowSteps.push({
            id: `step-${approvalOrder}`,
            name: 'Finance Director Approval',
            type: 'approval',
            description: 'Finance director approval for significant budget impact',
            icon: Users,
            status: 'pending',
            approver_role: 'finance_director',
            condition: 'amount > $50,000',
            estimatedTime: '4-8 hours'
          });
          
          approvalSteps.push({
            step_id: 'finance-director-approval',
            step_name: 'Finance Director Approval',
            approver_role: 'finance_director',
            required: true,
            order: 3,
            condition: 'amount > $50,000'
          });
          approvalOrder++;
        }

        // VP/C-Level for amounts over $100,000
        if (amount > 100000) {
          workflowSteps.push({
            id: `step-${approvalOrder}`,
            name: 'Executive Approval',
            type: 'approval',
            description: 'VP or C-level executive approval for major strategic initiatives',
            icon: Shield,
            status: 'pending',
            approver_role: 'executive',
            condition: 'amount > $100,000',
            estimatedTime: '1-3 days'
          });
          
          approvalSteps.push({
            step_id: 'executive-approval',
            step_name: 'Executive Approval',
            approver_role: 'executive',
            required: true,
            order: 4,
            condition: 'amount > $100,000'
          });
          approvalOrder++;
        }

        // Board approval for amounts over $500,000
        if (amount > 500000) {
          workflowSteps.push({
            id: `step-${approvalOrder}`,
            name: 'Board Approval',
            type: 'approval',
            description: 'Board of directors approval required for major financial commitments',
            icon: Users,
            status: 'pending',
            approver_role: 'board',
            condition: 'amount > $500,000',
            estimatedTime: '1-2 weeks'
          });
          
          approvalSteps.push({
            step_id: 'board-approval',
            step_name: 'Board Approval',
            approver_role: 'board',
            required: true,
            order: 5,
            condition: 'amount > $500,000'
          });
          approvalOrder++;
        }
      }

      // Legal Review for large contracts
      if (amount > 75000 || prompt.toLowerCase().includes('contract')) {
        workflowSteps.push({
          id: `step-${approvalOrder}`,
          name: 'Legal Review',
          type: 'review',
          description: 'Legal team reviews contracts and compliance requirements',
          icon: Shield,
          status: 'pending',
          approver_role: 'legal',
          condition: 'contracts or amount > $75,000',
          estimatedTime: '1-3 days'
        });
        approvalOrder++;
      }

      // Procurement step for large purchases
      if (amount > 25000) {
        workflowSteps.push({
          id: `step-${approvalOrder}`,
          name: 'Procurement Processing',
          type: 'processing',
          description: 'Procurement team handles vendor negotiations and purchase orders',
          icon: Database,
          status: 'pending',
          estimatedTime: '2-5 days'
        });
        approvalOrder++;
      }

      // Final notification and execution
      workflowSteps.push({
        id: `step-${approvalOrder}`,
        name: 'Execution & Notification',
        type: 'notification',
        description: 'Execute approved workflow and notify all stakeholders',
        icon: Zap,
        status: 'pending',
        estimatedTime: '30 minutes'
      });

      // Calculate total estimated time
      const totalHours = Math.max(8, approvalSteps.length * 6 + (amount > 100000 ? 24 : 0));
      const complexity = workflowSteps.length > 8 ? 'high' : workflowSteps.length > 5 ? 'medium' : 'low';

      const generatedWorkflowData = {
        id: `workflow-${Date.now()}`,
        name: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        description: prompt,
        type: selectedWorkflowType || 'campaign_approval',
        amount: amount,
        steps: workflowSteps,
        approvalSteps: approvalSteps,
        created_at: new Date().toISOString(),
        status: 'draft',
        triggers: ['manual', 'form_submission'],
        estimated_duration: `${totalHours}-${totalHours * 2} hours`,
        complexity: complexity,
        risk_level: amount > 100000 ? 'high' : amount > 50000 ? 'medium' : 'low'
      };

      console.log('Generated comprehensive workflow:', generatedWorkflowData);
      
      setGeneratedWorkflow(generatedWorkflowData);
      setWorkflowData(generatedWorkflowData);
      
      toast.success(`🎉 Multi-step workflow generated! ${workflowSteps.length} steps with ${approvalSteps.length} approval levels`);
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
                  Generating Multi-Level Workflow...
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

      {/* Enhanced Workflow Display */}
      {generatedWorkflow && generatedWorkflow.steps && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-6 w-6" />
                <span>Multi-Level Workflow Diagram</span>
              </div>
              <div className="flex space-x-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  {generatedWorkflow.complexity} complexity
                </Badge>
                {generatedWorkflow.amount > 0 && (
                  <Badge className="bg-yellow-500/20 text-white border-yellow-300/30">
                    ${generatedWorkflow.amount.toLocaleString()}
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription className="text-green-100">
              {generatedWorkflow.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Enhanced Workflow Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/80 rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-blue-600">{generatedWorkflow.steps.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Steps</div>
                </div>
                <div className="text-center p-4 bg-white/80 rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-green-600">{generatedWorkflow.approvalSteps?.length || 0}</div>
                  <div className="text-sm text-gray-600 font-medium">Approval Levels</div>
                </div>
                <div className="text-center p-4 bg-white/80 rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-purple-600">{generatedWorkflow.estimated_duration}</div>
                  <div className="text-sm text-gray-600 font-medium">Est. Duration</div>
                </div>
                <div className="text-center p-4 bg-white/80 rounded-xl shadow-sm">
                  <div className="text-3xl font-bold text-red-600 capitalize">{generatedWorkflow.risk_level}</div>
                  <div className="text-sm text-gray-600 font-medium">Risk Level</div>
                </div>
              </div>

              {/* Visual Flow Diagram */}
              <div>
                <h4 className="font-semibold mb-6 flex items-center text-xl">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Complete Workflow Flow
                </h4>
                <div className="space-y-4">
                  {generatedWorkflow.steps.map((step: any, index: number) => (
                    <div key={step.id}>
                      <div className="flex items-center space-x-6 p-6 bg-white/90 rounded-xl shadow-md border-l-4 border-blue-400 hover:shadow-lg transition-shadow">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <step.icon className="h-6 w-6 text-gray-700" />
                            <span className="font-bold text-xl text-gray-800">{step.name}</span>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300 font-medium">
                              {step.type.replace('_', ' ')}
                            </Badge>
                            {step.approver_role && (
                              <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-300 font-medium">
                                {step.approver_role.replace('_', ' ')}
                              </Badge>
                            )}
                            {step.estimatedTime && (
                              <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.estimatedTime}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 text-base mb-2">{step.description}</p>
                          {step.condition && (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <p className="text-sm text-amber-700 font-medium bg-amber-50 px-3 py-1 rounded-full">
                                Condition: {step.condition}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < generatedWorkflow.steps.length - 1 && (
                        <div className="flex justify-center py-2">
                          <div className="flex flex-col items-center">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                            <ArrowRight className="h-6 w-6 text-blue-500 transform rotate-90" />
                            <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={() => {
                    toast.success('Multi-level workflow created successfully!');
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg py-3"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Deploy This Workflow
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setGeneratedWorkflow(null);
                    setPrompt('');
                    setSelectedWorkflowType('');
                  }}
                  className="bg-white/50 hover:bg-white/70"
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
