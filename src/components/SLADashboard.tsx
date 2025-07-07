
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SLAStats {
  total: number;
  onTime: number;
  atRisk: number;
  overdue: number;
  escalated: number;
}

interface WorkflowWithSLA {
  id: string;
  workflow_name: string;
  workflow_type: string;
  submitter_name: string;
  sla_status: string;
  sla_deadline: string;
  created_at: string;
  escalations?: any[];
}

export const SLADashboard = () => {
  const [stats, setStats] = useState<SLAStats>({
    total: 0,
    onTime: 0,
    atRisk: 0,
    overdue: 0,
    escalated: 0
  });
  const [workflows, setWorkflows] = useState<WorkflowWithSLA[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSLAData = async () => {
    try {
      // Fetch SLA statistics
      const { data: slaData, error: slaError } = await supabase
        .from('workflow_executions')
        .select('sla_status')
        .not('sla_status', 'is', null)
        .neq('status', 'completed');

      if (slaError) throw slaError;

      const newStats = slaData.reduce((acc, workflow) => {
        acc.total++;
        switch (workflow.sla_status) {
          case 'on_time':
            acc.onTime++;
            break;
          case 'at_risk':
            acc.atRisk++;
            break;
          case 'overdue':
            acc.overdue++;
            break;
          case 'escalated':
            acc.escalated++;
            break;
        }
        return acc;
      }, { total: 0, onTime: 0, atRisk: 0, overdue: 0, escalated: 0 });

      setStats(newStats);

      // Fetch workflows that need attention (at risk, overdue, escalated)
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflow_executions')
        .select(`
          id,
          workflow_name,
          workflow_type,
          submitter_name,
          sla_status,
          sla_deadline,
          created_at,
          workflow_escalations(*)
        `)
        .in('sla_status', ['at_risk', 'overdue', 'escalated'])
        .neq('status', 'completed')
        .order('sla_deadline', { ascending: true });

      if (workflowError) throw workflowError;

      setWorkflows(workflowData || []);
    } catch (error) {
      console.error('Error fetching SLA data:', error);
      toast.error('Failed to load SLA dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const runSLACheck = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('sla-monitor');
      
      if (error) throw error;

      toast.success('SLA monitoring check completed');
      await fetchSLAData();
    } catch (error) {
      console.error('Error running SLA check:', error);
      toast.error('Failed to run SLA monitoring check');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSLAData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('sla_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions'
        },
        () => {
          fetchSLAData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'on_time': return 'bg-green-100 text-green-800 border-green-300';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      case 'escalated': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return `${Math.abs(diffHours)}h overdue`;
    } else if (diffHours < 24) {
      return `${diffHours}h remaining`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ${diffHours % 24}h remaining`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SLA Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading SLA data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SLA Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.onTime}</p>
                <p className="text-sm text-gray-600">On Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
                <p className="text-sm text-gray-600">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.escalated}</p>
                <p className="text-sm text-gray-600">Escalated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Workflows Requiring Attention */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflows Requiring Attention</CardTitle>
              <CardDescription>At-risk, overdue, and escalated workflows</CardDescription>
            </div>
            <Button onClick={runSLACheck} disabled={loading} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run SLA Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-600">All workflows are on track!</p>
              <p className="text-gray-600">No workflows currently require attention.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{workflow.workflow_name}</h4>
                    <Badge className={getSLAStatusColor(workflow.sla_status)} variant="outline">
                      {workflow.sla_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Type:</strong> {workflow.workflow_type}
                    </div>
                    <div>
                      <strong>Submitter:</strong> {workflow.submitter_name}
                    </div>
                    <div>
                      <strong>Deadline:</strong> {getTimeRemaining(workflow.sla_deadline)}
                    </div>
                  </div>

                  {workflow.escalations && workflow.escalations.length > 0 && (
                    <div className="mt-3 p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                      <p className="text-sm font-medium text-purple-800">
                        Escalated from {workflow.escalations[0].escalated_from} to {workflow.escalations[0].escalated_to}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {workflow.escalations[0].escalation_reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
