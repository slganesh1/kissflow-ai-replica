import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, RotateCcw, Activity, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface WorkflowExecution {
  id: string;
  workflow_type: string;
  workflow_name?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  sla_status: string;
  submitter_name: string;
  created_at: string;
  updated_at: string;
  sla_deadline?: string;
  execution_mode?: string;
  request_data?: any;
  result_data?: any;
}

interface WorkflowLog {
  id: string;
  workflow_id: string;
  step_id?: string;
  action: string;
  actor: string;
  details?: any;
  created_at: string;
}

interface WorkflowApproval {
  id: string;
  workflow_id: string;
  step_id: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_role: string;
  approver_id?: string;
  assigned_at: string;
  completed_at?: string;
  comments?: string;
}

export const RealtimeWorkflowMonitor = () => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [approvals, setApprovals] = useState<WorkflowApproval[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSLABadgeVariant = (slaStatus: string) => {
    switch (slaStatus) {
      case 'on_time':
        return 'default';
      case 'at_risk':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'escalated':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const fetchInitialData = async () => {
    try {
      // Fetch recent workflow executions
      const { data: executionsData, error: executionsError } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (executionsError) throw executionsError;
      setExecutions(executionsData || []);

      // Fetch recent logs
      const { data: logsData, error: logsError } = await supabase
        .from('workflow_execution_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      // Map timestamp to created_at for interface compatibility
      const mappedLogs = logsData?.map(log => ({
        ...log,
        created_at: log.timestamp
      })) || [];
      setLogs(mappedLogs);

      // Fetch pending approvals
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('workflow_approvals')
        .select('*')
        .order('assigned_at', { ascending: false })
        .limit(50);

      if (approvalsError) throw approvalsError;
      setApprovals(approvalsData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    fetchInitialData();

    // Set up real-time subscriptions
    const executionChannel = supabase
      .channel('workflow-executions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions'
        },
        (payload) => {
          console.log('Workflow execution change:', payload);
          if (payload.eventType === 'INSERT') {
            setExecutions(prev => [payload.new as WorkflowExecution, ...prev.slice(0, 49)]);
          } else if (payload.eventType === 'UPDATE') {
            setExecutions(prev => 
              prev.map(exec => 
                exec.id === payload.new.id ? payload.new as WorkflowExecution : exec
              )
            );
          }
        }
      )
      .subscribe();

    const logChannel = supabase
      .channel('workflow-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_execution_log'
        },
        (payload) => {
          console.log('New workflow log:', payload);
          setLogs(prev => [payload.new as WorkflowLog, ...prev.slice(0, 99)]);
        }
      )
      .subscribe();

    const approvalChannel = supabase
      .channel('workflow-approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_approvals'
        },
        (payload) => {
          console.log('Workflow approval change:', payload);
          if (payload.eventType === 'INSERT') {
            setApprovals(prev => [payload.new as WorkflowApproval, ...prev.slice(0, 49)]);
          } else if (payload.eventType === 'UPDATE') {
            setApprovals(prev => 
              prev.map(approval => 
                approval.id === payload.new.id ? payload.new as WorkflowApproval : approval
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(executionChannel);
      supabase.removeChannel(logChannel);
      supabase.removeChannel(approvalChannel);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    supabase.removeAllChannels();
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (isMonitoring) {
      cleanup = startMonitoring();
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [isMonitoring]);

  const filteredLogs = selectedWorkflow 
    ? logs.filter(log => log.workflow_id === selectedWorkflow)
    : logs;

  const filteredApprovals = selectedWorkflow
    ? approvals.filter(approval => approval.workflow_id === selectedWorkflow)
    : approvals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Workflow Monitor</h2>
          <p className="text-muted-foreground">
            Watch workflows execute with live status updates
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
          
          <Button
            onClick={fetchInitialData}
            variant="outline"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isMonitoring && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-700 font-medium">
            Live monitoring active - Real-time updates enabled
          </span>
        </div>
      )}

      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executions">Workflow Executions</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="executions" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {executions.map((execution) => (
                <Card 
                  key={execution.id}
                  className={`cursor-pointer transition-colors ${
                    selectedWorkflow === execution.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedWorkflow(
                    selectedWorkflow === execution.id ? null : execution.id
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        {execution.workflow_name || execution.workflow_type}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={getSLABadgeVariant(execution.sla_status)}>
                          {execution.sla_status?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {execution.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Submitted by {execution.submitter_name} • {format(new Date(execution.created_at), 'PPp')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {execution.workflow_type}
                      </div>
                      <div>
                        <span className="font-medium">Mode:</span> {execution.execution_mode || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {format(new Date(execution.created_at), 'PPp')}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {format(new Date(execution.updated_at), 'PPp')}
                      </div>
                      {execution.sla_deadline && (
                        <div className="col-span-2">
                          <span className="font-medium">SLA Deadline:</span> {format(new Date(execution.sla_deadline), 'PPp')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {executions.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No workflow executions found. Start monitoring to see real-time updates.
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium">
                        {log.actor}
                      </span>
                      {log.step_id && (
                        <span className="text-xs text-muted-foreground">
                          Step: {log.step_id}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'PPp')}
                    </span>
                  </div>
                  {log.details && (
                    <div className="mt-2 text-xs bg-muted p-2 rounded">
                      <pre>{JSON.stringify(log.details, null, 2)}</pre>
                    </div>
                  )}
                </Card>
              ))}
              
              {filteredLogs.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No execution logs found.
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredApprovals.map((approval) => (
                <Card key={approval.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Approval Request
                      </CardTitle>
                      <Badge variant={approval.status === 'pending' ? 'secondary' : 'default'}>
                        {approval.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Step: {approval.step_id} • Role: {approval.approver_role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Assigned:</span> {format(new Date(approval.assigned_at), 'PPp')}
                      </div>
                      {approval.completed_at && (
                        <div>
                          <span className="font-medium">Completed:</span> {format(new Date(approval.completed_at), 'PPp')}
                        </div>
                      )}
                      {approval.approver_id && (
                        <div>
                          <span className="font-medium">Approver:</span> {approval.approver_id}
                        </div>
                      )}
                      {approval.comments && (
                        <div className="col-span-2">
                          <span className="font-medium">Comments:</span> {approval.comments}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredApprovals.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No approval requests found.
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};