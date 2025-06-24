
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, DollarSign, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowInput {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'date' | 'file' | 'select' | 'textarea' | 'currency';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: string;
}

interface WorkflowInputFormProps {
  workflowName: string;
  workflowType: string;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
}

export const WorkflowInputForm: React.FC<WorkflowInputFormProps> = ({
  workflowName,
  workflowType,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate input fields based on workflow type
  const getWorkflowInputs = (type: string): WorkflowInput[] => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('marketing') && lowerType.includes('campaign')) {
      return [
        {
          id: 'campaign_name',
          name: 'campaign_name',
          type: 'text',
          label: 'Campaign Name',
          placeholder: 'Enter campaign name',
          required: true
        },
        {
          id: 'budget_amount',
          name: 'budget_amount',
          type: 'currency',
          label: 'Budget Amount',
          placeholder: '15000',
          required: true,
          validation: 'Must be greater than $1000'
        },
        {
          id: 'target_audience',
          name: 'target_audience',
          type: 'textarea',
          label: 'Target Audience',
          placeholder: 'Describe your target audience demographics and interests',
          required: true
        },
        {
          id: 'campaign_goals',
          name: 'campaign_goals',
          type: 'select',
          label: 'Primary Campaign Goal',
          required: true,
          options: ['Brand Awareness', 'Lead Generation', 'Sales Conversion', 'Customer Retention']
        },
        {
          id: 'launch_date',
          name: 'launch_date',
          type: 'date',
          label: 'Preferred Launch Date',
          required: true
        },
        {
          id: 'creative_brief',
          name: 'creative_brief',
          type: 'file',
          label: 'Creative Brief Document',
          required: false
        },
        {
          id: 'justification',
          name: 'justification',
          type: 'textarea',
          label: 'Business Justification',
          placeholder: 'Explain why this campaign is necessary and expected ROI',
          required: true
        }
      ];
    }
    
    if (lowerType.includes('expense') || lowerType.includes('approval')) {
      return [
        {
          id: 'expense_title',
          name: 'expense_title',
          type: 'text',
          label: 'Expense Title',
          placeholder: 'Brief description of the expense',
          required: true
        },
        {
          id: 'amount',
          name: 'amount',
          type: 'currency',
          label: 'Amount',
          placeholder: '5000',
          required: true
        },
        {
          id: 'category',
          name: 'category',
          type: 'select',
          label: 'Expense Category',
          required: true,
          options: ['Marketing', 'Technology', 'Travel', 'Office Supplies', 'Professional Services', 'Other']
        },
        {
          id: 'business_purpose',
          name: 'business_purpose',
          type: 'textarea',
          label: 'Business Purpose',
          placeholder: 'Detailed explanation of business need and expected benefits',
          required: true
        },
        {
          id: 'required_by',
          name: 'required_by',
          type: 'date',
          label: 'Required By Date',
          required: false
        },
        {
          id: 'supporting_documents',
          name: 'supporting_documents',
          type: 'file',
          label: 'Supporting Documents',
          required: false
        }
      ];
    }
    
    // Default generic inputs
    return [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Request Title',
        placeholder: 'Enter a descriptive title',
        required: true
      },
      {
        id: 'description',
        name: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Provide detailed information about your request',
        required: true
      },
      {
        id: 'priority',
        name: 'priority',
        type: 'select',
        label: 'Priority Level',
        required: true,
        options: ['Low', 'Medium', 'High', 'Urgent']
      }
    ];
  };

  const inputs = getWorkflowInputs(workflowType);

  const handleInputChange = (inputId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [inputId]: value
    }));
  };

  const handleFileUpload = (inputId: string, file: File) => {
    // In a real app, you'd upload to storage and get a URL
    setFormData(prev => ({
      ...prev,
      [inputId]: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // Temporary URL for demo
      }
    }));
    toast.success(`File "${file.name}" uploaded successfully`);
  };

  const validateForm = (): boolean => {
    for (const input of inputs) {
      if (input.required && !formData[input.id]) {
        toast.error(`${input.label} is required`);
        return false;
      }
      
      if (input.type === 'currency' && formData[input.id]) {
        const amount = parseFloat(formData[input.id].toString().replace(/[$,]/g, ''));
        if (isNaN(amount) || amount <= 0) {
          toast.error(`${input.label} must be a valid positive number`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Add metadata
    const submissionData = {
      ...formData,
      workflow_name: workflowName,
      workflow_type: workflowType,
      submitted_at: new Date().toISOString(),
      submitter_id: 'current-user', // In real app, get from auth
      status: 'submitted'
    };
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit(submissionData);
      toast.success('Workflow request submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit workflow request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (input: WorkflowInput) => {
    const commonProps = {
      id: input.id,
      required: input.required,
      onChange: (e: any) => handleInputChange(input.id, e.target.value)
    };

    switch (input.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={input.placeholder}
            rows={3}
            value={formData[input.id] || ''}
          />
        );
      
      case 'select':
        return (
          <Select onValueChange={(value) => handleInputChange(input.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${input.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <input
                type="file"
                id={input.id}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(input.id, file);
                }}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              <label
                htmlFor={input.id}
                className="cursor-pointer text-sm text-gray-600 hover:text-blue-600"
              >
                Click to upload or drag and drop
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, TXT, or image files
              </p>
            </div>
            {formData[input.id] && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                <span>{formData[input.id].name}</span>
                <Badge variant="secondary">{(formData[input.id].size / 1024).toFixed(1)}KB</Badge>
              </div>
            )}
          </div>
        );
      
      case 'currency':
        return (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              {...commonProps}
              type="number"
              placeholder={input.placeholder}
              className="pl-10"
              value={formData[input.id] || ''}
              min="0"
              step="0.01"
            />
          </div>
        );
      
      case 'date':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              {...commonProps}
              type="date"
              className="pl-10"
              value={formData[input.id] || ''}
            />
          </div>
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type={input.type}
            placeholder={input.placeholder}
            value={formData[input.id] || ''}
          />
        );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Submit Request: {workflowName}</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{workflowType}</Badge>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>Required fields are marked with *</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {inputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <Label htmlFor={input.id} className="flex items-center space-x-1">
                <span>{input.label}</span>
                {input.required && <span className="text-red-500">*</span>}
              </Label>
              {renderInput(input)}
              {input.validation && (
                <p className="text-xs text-gray-500">{input.validation}</p>
              )}
            </div>
          ))}
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
