
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Bot, Clock, TrendingUp, Workflow, CheckCircle, AlertCircle, Users } from 'lucide-react';

const workflowData = [
  { name: 'Jan', active: 65, completed: 80 },
  { name: 'Feb', active: 78, completed: 95 },
  { name: 'Mar', active: 82, completed: 88 },
  { name: 'Apr', active: 91, completed: 102 },
  { name: 'May', active: 87, completed: 115 },
  { name: 'Jun', active: 95, completed: 128 },
];

const agentData = [
  { name: 'Data Processing', value: 35, color: '#3b82f6' },
  { name: 'Email Automation', value: 25, color: '#10b981' },
  { name: 'Document Review', value: 20, color: '#f59e0b' },
  { name: 'Customer Service', value: 20, color: '#ef4444' },
];

export const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Active Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">24</div>
            <p className="text-xs text-blue-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">AI Agents</CardTitle>
            <Bot className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">8</div>
            <p className="text-xs text-green-600">3 learning, 5 active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">2.4h</div>
            <p className="text-xs text-amber-600">-23% improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Efficiency Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">94%</div>
            <p className="text-xs text-purple-600">+5% this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Activity</CardTitle>
            <CardDescription>Active vs Completed workflows over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workflowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Agent Distribution</CardTitle>
            <CardDescription>Usage by agent type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow Activity</CardTitle>
          <CardDescription>Latest updates from your automated processes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1, workflow: 'Customer Onboarding', status: 'completed', agent: 'DocuBot', time: '2 minutes ago', icon: CheckCircle, color: 'text-green-600' },
              { id: 2, workflow: 'Invoice Processing', status: 'in-progress', agent: 'FinanceAI', time: '5 minutes ago', icon: Activity, color: 'text-blue-600' },
              { id: 3, workflow: 'Support Ticket Routing', status: 'completed', agent: 'SupportBot', time: '12 minutes ago', icon: CheckCircle, color: 'text-green-600' },
              { id: 4, workflow: 'Data Quality Check', status: 'requires-attention', agent: 'QualityAI', time: '18 minutes ago', icon: AlertCircle, color: 'text-amber-600' },
              { id: 5, workflow: 'Email Campaign', status: 'completed', agent: 'MarketBot', time: '25 minutes ago', icon: CheckCircle, color: 'text-green-600' },
            ].map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                  <div>
                    <p className="font-medium">{activity.workflow}</p>
                    <p className="text-sm text-gray-600">Handled by {activity.agent}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : activity.status === 'requires-attention' ? 'destructive' : 'secondary'}
                    className={activity.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {activity.status.replace('-', ' ')}
                  </Badge>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
