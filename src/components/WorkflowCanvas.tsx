
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowDown, Plus, FileText, Bot, Mail, Database, Zap, Clock, CheckCircle, User, DollarSign, AlertCircle, XCircle } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  status?: 'pending' | 'active' | 'completed' | 'approved' | 'rejected';
  details?: {
    assignee?: string;
    duration?: string;
    priority?: string;
    conditions?: string[];
  };
}

interface WorkflowCanvasProps {
  selectedTemplate?: any;
  workflowName: string;
  workflowType: string;
  formData?: any;
  generatedWorkflow?: any;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  selectedTemplate,
  workflowName,
  workflowType,
  formData,
  generatedWorkflow
}) => {
  const generateWorkflowSteps = (): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];

    // Start step with detailed information
    steps.push({
      id: 'start',
      name: 'Workflow Initiated',
      type: 'trigger',
      description: 'Workflow triggered by user submission',
      icon: FileText,
      color: 'bg-blue-100 border-blue-300 text-blue-700',
      status: 'completed',
      details: {
        assignee: 'System',
        duration: 'Instant',
        priority: 'High'
      }
    });

    // If we have a generated workflow, use its steps with enhanced details
    if (generatedWorkflow) {
      generatedWorkflow.steps.forEach((step: any, index: number) => {
        const stepDetails = {
          assignee: step.type === 'approval' ? 'Manager' : 
                   step.type === 'review' ? 'Reviewer' :
                   step.type === 'ai-processing' ? 'AI Agent' : 'System',
          duration: step.type === 'approval' ? '24-48 hours' :
                   step.type === 'review' ? '2-4 hours' :
                   step.type === 'ai-processing' ? '5-10 minutes' : '1-2 hours',
          priority: generatedWorkflow.request_data?.urgency || 'Medium',
          conditions: step.type === 'approval' && generatedWorkflow.request_data?.amount > 1000 ? 
            ['Amount > $1000', 'Requires senior approval'] : 
            ['Standard workflow conditions']
        };

        steps.push({
          id: step.id,
          name: step.name,
          type: step.type,
          description: step.description,
          icon: step.type === 'approval' ? User : 
                step.type === 'review' ? CheckCircle :
                step.type === 'ai-processing' ? Bot : Zap,
          color: step.status === 'approved' ? 'bg-green-100 border-green-300 text-green-700' :
                 step.status === 'rejected' ? 'bg-red-100 border-red-300 text-red-700' :
                 step.status === 'pending' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
                 'bg-gray-100 border-gray-300 text-gray-700',
          status: step.status,
          details: stepDetails
        });
      });
    } else if (selectedTemplate) {
      // Generate detailed steps based on template
      switch (selectedTemplate.name) {
        case 'Customer Onboarding':
          steps.push(
            {
              id: 'validate-docs',
              name: 'Document Validation',
              type: 'ai-processing',
              description: 'AI validates customer documents using OCR and compliance checks',
              icon: Bot,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active',
              details: {
                assignee: 'DocumentAI Agent',
                duration: '5-10 minutes',
                priority: 'High',
                conditions: ['Valid ID required', 'Address verification', 'Document quality check']
              }
            },
            {
              id: 'compliance-check',
              name: 'Compliance Review',
              type: 'review',
              description: 'Automated compliance and risk assessment',
              icon: CheckCircle,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending',
              details: {
                assignee: 'Compliance Bot',
                duration: '15-30 minutes',
                priority: 'High',
                conditions: ['KYC verification', 'Sanctions check', 'Risk scoring']
              }
            },
            {
              id: 'create-account',
              name: 'Account Creation',
              type: 'database',
              description: 'Create customer account and set up initial services',
              icon: Database,
              color: 'bg-purple-100 border-purple-300 text-purple-700',
              status: 'pending',
              details: {
                assignee: 'Account System',
                duration: '2-5 minutes',
                priority: 'Medium',
                conditions: ['Unique account number', 'Service configuration', 'Access credentials']
              }
            },
            {
              id: 'welcome-sequence',
              name: 'Welcome Communication',
              type: 'notification',
              description: 'Send welcome email and account setup instructions',
              icon: Mail,
              color: 'bg-orange-100 border-orange-300 text-orange-700',
              status: 'pending',
              details: {
                assignee: 'NotificationBot',
                duration: '1-2 minutes',
                priority: 'Low',
                conditions: ['Email template', 'Account details', 'Next steps guide']
              }
            }
          );
          break;
        case 'Invoice Processing':
          steps.push(
            {
              id: 'ocr-extract',
              name: 'OCR Data Extraction',
              type: 'ai-processing',
              description: 'Extract invoice data using advanced OCR technology',
              icon: Bot,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active',
              details: {
                assignee: 'OCR-Agent',
                duration: '3-5 minutes',
                priority: 'High',
                conditions: ['Clear document scan', 'Supported format', 'Text recognition']
              }
            },
            {
              id: 'data-validation',
              name: 'Data Validation & Enrichment',
              type: 'validation',
              description: 'Validate extracted data and enrich with vendor information',
              icon: CheckCircle,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending',
              details: {
                assignee: 'ValidationBot',
                duration: '5-10 minutes',
                priority: 'High',
                conditions: ['Vendor database match', 'Amount validation', 'Date verification']
              }
            },
            {
              id: 'approval-routing',
              name: 'Approval Routing',
              type: 'routing',
              description: 'Route to appropriate approver based on amount and department',
              icon: ArrowRight,
              color: 'bg-blue-100 border-blue-300 text-blue-700',
              status: 'pending',
              details: {
                assignee: 'RoutingBot',
                duration: '1-2 minutes',
                priority: 'Medium',
                conditions: ['Amount threshold', 'Department rules', 'Approver availability']
              }
            },
            {
              id: 'manager-approval',
              name: 'Manager Approval',
              type: 'approval',
              description: 'Manager reviews and approves invoice for processing',
              icon: User,
              color: 'bg-red-100 border-red-300 text-red-700',
              status: 'pending',
              details: {
                assignee: 'Department Manager',
                duration: '24-48 hours',
                priority: 'Medium',
                conditions: ['Budget availability', 'Vendor verification', 'Purchase order match']
              }
            }
          );
          break;
        default:
          // Enhanced generic template steps
          steps.push(
            {
              id: 'ai-analysis',
              name: 'AI Analysis & Processing',
              type: 'ai-processing',
              description: 'AI analyzes request context and determines processing path',
              icon: Bot,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active',
              details: {
                assignee: 'AI Processing Agent',
                duration: '10-15 minutes',
                priority: 'High',
                conditions: ['Content analysis', 'Risk assessment', 'Route determination']
              }
            },
            {
              id: 'approval-required',
              name: 'Human Approval',
              type: 'approval',
              description: 'Human review and approval based on AI recommendations',
              icon: User,
              color: 'bg-red-100 border-red-300 text-red-700',
              status: 'pending',
              details: {
                assignee: 'Assigned Manager',
                duration: '2-24 hours',
                priority: 'Medium',
                conditions: ['AI recommendation review', 'Policy compliance', 'Final authorization']
              }
            }
          );
      }
    } else if (workflowType) {
      // Generate detailed steps based on workflow type
      switch (workflowType) {
        case 'expense_approval':
          steps.push(
            {
              id: 'expense-validation',
              name: 'Expense Validation',
              type: 'validation',
              description: 'Validate expense receipts and categorization',
              icon: CheckCircle,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active',
              details: {
                assignee: 'Expense Bot',
                duration: '5-10 minutes',
                priority: 'High',
                conditions: ['Receipt quality', 'Amount verification', 'Category validation']
              }
            },
            {
              id: 'policy-check',
              name: 'Policy Compliance Check',
              type: 'review',
              description: 'Automated policy compliance verification',
              icon: AlertCircle,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending',
              details: {
                assignee: 'Policy Engine',
                duration: '2-5 minutes',
                priority: 'High',
                conditions: ['Spending limits', 'Category rules', 'Approval thresholds']
              }
            },
            {
              id: 'manager-approval',
              name: 'Manager Approval',
              type: 'approval',
              description: 'Direct manager reviews and approves expense claim',
              icon: User,
              color: 'bg-blue-100 border-blue-300 text-blue-700',
              status: 'pending',
              details: {
                assignee: 'Direct Manager',
                duration: '24-48 hours',
                priority: 'Medium',
                conditions: ['Budget availability', 'Business justification', 'Receipt validity']
              }
            }
          );

          // Add finance director approval for high amounts
          if (formData?.amount && parseFloat(formData.amount) > 1000) {
            steps.push({
              id: 'finance-approval',
              name: 'Finance Director Approval',
              type: 'approval',
              description: 'Senior finance approval required for high-value expenses',
              icon: DollarSign,
              color: 'bg-red-100 border-red-300 text-red-700',
              status: 'pending',
              details: {
                assignee: 'Finance Director',
                duration: '48-72 hours',
                priority: 'High',
                conditions: ['High amount threshold', 'Budget impact', 'Strategic alignment']
              }
            });
          }
          break;
        case 'campaign_approval':
          steps.push(
            {
              id: 'content-analysis',
              name: 'Content Analysis',
              type: 'ai-processing',
              description: 'AI analyzes campaign content for compliance and effectiveness',
              icon: Bot,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active',
              details: {
                assignee: 'Content AI',
                duration: '10-15 minutes',
                priority: 'High',
                conditions: ['Brand compliance', 'Message clarity', 'Target audience fit']
              }
            },
            {
              id: 'legal-review',
              name: 'Legal & Compliance Review',
              type: 'review',
              description: 'Legal team reviews campaign for regulatory compliance',
              icon: CheckCircle,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending',
              details: {
                assignee: 'Legal Team',
                duration: '24-48 hours',
                priority: 'High',
                conditions: ['Regulatory compliance', 'Disclaimer requirements', 'Risk assessment']
              }
            },
            {
              id: 'marketing-approval',
              name: 'Marketing Director Approval',
              type: 'approval',
              description: 'Final approval from marketing leadership',
              icon: User,
              color: 'bg-red-100 border-red-300 text-red-700',
              status: 'pending',
              details: {
                assignee: 'Marketing Director',
                duration: '12-24 hours',
                priority: 'Medium',
                conditions: ['Strategic alignment', 'Budget approval', 'Launch readiness']
              }
            }
          );
          break;
        default:
          // Enhanced generic workflow steps
          steps.push(
            {
              id: 'processing',
              name: 'Request Processing',
              type: 'processing',
              description: 'System processes the submitted request',
              icon: Zap,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active',
              details: {
                assignee: 'Processing Engine',
                duration: '15-30 minutes',
                priority: 'Medium',
                conditions: ['Data validation', 'Rule evaluation', 'Path determination']
              }
            },
            {
              id: 'approval',
              name: 'Approval Required',
              type: 'approval',
              description: 'Approval required to complete the workflow',
              icon: User,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending',
              details: {
                assignee: 'Designated Approver',
                duration: '4-24 hours',
                priority: 'Medium',
                conditions: ['Authorization level', 'Business rules', 'Final verification']
              }
            }
          );
      }
    } else {
      // Default placeholder step
      steps.push({
        id: 'placeholder',
        name: 'Add Workflow Steps',
        type: 'placeholder',
        description: 'Configure your workflow by selecting a template or adding custom steps',
        icon: Plus,
        color: 'bg-gray-100 border-gray-300 text-gray-500',
        status: 'pending',
        details: {
          assignee: 'User',
          duration: 'Configuration needed',
          priority: 'Action Required'
        }
      });
    }

    // Enhanced end step
    if (steps.length > 1 && steps[0].type !== 'placeholder') {
      const allStepsCompleted = generatedWorkflow ? 
        generatedWorkflow.status === 'completed' : false;
      
      steps.push({
        id: 'complete',
        name: 'Workflow Complete',
        type: 'end',
        description: 'Workflow execution completed successfully with all approvals',
        icon: CheckCircle,
        color: allStepsCompleted ? 
          'bg-green-100 border-green-300 text-green-700' : 
          'bg-gray-100 border-gray-300 text-gray-500',
        status: allStepsCompleted ? 'completed' : 'pending',
        details: {
          assignee: 'System',
          duration: 'Instant',
          priority: allStepsCompleted ? 'Completed' : 'Pending'
        }
      });
    }

    return steps;
  };

  const steps = generateWorkflowSteps();

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <span>Workflow Diagram</span>
          {generatedWorkflow && (
            <Badge className="ml-2" variant="outline">
              Status: {generatedWorkflow.status}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {workflowName || selectedTemplate?.name || 'Visual representation of your workflow process'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300 overflow-y-auto">
          {steps.length === 0 || (steps.length === 1 && steps[0].type === 'placeholder') ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Plus className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">Build Your Workflow</p>
              <p className="text-sm text-center">
                Select a template or configure workflow type to generate your workflow diagram
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Card */}
                  <div className={`p-6 rounded-xl border-2 shadow-lg ${step.color} min-w-[320px] max-w-[400px] transition-all hover:shadow-xl hover:scale-105`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{step.name}</h4>
                          <p className="text-sm opacity-75 capitalize">{step.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(step.status)}
                        <Badge 
                          variant="outline" 
                          className={`${getStatusBadgeColor(step.status)} text-xs font-medium`}
                        >
                          {step.status?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm mb-4 leading-relaxed">{step.description}</p>

                    {/* Details Grid */}
                    {step.details && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/20 rounded-lg p-3">
                          <p className="opacity-75 mb-1">Assignee</p>
                          <p className="font-medium">{step.details.assignee}</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                          <p className="opacity-75 mb-1">Duration</p>
                          <p className="font-medium">{step.details.duration}</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                          <p className="opacity-75 mb-1">Priority</p>
                          <p className="font-medium">{step.details.priority}</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                          <p className="opacity-75 mb-1">Step #{index + 1}</p>
                          <p className="font-medium">{step.type}</p>
                        </div>
                      </div>
                    )}

                    {/* Conditions */}
                    {step.details?.conditions && step.details.conditions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs opacity-75 mb-2">Conditions & Requirements:</p>
                        <div className="flex flex-wrap gap-1">
                          {step.details.conditions.map((condition, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-xs bg-black/10 text-current border-black/20"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Flow Arrow */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center py-4">
                      <div className="flex flex-col items-center">
                        <ArrowDown className="h-8 w-8 text-gray-400 animate-bounce" />
                        <div className="w-0.5 h-4 bg-gray-300 mt-1"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Workflow Summary */}
              {steps.length > 2 && (
                <div className="mt-8 p-4 bg-white/50 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-gray-800 mb-2">Workflow Summary</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Total Steps</p>
                      <p>{steps.length}</p>
                    </div>
                    <div>
                      <p className="font-medium">Est. Duration</p>
                      <p>2-5 business days</p>
                    </div>
                    <div>
                      <p className="font-medium">Approval Points</p>
                      <p>{steps.filter(s => s.type === 'approval').length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
