
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const WorkflowInputForm = () => {
  const [formData, setFormData] = useState({
    workflowName: '',
    workflowType: '',
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

      // Create the workflow execution record
      const { data: workflow, error: workflowError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_name: formData.workflowName,
          workflow_type: formData.workflowType,
          submitter_name: formData.submitterName,
          status: 'pending',
          request_data: {
            title: formData.title,
            amount: formData.amount,
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
        toast.error('Failed to create workflow');
        return;
      }

      console.log('Workflow created:', workflow);

      // Create approval record for manager approval
      const { error: approvalError } = await supabase
        .from('workflow_approvals')
        .insert({
          workflow_id: workflow.id,
          step_id: 'manager-approval',
          step_name: 'Manager Approval',
          approver_role: 'manager',
          status: 'pending'
        });

      if (approvalError) {
        console.error('Error creating approval record:', approvalError);
        toast.error('Failed to create approval record');
        return;
      }

      console.log('Approval record created successfully');

      toast.success('Workflow submitted successfully!');
      
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
      toast.error('Failed to submit workflow');
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
        <CardTitle>Submit New Workflow</CardTitle>
        <CardDescription>Create a new workflow request that requires approval</CardDescription>
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
                  <SelectItem value="expense_approval">Expense Approval</SelectItem>
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
              />
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
