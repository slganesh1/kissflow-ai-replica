
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowInputFormProps {
  workflowName?: string;
  workflowType?: string;
  onSubmit?: (data: Record<string, any>) => void;
  onCancel?: () => void;
}

export const WorkflowInputForm: React.FC<WorkflowInputFormProps> = ({
  workflowName: initialWorkflowName = '',
  workflowType: initialWorkflowType = '',
  onSubmit: onExternalSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    workflowName: initialWorkflowName,
    workflowType: initialWorkflowType,
    submitterName: '',
    title: '',
    amount: '',
    businessPurpose: '',
    category: '',
    urgency: 'normal'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting workflow with data:', formData);

      // If there's an external submit handler (from AI Generator), use it
      if (onExternalSubmit) {
        onExternalSubmit(formData);
        setLoading(false);
        return;
      }

      // Create the workflow execution record with pending status - MUST stay pending until ALL approvals
      const { data: workflow, error: workflowError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_name: formData.workflowName,
          workflow_type: formData.workflowType,
          submitter_name: formData.submitterName,
          status: 'pending', // CRITICAL: Must stay pending until ALL approvals complete
          request_data: {
            title: formData.title,
            amount: parseFloat(formData.amount) || 0,
            business_purpose: formData.businessPurpose,
            category: formData.category,
            urgency: formData.urgency,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (workflowError) {
        console.error('Error creating workflow:', workflowError);
        toast.error('Failed to create workflow: ' + workflowError.message);
        return;
      }

      console.log('Workflow created successfully:', workflow);

      // Determine approval steps based on amount and workflow type
      const amount = parseFloat(formData.amount) || 0;
      const approvalSteps = [];

      if (formData.workflowType === 'expense_approval' && amount > 1000) {
        // High-value expenses require both manager and finance director approval
        approvalSteps.push(
          {
            workflow_id: workflow.id,
            step_id: 'manager-approval',
            step_name: 'Manager Approval',
            approver_role: 'manager',
            status: 'pending'
          },
          {
            workflow_id: workflow.id,
            step_id: 'finance-director-approval', 
            step_name: 'Finance Director Approval',
            approver_role: 'finance_director',
            status: 'pending'
          }
        );
      } else {
        // Other workflows just need manager approval
        approvalSteps.push({
          workflow_id: workflow.id,
          step_id: 'manager-approval',
          step_name: 'Manager Approval', 
          approver_role: 'manager',
          status: 'pending'
        });
      }

      // Create ALL approval records - workflow stays pending until all are approved
      const { data: approvals, error: approvalError } = await supabase
        .from('workflow_approvals')
        .insert(approvalSteps)
        .select();

      if (approvalError) {
        console.error('Error creating approval records:', approvalError);
        toast.error('Failed to create approval records: ' + approvalError.message);
        return;
      }

      console.log('Approval records created successfully:', approvals);
      console.log(`Workflow ${workflow.id} created with ${approvals?.length || 0} pending approvals`);

      const approvalCount = approvals?.length || 0;
      toast.success(
        `Workflow "${formData.workflowName}" submitted successfully! Requires ${approvalCount} approval(s).`
      );
      
      // Reset form
      setFormData({
        workflowName: '',
        workflowType: '',
        submitterName: '',
        title: '',
        amount: '',
        businessPurpose: '',
        category: '',
        urgency: 'normal'
      });

    } catch (error) {
      console.error('Error in workflow submission:', error);
      toast.error('Failed to submit workflow: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Submit New Workflow</CardTitle>
            <CardDescription>Create a new workflow request that requires approval</CardDescription>
          </div>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflowName">Workflow Name</Label>
              <Input
                id="workflowName"
                value={formData.workflowName}
                onChange={(e) => handleInputChange('workflowName', e.target.value)}
                placeholder="Enter workflow name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="workflowType">Workflow Type</Label>
              <Select 
                value={formData.workflowType} 
                onValueChange={(value) => handleInputChange('workflowType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense_approval">Marketing Expense Approval</SelectItem>
                  <SelectItem value="budget_request">Budget Request</SelectItem>
                  <SelectItem value="purchase_order">Purchase Order</SelectItem>
                  <SelectItem value="campaign_approval">Campaign Approval</SelectItem>
                  <SelectItem value="contract_review">Contract Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="submitterName">Your Name</Label>
            <Input
              id="submitterName"
              value={formData.submitterName}
              onChange={(e) => handleInputChange('submitterName', e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Request Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief title for your request"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              {parseFloat(formData.amount) > 1000 && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ Amounts over $1,000 require both Manager and Finance Director approval
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select 
              value={formData.urgency} 
              onValueChange={(value) => handleInputChange('urgency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="businessPurpose">Business Purpose</Label>
            <Textarea
              id="businessPurpose"
              value={formData.businessPurpose}
              onChange={(e) => handleInputChange('businessPurpose', e.target.value)}
              placeholder="Please explain the business purpose and justification for this request"
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Workflow'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
