
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, DollarSign, FileText } from 'lucide-react';

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
  approver_id: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
}

interface WorkflowDetailModalProps {
  workflow: WorkflowExecution | null;
  approvals: WorkflowApproval[];
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowDetailModal: React.FC<WorkflowDetailModalProps> = ({
  workflow,
  approvals,
  isOpen,
  onClose
}) => {
  if (!workflow) return null;

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

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{workflow.workflow_name}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed view of workflow execution and approval status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workflow Overview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Workflow Overview</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(workflow.status)} variant="outline">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(workflow.status)}
                      <span className="capitalize">{workflow.status.replace('_', ' ')}</span>
                    </div>
                  </Badge>
                </div>
                <p><strong>Type:</strong> {workflow.workflow_type}</p>
                <p><strong>ID:</strong> {workflow.id}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span><strong>Submitter:</strong> {workflow.submitter_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span><strong>Created:</strong> {new Date(workflow.created_at).toLocaleString()}</span>
                </div>
                {workflow.updated_at && workflow.updated_at !== workflow.created_at && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span><strong>Last Updated:</strong> {new Date(workflow.updated_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Request Details */}
          {workflow.request_data && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Request Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflow.request_data.title && (
                  <div>
                    <strong>Title:</strong> {workflow.request_data.title}
                  </div>
                )}
                {workflow.request_data.amount && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span><strong>Amount:</strong> ${workflow.request_data.amount}</span>
                  </div>
                )}
                {workflow.request_data.campaign_name && (
                  <div>
                    <strong>Campaign:</strong> {workflow.request_data.campaign_name}
                  </div>
                )}
                {workflow.request_data.category && (
                  <div>
                    <strong>Category:</strong> {workflow.request_data.category}
                  </div>
                )}
                {workflow.request_data.urgency && (
                  <div>
                    <strong>Urgency:</strong> {workflow.request_data.urgency}
                  </div>
                )}
              </div>
              {workflow.request_data.business_purpose && (
                <div className="mt-3">
                  <strong>Business Purpose:</strong>
                  <p className="mt-1 text-sm bg-white p-2 rounded border">
                    {workflow.request_data.business_purpose}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Approval Timeline */}
          {approvals.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Approval Timeline</span>
              </h3>
              <div className="space-y-3">
                {approvals.map((approval, index) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{approval.step_name}</span>
                          <Badge variant="outline" className={getApprovalStatusColor(approval.status)}>
                            {approval.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Approver Role:</strong> {approval.approver_role.replace('_', ' ')}
                        {approval.approved_at && (
                          <span className="ml-4">
                            <strong>Approved:</strong> {new Date(approval.approved_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {approval.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <strong>Rejection Reason:</strong> {approval.rejection_reason}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      Step {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
