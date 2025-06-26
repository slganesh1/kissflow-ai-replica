
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowDown, Plus, FileText, Bot, Mail, Database, Zap, Clock, CheckCircle, User, DollarSign } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  status?: 'pending' | 'active' | 'completed';
}

interface WorkflowCanvasProps {
  selectedTemplate?: any;
  workflowName: string;
  workflowType: string;
  formData?: any;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  selectedTemplate,
  workflowName,
  workflowType,
  formData
}) => {
  const generateWorkflowSteps = (): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];

    // Start step
    steps.push({
      id: 'start',
      name: 'Workflow Start',
      type: 'trigger',
      description: 'Workflow initiated by user',
      icon: FileText,
      color: 'bg-blue-100 border-blue-300 text-blue-700',
      status: 'completed'
    });

    // Generate steps based on template or workflow type
    if (selectedTemplate) {
      switch (selectedTemplate.name) {
        case 'Customer Onboarding':
          steps.push(
            {
              id: 'validate-docs',
              name: 'Document Validation',
              type: 'ai-processing',
              description: 'AI validates customer documents',
              icon: Bot,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active'
            },
            {
              id: 'create-account',
              name: 'Account Creation',
              type: 'database',
              description: 'Create customer account in system',
              icon: Database,
              color: 'bg-purple-100 border-purple-300 text-purple-700',
              status: 'pending'
            },
            {
              id: 'welcome-email',
              name: 'Welcome Email',
              type: 'notification',
              description: 'Send welcome email to customer',
              icon: Mail,
              color: 'bg-orange-100 border-orange-300 text-orange-700',
              status: 'pending'
            }
          );
          break;
        case 'Invoice Processing':
          steps.push(
            {
              id: 'ocr-extract',
              name: 'OCR Extraction',
              type: 'ai-processing',
              description: 'Extract data from invoice using OCR',
              icon: Bot,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active'
            },
            {
              id: 'data-validation',
              name: 'Data Validation',
              type: 'validation',
              description: 'Validate extracted invoice data',
              icon: CheckCircle,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending'
            },
            {
              id: 'approval-required',
              name: 'Manager Approval',
              type: 'approval',
              description: 'Requires manager approval for processing',
              icon: User,
              color: 'bg-red-100 border-red-300 text-red-700',
              status: 'pending'
            }
          );
          break;
        default:
          // Generic template steps
          steps.push(
            {
              id: 'ai-processing',
              name: 'AI Processing',
              type: 'ai-processing',
              description: 'AI analyzes and processes the request',
              icon: Bot,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active'
            },
            {
              id: 'approval',
              name: 'Approval Required',
              type: 'approval',
              description: 'Manager approval required',
              icon: User,
              color: 'bg-red-100 border-red-300 text-red-700',
              status: 'pending'
            }
          );
      }
    } else if (workflowType) {
      // Generate steps based on workflow type
      switch (workflowType) {
        case 'expense_approval':
          steps.push(
            {
              id: 'expense-review',
              name: 'Expense Review',
              type: 'review',
              description: 'Review expense details and documentation',
              icon: DollarSign,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active'
            },
            {
              id: 'manager-approval',
              name: 'Manager Approval',
              type: 'approval',
              description: 'Manager reviews and approves expense',
              icon: User,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending'
            }
          );

          // Add finance director approval for high amounts
          if (formData?.amount && parseFloat(formData.amount) > 1000) {
            steps.push({
              id: 'finance-approval',
              name: 'Finance Director Approval',
              type: 'approval',
              description: 'Finance director approval for high-value expense',
              icon: User,
              color: 'bg-red-100 border-red-300 text-red-700',
              status: 'pending'
            });
          }
          break;
        case 'campaign_approval':
          steps.push(
            {
              id: 'content-review',
              name: 'Content Review',
              type: 'review',
              description: 'Review campaign content and messaging',
              icon: FileText,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active'
            },
            {
              id: 'legal-review',
              name: 'Legal Review',
              type: 'review',
              description: 'Legal compliance review',
              icon: CheckCircle,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending'
            },
            {
              id: 'final-approval',
              name: 'Final Approval',
              type: 'approval',
              description: 'Final campaign approval',
              icon: User,
              color: 'bg-red-100 border-red-300 text-red-700',
              status: 'pending'
            }
          );
          break;
        default:
          // Generic workflow steps
          steps.push(
            {
              id: 'processing',
              name: 'Processing',
              type: 'processing',
              description: 'Process the request',
              icon: Zap,
              color: 'bg-green-100 border-green-300 text-green-700',
              status: 'active'
            },
            {
              id: 'approval',
              name: 'Approval',
              type: 'approval',
              description: 'Approval required',
              icon: User,
              color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
              status: 'pending'
            }
          );
      }
    } else {
      // Default steps when no template or type is selected
      steps.push({
        id: 'placeholder',
        name: 'Add Steps',
        type: 'placeholder',
        description: 'Drag actions here to build your workflow',
        icon: Plus,
        color: 'bg-gray-100 border-gray-300 text-gray-500',
        status: 'pending'
      });
    }

    // End step
    if (steps.length > 1) {
      steps.push({
        id: 'complete',
        name: 'Workflow Complete',
        type: 'end',
        description: 'Workflow completed successfully',
        icon: CheckCircle,
        color: 'bg-green-100 border-green-300 text-green-700',
        status: 'pending'
      });
    }

    return steps;
  };

  const steps = generateWorkflowSteps();

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="text-lg">Workflow Canvas</CardTitle>
        <CardDescription>
          {workflowName || selectedTemplate?.name || 'Visual representation of your workflow'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-full bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 overflow-y-auto">
          {steps.length === 0 || (steps.length === 1 && steps[0].type === 'placeholder') ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Plus className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">Build Your Workflow</p>
              <p className="text-sm text-center">
                Select a template or drag actions from the palette to create your workflow
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`p-4 rounded-lg border-2 ${step.color} min-w-[200px] transition-all hover:shadow-md`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <step.icon className="h-5 w-5" />
                      <span className="font-medium">{step.name}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          step.status === 'completed' ? 'border-green-500 text-green-700' :
                          step.status === 'active' ? 'border-blue-500 text-blue-700' :
                          'border-gray-400 text-gray-600'
                        }
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-80">{step.description}</p>
                    <div className="mt-2 text-xs opacity-60">
                      Type: {step.type}
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
