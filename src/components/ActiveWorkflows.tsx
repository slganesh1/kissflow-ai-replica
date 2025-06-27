
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowDetailsModal } from './WorkflowDetailsModal';

interface WorkflowExecution {
  id: string;
  workflow_name: string;
  workflow_type: string;
  status: string;
  submitter_name: string;
  created_at: string;
  updated_at: string;
  request_data: any;
}

interface WorkflowApproval {
  id: string;
  step_name: string;
  status: string;
  approver_role: string;
  approver_id?: string;
  approved_at?: string;
  rejection_reason?: string;
  order_sequence: number;
}

export const ActiveWorkflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [approvals, setApprovals] = useState<{ [key: string]: WorkflowApproval[] }>({});
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowExecution | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchWorkflows = async () => {
    try {
      console.log('Fetching workflows...');
      
      // Fetch workflows based on filter - show all if showCompleted is true, otherwise exclude completed and cancelled
      const query = supabase
        .from('workflow_executions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!showCompleted) {
        query.not('status', 'in', '(completed,cancelled)');
      }

      const { data: workflowData, error: workflowError } = await query;

      if (workflowError) {
        console.error('Error fetching workflows:', workflowError);
        toast.error('Failed to load workflows');
        return;
      }

      console.log('Fetched workflows:', workflowData);
      setWorkflows(workflowData || []);

      // Fetch approvals for all workflows
      const workflowIds = workflowData?.map(w => w.id) || [];
      if (workflowIds.length > 0) {
        const { data: approvalData, error: approvalError } = await supabase
          .from('workflow_approvals')
          .select('*')
          .in('workflow_id', workflowIds)
          .order('order_sequence', { ascending: true });

        if (approvalError) {
          console.error('Error fetching approvals:', approvalError);
        } else {
          // Group approvals by workflow_id
          const groupedApprovals = (approvalData || []).reduce((acc, approval) => {
            if (!acc[approval.workflow_id]) {
              acc[approval.workflow_id] = [];
            }
            acc[approval.workflow_id].push(approval);
            return acc;
          }, {} as { [key: string]: WorkflowApproval[] });
          
          setApprovals(groupedApprovals);
        }
      }
    } catch (error) {
      console.error('Error in fetchWorkflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    
    // Set up real-time subscription for workflow changes
    const channel = supabase
      .channel('workflow_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions'
        },
        (payload) => {
          console.log('Workflow change detected:', payload);
          fetchWorkflows();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_approvals'
        },
        (payload) => {
          console.log('Approval change detected:', payload);
          fetchWorkflows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showCompleted]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getWorkflowSummary = (workflow: WorkflowExecution) => {
    const workflowApprovals = approvals[workflow.id] || [];
    const pendingApprovals = workflowApprovals.filter(a => a.status === 'pending');
    const completedApprovals = workflowApprovals.filter(a => a.status === 'approved');
    
    if (workflow.status === 'pending' && pendingApprovals.length > 0) {
      return `Waiting for ${pendingApprovals.length} approval(s)`;
    } else if (workflow.status === 'pending' && workflowApprovals.length === 0) {
      return 'Workflow created, awaiting processing';
    } else if (completedApprovals.length > 0) {
      return `${completedApprovals.length} approval(s) completed`;
    } else {
      return `Status: ${workflow.status.replace('_', ' ')}`;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchWorkflows();
  };

  const handleViewDetails = (workflow: WorkflowExecution) => {
    setSelectedWorkflow(workflow);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading workflows...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Monitor</CardTitle>
              <CardDescription>Monitor and track your workflow executions</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Hide Completed' : 'Show All'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {showCompleted ? 'No workflows found' : 'No active workflows found'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Create a new workflow to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{workflow.workflow_name}</h4>
                    <Badge className={getStatusColor(workflow.status)} variant="outline">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(workflow.status)}
                        <span className="capitalize">{workflow.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p><strong>Type:</strong> {workflow.workflow_type}</p>
                    <p><strong>Submitter:</strong> {workflow.submitter_name}</p>
                    <p><strong>Created:</strong> {new Date(workflow.created_at).toLocaleDateString()} at {new Date(workflow.created_at).toLocaleTimeString()}</p>
                    {workflow.updated_at && workflow.updated_at !== workflow.created_at && (
                      <p><strong>Last Updated:</strong> {new Date(workflow.updated_at).toLocaleTimeString()}</p>
                    )}
                    <p><strong>Status:</strong> {getWorkflowSummary(workflow)}</p>
                  </div>

                  {workflow.request_data && (
                    <div className="bg-gray-50 p-2 rounded text-xs mb-3">
                      <strong>Request Details:</strong>
                      {workflow.request_data.title && <div>Title: {workflow.request_data.title}</div>}
                      {workflow.request_data.amount && <div>Amount: ${workflow.request_data.amount}</div>}
                      {workflow.request_data.campaign_name && <div>Campaign: {workflow.request_data.campaign_name}</div>}
                      {workflow.request_data.business_purpose && <div>Purpose: {workflow.request_data.business_purpose}</div>}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(workflow)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {approvals[workflow.id]?.some(a => a.status === 'pending') && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Pending Approval
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        ID: {workflow.id.substring(0, 8)}...
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WorkflowDetailsModal
        workflow={selectedWorkflow}
        approvals={selectedWorkflow ? (approvals[selectedWorkflow.id] || []) : []}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedWorkflow(null);
        }}
      />
    </>
  );
};
