import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Play, Save, FileText, Bot, Mail, Database, Clock, ArrowRight, CheckCircle2, AlertCircle, DollarSign, Users, Shield, Zap, User, Building, Key, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { VisualWorkflowDiagram } from './VisualWorkflowDiagram';
import { supabase } from '@/integrations/supabase/client';
import type { Database as DatabaseType } from '@/integrations/supabase/types';

type WorkflowStatus = DatabaseType['public']['Enums']['workflow_status'];

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
  const [isExecuting, setIsExecuting] = useState(false);

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
      const isOnboardingWorkflow = prompt.toLowerCase().includes('onboarding') || prompt.toLowerCase().includes('new employee') || prompt.toLowerCase().includes('employee joins') || selectedWorkflowType === 'employee_onboarding';
      const isExpenseWorkflow = prompt.toLowerCase().includes('expense') || selectedWorkflowType === 'expense_approval';
      const isCampaignWorkflow = prompt.toLowerCase().includes('campaign') || selectedWorkflowType === 'campaign_approval' || prompt.toLowerCase().includes('marketing');
      const isPurchaseWorkflow = prompt.toLowerCase().includes('purchase') || selectedWorkflowType === 'purchase_order';
      
      if (isOnboardingWorkflow) {
        // Comprehensive Employee Onboarding Workflow
        
        // Step 1: Hiring Request Approval
        workflowSteps.push({
          id: 'step-1',
          name: 'Hiring Request Approval',
          type: 'approval',
          description: 'HR Manager reviews and approves the new hire request with position details, salary, and start date',
          icon: User,
          status: 'pending',
          approver_role: 'hr_manager',
          estimatedTime: '1-2 hours'
        });

        approvalSteps.push({
          step_id: 'hiring-request-approval',
          step_name: 'Hiring Request Approval',
          approver_role: 'hr_manager',
          required: true,
          order: 1
        });

        // Step 2: Document Collection
        workflowSteps.push({
          id: 'step-2',
          name: 'Document Collection',
          type: 'form_input',
          description: 'Collect required documents: ID, tax forms, emergency contacts, banking details, and contracts',
          icon: FileText,
          status: 'pending',
          estimatedTime: '2-3 days'
        });

        // Step 3: Background Check & Verification
        workflowSteps.push({
          id: 'step-3',
          name: 'Background Check & Verification',
          type: 'validation',
          description: 'HR conducts background verification, reference checks, and document validation',
          icon: Shield,
          status: 'pending',
          estimatedTime: '3-5 days'
        });

        // Step 4: IT Asset Provisioning
        workflowSteps.push({
          id: 'step-4',
          name: 'IT Asset Provisioning',
          type: 'processing',
          description: 'IT team provisions laptop, phone, email account, and software licenses',
          icon: Database,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 5: System Access Setup
        workflowSteps.push({
          id: 'step-5',
          name: 'System Access Setup',
          type: 'processing',
          description: 'IT creates user accounts, sets up VPN access, and configures role-based permissions',
          icon: Key,
          status: 'pending',
          estimatedTime: '4-6 hours'
        });

        // Step 6: Workspace Preparation
        workflowSteps.push({
          id: 'step-6',
          name: 'Workspace Preparation',
          type: 'processing',
          description: 'Admin team prepares desk, assigns parking, orders business cards, and sets up office access',
          icon: Building,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 7: Payroll Setup
        workflowSteps.push({
          id: 'step-7',
          name: 'Payroll Setup',
          type: 'processing',
          description: 'Finance team sets up payroll, benefits enrollment, and tax withholdings',
          icon: DollarSign,
          status: 'pending',
          estimatedTime: '2-3 hours'
        });

        // Step 8: Policy & Compliance Training
        workflowSteps.push({
          id: 'step-8',
          name: 'Policy & Compliance Training',
          type: 'processing',
          description: 'Employee completes mandatory training on policies, safety, and compliance requirements',
          icon: Shield,
          status: 'pending',
          estimatedTime: '4-8 hours'
        });

        // Step 9: Department Integration
        workflowSteps.push({
          id: 'step-9',
          name: 'Department Integration',
          type: 'processing',
          description: 'Department manager introduces team, assigns mentor, and provides role-specific training',
          icon: Users,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 10: IT Security Briefing
        workflowSteps.push({
          id: 'step-10',
          name: 'IT Security Briefing',
          type: 'approval',
          description: 'IT Security team conducts security briefing and confirms system access compliance',
          icon: Shield,
          status: 'pending',
          approver_role: 'it_security',
          estimatedTime: '1 hour'
        });

        approvalSteps.push({
          step_id: 'it-security-briefing',
          step_name: 'IT Security Briefing',
          approver_role: 'it_security',
          required: true,
          order: 2
        });

        // Step 11: Finance Approval
        workflowSteps.push({
          id: 'step-11',
          name: 'Finance Approval',
          type: 'approval',
          description: 'Finance director approves payroll setup and benefits enrollment',
          icon: DollarSign,
          status: 'pending',
          approver_role: 'finance_director',
          estimatedTime: '2-4 hours'
        });

        approvalSteps.push({
          step_id: 'finance-approval',
          step_name: 'Finance Approval',
          approver_role: 'finance_director',
          required: true,
          order: 3
        });

        // Step 12: Department Manager Approval
        workflowSteps.push({
          id: 'step-12',
          name: 'Department Manager Approval',
          type: 'approval',
          description: 'Department manager confirms readiness and approves employee to start working',
          icon: Users,
          status: 'pending',
          approver_role: 'department_manager',
          estimatedTime: '1-2 hours'
        });

        approvalSteps.push({
          step_id: 'department-manager-approval',
          step_name: 'Department Manager Approval',
          approver_role: 'department_manager',
          required: true,
          order: 4
        });

        // Step 13: Welcome & Orientation
        workflowSteps.push({
          id: 'step-13',
          name: 'Welcome & Orientation',
          type: 'notification',
          description: 'Send welcome package, schedule first day orientation, and notify all departments',
          icon: Mail,
          status: 'pending',
          estimatedTime: '1 hour'
        });

        // Step 14: First Day Check-in
        workflowSteps.push({
          id: 'step-14',
          name: 'First Day Check-in',
          type: 'processing',
          description: 'HR conducts first day check-in, collects feedback, and ensures smooth transition',
          icon: CheckCircle2,
          status: 'pending',
          estimatedTime: '30 minutes'
        });

        // Step 15: 30-Day Review
        workflowSteps.push({
          id: 'step-15',
          name: '30-Day Review',
          type: 'review',
          description: 'Schedule 30-day review meeting with manager and HR to assess integration progress',
          icon: Clock,
          status: 'pending',
          estimatedTime: '1 hour'
        });

      } else if (isExpenseWorkflow || isCampaignWorkflow) {
        // ... keep existing code for expense/campaign workflows
        
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
      }

      // Calculate total estimated time
      const totalHours = isOnboardingWorkflow ? 
        Math.max(40, workflowSteps.length * 4) : // Onboarding takes longer
        Math.max(8, approvalSteps.length * 6 + (amount > 100000 ? 24 : 0));
      
      const complexity = workflowSteps.length > 12 ? 'high' : workflowSteps.length > 8 ? 'medium' : 'low';

      const generatedWorkflowData = {
        id: `workflow-${Date.now()}`,
        name: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        description: prompt,
        type: selectedWorkflowType || (isOnboardingWorkflow ? 'employee_onboarding' : 'campaign_approval'),
        amount: amount,
        steps: workflowSteps,
        approvalSteps: approvalSteps,
        created_at: new Date().toISOString(),
        status: 'draft',
        triggers: ['manual', 'form_submission'],
        estimated_duration: isOnboardingWorkflow ? 
          `${Math.ceil(totalHours/8)} business days` : 
          `${totalHours}-${totalHours * 2} hours`,
        complexity: complexity,
        risk_level: isOnboardingWorkflow ? 'medium' : 
          (amount > 100000 ? 'high' : amount > 50000 ? 'medium' : 'low')
      };

      console.log('Generated comprehensive workflow:', generatedWorkflowData);
      
      setGeneratedWorkflow(generatedWorkflowData);
      setWorkflowData(generatedWorkflowData);
      
      toast.success(`🎉 Visual workflow diagram generated! ${workflowSteps.length} steps with ${approvalSteps.length} approval levels`);
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!generatedWorkflow) {
      toast.error('Please generate a workflow first');
      return;
    }

    setIsExecuting(true);
    
    try {
      console.log('Executing workflow:', generatedWorkflow);

      // Create workflow execution record
      const workflowExecutionData = {
        workflow_name: generatedWorkflow.name,
        workflow_type: generatedWorkflow.type || 'campaign_approval',
        submitter_name: 'AI Generated',
        status: 'pending' as WorkflowStatus,
        request_data: {
          description: generatedWorkflow.description,
          amount: generatedWorkflow.amount || 0,
          steps: generatedWorkflow.steps,
          approval_steps: generatedWorkflow.approvalSteps,
          created_at: new Date().toISOString(),
          complexity: generatedWorkflow.complexity,
          estimated_duration: generatedWorkflow.estimated_duration
        }
      };

      console.log('Creating workflow execution:', workflowExecutionData);

      const { data: workflow, error: workflowError } = await supabase
        .from('workflow_executions')
        .insert(workflowExecutionData)
        .select()
        .single();

      if (workflowError) {
        console.error('Error creating workflow:', workflowError);
        toast.error('Failed to execute workflow: ' + workflowError.message);
        return;
      }

      console.log('Workflow executed successfully:', workflow);

      // Create approval records if there are approval steps
      if (generatedWorkflow.approvalSteps && generatedWorkflow.approvalSteps.length > 0) {
        const approvalRecords = generatedWorkflow.approvalSteps.map((step: any, index: number) => ({
          workflow_id: workflow.id,
          step_id: step.step_id,
          step_name: step.step_name,
          approver_role: step.approver_role,
          status: 'pending' as const,
          order_sequence: index + 1
        }));

        console.log('Creating approval records:', approvalRecords);

        const { error: approvalError } = await supabase
          .from('workflow_approvals')
          .insert(approvalRecords);

        if (approvalError) {
          console.error('Error creating approval records:', approvalError);
          toast.error('Failed to create approval records: ' + approvalError.message);
          return;
        }
      }

      const approvalCount = generatedWorkflow.approvalSteps?.length || 0;
      toast.success(
        `🎉 Workflow "${generatedWorkflow.name}" executed successfully! 
        ${approvalCount > 0 ? `Waiting for ${approvalCount} approval(s). Check the Active tab to monitor progress.` : 'Processing...'}`
      );

    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow: ' + (error as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <span>AI Workflow Generator</span>
          </CardTitle>
          <CardDescription className="text-blue-100">
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
                placeholder="Describe your business process... For example: 'When a new employee joins, multiple departments must coordinate — HR, IT, Admin, and Finance. This involves document collection, asset provisioning, access rights, policy compliance, and payroll setup.'"
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
                  <SelectItem value="employee_onboarding">Employee Onboarding</SelectItem>
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
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Visual Workflow Diagram...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Visual Workflow Diagram
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visual Workflow Diagram */}
      {generatedWorkflow && generatedWorkflow.steps && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-6 w-6" />
                <span>Visual Workflow Diagram</span>
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
          <CardContent className="p-0">
            <VisualWorkflowDiagram workflow={generatedWorkflow} />
            
            {/* Action Buttons */}
            <div className="flex space-x-4 p-6">
              <Button 
                onClick={handleExecuteWorkflow}
                disabled={isExecuting}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg py-3"
              >
                {isExecuting ? (
                  <>
                    <Zap className="h-5 w-5 mr-2 animate-spin" />
                    Executing Workflow...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Execute This Workflow
                  </>
                )}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
