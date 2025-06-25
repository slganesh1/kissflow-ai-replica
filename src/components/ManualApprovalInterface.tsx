
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, User, FileText, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PendingApproval {
  id: string;
  workflow_id: string;
  step_id: string;
  step_name: string;
  approver_role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  workflow_executions: {
    workflow_name: string;
    workflow_type: string;
    request_data: any;
    submitter_name: string;
    created_at: string;
  };
}

export const ManualApprovalInterface = () => {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const fetchPendingApprovals = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-pending-approvals', {
        body: { role: 'manager' } // You can make this dynamic based on user role
      });

      if (error) throw error;

      setPendingApprovals(data.approvals || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    
    // Set up real-time subscription for new approvals
    const channel = supabase
      .channel('workflow_approvals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_approvals'
        },
        () => {
          fetchPendingApprovals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApproval = async (approval: PendingApproval, decision: 'approved' | 'rejected') => {
    setProcessingId(approval.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('approve-workflow', {
        body: {
          workflowId: approval.workflow_id,
          stepId: approval.step_id,
          decision,
          comments: comments[approval.id] || '',
          approverId: 'current-user-id' // Replace with actual user ID
        }
      });

      if (error) throw error;

      toast.success(`Workflow ${decision} successfully!`);
      
      // Remove from pending list
      setPendingApprovals(prev => prev.filter(item => item.id !== approval.id));
      
      // Clear comments
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[approval.id];
        return newComments;
      });

    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error(`Failed to ${decision === 'approved' ? 'approve' : 'reject'} workflow`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));
  };

  const getUrgencyBadge = (data: any) => {
    if (data?.priority === 'urgent' || data?.urgency === 'urgent') {
      return <Badge className="bg-red-100 text-red-700">URGENT</Badge>;
    }
    if (data?.priority === 'high' || data?.urgency === 'high') {
      return <Badge className="bg-orange-100 text-orange-700">HIGH PRIORITY</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading pending approvals...</div>
      </div>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
          <p className="text-gray-600 text-center">All workflows are up to date. New approval requests will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pending Approvals</h2>
          <p className="text-gray-600">{pendingApprovals.length} workflow(s) waiting for your approval</p>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="h-4 w-4 mr-1" />
          {pendingApprovals.length} Pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {pendingApprovals.map((approval) => {
          const { workflow_executions: workflow } = approval;
          const requestData = workflow.request_data || {};

          return (
            <Card key={approval.id} className="border-l-4 border-l-yellow-400">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>{workflow.workflow_name}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">{workflow.workflow_type}</Badge>
                      <span className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Submitted by {workflow.submitter_name || 'Unknown'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getUrgencyBadge(requestData)}
                    <Badge className="bg-blue-100 text-blue-700">
                      {approval.step_name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Request Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Request Details</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {requestData.title && (
                      <div>
                        <strong>Title:</strong> {requestData.title}
                      </div>
                    )}
                    {requestData.campaign_name && (
                      <div>
                        <strong>Campaign:</strong> {requestData.campaign_name}
                      </div>
                    )}
                    {(requestData.amount || requestData.budget_amount) && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <strong>Amount:</strong> {formatCurrency(requestData.amount || requestData.budget_amount)}
                      </div>
                    )}
                    {requestData.category && (
                      <div>
                        <strong>Category:</strong> {requestData.category}
                      </div>
                    )}
                    {requestData.campaign_goals && (
                      <div>
                        <strong>Goal:</strong> {requestData.campaign_goals}
                      </div>
                    )}
                    {requestData.required_by && (
                      <div>
                        <strong>Required By:</strong> {new Date(requestData.required_by).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {(requestData.business_purpose || requestData.justification || requestData.target_audience) && (
                    <div className="mt-4">
                      <strong>Description:</strong>
                      <p className="text-gray-700 mt-1">
                        {requestData.business_purpose || requestData.justification || requestData.target_audience}
                      </p>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div>
                  <Label htmlFor={`comments-${approval.id}`}>Comments (Optional)</Label>
                  <Textarea
                    id={`comments-${approval.id}`}
                    placeholder="Add your comments or feedback..."
                    value={comments[approval.id] || ''}
                    onChange={(e) => setComments(prev => ({ 
                      ...prev, 
                      [approval.id]: e.target.value 
                    }))}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <Button
                    onClick={() => handleApproval(approval, 'approved')}
                    disabled={processingId === approval.id}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processingId === approval.id ? 'Processing...' : 'Approve'}
                  </Button>
                  
                  <Button
                    onClick={() => handleApproval(approval, 'rejected')}
                    disabled={processingId === approval.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processingId === approval.id ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
