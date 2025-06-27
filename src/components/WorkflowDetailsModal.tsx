
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

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

interface WorkflowDetailsModalProps {
  workflow: WorkflowExecution | null;
  approvals: WorkflowApproval[];
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowDetailsModal: React.FC<WorkflowDetailsModalProps> = ({
  workflow,
  approvals,
  isOpen,
  onClose
}) => {
  if (!workflow) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Sort approvals by order_sequence
  const sortedApprovals = [...approvals].sort((a, b) => a.order_sequence - b.order_sequence);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workflow.workflow_name}</DialogTitle>
          <DialogDescription>
            Workflow Details and Approval Status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workflow Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Workflow Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>Type:</strong> {workflow.workflow_type}</div>
              <div><strong>Status:</strong> 
                <Badge className={`ml-2 ${getStatusColor(workflow.status)}`} variant="outline">
                  {workflow.status.replace('_', ' ')}
                </Badge>
              </div>
              <div><strong>Submitter:</strong> {workflow.submitter_name}</div>
              <div><strong>Created:</strong> {new Date(workflow.created_at).toLocaleString()}</div>
              {workflow.updated_at && workflow.updated_at !== workflow.created_at && (
                <div><strong>Last Updated:</strong> {new Date(workflow.updated_at).toLocaleString()}</div>
              )}
              <div><strong>ID:</strong> {workflow.id}</div>
            </div>
          </div>

          {/* Request Data */}
          {workflow.request_data && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Request Details</h3>
              <div className="text-sm space-y-2">
                {workflow.request_data.title && <div><strong>Title:</strong> {workflow.request_data.title}</div>}
                {workflow.request_data.amount && <div><strong>Amount:</strong> ${workflow.request_data.amount}</div>}
                {workflow.request_data.campaign_name && <div><strong>Campaign:</strong> {workflow.request_data.campaign_name}</div>}
                {workflow.request_data.business_purpose && <div><strong>Purpose:</strong> {workflow.request_data.business_purpose}</div>}
                {workflow.request_data.description && <div><strong>Description:</strong> {workflow.request_data.description}</div>}
              </div>
            </div>
          )}

          {/* Approval Steps */}
          <div>
            <h3 className="font-semibold mb-3">Approval Steps</h3>
            {sortedApprovals.length > 0 ? (
              <div className="space-y-3">
                {sortedApprovals.map((approval, index) => (
                  <div key={approval.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Step {approval.order_sequence}
                        </span>
                        <h4 className="font-medium">{approval.step_name}</h4>
                      </div>
                      <Badge className={getStatusColor(approval.status)} variant="outline">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(approval.status)}
                          <span className="capitalize">{approval.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Approver Role:</strong> {approval.approver_role.replace('_', ' ')}</div>
                      {approval.approver_id && (
                        <div><strong>Approved By:</strong> {approval.approver_id}</div>
                      )}
                      {approval.approved_at && (
                        <div><strong>Approved At:</strong> {new Date(approval.approved_at).toLocaleString()}</div>
                      )}
                      {approval.rejection_reason && (
                        <div className="text-red-600">
                          <strong>Rejection Reason:</strong> {approval.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No approval steps configured for this workflow.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
