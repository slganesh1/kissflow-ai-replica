import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Info } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type WorkflowStatus = Database['public']['Enums']['workflow_status'];

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
    urgency: 'normal',
    additionalDetails: ''
  });
  const [loading, setLoading] = useState(false);

  const getApprovalRequirements = () => {
    const amount = parseFloat(formData.amount) || 0;
    const requirements = [];
    
    if (formData.workflowType === 'expense_approval') {
      requirements.push('Manager Approval Required');
      if (amount > 1000) {
        requirements.push('Finance Director Approval Required (Amount > $1,000)');
      }
    } else if (formData.workflowType === 'campaign_approval') {
      requirements.push('Marketing Manager Approval Required');
      if (amount > 5000) {
        requirements.push('Finance Director Approval Required (Budget > $5,000)');
      }
    } else {
      requirements.push('Manager Approval Required');
    }
    
    return requirements;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting workflow with data:', formData);

      // Validate required fields
      if (!formData.workflowName || !formData.submitterName || !formData.title) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // If there's an external submit handler (from AI Generator), use it
      if (onExternalSubmit) {
        onExternalSubmit(formData);
        setLoading(false);
        return;
      }

      // Create detailed workflow execution record
      const workflowExecutionData = {
        workflow_name: formData.workflowName,
        workflow_type: formData.workflowType,
        submitter_name: formData.submitterName,
        status: 'pending' as WorkflowStatus,
        request_data: {
          title: formData.title,
          amount: parseFloat(formData.amount) || 0,
          business_purpose: formData.businessPurpose,
          category: formData.category,
          urgency: formData.urgency,
          additional_details: formData.additionalDetails,
          created_at: new Date().toISOString(),
          approval_requirements: getApprovalRequirements()
        }
      };

      console.log('Creating workflow execution:', workflowExecutionData);

      const { data: workflow, error: workflowError } = await supabase
        .from('workflow_executions')
        .insert(workflowExecutionData)
        .select()
        .single();

      if (workflowError) {
        console.error('Error creating workflow:', workflowError);
        toast.error('Failed to create workflow: ' + workflowError.message);
        return;
      }

      console.log('Workflow created successfully:', workflow);

      // Execute the workflow using the workflow engine
      const { data: executionResult, error: executionError } = await supabase.functions.invoke('execute-workflow', {
        body: { workflowId: workflow.id }
      });

      if (executionError) {
        console.error('Error executing workflow:', executionError);
        toast.error('Failed to execute workflow: ' + executionError.message);
        return;
      }

      console.log('Workflow execution started:', executionResult);

      toast.success(
        `🎉 Workflow "${formData.workflowName}" submitted and started successfully! 
        Check the Active Workflows tab to monitor progress.`
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
        urgency: 'normal',
        additionalDetails: ''
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

  const approvalRequirements = getApprovalRequirements();

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Submit New Workflow Request</CardTitle>
            <CardDescription className="text-blue-100">
              Create a new workflow request that will go through the approval process
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Approval Requirements Info */}
          {approvalRequirements.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Approval Requirements</span>
              </div>
              <div className="space-y-1">
                {approvalRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-blue-800">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflowName">Workflow Name *</Label>
              <Input
                id="workflowName"
                value={formData.workflowName}
                onChange={(e) => handleInputChange('workflowName', e.target.value)}
                placeholder="Enter workflow name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="workflowType">Workflow Type *</Label>
              <Select 
                value={formData.workflowType} 
                onValueChange={(value) => handleInputChange('workflowType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense_approval">Marketing Expense Approval</SelectItem>
                  <SelectItem value="campaign_approval">Campaign Approval</SelectItem>
                  <SelectItem value="budget_request">Budget Request</SelectItem>
                  <SelectItem value="purchase_order">Purchase Order</SelectItem>
                  <SelectItem value="contract_review">Contract Review</SelectItem>
                  <SelectItem value="custom">Custom Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="submitterName">Your Name *</Label>
            <Input
              id="submitterName"
              value={formData.submitterName}
              onChange={(e) => handleInputChange('submitterName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Request Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief, descriptive title for your request"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount ($) *</Label>
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
              {parseFloat(formData.amount) > 1000 && formData.workflowType === 'expense_approval' && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-600">
                    Requires both Manager and Finance Director approval
                  </span>
                </div>
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
                  <SelectItem value="travel">Travel & Entertainment</SelectItem>
                  <SelectItem value="equipment">Equipment & Supplies</SelectItem>
                  <SelectItem value="software">Software & Tools</SelectItem>
                  <SelectItem value="training">Training & Development</SelectItem>
                  <SelectItem value="consulting">Consulting Services</SelectItem>
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
                <SelectItem value="low">🟢 Low - No rush, standard processing</SelectItem>
                <SelectItem value="normal">🟡 Normal - Standard timeline</SelectItem>
                <SelectItem value="high">🟠 High - Expedited processing needed</SelectItem>
                <SelectItem value="urgent">🔴 Urgent - Immediate attention required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="businessPurpose">Business Purpose & Justification *</Label>
            <Textarea
              id="businessPurpose"
              value={formData.businessPurpose}
              onChange={(e) => handleInputChange('businessPurpose', e.target.value)}
              placeholder="Please provide detailed business justification, expected outcomes, and how this aligns with company objectives..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="additionalDetails">Additional Details</Label>
            <Textarea
              id="additionalDetails"
              value={formData.additionalDetails}
              onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
              placeholder="Any additional information that would help with the approval process..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {loading ? 'Starting Workflow...' : 'Submit for Approval'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
