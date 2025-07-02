
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, Bot, Users, DollarSign, Shield, Clock, ArrowDown, GitBranch, AlertTriangle, CreditCard, Building, Search, Eye, Mail, UserCheck, ClipboardCheck, Phone, Star, Award, TrendingUp, Send, Zap } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  status?: string;
  assignee?: string;
  duration?: string;
  estimatedTime?: string;
  conditions?: {
    approved?: string;
    rejected?: string;
  };
}

interface VisualWorkflowDiagramProps {
  workflow: {
    name?: string;
    steps: WorkflowStep[];
    amount?: number;
    estimated_duration?: string;
  };
}

export const VisualWorkflowDiagram: React.FC<VisualWorkflowDiagramProps> = ({ workflow }) => {
  const { steps, amount = 0, name = 'Workflow Process', estimated_duration = '' } = workflow;

  const getStepColor = (type: string) => {
    const colors = {
      form: 'bg-blue-100 border-blue-300 text-blue-800',
      ai_analysis: 'bg-purple-100 border-purple-300 text-purple-800',
      validation: 'bg-cyan-100 border-cyan-300 text-cyan-800',
      verification: 'bg-cyan-100 border-cyan-300 text-cyan-800',
      approval: 'bg-orange-100 border-orange-300 text-orange-800',
      review: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      processing: 'bg-indigo-100 border-indigo-300 text-indigo-800',
      notification: 'bg-green-100 border-green-300 text-green-800',
      automated_check: 'bg-teal-100 border-teal-300 text-teal-800',
      assessment: 'bg-amber-100 border-amber-300 text-amber-800',
      evaluation: 'bg-amber-100 border-amber-300 text-amber-800',
      form_input: 'bg-blue-100 border-blue-300 text-blue-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getStepIcon = (iconName: string) => {
    const icons = {
      FileText, Bot, Users, CheckCircle, AlertTriangle, Clock, Shield, 
      CreditCard, Building, Search, Zap, Eye, Send, Mail, UserCheck, 
      ClipboardCheck, Phone, Star, Award, TrendingUp, DollarSign
    };
    return icons[iconName as keyof typeof icons] || FileText;
  };

  const renderDecisionBranch = (step: WorkflowStep, index: number) => {
    const isApprovalStep = step.type === 'approval' || step.conditions;
    
    if (!isApprovalStep || index >= steps.length - 1) return null;

    return (
      <div className="my-6">
        <div className="flex items-center justify-center mb-4">
          <GitBranch className="h-6 w-6 text-gray-500" />
        </div>
        
        <div className="flex justify-center space-x-12">
          {/* Approved Path */}
          <div className="flex flex-col items-center">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-md">
              <CheckCircle className="h-4 w-4" />
              <span>Approved</span>
            </div>
            <div className="w-0.5 h-8 bg-green-400 mt-2"></div>
            <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
              {step.conditions?.approved || 'Continue to next step'}
            </div>
          </div>

          {/* Rejected Path */}
          <div className="flex flex-col items-center">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-md">
              <XCircle className="h-4 w-4" />
              <span>Rejected</span>
            </div>
            <div className="w-0.5 h-8 bg-red-400 mt-2"></div>
            <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-xs mt-2 max-w-[200px] text-center">
              <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
              {step.conditions?.rejected || 'Process ends or returns to submitter'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkflowStep = (step: WorkflowStep, index: number) => {
    const StepIcon = getStepIcon(step.icon);
    const isApprovalStep = step.type === 'approval' || step.conditions;
    const duration = step.duration || step.estimatedTime || '';
    
    return (
      <div key={step.id} className="flex flex-col items-center">
        {/* Step Number Badge */}
        <div className="mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {index + 1}
          </div>
        </div>

        {/* Main Step Card */}
        <div className={`relative p-4 rounded-xl border-2 min-w-[280px] max-w-[320px] ${getStepColor(step.type)} shadow-lg hover:shadow-xl transition-shadow duration-200`}>
          {/* Step Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-white/80 rounded-lg">
              <StepIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm leading-tight">{step.name}</h4>
              <Badge className="text-xs mt-1 bg-white/50">
                {step.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          {/* Step Description */}
          <p className="text-xs mb-3 leading-relaxed opacity-90">
            {step.description}
          </p>
          
          {/* Step Details */}
          <div className="flex flex-wrap gap-2">
            {duration && (
              <Badge className="text-xs bg-blue-50 text-blue-700 border border-blue-200">
                <Clock className="h-3 w-3 mr-1" />
                {duration}
              </Badge>
            )}
            {step.assignee && (
              <Badge className="text-xs bg-purple-50 text-purple-700 border border-purple-200">
                <Users className="h-3 w-3 mr-1" />
                {step.assignee}
              </Badge>
            )}
          </div>
        </div>

        {/* Decision Branching */}
        {renderDecisionBranch(step, index)}

        {/* Connecting Arrow (only if not approval or last step) */}
        {!isApprovalStep && index < steps.length - 1 && (
          <div className="my-4 flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-gray-300 to-gray-400"></div>
            <ArrowDown className="h-5 w-5 text-gray-500 bg-white rounded-full p-1 border-2 border-gray-300" />
            <div className="w-0.5 h-6 bg-gradient-to-b from-gray-400 to-gray-300"></div>
          </div>
        )}

        {/* Continue arrow after approval branches */}
        {isApprovalStep && index < steps.length - 1 && (
          <div className="mt-4 mb-4 flex flex-col items-center">
            <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full mb-2">
              If Approved
            </div>
            <ArrowDown className="h-5 w-5 text-green-500 bg-white rounded-full p-1 border-2 border-green-300" />
            <div className="w-0.5 h-6 bg-green-300"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">{name}</h3>
              <div className="flex items-center space-x-4 text-blue-100 text-sm mt-1">
                <span>{steps.length} steps</span>
                {estimated_duration && (
                  <>
                    <span>•</span>
                    <span>Est. {estimated_duration}</span>
                  </>
                )}
                {amount > 0 && (
                  <>
                    <span>•</span>
                    <span>${amount.toLocaleString()} budget</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-3 py-1">
            Active Workflow
          </Badge>
        </div>
      </div>

      {/* Workflow Content */}
      <div className="p-6">
        <div className="flex flex-col items-center space-y-0 max-h-[700px] overflow-y-auto">
          {/* Start Node */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 mb-6 shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span>START</span>
          </div>

          <div className="w-0.5 h-6 bg-gray-300 mb-4"></div>

          {/* Workflow Steps */}
          {steps.map((step, index) => renderWorkflowStep(step, index))}

          {/* End Node */}
          <div className="mt-6">
            <div className="w-0.5 h-6 bg-gray-300 mb-4"></div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 shadow-lg">
              <span>COMPLETE</span>
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
