
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Save, Bot, Sparkles, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { AIWorkflowGenerator } from './AIWorkflowGenerator';
import { ActiveWorkflows } from './ActiveWorkflows';
import { WorkflowCanvas } from './WorkflowCanvas';

const workflowTemplates = [
  {
    id: 1,
    name: 'Customer Onboarding',
    description: 'Automate new customer registration and setup process',
    steps: 4,
    agents: ['DocumentAI', 'NotificationBot'],
    category: 'Customer Management'
  },
  {
    id: 2,
    name: 'Invoice Processing',
    description: 'Extract, validate, and process invoices automatically',
    steps: 6,
    agents: ['OCR-Agent', 'ValidationBot', 'ApprovalAI'],
    category: 'Finance'
  },
  {
    id: 3,
    name: 'Support Ticket Routing',
    description: 'Intelligent routing of support tickets to appropriate teams',
    steps: 3,
    agents: ['ClassifierAI', 'RoutingBot'],
    category: 'Customer Support'
  },
  {
    id: 4,
    name: 'Data Pipeline',
    description: 'ETL process with quality checks and anomaly detection',
    steps: 5,
    agents: ['DataBot', 'QualityAI', 'AlertAgent'],
    category: 'Data Processing'
  }
];

export const WorkflowBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowType, setWorkflowType] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);

  const startFromTemplate = (template) => {
    setSelectedTemplate(template);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setWorkflowType(template.category.toLowerCase().replace(' ', '_'));
    setIsBuilding(true);
    setCurrentWorkflow(null);
    toast.success(`Started building workflow: ${template.name}`);
  };

  const saveWorkflow = () => {
    if (!workflowName) {
      toast.error('Please enter a workflow name');
      return;
    }
    toast.success('Workflow saved successfully!');
  };

  const handleWorkflowGenerated = (generatedWorkflow) => {
    setCurrentWorkflow(generatedWorkflow);
    setWorkflowName(generatedWorkflow.workflow_name || 'AI Generated Workflow');
    setWorkflowType(generatedWorkflow.workflow_type || 'ai_generated');
    setIsBuilding(true);
    setSelectedTemplate(null);
  };

  if (isBuilding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Workflow Builder</h2>
            <p className="text-gray-600 text-lg">Building: {workflowName}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => {
              setIsBuilding(false);
              setCurrentWorkflow(null);
              setSelectedTemplate(null);
            }}>
              Back to Templates
            </Button>
            <Button onClick={saveWorkflow}>
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Test Run
            </Button>
          </div>
        </div>

        {/* Current Workflow Diagram Only */}
        <div className="w-full">
          <WorkflowCanvas 
            selectedTemplate={selectedTemplate}
            workflowName={workflowName}
            workflowType={workflowType}
            generatedWorkflow={currentWorkflow}
            formData={{ 
              workflowName,
              workflowType,
              triggerType,
              assignedAgent
            }}
          />
        </div>

        {/* Configuration Panel */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Workflow Configuration</CardTitle>
            <CardDescription>Configure your workflow settings and properties</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="workflow-name" className="text-base font-medium">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="workflow-type" className="text-base font-medium">Workflow Type</Label>
              <Select value={workflowType} onValueChange={setWorkflowType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense_approval">Expense Approval</SelectItem>
                  <SelectItem value="campaign_approval">Campaign Approval</SelectItem>
                  <SelectItem value="customer_management">Customer Management</SelectItem>
                  <SelectItem value="data_processing">Data Processing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="customer_support">Customer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trigger-type" className="text-base font-medium">Trigger Type</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="schedule">Scheduled</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ai-agent" className="text-base font-medium">Assign AI Agent</Label>
              <Select value={assignedAgent} onValueChange={setAssignedAgent}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docbot">DocumentAI</SelectItem>
                  <SelectItem value="databot">DataBot</SelectItem>
                  <SelectItem value="supportbot">SupportBot</SelectItem>
                  <SelectItem value="financeai">FinanceAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="workflow-description" className="text-base font-medium">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe your workflow"
                rows={4}
                className="mt-2"
              />
            </div>

            {(selectedTemplate || currentWorkflow) && (
              <div className="md:col-span-2 pt-4 border-t">
                <h4 className="font-semibold mb-3 text-lg">
                  {selectedTemplate ? 'Template Information' : 'AI Generated Workflow'}
                </h4>
                {selectedTemplate && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Steps:</strong> {selectedTemplate.steps}
                    </div>
                    <div>
                      <strong>Category:</strong> {selectedTemplate.category}
                    </div>
                    <div>
                      <strong>AI Agents:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTemplate.agents.map((agent, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {currentWorkflow && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Status:</strong> {currentWorkflow.status}
                    </div>
                    <div>
                      <strong>Steps:</strong> {currentWorkflow.steps?.length || 0}
                    </div>
                    <div>
                      <strong>Generated:</strong> AI-Powered
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Workflow Builder</h2>
          <p className="text-gray-600 text-lg">Create intelligent workflows with AI-powered automation</p>
        </div>
        <Button onClick={() => setIsBuilding(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create New Workflow
        </Button>
      </div>

      <Tabs defaultValue="ai-generator" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="ai-generator" className="flex items-center space-x-2 text-base">
            <Sparkles className="h-5 w-5" />
            <span>AI Generator</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-base">Templates</TabsTrigger>
          <TabsTrigger value="active" className="flex items-center space-x-2 text-base">
            <Activity className="h-5 w-5" />
            <span>Active Workflows</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-generator" className="mt-6">
          <AIWorkflowGenerator onWorkflowGenerated={handleWorkflowGenerated} />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </CardTitle>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{template.steps} steps</span>
                      <span>{template.agents.length} AI agents</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.agents.map((agent, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          {agent}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      className="w-full group-hover:bg-blue-600 transition-colors"
                      onClick={() => startFromTemplate(template)}
                    >
                      Use This Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <ActiveWorkflows />
        </TabsContent>
      </Tabs>
    </div>
  );
};
