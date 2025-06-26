
import React from 'react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { AgentPanel } from '@/components/AgentPanel';
import { ProcessMonitor } from '@/components/ProcessMonitor';
import { AgentCoordinator } from '@/components/AgentCoordinator';
import { ContextualAnalyzer } from '@/components/ContextualAnalyzer';
import { ContinuousOptimizer } from '@/components/ContinuousOptimizer';
import { IntelligentAutomationHub } from '@/components/IntelligentAutomationHub';
import { ManualApprovalInterface } from '@/components/ManualApprovalInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Workflow Automation Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Create, automate, and optimize your business processes with intelligent AI agents. 
            Build workflows that think, learn, and adapt to your needs.
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-8">
            <TabsTrigger value="dashboard" className="text-sm font-medium">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="builder" className="text-sm font-medium">
              Workflow Builder
            </TabsTrigger>
            <TabsTrigger value="intelligent" className="text-sm font-medium">
              Intelligent Automation
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-sm font-medium">
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="coordination" className="text-sm font-medium">
              Agent Coordination
            </TabsTrigger>
            <TabsTrigger value="context" className="text-sm font-medium">
              Contextual AI
            </TabsTrigger>
            <TabsTrigger value="optimization" className="text-sm font-medium">
              Continuous Optimization
            </TabsTrigger>
            <TabsTrigger value="monitor" className="text-sm font-medium">
              Process Monitor
            </TabsTrigger>
            <TabsTrigger value="approvals" className="text-sm font-medium">
              Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="builder">
            <WorkflowBuilder />
          </TabsContent>

          <TabsContent value="intelligent">
            <IntelligentAutomationHub />
          </TabsContent>

          <TabsContent value="agents">
            <AgentPanel />
          </TabsContent>

          <TabsContent value="coordination">
            <AgentCoordinator />
          </TabsContent>

          <TabsContent value="context">
            <ContextualAnalyzer />
          </TabsContent>

          <TabsContent value="optimization">
            <ContinuousOptimizer />
          </TabsContent>

          <TabsContent value="monitor">
            <ProcessMonitor />
          </TabsContent>

          <TabsContent value="approvals">
            <ManualApprovalInterface />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
