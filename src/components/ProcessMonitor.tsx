
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Search, Filter, RefreshCw, Play, Pause, Square, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

const processData = [
  { time: '00:00', active: 12, completed: 45, failed: 2 },
  { time: '04:00', active: 8, completed: 52, failed: 1 },
  { time: '08:00', active: 25, completed: 68, failed: 3 },
  { time: '12:00', active: 32, completed: 89, failed: 2 },
  { time: '16:00', active: 28, completed: 103, failed: 4 },
  { time: '20:00', active: 15, completed: 87, failed: 1 },
];

const runningProcesses = [
  {
    id: 'proc-001',
    name: 'Customer Onboarding - Batch #127',
    status: 'running',
    progress: 78,
    startTime: '2024-01-15 14:30:00',
    estimatedCompletion: '2024-01-15 15:45:00',
    agent: 'DocumentAI',
    priority: 'high',
    processedItems: 156,
    totalItems: 200,
    errorCount: 2
  },
  {
    id: 'proc-002',
    name: 'Invoice Processing - Weekly Batch',
    status: 'running',
    progress: 45,
    startTime: '2024-01-15 13:15:00',
    estimatedCompletion: '2024-01-15 16:30:00',
    agent: 'FinanceAI',
    priority: 'medium',
    processedItems: 89,
    totalItems: 198,
    errorCount: 0
  },
  {
    id: 'proc-003',
    name: 'Data Quality Check - Daily',
    status: 'paused',
    progress: 92,
    startTime: '2024-01-15 12:00:00',
    estimatedCompletion: '2024-01-15 14:15:00',
    agent: 'QualityAI',
    priority: 'low',
    processedItems: 276,
    totalItems: 300,
    errorCount: 5
  },
  {
    id: 'proc-004',
    name: 'Support Ticket Classification',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15 11:30:00',
    estimatedCompletion: '2024-01-15 12:45:00',
    agent: 'SupportBot',
    priority: 'high',
    processedItems: 342,
    totalItems: 342,
    errorCount: 1
  },
  {
    id: 'proc-005',
    name: 'Email Campaign Processing',
    status: 'failed',
    progress: 23,
    startTime: '2024-01-15 10:00:00',
    estimatedCompletion: '2024-01-15 11:00:00',
    agent: 'MarketBot',
    priority: 'medium',
    processedItems: 45,
    totalItems: 195,
    errorCount: 12
  }
];

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'running':
      return <Play className="h-4 w-4 text-green-500" />;
    case 'paused':
      return <Pause className="h-4 w-4 text-yellow-500" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'failed':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export const ProcessMonitor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProcesses = runningProcesses.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      running: 'default',
      paused: 'secondary',
      completed: 'default',
      failed: 'destructive'
    };
    
    const colors = {
      running: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Process Monitor</h2>
          <p className="text-gray-600">Real-time monitoring of workflow processes and AI agents</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Active Processes</p>
                <p className="text-2xl font-bold text-green-900">
                  {runningProcesses.filter(p => p.status === 'running').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Completed Today</p>
                <p className="text-2xl font-bold text-blue-900">47</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Queue Length</p>
                <p className="text-2xl font-bold text-amber-900">12</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">96.8%</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Process Activity</CardTitle>
          <CardDescription>Real-time process execution over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={processData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="active" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
              <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Process List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Running Processes</CardTitle>
              <CardDescription>Monitor and manage active workflow processes</CardDescription>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search processes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProcesses.map((process) => (
              <Card key={process.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <StatusIcon status={process.status} />
                      <div>
                        <h3 className="font-semibold text-lg">{process.name}</h3>
                        <p className="text-sm text-gray-600">Handled by {process.agent}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(process.priority)}
                      {getStatusBadge(process.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Progress</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={process.progress} className="flex-1" />
                        <span className="text-sm font-medium">{process.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Items Processed</p>
                      <p className="font-semibold">{process.processedItems} / {process.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Start Time</p>
                      <p className="font-semibold">{new Date(process.startTime).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Est. Completion</p>
                      <p className="font-semibold">{new Date(process.estimatedCompletion).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {process.errorCount > 0 && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">{process.errorCount} errors</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {process.status === 'running' && (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {process.status === 'paused' && (
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      {(process.status === 'running' || process.status === 'paused') && (
                        <Button size="sm" variant="destructive">
                          <Square className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
