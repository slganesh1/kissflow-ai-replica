
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowExecution {
  id: string;
  workflow_name: string;
  workflow_type: string;
  status: string;
  submitter_name: string;
  created_at: string;
  request_data: any;
}

interface WorkflowApproval {
  id: string;
  step_name: string;
  status: string;
  approver_role: string;
}

export const ActiveWorkflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [approvals, setApprovals] = useState<{ [key: string]: WorkflowApproval[] }>({});
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      // Fetch all workflows that are not cancelled
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflow_executions')
        .select('*')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (workflowError) {
        console.error('Error fetching workflows:', workflowError);
        toast.error('Failed to load workflows');
        return;
      }

      setWorkflows(workflowData || []);

      // Fetch approvals for all workflows
      const workflowIds = workflowData?.map(w => w.id) || [];
      if (workflowIds.length > 0) {
        const { data: approvalData, error: approvalError } = await supabase
          .from('workflow_approvals')
          .select('*')
          .in('workflow_id', workflowIds);

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
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getWorkflowSummary = (workflow: WorkflowExecution) => {
    const workflowApprovals = approvals[workflow.id] || [];
    const pendingApprovals = workflowApprovals.filter(a => a.status === 'pending');
    const completedApprovals = workflowApprovals.filter(a => a.status === 'approved');
    
    if (pendingApprovals.length > 0) {
      return `Waiting for ${pendingApprovals.length} approval(s)`;
    } else if (completedApprovals.length > 0) {
      return `${completedApprovals.length} approval(s) completed`;
    } else {
      return 'No approvals required';
    }
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

  if (workflows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
          <CardDescription>No active workflows found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Create a new workflow to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Workflows</CardTitle>
        <CardDescription>Monitor and track your workflow executions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{workflow.workflow_name}</h4>
                <Badge className={getStatusColor(workflow.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(workflow.status)}
                    <span>{workflow.status}</span>
                  </div>
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <p><strong>Type:</strong> {workflow.workflow_type}</p>
                <p><strong>Submitter:</strong> {workflow.submitter_name}</p>
                <p><strong>Created:</strong> {new Date(workflow.created_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {getWorkflowSummary(workflow)}</p>
              </div>

              {workflow.request_data && (
                <div className="bg-gray-50 p-2 rounded text-xs mb-3">
                  <strong>Request Details:</strong>
                  {workflow.request_data.title && <div>Title: {workflow.request_data.title}</div>}
                  {workflow.request_data.amount && <div>Amount: ${workflow.request_data.amount}</div>}
                  {workflow.request_data.campaign_name && <div>Campaign: {workflow.request_data.campaign_name}</div>}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                {approvals[workflow.id]?.some(a => a.status === 'pending') && (
                  <Badge variant="outline" className="text-orange-600">
                    Pending Approval
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
