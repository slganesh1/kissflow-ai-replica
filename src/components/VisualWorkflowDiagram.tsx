
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, Bot, Users, DollarSign, Shield, Clock, ArrowDown, GitBranch } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: any;
  status: string;
  approver_role?: string;
  estimatedTime?: string;
  condition?: string;
}

interface VisualWorkflowDiagramProps {
  workflow: {
    steps: WorkflowStep[];
    amount?: number;
  };
}

export const VisualWorkflowDiagram: React.FC<VisualWorkflowDiagramProps> = ({ workflow }) => {
  const { steps, amount = 0 } = workflow;

  const getStepColor = (type: string) => {
    switch (type) {
      case 'form_input': return 'bg-green-100 border-green-300 text-green-800';
      case 'ai_analysis': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'validation': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'approval': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'review': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'processing': return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'notification': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const renderWorkflowNode = (step: WorkflowStep, index: number) => {
    const isApprovalStep = step.type === 'approval';
    
    return (
      <div key={step.id} className="flex flex-col items-center">
        {/* Main Step Node */}
        <div className={`relative p-4 rounded-lg border-2 min-w-[250px] ${getStepColor(step.type)} shadow-md`}>
          <div className="flex items-center space-x-2 mb-2">
            <step.icon className="h-5 w-5" />
            <span className="font-semibold text-sm">{step.name}</span>
          </div>
          
          <div className="text-xs mb-2">{step.description}</div>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {step.type.replace('_', ' ')}
            </Badge>
            {step.approver_role && (
              <Badge className="text-xs bg-gray-100 text-gray-700">
                {step.approver_role.replace('_', ' ')}
              </Badge>
            )}
            {step.estimatedTime && (
              <Badge className="text-xs bg-blue-50 text-blue-700">
                <Clock className="h-3 w-3 mr-1" />
                {step.estimatedTime}
              </Badge>
            )}
          </div>

          {step.condition && (
            <div className="mt-2 text-xs bg-yellow-50 text-yellow-700 p-1 rounded">
              Condition: {step.condition}
            </div>
          )}
        </div>

        {/* Decision Branching for Approval Steps */}
        {isApprovalStep && index < steps.length - 1 && (
          <div className="my-4">
            <div className="flex items-center justify-center mb-2">
              <GitBranch className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="flex space-x-8">
              {/* Approved Path */}
              <div className="flex flex-col items-center">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Approved</span>
                </div>
                <div className="w-0.5 h-6 bg-green-300 mt-2"></div>
              </div>

              {/* Rejected Path */}
              <div className="flex flex-col items-center">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <XCircle className="h-3 w-3" />
                  <span>Rejected</span>
                </div>
                <div className="w-0.5 h-6 bg-red-300 mt-2"></div>
                <div className="bg-red-100 border-red-300 text-red-800 p-2 rounded text-xs mt-2">
                  Back to Submitter
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connector Arrow */}
        {!isApprovalStep && index < steps.length - 1 && (
          <div className="my-4 flex flex-col items-center">
            <div className="w-0.5 h-8 bg-gray-300"></div>
            <ArrowDown className="h-4 w-4 text-gray-500" />
            <div className="w-0.5 h-8 bg-gray-300"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      {/* Workflow Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500 text-white p-2 rounded-full">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Visual Workflow Diagram</h3>
            <p className="text-gray-600 text-sm">
              {steps.length} steps • {amount > 0 ? `$${amount.toLocaleString()} budget` : 'Standard process'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="flex flex-col items-center space-y-0 max-h-[600px] overflow-y-auto">
        {/* Start Node */}
        <div className="bg-green-500 text-white px-4 py-2 rounded-full font-medium flex items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <span>Start</span>
        </div>

        <div className="w-0.5 h-4 bg-gray-300 mb-4"></div>

        {/* Workflow Steps */}
        {steps.map((step, index) => renderWorkflowNode(step, index))}

        {/* End Node */}
        <div className="mt-6">
          <div className="w-0.5 h-4 bg-gray-300 mb-4"></div>
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium flex items-center space-x-2">
            <span>Complete</span>
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
