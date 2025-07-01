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
import { Plus, Play, Save, Settings, Bot, Mail, FileText, Database, Zap, ArrowRight, Clock, Sparkles, Activity, Users, Brain, TrendingUp, BarChart3, UserCheck, File, Package, CheckCircle, XCircle, Shield, GitBranch } from 'lucide-react';
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
  const [showVisualDiagram, setShowVisualDiagram] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [showChatbot, setShowChatbot] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const generateWorkflow = async () => {
    if (!aiDescription.trim()) {
      toast.error('Please enter a description for the AI to generate a workflow.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate AI workflow generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const generatedSteps: WorkflowStep[] = [
        {
          id: '1',
          name: 'Submit Form',
          type: 'form_input',
          description: 'User submits the initial request form',
          icon: FileText,
          status: 'complete'
        },
        {
          id: '2',
          name: 'AI Analysis',
          type: 'ai_analysis',
          description: 'AI analyzes the request and extracts key information',
          icon: Bot,
          status: 'complete'
        },
        {
          id: '3',
          name: 'Validation Check',
          type: 'validation',
          description: 'System validates the extracted information against rules',
          icon: CheckCircle,
          status: 'pending'
        },
        {
          id: '4',
          name: 'Approval Request',
          type: 'approval',
          description: 'Request is sent to the appropriate approver',
          icon: Users,
          status: 'pending',
          approver_role: 'Finance Manager',
          estimatedTime: '24 hours'
        },
        {
          id: '5',
          name: 'Compliance Review',
          type: 'review',
          description: 'Compliance team reviews the request',
          icon: Shield,
          status: 'pending',
          estimatedTime: '48 hours'
        },
        {
          id: '6',
          name: 'Process Payment',
          type: 'processing',
          description: 'Payment is processed based on approved request',
          icon: DollarSign,
          status: 'pending'
        },
        {
          id: '7',
          name: 'Send Notification',
          type: 'notification',
          description: 'User is notified of the completed request',
          icon: Mail,
          status: 'pending'
        }
      ];

      const newWorkflowData = {
        id: `workflow-${Date.now()}`,
        name: workflowName || 'Generated Workflow',
        description: workflowDescription || aiDescription,
        type: 'ai-generated',
        category: 'General',
        steps: generatedSteps.length,
        agents: ['AI Analyzer', 'Validation Bot'],
        created_at: new Date().toISOString(),
        status: 'draft'
      };

      setGeneratedWorkflow({ steps: generatedSteps });
      setWorkflowData(newWorkflowData);
      toast.success('AI-powered workflow generated successfully!');
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
      updated_at: new Date().toISOString()
    };

    setWorkflowData(updatedWorkflow);
    setGeneratedWorkflow(updatedWorkflow);

    toast.success('Workflow saved successfully!');
  };

  const deployWorkflow = async () => {
    setIsDeploying(true);
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Workflow deployed successfully!');
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

        {/* Workflow Preview */}
        {generatedWorkflow && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center space-x-2">
                <File className="h-5 w-5" />
                <span>Workflow Preview</span>
              </CardTitle>
              <CardDescription className="text-blue-100">Review the generated workflow steps</CardDescription>
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
                <h4 className="text-sm font-medium">Workflow Steps</h4>
                <ul className="list-disc pl-4">
                  {generatedWorkflow.steps.map((step, index) => (
                    <li key={step.id} className="text-sm">
                      {index + 1}. {step.name} - {step.description}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {generatedWorkflow && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Workflow Diagram */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Visual Diagram</span>
              </CardTitle>
              <CardDescription className="text-indigo-100">Visualize the workflow process</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {showVisualDiagram ? (
                <VisualWorkflowDiagram workflow={generatedWorkflow} />
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <p className="text-gray-600 mb-4">Click to view the visual workflow diagram</p>
                  <Button onClick={() => setShowVisualDiagram(true)} variant="outline">
                    Show Diagram
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
              {/* Add AI Chatbot Button */}
              <Button
                onClick={() => {
                  setShowChatbot(true);
                  setIsChatMinimized(false);
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Chatbot */}
      {showChatbot && generatedWorkflow && (
        <WorkflowChatbot
          workflow={generatedWorkflow}
          onWorkflowUpdate={handleWorkflowUpdate}
          isMinimized={isChatMinimized}
          onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
    </div>
  );
};
