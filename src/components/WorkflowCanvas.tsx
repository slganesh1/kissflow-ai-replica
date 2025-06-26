
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

    // If we have a generated workflow, use its steps with enhanced details
    if (generatedWorkflow && generatedWorkflow.steps) {
      generatedWorkflow.steps.forEach((step: any, index: number) => {
        const stepDetails = {
          assignee: step.type === 'approval' ? 'Manager' : 
                   step.type === 'review' ? 'Reviewer' :
                   step.type === 'ai-processing' ? 'AI Agent' : 'System',
          duration: step.type === 'approval' ? '24-48 hours' :
                   step.type === 'review' ? '2-4 hours' :
                   step.type === 'ai-processing' ? '5-10 minutes' : '1-2 hours',
          priority: generatedWorkflow.request_data?.urgency || 'Medium',
          conditions: step.type === 'approval' ? 
            ['Manager approval required', 'Budget verification'] : 
            ['Standard workflow conditions']
        };

        steps.push({
          id: step.id,
          name: step.name,
          type: step.type,
          description: step.description,
          icon: step.type === 'approval' ? User : 
                step.type === 'review' ? CheckCircle :
                step.type === 'ai-processing' ? Bot : 
                step.type === 'trigger' ? FileText :
                step.type === 'notification' ? Mail :
                step.type === 'end' ? CheckCircle : Zap,
          color: step.status === 'completed' ? 'bg-green-100 border-green-300 text-green-700' :
                 step.status === 'active' ? 'bg-blue-100 border-blue-300 text-blue-700' :
                 step.status === 'approved' ? 'bg-green-100 border-green-300 text-green-700' :
                 step.status === 'rejected' ? 'bg-red-100 border-red-300 text-red-700' :
                 step.status === 'pending' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
                 'bg-gray-100 border-gray-300 text-gray-700',
          status: step.status,
          details: stepDetails
        });
      });

      return steps;
    }

    // Start step for templates and manual workflows
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

    // Template-specific detailed steps
    if (selectedTemplate) {
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
                conditions: ['Unique account number', 'Service configuration']
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
                conditions: ['Clear document scan', 'Supported format']
              }
            },
            {
              id: 'data-validation',
              name: 'Data Validation',
              type: 'validation',
              description: 'Validate extracted data and enrich with vendor information',
              icon: CheckCircle,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending',
              details: {
                assignee: 'ValidationBot',
                duration: '5-10 minutes',
                priority: 'High',
                conditions: ['Vendor database match', 'Amount validation']
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
                conditions: ['Budget availability', 'Vendor verification']
              }
            }
          );
          break;

        default:
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
                conditions: ['Content analysis', 'Risk assessment']
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
                conditions: ['AI recommendation review', 'Policy compliance']
              }
            }
          );
      }
    } else if (workflowType) {
      // Workflow type specific steps
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
                conditions: ['Receipt quality', 'Amount verification']
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
                conditions: ['Budget availability', 'Business justification']
              }
            }
          );
          break;

        default:
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
                conditions: ['Data validation', 'Rule evaluation']
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
                conditions: ['Authorization level', 'Business rules']
              }
            }
          );
      }
    }

    // End step
    if (steps.length > 1) {
      steps.push({
        id: 'complete',
        name: 'Workflow Complete',
        type: 'end',
        description: 'Workflow execution completed successfully',
        icon: CheckCircle,
        color: 'bg-green-100 border-green-300 text-green-700',
        status: 'pending',
        details: {
          assignee: 'System',
          duration: 'Instant',
          priority: 'Completed'
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
    <Card className="h-[700px]">
      <CardHeader>
        <CardTitle className="text-xl flex items-center space-x-2">
          <span>Workflow Diagram</span>
          {generatedWorkflow && (
            <Badge className="ml-2" variant="outline">
              Status: {generatedWorkflow.status}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-base">
          {workflowName || selectedTemplate?.name || 'Visual representation of your workflow process'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300 overflow-y-auto">
          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Plus className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">Build Your Workflow</p>
              <p className="text-sm text-center">
                Select a template or configure workflow type to generate your workflow diagram
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Enhanced Step Card */}
                  <div className={`p-6 rounded-xl border-2 shadow-lg ${step.color} min-w-[400px] max-w-[500px] transition-all hover:shadow-xl hover:scale-102`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/30 rounded-lg">
                          <step.icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl">{step.name}</h4>
                          <p className="text-sm opacity-80 capitalize font-medium">{step.type.replace('_', ' ').replace('-', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(step.status)}
                        <Badge 
                          variant="outline" 
                          className={`${getStatusBadgeColor(step.status)} text-xs font-bold`}
                        >
                          {step.status?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm mb-5 leading-relaxed font-medium">{step.description}</p>

                    {/* Details Grid */}
                    {step.details && (
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="bg-white/25 rounded-lg p-3">
                          <p className="opacity-75 mb-1 font-medium">Assignee</p>
                          <p className="font-bold">{step.details.assignee}</p>
                        </div>
                        <div className="bg-white/25 rounded-lg p-3">
                          <p className="opacity-75 mb-1 font-medium">Duration</p>
                          <p className="font-bold">{step.details.duration}</p>
                        </div>
                        <div className="bg-white/25 rounded-lg p-3">
                          <p className="opacity-75 mb-1 font-medium">Priority</p>
                          <p className="font-bold">{step.details.priority}</p>
                        </div>
                        <div className="bg-white/25 rounded-lg p-3">
                          <p className="opacity-75 mb-1 font-medium">Step #{index + 1}</p>
                          <p className="font-bold capitalize">{step.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    )}

                    {/* Conditions */}
                    {step.details?.conditions && step.details.conditions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm opacity-75 mb-2 font-medium">Conditions & Requirements:</p>
                        <div className="flex flex-wrap gap-2">
                          {step.details.conditions.map((condition, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-xs bg-black/15 text-current border-black/25 font-medium"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Flow Arrow */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center py-6">
                      <div className="flex flex-col items-center">
                        <ArrowDown className="h-10 w-10 text-gray-500 animate-bounce" />
                        <div className="w-1 h-6 bg-gray-400 mt-2 rounded"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Enhanced Workflow Summary */}
              {steps.length > 2 && (
                <div className="mt-8 p-6 bg-white/70 rounded-xl border-2 border-gray-200 shadow-lg">
                  <h5 className="font-bold text-lg text-gray-800 mb-4">Workflow Summary</h5>
                  <div className="grid grid-cols-4 gap-6 text-sm text-gray-700">
                    <div className="text-center">
                      <p className="font-bold text-2xl text-blue-600">{steps.length}</p>
                      <p className="font-medium">Total Steps</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-2xl text-green-600">2-5</p>
                      <p className="font-medium">Business Days</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-2xl text-orange-600">{steps.filter(s => s.type === 'approval').length}</p>
                      <p className="font-medium">Approval Points</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-2xl text-purple-600">{steps.filter(s => s.type === 'ai-processing').length}</p>
                      <p className="font-medium">AI Steps</p>
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
