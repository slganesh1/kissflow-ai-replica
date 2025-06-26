import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Save, Settings, Bot, Mail, FileText, Database, Zap, ArrowRight, Clock, Sparkles, Activity, Users, Brain, TrendingUp, BarChart3, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AIWorkflowGenerator } from './AIWorkflowGenerator';
import { ActiveWorkflows } from './ActiveWorkflows';
import { AgentPanel } from './AgentPanel';
import { AgentCoordinator } from './AgentCoordinator';
import { ContinuousOptimizer } from './ContinuousOptimizer';
import { ApproverHierarchy } from './ApproverHierarchy';

const workflowTemplates = [
  {
    id: 1,
    name: 'Customer Onboarding',
    description: 'Automate new customer registration and setup process',
    steps: 4,
    agents: ['DocumentAI', 'NotificationBot'],
    category: 'Customer Management',
    color: 'from-blue-400 to-cyan-400'
  },
  {
    id: 2,
    name: 'Invoice Processing',
    description: 'Extract, validate, and process invoices automatically',
    steps: 6,
    agents: ['OCR-Agent', 'ValidationBot', 'ApprovalAI'],
    category: 'Finance',
    color: 'from-green-400 to-emerald-400'
  },
  {
    id: 3,
    name: 'Support Ticket Routing',
    description: 'Intelligent routing of support tickets to appropriate teams',
    steps: 3,
    agents: ['ClassifierAI', 'RoutingBot'],
    category: 'Customer Support',
    color: 'from-purple-400 to-violet-400'
  },
  {
    id: 4,
    name: 'Data Pipeline',
    description: 'ETL process with quality checks and anomaly detection',
    steps: 5,
    agents: ['DataBot', 'QualityAI', 'AlertAgent'],
    category: 'Data Processing',
    color: 'from-orange-400 to-red-400'
  }
];

