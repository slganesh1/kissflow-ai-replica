

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VisualWorkflowDiagram } from './VisualWorkflowDiagram';
import { toast } from 'sonner';
import { Plus, Play, Save, Settings, Bot, Mail, FileText, Database, Zap, ArrowRight, Clock, Sparkles, Activity, Users, Brain, TrendingUp, BarChart3, UserCheck, File, Package, CheckCircle, XCircle, Shield, GitBranch, DollarSign } from 'lucide-react';
import { WorkflowChatbot } from './WorkflowChatbot';

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

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  steps: number;
  agents: string[];
  created_at: string;
  status: string;
  updated_at?: string;
}

interface AIWorkflowGeneratorProps {
  generatedWorkflow: any;
  setGeneratedWorkflow: (workflow: any) => void;
  workflowData: WorkflowData | null;
  setWorkflowData: (data: WorkflowData | null) => void;
}

export const AIWorkflowGenerator = ({ generatedWorkflow, setGeneratedWorkflow, workflowData, setWorkflowData }) => {
  const [aiDescription, setAiDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [showChatbot, setShowChatbot] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const generateDetailedWorkflow = (description: string) => {
    const lowerDesc = description.toLowerCase();
    
    // Employee/HR Workflows
    if (lowerDesc.includes('employee') || lowerDesc.includes('hr') || lowerDesc.includes('hiring') || lowerDesc.includes('onboard')) {
      return [
        {
          id: '1',
          name: 'Application Submission',
          type: 'form_input',
          description: 'Candidate submits job application with resume and cover letter',
          icon: FileText,
          status: 'complete',
          estimatedTime: '5 minutes'
        },
        {
          id: '2',
          name: 'AI Resume Screening',
          type: 'ai_analysis',
          description: 'AI analyzes resume for keyword matching, experience level, and qualification scoring',
          icon: Bot,
          status: 'complete',
          estimatedTime: '2 minutes'
        },
        {
          id: '3',
          name: 'HR Initial Review',
          type: 'review',
          description: 'HR team reviews AI recommendations and candidate profile for culture fit',
          icon: Users,
          status: 'pending',
          approver_role: 'HR Recruiter',
          estimatedTime: '24 hours'
        },
        {
          id: '4',
          name: 'Technical Assessment',
          type: 'assessment',
          description: 'Candidate completes role-specific technical evaluation and skills test',
          icon: Brain,
          status: 'pending',
          estimatedTime: '2 hours'
        },
        {
          id: '5',
          name: 'Manager Interview',
          type: 'approval',
          description: 'Hiring manager conducts behavioral and technical interview session',
          icon: UserCheck,
          status: 'pending',
          approver_role: 'Hiring Manager',
          estimatedTime: '48 hours'
        },
        {
          id: '6',
          name: 'Background Check',
          type: 'validation',
          description: 'Third-party verification of employment history, education, and references',
          icon: Shield,
          status: 'pending',
          estimatedTime: '72 hours'
        },
        {
          id: '7',
          name: 'Offer Generation',
          type: 'processing',
          description: 'HR generates offer letter with salary, benefits, and start date details',
          icon: FileText,
          status: 'pending',
          estimatedTime: '12 hours'
        },
        {
          id: '8',
          name: 'Executive Approval',
          type: 'approval',
          description: 'Senior leadership approves compensation package and hiring decision',
          icon: CheckCircle,
          status: 'pending',
          approver_role: 'VP/Director',
          estimatedTime: '24 hours'
        },
        {
          id: '9',
          name: 'Offer Communication',
          type: 'notification',
          description: 'Formal offer extended to candidate with acceptance deadline',
          icon: Mail,
          status: 'pending',
          estimatedTime: '2 hours'
        }
      ];
    }
    
    // Order/Purchase Workflows
    if (lowerDesc.includes('order') || lowerDesc.includes('purchase') || lowerDesc.includes('buy') || lowerDesc.includes('procurement')) {
      return [
        {
          id: '1',
          name: 'Order Placement',
          type: 'form_input',
          description: 'Customer submits order with product selection, quantity, and shipping details',
          icon: Package,
          status: 'complete',
          estimatedTime: '3 minutes'
        },
        {
          id: '2',
          name: 'Inventory Validation',
          type: 'validation',
          description: 'System checks product availability, stock levels, and delivery constraints',
          icon: Database,
          status: 'complete',
          estimatedTime: '30 seconds'
        },
        {
          id: '3',
          name: 'Pricing Calculation',
          type: 'ai_analysis',
          description: 'AI calculates total cost including taxes, shipping, discounts, and promotional offers',
          icon: Bot,
          status: 'complete',
          estimatedTime: '1 minute'
        },
        {
          id: '4',
          name: 'Payment Processing',
          type: 'processing',
          description: 'Secure payment gateway processes credit card or digital payment method',
          icon: DollarSign,
          status: 'pending',
          estimatedTime: '2 minutes'
        },
        {
          id: '5',
          name: 'Fraud Detection',
          type: 'validation',
          description: 'AI-powered fraud detection analyzes payment patterns and risk factors',
          icon: Shield,
          status: 'pending',
          estimatedTime: '5 minutes'
        },
        {
          id: '6',
          name: 'Order Confirmation',
          type: 'notification',
          description: 'Customer receives detailed order confirmation with tracking information',
          icon: Mail,
          status: 'pending',
          estimatedTime: '1 minute'
        },
        {
          id: '7',
          name: 'Warehouse Processing',
          type: 'processing',
          description: 'Warehouse team picks, packs, and prepares order for shipment',
          icon: Package,
          status: 'pending',
          approver_role: 'Warehouse Manager',
          estimatedTime: '4 hours'
        },
        {
          id: '8',
          name: 'Quality Control',
          type: 'review',
          description: 'Quality assurance team inspects packaged order for accuracy and condition',
          icon: CheckCircle,
          status: 'pending',
          estimatedTime: '30 minutes'
        },
        {
          id: '9',
          name: 'Shipping Dispatch',
          type: 'processing',
          description: 'Courier pickup and delivery tracking activation with customer notifications',
          icon: ArrowRight,
          status: 'pending',
          estimatedTime: '24-48 hours'
        }
      ];
    }
    
    // Financial/Expense Workflows
    if (lowerDesc.includes('expense') || lowerDesc.includes('reimburs') || lowerDesc.includes('financial') || lowerDesc.includes('budget')) {
      return [
        {
          id: '1',
          name: 'Expense Submission',
          type: 'form_input',
          description: 'Employee submits expense report with receipts, categories, and business justification',
          icon: FileText,
          status: 'complete',
          estimatedTime: '10 minutes'
        },
        {
          id: '2',
          name: 'Receipt OCR Processing',
          type: 'ai_analysis',
          description: 'AI extracts data from receipt images including amounts, dates, vendors, and categories',
          icon: Bot,
          status: 'complete',
          estimatedTime: '1 minute'
        },
        {
          id: '3',
          name: 'Policy Compliance Check',
          type: 'validation',
          description: 'System validates expenses against company policy limits and approved categories',
          icon: Shield,
          status: 'pending',
          estimatedTime: '2 minutes'
        },
        {
          id: '4',
          name: 'Manager Pre-Approval',
          type: 'approval',
          description: 'Direct manager reviews and approves expense legitimacy and business necessity',
          icon: UserCheck,
          status: 'pending',
          approver_role: 'Direct Manager',
          estimatedTime: '24 hours'
        },
        {
          id: '5',
          name: 'Finance Review',
          type: 'review',
          description: 'Finance team conducts detailed review of high-value or flagged expenses',
          icon: TrendingUp,
          status: 'pending',
          approver_role: 'Finance Analyst',
          estimatedTime: '48 hours'
        },
        {
          id: '6',
          name: 'Budget Impact Analysis',
          type: 'ai_analysis',
          description: 'AI analyzes impact on department budget and generates spending insights',
          icon: BarChart3,
          status: 'pending',
          estimatedTime: '5 minutes'
        },
        {
          id: '7',
          name: 'Accounting Integration',
          type: 'processing',
          description: 'Approved expenses automatically sync with accounting system and general ledger',
          icon: Database,
          status: 'pending',
          estimatedTime: '30 minutes'
        },
        {
          id: '8',
          name: 'Reimbursement Processing',
          type: 'processing',
          description: 'Payroll system processes reimbursement for next pay cycle or direct deposit',
          icon: DollarSign,
          status: 'pending',
          estimatedTime: '72 hours'
        },
        {
          id: '9',
          name: 'Completion Notification',
          type: 'notification',
          description: 'Employee receives confirmation of reimbursement with payment details and timeline',
          icon: Mail,
          status: 'pending',
          estimatedTime: '5 minutes'
        }
      ];
    }
    
    // Customer Support Workflows
    if (lowerDesc.includes('support') || lowerDesc.includes('ticket') || lowerDesc.includes('customer') || lowerDesc.includes('help')) {
      return [
        {
          id: '1',
          name: 'Ticket Creation',
          type: 'form_input',
          description: 'Customer submits support request with issue description, priority level, and contact info',
          icon: FileText,
          status: 'complete',
          estimatedTime: '5 minutes'
        },
        {
          id: '2',
          name: 'AI Categorization',
          type: 'ai_analysis',
          description: 'AI analyzes ticket content to categorize issue type, urgency, and required expertise',
          icon: Bot,
          status: 'complete',
          estimatedTime: '30 seconds'
        },
        {
          id: '3',
          name: 'Knowledge Base Search',
          type: 'ai_analysis',
          description: 'AI searches existing solutions and suggests automated responses for common issues',
          icon: Brain,
          status: 'pending',
          estimatedTime: '1 minute'
        },
        {
          id: '4',
          name: 'Agent Assignment',
          type: 'processing',
          description: 'Intelligent routing assigns ticket to available agent with relevant expertise',
          icon: Users,
          status: 'pending',
          estimatedTime: '15 minutes'
        },
        {
          id: '5',
          name: 'Initial Response',
          type: 'notification',
          description: 'Agent provides acknowledgment and initial assessment with expected resolution timeline',
          icon: Mail,
          status: 'pending',
          approver_role: 'Support Agent',
          estimatedTime: '2 hours'
        },
        {
          id: '6',
          name: 'Issue Investigation',
          type: 'review',
          description: 'Agent investigates issue using customer data, logs, and diagnostic tools',
          icon: Activity,
          status: 'pending',
          estimatedTime: '4 hours'
        },
        {
          id: '7',
          name: 'Escalation Review',
          type: 'approval',
          description: 'Complex issues escalated to senior support or engineering teams for resolution',
          icon: ArrowRight,
          status: 'pending',
          approver_role: 'Senior Support',
          estimatedTime: '8 hours',
          condition: 'If complex technical issue'
        },
        {
          id: '8',
          name: 'Solution Implementation',
          type: 'processing',
          description: 'Agent implements solution and verifies issue resolution with customer',
          icon: CheckCircle,
          status: 'pending',
          estimatedTime: '2 hours'
        },
        {
          id: '9',
          name: 'Customer Satisfaction',
          type: 'review',
          description: 'Customer feedback survey sent to measure satisfaction and identify improvements',
          icon: TrendingUp,
          status: 'pending',
          estimatedTime: '24 hours'
        }
      ];
    }
    
    // Default Generic Workflow
    return [
      {
        id: '1',
        name: 'Request Initiation',
        type: 'form_input',
        description: 'User submits initial request with detailed requirements and supporting documentation',
        icon: FileText,
        status: 'complete',
        estimatedTime: '10 minutes'
      },
      {
        id: '2',
        name: 'AI Content Analysis',
        type: 'ai_analysis',
        description: 'Advanced AI processes request content, extracts key data points, and identifies patterns',
        icon: Bot,
        status: 'complete',
        estimatedTime: '3 minutes'
      },
      {
        id: '3',
        name: 'Automated Validation',
        type: 'validation',
        description: 'System performs comprehensive validation checks against business rules and compliance requirements',
        icon: Shield,
        status: 'pending',
        estimatedTime: '5 minutes'
      },
      {
        id: '4',
        name: 'Risk Assessment',
        type: 'ai_analysis',
        description: 'AI evaluates potential risks, impact assessment, and recommends appropriate approval path',
        icon: Brain,
        status: 'pending',
        estimatedTime: '10 minutes'
      },
      {
        id: '5',
        name: 'Primary Approval',
        type: 'approval',
        description: 'Designated approver reviews request details, AI recommendations, and makes approval decision',
        icon: UserCheck,
        status: 'pending',
        approver_role: 'Department Manager',
        estimatedTime: '24 hours'
      },
      {
        id: '6',
        name: 'Compliance Review',
        type: 'review',
        description: 'Specialized compliance team ensures adherence to regulatory requirements and internal policies',
        icon: CheckCircle,
        status: 'pending',
        approver_role: 'Compliance Officer',
        estimatedTime: '48 hours'
      },
      {
        id: '7',
        name: 'Executive Authorization',
        type: 'approval',
        description: 'Senior leadership provides final authorization for high-impact or high-value requests',
        icon: Users,
        status: 'pending',
        approver_role: 'Executive Team',
        estimatedTime: '72 hours',
        condition: 'If request value > $10,000'
      },
      {
        id: '8',
        name: 'Implementation Processing',
        type: 'processing',
        description: 'Automated systems execute approved request with real-time monitoring and status updates',
        icon: Zap,
        status: 'pending',
        estimatedTime: '2-6 hours'
      },
      {
        id: '9',
        name: 'Completion Notification',
        type: 'notification',
        description: 'All stakeholders receive detailed completion notification with results and next steps',
        icon: Mail,
        status: 'pending',
        estimatedTime: '5 minutes'
      },
      {
        id: '10',
        name: 'Performance Analytics',
        type: 'ai_analysis',
        description: 'AI generates performance metrics, identifies optimization opportunities, and updates workflow intelligence',
        icon: BarChart3,
        status: 'pending',
        estimatedTime: '15 minutes'
      }
    ];
  };

  const generateWorkflow = async () => {
    if (!aiDescription.trim()) {
      toast.error('Please enter a description for the AI to generate a workflow.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generatedSteps = generateDetailedWorkflow(aiDescription);

      // Create intelligent workflow name if not provided
      const intelligentName = workflowName || (() => {
        const desc = aiDescription.toLowerCase();
        if (desc.includes('employee') || desc.includes('hr')) return 'Employee Management Workflow';
        if (desc.includes('order') || desc.includes('purchase')) return 'Order Processing Workflow';
        if (desc.includes('expense') || desc.includes('reimburs')) return 'Expense Reimbursement Workflow';
        if (desc.includes('support') || desc.includes('ticket')) return 'Customer Support Workflow';
        return 'Smart Business Process Workflow';
      })();

      const newWorkflowData = {
        id: `workflow-${Date.now()}`,
        name: intelligentName,
        description: workflowDescription || `Intelligent workflow: ${aiDescription}`,
        type: 'ai-generated',
        category: 'Business Process',
        steps: generatedSteps.length,
        agents: ['AI Processor', 'Smart Validator', 'Decision Engine'],
        created_at: new Date().toISOString(),
        status: 'draft'
      };

      setGeneratedWorkflow({ steps: generatedSteps });
      setWorkflowData(newWorkflowData);
      toast.success(`Detailed ${generatedSteps.length}-step workflow generated successfully!`);
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkflow = () => {
    if (!workflowName) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (!workflowDescription) {
      toast.error('Please enter a workflow description');
      return;
    }

    if (!generatedWorkflow) {
      toast.error('Please generate a workflow first');
      return;
    }

    // Update the current workflow data
    const updatedWorkflow = {
      ...workflowData,
      name: workflowName,
      description: workflowDescription,
      updated_at: new Date().toISOString(),
      status: 'saved'
    };

    setWorkflowData(updatedWorkflow);
    setGeneratedWorkflow(updatedWorkflow);

    toast.success('Workflow saved successfully!');
  };

  const deployWorkflow = async () => {
    if (!generatedWorkflow) {
      toast.error('Please generate a workflow first');
      return;
    }

    if (!workflowName || !workflowDescription) {
      toast.error('Please save the workflow first before deploying');
      return;
    }

    setIsDeploying(true);
    try {
      // Simulate real deployment process
      toast.info('Starting deployment process...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.info('Validating workflow steps...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.info('Activating workflow agents...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Update workflow status to deployed
      const deployedWorkflow = {
        ...workflowData,
        status: 'deployed',
        deployed_at: new Date().toISOString(),
        is_active: true,
        deployment_id: `deploy-${Date.now()}`
      };
      
      setWorkflowData(deployedWorkflow);
      setGeneratedWorkflow({ ...generatedWorkflow, ...deployedWorkflow });
      
      toast.success('🚀 Workflow deployed successfully and is now active!');
    } catch (error) {
      console.error('Error deploying workflow:', error);
      toast.error('Failed to deploy workflow. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleWorkflowUpdate = (updatedWorkflow: any) => {
    setGeneratedWorkflow(updatedWorkflow);
    setWorkflowData(updatedWorkflow);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-pink-500 to-violet-600 rounded-xl text-white shadow-lg">
        <h2 className="text-2xl font-bold">✨ AI Workflow Generator</h2>
        <p className="text-pink-100">Describe your ideal workflow and let AI build it for you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Description Input */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-pink-50">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Describe Your Workflow</span>
            </CardTitle>
            <CardDescription className="text-pink-100">Enter a detailed description to generate your workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div>
              <Label htmlFor="ai-description">AI Description</Label>
              <Textarea
                id="ai-description"
                placeholder="e.g., 'Process a customer order from submission to delivery, including validation, payment, and shipping'"
                rows={4}
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={generateWorkflow}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
            >
              {isLoading ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                  </div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Configuration */}
        {generatedWorkflow && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Workflow Configuration</span>
              </CardTitle>
              <CardDescription className="text-blue-100">Configure your workflow settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  placeholder="Enter workflow name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Workflow Description</Label>
                <Textarea
                  id="workflow-description"
                  placeholder="Enter workflow description"
                  rows={3}
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Generated Steps ({generatedWorkflow.steps.length})</h4>
                <div className="max-h-32 overflow-y-auto">
                  <ul className="list-disc pl-4 space-y-1">
                    {generatedWorkflow.steps.map((step, index) => (
                      <li key={step.id} className="text-xs">
                        <span className="font-medium">{step.name}</span>
                        {step.estimatedTime && (
                          <span className="text-gray-500 ml-1">({step.estimatedTime})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {generatedWorkflow && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Workflow Diagram - Now shown by default */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Visual Workflow Diagram</span>
                </CardTitle>
                <CardDescription className="text-indigo-100">Interactive workflow visualization</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <VisualWorkflowDiagram workflow={generatedWorkflow} />
              </CardContent>
            </Card>
          </div>

          {/* Workflow Actions */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <Button
                onClick={saveWorkflow}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
              <Button
                onClick={deployWorkflow}
                disabled={isDeploying}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                {isDeploying ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                    </div>
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Deploy Workflow
                  </>
                )}
              </Button>
              {/* AI Chatbot Button - Fixed */}
              <Button
                onClick={() => {
                  setShowChatbot(true);
                  setIsChatMinimized(false);
                  console.log('Opening chatbot:', { showChatbot: true, isChatMinimized: false });
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Bot className="h-4 w-4 mr-2" />
                Chat with AI Assistant
              </Button>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
              
              {/* Workflow Status Display */}
              {workflowData && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Workflow Status</h4>
                  <div className="space-y-2">
                    <Badge className={
                      workflowData.status === 'deployed' ? 'bg-green-500 text-white' :
                      workflowData.status === 'saved' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }>
                      {workflowData.status === 'deployed' ? '🚀 Deployed' :
                       workflowData.status === 'saved' ? '💾 Saved' : '📝 Draft'}
                    </Badge>
                    {workflowData.deployed_at && (
                      <div className="text-xs text-gray-600">
                        Deployed: {new Date(workflowData.deployed_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Chatbot - Fixed functionality */}
      {showChatbot && generatedWorkflow && (
        <WorkflowChatbot
          workflow={generatedWorkflow}
          onWorkflowUpdate={handleWorkflowUpdate}
          isMinimized={isChatMinimized}
          onToggleMinimize={() => {
            setIsChatMinimized(!isChatMinimized);
            console.log('Toggling chatbot minimize:', !isChatMinimized);
          }}
        />
      )}
    </div>
  );
};

