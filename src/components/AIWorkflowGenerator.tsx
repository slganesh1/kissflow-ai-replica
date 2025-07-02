
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Clock, CheckCircle, AlertCircle, Users, FileText, Shield, Calculator, CreditCard, Building, Search, Zap, Eye, Send, Mail, UserCheck, ClipboardCheck, Phone, Star, Award, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'form' | 'ai_analysis' | 'review' | 'approval' | 'assessment' | 'validation' | 'processing' | 'notification' | 'automated_check' | 'verification' | 'evaluation';
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

  // Generic workflow step patterns that can be intelligently combined
  const stepPatterns = {
    // Input/Submission patterns
    application: { name: 'Application Submission', type: 'form', icon: 'FileText', duration: '10 minutes' },
    request: { name: 'Request Submission', type: 'form', icon: 'FileText', duration: '5 minutes' },
    registration: { name: 'Registration', type: 'form', icon: 'UserCheck', duration: '15 minutes' },
    
    // AI/Automated Analysis patterns
    document_check: { name: 'Document Verification', type: 'ai_analysis', icon: 'Bot', duration: '2-5 minutes' },
    fraud_detection: { name: 'Fraud Detection', type: 'ai_analysis', icon: 'Shield', duration: '1-3 minutes' },
    risk_assessment: { name: 'Risk Assessment', type: 'ai_analysis', icon: 'AlertCircle', duration: '3-5 minutes' },
    content_analysis: { name: 'Content Analysis', type: 'ai_analysis', icon: 'Search', duration: '2-4 minutes' },
    scoring: { name: 'Automated Scoring', type: 'ai_analysis', icon: 'Star', duration: '1-2 minutes' },
    
    // Verification patterns
    identity_verification: { name: 'Identity Verification', type: 'verification', icon: 'UserCheck', duration: '5-10 minutes' },
    background_check: { name: 'Background Verification', type: 'verification', icon: 'Search', duration: '24-72 hours' },
    reference_check: { name: 'Reference Verification', type: 'verification', icon: 'Phone', duration: '2-3 days' },
    
    // Review patterns
    initial_review: { name: 'Initial Review', type: 'review', icon: 'Eye', duration: '2-4 hours' },
    technical_review: { name: 'Technical Review', type: 'review', icon: 'Bot', duration: '4-6 hours' },
    compliance_review: { name: 'Compliance Review', type: 'review', icon: 'Shield', duration: '1-2 days' },
    
    // Approval patterns
    manager_approval: { name: 'Manager Approval', type: 'approval', icon: 'Users', duration: '4-24 hours', assignee: 'Manager' },
    senior_approval: { name: 'Senior Management Approval', type: 'approval', icon: 'Award', duration: '1-3 days', assignee: 'Senior Manager' },
    committee_approval: { name: 'Committee Approval', type: 'approval', icon: 'Users', duration: '2-5 days', assignee: 'Committee' },
    executive_approval: { name: 'Executive Approval', type: 'approval', icon: 'Award', duration: '3-7 days', assignee: 'Executive' },
    
    // Assessment patterns
    evaluation: { name: 'Evaluation', type: 'assessment', icon: 'ClipboardCheck', duration: '1-2 hours' },
    testing: { name: 'Testing/Assessment', type: 'assessment', icon: 'CheckCircle', duration: '30 minutes - 2 hours' },
    interview: { name: 'Interview', type: 'assessment', icon: 'Users', duration: '30-60 minutes' },
    
    // Processing patterns
    account_setup: { name: 'Account Setup', type: 'processing', icon: 'Building', duration: '30 minutes - 2 hours' },
    payment_processing: { name: 'Payment Processing', type: 'processing', icon: 'CreditCard', duration: '5-30 minutes' },
    document_generation: { name: 'Document Generation', type: 'processing', icon: 'FileText', duration: '10-30 minutes' },
    system_update: { name: 'System Update', type: 'processing', icon: 'Bot', duration: '5-15 minutes' },
    
    // Notification patterns
    notification: { name: 'Notification', type: 'notification', icon: 'Mail', duration: '1-5 minutes' },
    communication: { name: 'Communication', type: 'notification', icon: 'Send', duration: '5-10 minutes' },
    
    // Automated checks
    credit_check: { name: 'Credit Check', type: 'automated_check', icon: 'TrendingUp', duration: '2-10 minutes' },
    eligibility_check: { name: 'Eligibility Check', type: 'automated_check', icon: 'CheckCircle', duration: '1-5 minutes' },
    policy_check: { name: 'Policy Compliance Check', type: 'automated_check', icon: 'Shield', duration: '2-5 minutes' }
  };

  const analyzeWorkflowDescription = (description: string): WorkflowStep[] => {
    const lowerDesc = description.toLowerCase();
    const words = lowerDesc.split(/\s+/);
    const steps: WorkflowStep[] = [];
    let stepCounter = 1;

    // Helper function to create step
    const createStep = (pattern: any, customName?: string, customDesc?: string, customAssignee?: string) => {
      const step: WorkflowStep = {
        id: `step_${stepCounter++}`,
        name: customName || pattern.name,
        type: pattern.type,
        description: customDesc || `${pattern.name} step in the workflow process`,
        duration: pattern.duration,
        icon: pattern.icon,
        assignee: customAssignee || pattern.assignee
      };
      
      if (pattern.type === 'approval') {
        step.conditions = {
          approved: 'Continue to next step',
          rejected: 'Return to submitter or end process'
        };
      }
      
      return step;
    };

    // 1. Always start with some form of input/submission
    if (words.some(w => ['apply', 'application', 'applying'].includes(w))) {
      steps.push(createStep(stepPatterns.application, 'Application Submission', 'User submits application with required documents and information'));
    } else if (words.some(w => ['request', 'submit', 'submits'].includes(w))) {
      steps.push(createStep(stepPatterns.request, 'Request Submission', 'User submits request with necessary details'));
    } else if (words.some(w => ['register', 'registration', 'sign up'].includes(w))) {
      steps.push(createStep(stepPatterns.registration, 'Registration', 'User registers and provides required information'));
    } else {
      steps.push(createStep(stepPatterns.application, 'Initial Submission', 'Process begins with information submission'));
    }

    // 2. Document/Information verification
    if (words.some(w => ['document', 'documents', 'upload', 'proof', 'certificate'].includes(w))) {
      steps.push(createStep(stepPatterns.document_check, 'Document Verification', 'AI verifies document authenticity and completeness'));
    }

    // 3. Identity/Background checks
    if (words.some(w => ['identity', 'background', 'verification', 'check'].includes(w))) {
      if (words.some(w => ['background', 'history', 'previous'].includes(w))) {
        steps.push(createStep(stepPatterns.background_check, 'Background Verification', 'Comprehensive background and history verification'));
      } else {
        steps.push(createStep(stepPatterns.identity_verification, 'Identity Verification', 'Verify identity and personal information'));
      }
    }

    // 4. Credit/Financial checks (for financial processes)
    if (words.some(w => ['credit', 'financial', 'loan', 'bank', 'money', 'payment', 'salary'].includes(w))) {
      steps.push(createStep(stepPatterns.credit_check, 'Credit Assessment', 'Check credit score and financial eligibility'));
    }

    // 5. Risk/Fraud detection
    if (words.some(w => ['fraud', 'risk', 'security', 'suspicious'].includes(w))) {
      steps.push(createStep(stepPatterns.fraud_detection, 'Risk & Fraud Detection', 'AI analyzes for potential fraud and assigns risk score'));
    }

    // 6. Automated eligibility/policy checks
    if (words.some(w => ['eligible', 'eligibility', 'qualify', 'policy', 'compliance'].includes(w))) {
      steps.push(createStep(stepPatterns.eligibility_check, 'Eligibility Assessment', 'System checks eligibility against predefined criteria'));
    }

    // 7. Reviews (different types based on context)
    if (words.some(w => ['review', 'analyze', 'assessment', 'evaluation'].includes(w))) {
      if (words.some(w => ['technical', 'skill', 'code', 'test'].includes(w))) {
        steps.push(createStep(stepPatterns.technical_review, 'Technical Review', 'Technical evaluation and skill assessment'));
      } else if (words.some(w => ['compliance', 'legal', 'regulation'].includes(w))) {
        steps.push(createStep(stepPatterns.compliance_review, 'Compliance Review', 'Review for regulatory and legal compliance'));
      } else {
        steps.push(createStep(stepPatterns.initial_review, 'Initial Review', 'Comprehensive review of submitted information'));
      }
    }

    // 8. Testing/Assessment (for hiring, education, etc.)
    if (words.some(w => ['test', 'testing', 'exam', 'assessment', 'interview', 'evaluate'].includes(w))) {
      if (words.some(w => ['interview', 'meeting', 'discussion'].includes(w))) {
        steps.push(createStep(stepPatterns.interview, 'Interview Process', 'Conduct interview to assess suitability'));
      } else {
        steps.push(createStep(stepPatterns.testing, 'Assessment/Testing', 'Complete required tests or assessments'));
      }
    }

    // 9. Approvals (determine level based on context)
    const needsApproval = words.some(w => ['approval', 'approve', 'manager', 'supervisor', 'committee', 'executive'].includes(w));
    
    if (needsApproval) {
      // Determine approval hierarchy based on context
      if (words.some(w => ['committee', 'board', 'group'].includes(w))) {
        steps.push(createStep(stepPatterns.committee_approval, 'Committee Review', 'Committee evaluates and makes decision'));
      }
      
      if (words.some(w => ['manager', 'supervisor'].includes(w))) {
        steps.push(createStep(stepPatterns.manager_approval, 'Manager Approval', 'Manager reviews and approves request'));
      }
      
      if (words.some(w => ['executive', 'senior', 'director', 'vp'].includes(w)) || 
          words.some(w => ['large', 'high', 'significant', 'major'].includes(w))) {
        steps.push(createStep(stepPatterns.executive_approval, 'Executive Approval', 'Senior leadership final approval'));
      }
      
      // If no specific approval mentioned, add manager approval
      if (!steps.some(s => s.type === 'approval')) {
        steps.push(createStep(stepPatterns.manager_approval, 'Approval Decision', 'Authorized person makes final decision'));
      }
    }

    // 10. Processing/Setup steps
    if (words.some(w => ['account', 'setup', 'create', 'generate', 'prepare'].includes(w))) {
      if (words.some(w => ['account', 'profile', 'system'].includes(w))) {
        steps.push(createStep(stepPatterns.account_setup, 'Account Creation', 'Set up user account and system access'));
      } else if (words.some(w => ['document', 'contract', 'offer', 'letter'].includes(w))) {
        steps.push(createStep(stepPatterns.document_generation, 'Document Generation', 'Generate necessary documents and agreements'));
      }
    }

    // 11. Payment/Financial processing
    if (words.some(w => ['payment', 'money', 'transfer', 'disburse', 'fund'].includes(w))) {
      steps.push(createStep(stepPatterns.payment_processing, 'Payment Processing', 'Process payment or fund transfer'));
    }

    // 12. Final notifications
    if (words.some(w => ['notify', 'notification', 'inform', 'communicate', 'send', 'email', 'sms'].includes(w))) {
      steps.push(createStep(stepPatterns.notification, 'Final Notification', 'Send confirmation and next steps to user'));
    } else {
      // Always end with some form of communication
      steps.push(createStep(stepPatterns.communication, 'Process Completion', 'Communicate final outcome and next steps'));
    }

    // 13. Regulatory/Compliance reporting (for regulated industries)
    if (words.some(w => ['government', 'regulatory', 'compliance', 'report', 'authority', 'tax'].includes(w))) {
      steps.push(createStep(stepPatterns.policy_check, 'Regulatory Reporting', 'Submit required reports to regulatory authorities'));
    }

    return steps;
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
      
      const steps = analyzeWorkflowDescription(prompt);
      
      // Determine workflow type and name based on content
      const lowerPrompt = prompt.toLowerCase();
      let workflowType = 'custom_workflow';
      let workflowName = 'Custom Workflow';
      
      if (lowerPrompt.includes('loan') || lowerPrompt.includes('credit') || lowerPrompt.includes('bank')) {
        workflowType = 'loan_approval';
        workflowName = 'Loan Approval Process';
      } else if (lowerPrompt.includes('hire') || lowerPrompt.includes('recruit') || lowerPrompt.includes('interview')) {
        workflowType = 'hiring_process';
        workflowName = 'Hiring Process';
      } else if (lowerPrompt.includes('expense') || lowerPrompt.includes('purchase')) {
        workflowType = 'expense_approval';
        workflowName = 'Expense Approval';
      } else if (lowerPrompt.includes('campaign') || lowerPrompt.includes('marketing')) {
        workflowType = 'campaign_approval';
        workflowName = 'Campaign Approval';
      } else if (lowerPrompt.includes('contract') || lowerPrompt.includes('vendor')) {
        workflowType = 'contract_approval';
        workflowName = 'Contract Approval';
      } else {
        // Extract potential workflow name from the prompt
        const sentences = prompt.split(/[.!?]/);
        if (sentences.length > 0) {
          const firstSentence = sentences[0].trim();
          if (firstSentence.length < 50) {
            workflowName = firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
          } else {
            workflowName = 'AI Generated Workflow';
          }
        }
      }
      
      const workflow = {
        id: `ai-generated-${Date.now()}`,
        name: workflowName,
        description: prompt.slice(0, 200) + (prompt.length > 200 ? '...' : ''),
        type: workflowType,
        steps: steps,
        created_at: new Date().toISOString(),
        status: 'draft',
        estimated_duration: calculateTotalDuration(steps)
      };
      
      setGeneratedWorkflow(workflow);
      setWorkflowData(workflow);
      
      toast.success(`Generated intelligent workflow with ${steps.length} steps!`);
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotalDuration = (steps: WorkflowStep[]): string => {
    // Estimate based on step types and complexity
    let totalHours = 0;
    
    steps.forEach(step => {
      switch (step.type) {
        case 'form':
          totalHours += 0.25; // 15 minutes
          break;
        case 'ai_analysis':
        case 'automated_check':
          totalHours += 0.1; // 6 minutes
          break;
        case 'review':
          totalHours += 4; // 4 hours
          break;
        case 'approval':
          totalHours += 24; // 1 day
          break;
        case 'assessment':
          totalHours += 2; // 2 hours
          break;
        case 'verification':
          totalHours += 48; // 2 days
          break;
        case 'processing':
          totalHours += 1; // 1 hour
          break;
        default:
          totalHours += 0.5; // 30 minutes
      }
    });

    if (totalHours < 1) {
      return `${Math.round(totalHours * 60)} minutes`;
    } else if (totalHours < 24) {
      return `${Math.round(totalHours)} hours`;
    } else {
      return `${Math.round(totalHours / 24)} days`;
    }
  };

  const getStepIcon = (iconName: string) => {
    const icons = {
      FileText, Bot, Users, CheckCircle, AlertCircle, Clock, Shield, Calculator, CreditCard, Building,
      Search, Zap, Eye, Send, Mail, UserCheck, ClipboardCheck, Phone, Star, Award, TrendingUp, DollarSign
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
      verification: 'bg-cyan-100 text-cyan-800',
      processing: 'bg-indigo-100 text-indigo-800',
      notification: 'bg-pink-100 text-pink-800',
      automated_check: 'bg-teal-100 text-teal-800',
      evaluation: 'bg-amber-100 text-amber-800'
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
              <CardTitle className="text-xl">🤖 Universal AI Workflow Generator</CardTitle>
              <CardDescription className="text-pink-100">
                Describe ANY business process and I'll intelligently create a workflow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe your business process:
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe any workflow process. Examples:&#10;• A person applying for a loan at a bank...&#10;• Employee onboarding process with training...&#10;• Product return and refund process...&#10;• New client onboarding for consulting...&#10;• Insurance claim processing...&#10;• Grant application review process...&#10;&#10;I'll analyze your description and create intelligent workflow steps!"
                rows={6}
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
                  Analyzing & Generating Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Intelligent Workflow
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
                  {generatedWorkflow.steps?.length || 0} intelligent steps • Est. {generatedWorkflow.estimated_duration}
                </CardDescription>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                AI Generated
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
