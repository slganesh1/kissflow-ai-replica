
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Clock, CheckCircle, AlertCircle, Users, FileText, Shield, Calculator, CreditCard, Building } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'form' | 'ai_analysis' | 'review' | 'approval' | 'assessment' | 'validation' | 'processing' | 'notification' | 'automated_check';
  description: string;
  assignee?: string;
  duration: string;
  icon: string;
  conditions?: {
    approved?: string;
    rejected?: string;
  };
}

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

  const analyzeWorkflowType = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('loan') || lowerDesc.includes('credit') || lowerDesc.includes('bank') || lowerDesc.includes('lending')) {
      return 'loan_approval';
    }
    if (lowerDesc.includes('expense') || lowerDesc.includes('purchase') || lowerDesc.includes('budget')) {
      return 'expense_approval';
    }
    if (lowerDesc.includes('hire') || lowerDesc.includes('recruit') || lowerDesc.includes('interview') || lowerDesc.includes('candidate')) {
      return 'hiring_process';
    }
    if (lowerDesc.includes('campaign') || lowerDesc.includes('marketing') || lowerDesc.includes('advertisement')) {
      return 'campaign_approval';
    }
    if (lowerDesc.includes('contract') || lowerDesc.includes('vendor') || lowerDesc.includes('supplier')) {
      return 'contract_approval';
    }
    
    return 'custom_workflow';
  };

  const generateLoanApprovalWorkflow = (): WorkflowStep[] => {
    return [
      {
        id: 'application_submission',
        name: 'Loan Application Submission',
        type: 'form',
        description: 'Customer submits loan application with required documents (ID, salary slips, tax returns)',
        duration: '10 minutes',
        icon: 'FileText'
      },
      {
        id: 'document_verification',
        name: 'AI Document Verification',
        type: 'ai_analysis',
        description: 'AI validates document authenticity, completeness, and extracts key information',
        duration: '3 minutes',
        icon: 'Bot'
      },
      {
        id: 'credit_score_check',
        name: 'Credit Score Assessment',
        type: 'automated_check',
        description: 'System pulls credit score from CIBIL and checks loan history and affordability',
        duration: '5 minutes',
        icon: 'CreditCard'
      },
      {
        id: 'fraud_risk_analysis',
        name: 'Fraud & Risk Detection',
        type: 'ai_analysis',
        description: 'AI analyzes application patterns, location data, and assigns risk score (low/medium/high)',
        duration: '2 minutes',
        icon: 'Shield'
      },
      {
        id: 'automated_approval_check',
        name: 'Automated Pre-Approval',
        type: 'automated_check',
        description: 'System determines if loan qualifies for automatic approval based on risk score',
        duration: '1 minute',
        icon: 'CheckCircle',
        conditions: {
          approved: 'Low Risk - Auto Approve',
          rejected: 'Medium/High Risk - Manual Review'
        }
      },
      {
        id: 'manager_review',
        name: 'Manager Quick Review',
        type: 'approval',
        description: 'Branch manager reviews low-risk applications for final sign-off',
        assignee: 'Branch Manager',
        duration: '2 hours',
        icon: 'Users'
      },
      {
        id: 'committee_review',
        name: 'Loan Committee Review',
        type: 'review',
        description: 'Risk officer, compliance officer, and loan manager review medium/high risk applications',
        assignee: 'Loan Committee',
        duration: '24-48 hours',
        icon: 'Users'
      },
      {
        id: 'final_decision',
        name: 'Final Loan Decision',
        type: 'approval',
        description: 'Committee makes final approval/rejection decision with terms',
        assignee: 'Loan Committee',
        duration: '1 hour',
        icon: 'CheckCircle',
        conditions: {
          approved: 'Generate Offer',
          rejected: 'Send Rejection Notice'
        }
      },
      {
        id: 'offer_generation',
        name: 'Loan Offer Preparation',
        type: 'processing',
        description: 'System generates formal loan offer with amount, interest rate, and repayment terms',
        duration: '30 minutes',
        icon: 'FileText'
      },
      {
        id: 'customer_acceptance',
        name: 'Customer Digital Signature',
        type: 'form',
        description: 'Customer reviews and digitally signs the loan agreement',
        duration: '15 minutes',
        icon: 'FileText'
      },
      {
        id: 'account_creation',
        name: 'Loan Account Setup',
        type: 'processing',
        description: 'Bank creates loan account and prepares for disbursement',
        duration: '1 hour',
        icon: 'Building'
      },
      {
        id: 'disbursement',
        name: 'Loan Disbursement',
        type: 'processing',
        description: 'Funds transferred to customer account with SMS/email confirmation',
        duration: '2 hours',
        icon: 'CreditCard'
      },
      {
        id: 'regulatory_reporting',
        name: 'Regulatory Compliance',
        type: 'automated_check',
        description: 'System reports loan details to government agencies and tax authorities',
        duration: '24 hours',
        icon: 'Shield'
      }
    ];
  };

  const generateWorkflowSteps = (description: string, workflowType: string): WorkflowStep[] => {
    switch (workflowType) {
      case 'loan_approval':
        return generateLoanApprovalWorkflow();
      
      case 'expense_approval':
        return [
          {
            id: 'expense_submission',
            name: 'Expense Request Submission',
            type: 'form',
            description: 'Employee submits expense request with receipts and justification',
            duration: '5 minutes',
            icon: 'FileText'
          },
          {
            id: 'manager_approval',
            name: 'Manager Approval',
            type: 'approval',
            description: 'Direct manager reviews and approves/rejects expense request',
            assignee: 'Direct Manager',
            duration: '24 hours',
            icon: 'Users'
          },
          {
            id: 'finance_review',
            name: 'Finance Department Review',
            type: 'review',
            description: 'Finance team validates expense policy compliance and processes payment',
            assignee: 'Finance Team',
            duration: '48 hours',
            icon: 'Calculator'
          }
        ];
      
      default:
        // Generic workflow based on description analysis
        return [
          {
            id: 'request_submission',
            name: 'Request Submission',
            type: 'form',
            description: 'User submits request with required information',
            duration: '5 minutes',
            icon: 'FileText'
          },
          {
            id: 'initial_review',
            name: 'Initial Review',
            type: 'review',
            description: 'System or reviewer performs initial validation',
            duration: '1 hour',
            icon: 'Bot'
          },
          {
            id: 'approval_decision',
            name: 'Approval Decision',
            type: 'approval',
            description: 'Authorized person makes final decision',
            assignee: 'Approver',
            duration: '24 hours',
            icon: 'CheckCircle'
          }
        ];
    }
  };

  const generateWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the workflow you want to create');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const workflowType = analyzeWorkflowType(prompt);
      const steps = generateWorkflowSteps(prompt, workflowType);
      
      const workflow = {
        id: `ai-generated-${Date.now()}`,
        name: workflowType === 'loan_approval' ? 'Bank Loan Approval Process' : 
              workflowType === 'expense_approval' ? 'Expense Approval Workflow' :
              'Custom Workflow',
        description: prompt.slice(0, 200) + (prompt.length > 200 ? '...' : ''),
        type: workflowType,
        steps: steps,
        created_at: new Date().toISOString(),
        status: 'draft',
        estimated_duration: calculateTotalDuration(steps)
      };
      
      setGeneratedWorkflow(workflow);
      setWorkflowData(workflow);
      
      toast.success(`Generated ${workflowType.replace('_', ' ')} workflow with ${steps.length} steps!`);
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotalDuration = (steps: WorkflowStep[]): string => {
    // Simple duration calculation - in reality this would be more sophisticated
    const totalMinutes = steps.length * 30; // Rough estimate
    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else if (totalMinutes < 1440) {
      return `${Math.round(totalMinutes / 60)} hours`;
    } else {
      return `${Math.round(totalMinutes / 1440)} days`;
    }
  };

  const getStepIcon = (iconName: string) => {
    const icons = {
      FileText,
      Bot,
      Users,
      CheckCircle,
      AlertCircle,
      Clock,
      Shield,
      Calculator,
      CreditCard,
      Building
    };
    return icons[iconName as keyof typeof icons] || FileText;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      form: 'bg-blue-100 text-blue-800',
      ai_analysis: 'bg-purple-100 text-purple-800',
      review: 'bg-yellow-100 text-yellow-800',
      approval: 'bg-green-100 text-green-800',
      assessment: 'bg-orange-100 text-orange-800',
      validation: 'bg-red-100 text-red-800',
      processing: 'bg-indigo-100 text-indigo-800',
      notification: 'bg-pink-100 text-pink-800',
      automated_check: 'bg-cyan-100 text-cyan-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6" />
            <div>
              <CardTitle className="text-xl">🤖 AI Workflow Generator</CardTitle>
              <CardDescription className="text-pink-100">
                Describe your business process and I'll create an intelligent workflow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe your workflow process:
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: A person applying for a loan at a bank. The customer fills out an online form, uploads documents like ID proof and salary slips. The bank then verifies documents, checks credit score, performs fraud detection, and routes to appropriate approvers based on risk level..."
                rows={4}
                className="w-full"
              />
            </div>
            
            <Button
              onClick={generateWorkflow}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Smart Workflow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedWorkflow && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{generatedWorkflow.name}</CardTitle>
                <CardDescription className="text-indigo-100">
                  {generatedWorkflow.steps?.length || 0} steps • Est. {generatedWorkflow.estimated_duration}
                </CardDescription>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {generatedWorkflow.type?.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700 text-sm">{generatedWorkflow.description}</p>
              
              <div className="space-y-3">
                {generatedWorkflow.steps?.map((step: WorkflowStep, index: number) => {
                  const StepIcon = getStepIcon(step.icon);
                  
                  return (
                    <div key={step.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border shadow-sm">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <StepIcon className="h-5 w-5 text-gray-600" />
                          <h4 className="font-medium text-gray-900">{step.name}</h4>
                          <Badge className={getTypeColor(step.type)}>
                            {step.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{step.duration}</span>
                          </div>
                          {step.assignee && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{step.assignee}</span>
                            </div>
                          )}
                        </div>

                        {step.conditions && (
                          <div className="mt-2 flex space-x-2">
                            {step.conditions.approved && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ✓ {step.conditions.approved}
                              </Badge>
                            )}
                            {step.conditions.rejected && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                ✗ {step.conditions.rejected}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
