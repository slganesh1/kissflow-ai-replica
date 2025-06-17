
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Brain, Zap, Activity, Settings, Plus, Play, Pause, BarChart3, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const agents = [
  {
    id: 1,
    name: 'DocumentAI',
    type: 'Document Processing',
    status: 'active',
    performance: 94,
    tasksCompleted: 1247,
    avgProcessingTime: '2.3s',
    description: 'Extracts and processes information from documents using OCR and NLP',
    capabilities: ['OCR', 'Text Extraction', 'Data Validation', 'Classification'],
    lastActive: '2 minutes ago',
    accuracy: 96.5
  },
  {
    id: 2,
    name: 'SupportBot',
    type: 'Customer Support',
    status: 'active',
    performance: 89,
    tasksCompleted: 892,
    avgProcessingTime: '1.8s',
    description: 'Handles customer inquiries and routes tickets to appropriate teams',
    capabilities: ['Sentiment Analysis', 'Intent Recognition', 'Auto-routing', 'Response Generation'],
    lastActive: '5 minutes ago',
    accuracy: 92.1
  },
  {
    id: 3,
    name: 'DataBot',
    type: 'Data Processing',
    status: 'learning',
    performance: 76,
    tasksCompleted: 534,
    avgProcessingTime: '4.1s',
    description: 'Processes and analyzes large datasets with quality checks',
    capabilities: ['ETL', 'Data Cleaning', 'Anomaly Detection', 'Reporting'],
    lastActive: '12 minutes ago',
    accuracy: 88.7
  },
  {
    id: 4,
    name: 'FinanceAI',
    type: 'Financial Processing',
    status: 'active',
    performance: 97,
    tasksCompleted: 2104,
    avgProcessingTime: '1.2s',
    description: 'Processes invoices, expenses, and financial documents',
    capabilities: ['Invoice Processing', 'Expense Analysis', 'Fraud Detection', 'Compliance'],
    lastActive: '1 minute ago',
    accuracy: 98.2
  },
  {
    id: 5,
    name: 'QualityAI',
    type: 'Quality Assurance',
    status: 'idle',
    performance: 85,
    tasksCompleted: 321,
    avgProcessingTime: '3.7s',
    description: 'Monitors data quality and performs automated testing',
    capabilities: ['Quality Checks', 'Test Automation', 'Error Detection', 'Validation'],
    lastActive: '45 minutes ago',
    accuracy: 94.3
  }
];

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'active':
      return <Activity className="h-4 w-4 text-green-500" />;
    case 'learning':
      return <Brain className="h-4 w-4 text-blue-500" />;
    case 'idle':
      return <Clock className="h-4 w-4 text-gray-500" />;
    default:
      return <Bot className="h-4 w-4" />;
  }
};

export const AgentPanel = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const toggleAgent = (agentId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'idle' : 'active';
    toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Agent Management</h2>
          <p className="text-gray-600">Monitor and manage your intelligent automation agents</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Agent
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Agent Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Active Agents</p>
                    <p className="text-2xl font-bold text-green-900">3</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Learning</p>
                    <p className="text-2xl font-bold text-blue-900">1</p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Total Tasks</p>
                    <p className="text-2xl font-bold text-amber-900">5,098</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Avg Accuracy</p>
                    <p className="text-2xl font-bold text-purple-900">94.0%</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        agent.status === 'active' ? 'bg-green-100' :
                        agent.status === 'learning' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <StatusIcon status={agent.status} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription>{agent.type}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{agent.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Performance</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={agent.performance} className="flex-1" />
                        <span>{agent.performance}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Accuracy</p>
                      <p className="text-lg font-semibold text-green-600">{agent.accuracy}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tasks Completed</p>
                      <p className="font-semibold">{agent.tasksCompleted.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Processing</p>
                      <p className="font-semibold">{agent.avgProcessingTime}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.capabilities.map((capability, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last active: {agent.lastActive}</span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAgent(agent.id, agent.status)}
                      >
                        {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analytics for all agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Bot className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{agent.name}</h3>
                      </div>
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Performance Score</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={agent.performance} className="flex-1" />
                          <span className="text-sm font-medium">{agent.performance}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Accuracy Rate</p>
                        <p className="text-lg font-semibold text-green-600">{agent.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Tasks Completed</p>
                        <p className="text-lg font-semibold">{agent.tasksCompleted.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Avg Processing Time</p>
                        <p className="text-lg font-semibold">{agent.avgProcessingTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>Manage agent settings and training parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Auto-scaling</h3>
                    <p className="text-sm text-gray-600">Automatically scale agents based on workload</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Learning Mode</h3>
                    <p className="text-sm text-gray-600">Allow agents to improve through feedback</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Error Handling</h3>
                    <p className="text-sm text-gray-600">Automatic retry and escalation policies</p>
                  </div>
                  <Badge variant="secondary">Configured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
