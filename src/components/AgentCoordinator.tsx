
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, Brain, Zap, Users, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  type: 'coordinator' | 'processor' | 'validator' | 'notifier';
  status: 'active' | 'busy' | 'idle';
  currentTask?: string;
  performance: number;
  expertise: string[];
  workload: number;
}

interface WorkflowTask {
  id: string;
  name: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  estimatedTime: number;
  actualTime?: number;
  dependencies: string[];
}

interface CoordinationEvent {
  id: string;
  timestamp: Date;
  type: 'task_assigned' | 'task_completed' | 'agent_communication' | 'escalation';
  message: string;
  agentId: string;
  taskId?: string;
}

export const AgentCoordinator = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'coord-1',
      name: 'MasterCoordinator',
      type: 'coordinator',
      status: 'active',
      performance: 95,
      expertise: ['workflow-orchestration', 'decision-making', 'resource-allocation'],
      workload: 60
    },
    {
      id: 'proc-1',
      name: 'DocumentProcessor',
      type: 'processor',
      status: 'busy',
      currentTask: 'Processing expense report #1247',
      performance: 92,
      expertise: ['document-analysis', 'data-extraction', 'validation'],
      workload: 85
    },
    {
      id: 'valid-1',
      name: 'ValidationAgent',
      type: 'validator',
      status: 'active',
      performance: 98,
      expertise: ['compliance-check', 'fraud-detection', 'policy-validation'],
      workload: 40
    },
    {
      id: 'notif-1',
      name: 'NotificationBot',
      type: 'notifier',
      status: 'idle',
      performance: 89,
      expertise: ['communication', 'alert-management', 'status-updates'],
      workload: 20
    }
  ]);

  const [activeTasks, setActiveTasks] = useState<WorkflowTask[]>([
    {
      id: 'task-1',
      name: 'Marketing Expense Approval',
      type: 'approval',
      priority: 'high',
      assignedAgent: 'proc-1',
      status: 'in-progress',
      estimatedTime: 120,
      dependencies: []
    },
    {
      id: 'task-2',
      name: 'Invoice Validation',
      type: 'validation',
      priority: 'medium',
      assignedAgent: 'valid-1',
      status: 'pending',
      estimatedTime: 90,
      dependencies: ['task-1']
    },
    {
      id: 'task-3',
      name: 'Compliance Check',
      type: 'compliance',
      priority: 'urgent',
      status: 'pending',
      estimatedTime: 60,
      dependencies: []
    }
  ]);

  const [coordinationEvents, setCoordinationEvents] = useState<CoordinationEvent[]>([
    {
      id: 'event-1',
      timestamp: new Date(Date.now() - 120000),
      type: 'task_assigned',
      message: 'Task "Marketing Expense Approval" assigned to DocumentProcessor',
      agentId: 'coord-1',
      taskId: 'task-1'
    },
    {
      id: 'event-2',
      timestamp: new Date(Date.now() - 60000),
      type: 'agent_communication',
      message: 'DocumentProcessor requesting validation support',
      agentId: 'proc-1'
    },
    {
      id: 'event-3',
      timestamp: new Date(Date.now() - 30000),
      type: 'escalation',
      message: 'Urgent compliance check detected, escalating priority',
      agentId: 'coord-1',
      taskId: 'task-3'
    }
  ]);

  const [isCoordinating, setIsCoordinating] = useState(true);

  useEffect(() => {
    if (!isCoordinating) return;

    const interval = setInterval(() => {
      // Simulate real-time coordination
      simulateAgentActivity();
    }, 3000);

    return () => clearInterval(interval);
  }, [isCoordinating]);

  const simulateAgentActivity = () => {
    // Simulate agent workload changes
    setAgents(prev => prev.map(agent => ({
      ...agent,
      workload: Math.max(0, Math.min(100, agent.workload + (Math.random() - 0.5) * 10))
    })));

    // Simulate task progress
    setActiveTasks(prev => prev.map(task => {
      if (task.status === 'in-progress' && Math.random() > 0.7) {
        return { ...task, status: 'completed' };
      }
      return task;
    }));

    // Add coordination events occasionally
    if (Math.random() > 0.8) {
      const newEvent: CoordinationEvent = {
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        type: 'agent_communication',
        message: 'Agent coordination in progress...',
        agentId: 'coord-1'
      };
      
      setCoordinationEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    }
  };

  const assignTaskToOptimalAgent = (taskId: string) => {
    const task = activeTasks.find(t => t.id === taskId);
    if (!task) return;

    // Find the best agent based on expertise, workload, and performance
    const availableAgents = agents.filter(agent => 
      agent.status !== 'busy' && agent.workload < 90
    );

    const optimalAgent = availableAgents.reduce((best, current) => {
      const currentScore = current.performance * (1 - current.workload / 100);
      const bestScore = best.performance * (1 - best.workload / 100);
      return currentScore > bestScore ? current : best;
    });

    setActiveTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, assignedAgent: optimalAgent.id, status: 'in-progress' } : t
    ));

    setAgents(prev => prev.map(agent => 
      agent.id === optimalAgent.id 
        ? { ...agent, status: 'busy', currentTask: task.name, workload: agent.workload + 20 }
        : agent
    ));

    const event: CoordinationEvent = {
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      type: 'task_assigned',
      message: `Task "${task.name}" intelligently assigned to ${optimalAgent.name}`,
      agentId: 'coord-1',
      taskId: taskId
    };

    setCoordinationEvents(prev => [event, ...prev.slice(0, 9)]);
    toast.success(`Task assigned to optimal agent: ${optimalAgent.name}`);
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'coordinator': return Brain;
      case 'processor': return Zap;
      case 'validator': return CheckCircle;
      case 'notifier': return MessageSquare;
      default: return Bot;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Agent Coordination Center</span>
          </h2>
          <p className="text-gray-600">Real-time multi-agent workflow coordination</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={isCoordinating ? "default" : "outline"}
            onClick={() => setIsCoordinating(!isCoordinating)}
          >
            {isCoordinating ? 'Coordinating...' : 'Start Coordination'}
          </Button>
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const IconComponent = getAgentIcon(agent.type);
          return (
            <Card key={agent.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Performance</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={agent.performance} className="flex-1" />
                    <span className="text-xs font-medium">{agent.performance}%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Workload</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={agent.workload} className="flex-1" />
                    <span className="text-xs font-medium">{agent.workload}%</span>
                  </div>
                </div>

                {agent.currentTask && (
                  <div>
                    <p className="text-xs text-gray-500">Current Task:</p>
                    <p className="text-xs font-medium truncate">{agent.currentTask}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {agent.expertise.slice(0, 2).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Tasks and Coordination Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Active Tasks</span>
            </CardTitle>
            <CardDescription>Tasks being coordinated across agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{task.name}</h4>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Est. {task.estimatedTime}s</span>
                  <Badge variant="outline">{task.status}</Badge>
                </div>

                {task.assignedAgent ? (
                  <p className="text-xs text-blue-600">
                    Assigned to: {agents.find(a => a.id === task.assignedAgent)?.name}
                  </p>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => assignTaskToOptimalAgent(task.id)}
                  >
                    Auto-assign to Optimal Agent
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coordination Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Coordination Events</span>
            </CardTitle>
            <CardDescription>Real-time agent coordination activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {coordinationEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {event.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{event.message}</p>
                <p className="text-xs text-gray-600">
                  Agent: {agents.find(a => a.id === event.agentId)?.name}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