const availableActions = [
  { icon: Mail, name: 'Send Email', color: 'bg-gradient-to-r from-blue-400 to-blue-600', category: 'Communication' },
  { icon: FileText, name: 'Process Document', color: 'bg-gradient-to-r from-green-400 to-green-600', category: 'Document' },
  { icon: Database, name: 'Database Query', color: 'bg-gradient-to-r from-purple-400 to-purple-600', category: 'Data' },
  { icon: Bot, name: 'AI Analysis', color: 'bg-gradient-to-r from-orange-400 to-orange-600', category: 'AI' },
  { icon: Zap, name: 'API Call', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', category: 'Integration' },
  { icon: Clock, name: 'Wait/Delay', color: 'bg-gradient-to-r from-gray-400 to-gray-600', category: 'Control' },
];

export const WorkflowBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  
  // Add workflow state that persists across tabs
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [workflowData, setWorkflowData] = useState(null);

  const startFromTemplate = (template) => {
    setSelectedTemplate(template);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setIsBuilding(true);
    toast.success(`Started building workflow: ${template.name}`);
  };

  const saveWorkflow = () => {
    if (!workflowName) {
      toast.error('Please enter a workflow name');
      return;
    }
    toast.success('Workflow saved successfully!');
  };

  if (isBuilding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
          <div>
            <h2 className="text-2xl font-bold">🚀 Workflow Builder</h2>
            <p className="text-indigo-100">Building: {workflowName}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsBuilding(false)} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              ← Back to Templates
            </Button>
            <Button onClick={saveWorkflow} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
            <Button className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-lg">
              <Play className="h-4 w-4 mr-2" />
              Test Run
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Actions Palette */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-lg">🎨 Available Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {availableActions.map((action, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${action.color} text-white border-2 border-transparent hover:border-white/50`}
                    draggable
                  >
                    <div className="flex items-center space-x-3">
                      <action.icon className="h-5 w-5" />
                      <span className="font-medium">{action.name}</span>
                    </div>
                    <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-0">
                      {action.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Canvas */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="text-lg">🎯 Workflow Canvas</CardTitle>
                <CardDescription className="text-purple-100">Drag and drop actions to build your workflow</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-full bg-gradient-to-br from-gray-50 to-indigo-100 rounded-xl p-6 border-2 border-dashed border-indigo-300">
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    {selectedTemplate ? (
                      <div className="space-y-6 w-full">
                        {/* Sample workflow steps based on template */}
                        <div className="flex items-center justify-center">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-xl border-2 border-blue-300 text-white shadow-lg">
                            <FileText className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium text-center">Start Trigger</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <ArrowRight className="h-8 w-8 text-indigo-400" />
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-xl border-2 border-green-300 text-white shadow-lg">
                            <Bot className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium text-center">AI Processing</p>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <ArrowRight className="h-8 w-8 text-indigo-400" />
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded-xl border-2 border-purple-300 text-white shadow-lg">
                            <Mail className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium text-center">Send Notification</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Plus className="h-16 w-16 mb-4 text-indigo-400" />
                        <p className="text-lg font-medium">Drag actions here to build your workflow</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Panel */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="text-lg">⚙️ Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                />
              </div>
              
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe your workflow"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="trigger-type">Trigger Type</Label>
                <Select>
                  <SelectTrigger>
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
                <Label htmlFor="ai-agent">Assign AI Agent</Label>
                <Select>
                  <SelectTrigger>
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">🎨 Workflow Builder</h2>
          <p className="text-cyan-100">Create intelligent workflows with AI-powered automation</p>
        </div>
        <Button onClick={() => setIsBuilding(true)} className="bg-white/20 border-white/30 text-white hover:bg-white/30 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create New Workflow
        </Button>
      </div>

      <Tabs defaultValue="ai-generator" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-1">
          <TabsTrigger value="ai-generator" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-500 data-[state=active]:text-white rounded-lg transition-all duration-300">
            <Sparkles className="h-4 w-4" />
            <span>AI Generator</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-300">Templates</TabsTrigger>
          <TabsTrigger value="active" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg transition-all duration-300">
            <Activity className="h-4 w-4" />
            <span>Active</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-300">
            <Bot className="h-4 w-4" />
            <span>Agents</span>
          </TabsTrigger>
          <TabsTrigger value="coordination" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg transition-all duration-300">
            <Users className="h-4 w-4" />
            <span>Coordination</span>
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all duration-300">
            <TrendingUp className="h-4 w-4" />
            <span>Optimization</span>
          </TabsTrigger>
          <TabsTrigger value="approvers" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-lg transition-all duration-300">
            <UserCheck className="h-4 w-4" />
            <span>Approvers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-generator">
          <AIWorkflowGenerator 
            generatedWorkflow={generatedWorkflow}
            setGeneratedWorkflow={setGeneratedWorkflow}
            workflowData={workflowData}
            setWorkflowData={setWorkflowData}
          />
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105 border-0 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${template.color}`}></div>
                <CardHeader className="bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                      {template.name}
                    </CardTitle>
                    <Badge className={`bg-gradient-to-r ${template.color} text-white border-0`}>{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="bg-gradient-to-br from-gray-50 to-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>{template.steps} steps</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>{template.agents.length} AI agents</span>
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {template.agents.map((agent, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300">
                          <Bot className="h-3 w-3 mr-1" />
                          {agent}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      className={`w-full bg-gradient-to-r ${template.color} hover:shadow-lg transition-all duration-300 text-white border-0`}
                      onClick={() => startFromTemplate(template)}
                    >
                      ✨ Use This Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <ActiveWorkflows />
        </TabsContent>

        <TabsContent value="agents">
          <AgentPanel />
        </TabsContent>

        <TabsContent value="coordination">
          <AgentCoordinator />
        </TabsContent>

        <TabsContent value="optimization">
          <ContinuousOptimizer />
        </TabsContent>

        <TabsContent value="approvers">
          <ApproverHierarchy />
        </TabsContent>
      </Tabs>
    </div>
  );
};
