import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Play, Save, FileText, Bot, Mail, Database, Clock, ArrowRight, CheckCircle2, AlertCircle, DollarSign, Users, Shield, Zap, User, Building, Key, Briefcase, Target, TrendingUp, FileCheck, Gavel, MessageSquare, PhoneCall, Calendar, Truck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { VisualWorkflowDiagram } from './VisualWorkflowDiagram';
import { supabase } from '@/integrations/supabase/client';
import type { Database as DatabaseType } from '@/integrations/supabase/types';

type WorkflowStatus = DatabaseType['public']['Enums']['workflow_status'];

interface AIWorkflowGeneratorProps {
  generatedWorkflow: any;
  setGeneratedWorkflow: (workflow: any) => void;
  workflowData: any;
  setWorkflowData: (data: any) => void;
}

export const AIWorkflowGenerator: React.FC<AIWorkflowGeneratorProps> = ({
  generatedWorkflow,
  setGeneratedWorkflow,
  workflowData,
  setWorkflowData
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const generateComprehensiveWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a workflow description');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Extract amount from prompt to determine approval complexity
      const amountMatch = prompt.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
      
      const workflowSteps = [];
      const approvalSteps = [];
      
      // Determine workflow type with enhanced detection
      const isOnboardingWorkflow = prompt.toLowerCase().includes('onboarding') || prompt.toLowerCase().includes('new employee') || prompt.toLowerCase().includes('employee joins') || selectedWorkflowType === 'employee_onboarding';
      const isExpenseWorkflow = prompt.toLowerCase().includes('expense') || selectedWorkflowType === 'expense_approval';
      const isCampaignWorkflow = prompt.toLowerCase().includes('campaign') || selectedWorkflowType === 'campaign_approval' || prompt.toLowerCase().includes('marketing');
      const isPurchaseWorkflow = prompt.toLowerCase().includes('purchase') || selectedWorkflowType === 'purchase_order' || prompt.toLowerCase().includes('procurement');
      const isContentWorkflow = prompt.toLowerCase().includes('content') || selectedWorkflowType === 'content_review';
      const isBudgetWorkflow = prompt.toLowerCase().includes('budget') || selectedWorkflowType === 'budget_request';
      
      if (isOnboardingWorkflow) {
        // Comprehensive Employee Onboarding Workflow
        
        // Step 1: Hiring Request Approval
        workflowSteps.push({
          id: 'step-1',
          name: 'Hiring Request Approval',
          type: 'approval',
          description: 'HR Manager reviews and approves the new hire request with position details, salary, and start date',
          icon: User,
          status: 'pending',
          approver_role: 'hr_manager',
          estimatedTime: '1-2 hours'
        });

        approvalSteps.push({
          step_id: 'hiring-request-approval',
          step_name: 'Hiring Request Approval',
          approver_role: 'hr_manager',
          required: true,
          order: 1
        });

        // Step 2: Document Collection
        workflowSteps.push({
          id: 'step-2',
          name: 'Document Collection',
          type: 'form_input',
          description: 'Collect required documents: ID, tax forms, emergency contacts, banking details, and contracts',
          icon: FileText,
          status: 'pending',
          estimatedTime: '2-3 days'
        });

        // Step 3: Background Check & Verification
        workflowSteps.push({
          id: 'step-3',
          name: 'Background Check & Verification',
          type: 'validation',
          description: 'HR conducts background verification, reference checks, and document validation',
          icon: Shield,
          status: 'pending',
          estimatedTime: '3-5 days'
        });

        // Step 4: IT Asset Provisioning
        workflowSteps.push({
          id: 'step-4',
          name: 'IT Asset Provisioning',
          type: 'processing',
          description: 'IT team provisions laptop, phone, email account, and software licenses',
          icon: Database,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 5: System Access Setup
        workflowSteps.push({
          id: 'step-5',
          name: 'System Access Setup',
          type: 'processing',
          description: 'IT creates user accounts, sets up VPN access, and configures role-based permissions',
          icon: Key,
          status: 'pending',
          estimatedTime: '4-6 hours'
        });

        // Step 6: Workspace Preparation
        workflowSteps.push({
          id: 'step-6',
          name: 'Workspace Preparation',
          type: 'processing',
          description: 'Admin team prepares desk, assigns parking, orders business cards, and sets up office access',
          icon: Building,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 7: Payroll Setup
        workflowSteps.push({
          id: 'step-7',
          name: 'Payroll Setup',
          type: 'processing',
          description: 'Finance team sets up payroll, benefits enrollment, and tax withholdings',
          icon: DollarSign,
          status: 'pending',
          estimatedTime: '2-3 hours'
        });

        // Step 8: Policy & Compliance Training
        workflowSteps.push({
          id: 'step-8',
          name: 'Policy & Compliance Training',
          type: 'processing',
          description: 'Employee completes mandatory training on policies, safety, and compliance requirements',
          icon: Shield,
          status: 'pending',
          estimatedTime: '4-8 hours'
        });

        // Step 9: Department Integration
        workflowSteps.push({
          id: 'step-9',
          name: 'Department Integration',
          type: 'processing',
          description: 'Department manager introduces team, assigns mentor, and provides role-specific training',
          icon: Users,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 10: IT Security Briefing
        workflowSteps.push({
          id: 'step-10',
          name: 'IT Security Briefing',
          type: 'approval',
          description: 'IT Security team conducts security briefing and confirms system access compliance',
          icon: Shield,
          status: 'pending',
          approver_role: 'it_security',
          estimatedTime: '1 hour'
        });

        approvalSteps.push({
          step_id: 'it-security-briefing',
          step_name: 'IT Security Briefing',
          approver_role: 'it_security',
          required: true,
          order: 2
        });

        // Step 11: Finance Approval
        workflowSteps.push({
          id: 'step-11',
          name: 'Finance Approval',
          type: 'approval',
          description: 'Finance director approves payroll setup and benefits enrollment',
          icon: DollarSign,
          status: 'pending',
          approver_role: 'finance_director',
          estimatedTime: '2-4 hours'
        });

        approvalSteps.push({
          step_id: 'finance-approval',
          step_name: 'Finance Approval',
          approver_role: 'finance_director',
          required: true,
          order: 3
        });

        // Step 12: Department Manager Approval
        workflowSteps.push({
          id: 'step-12',
          name: 'Department Manager Approval',
          type: 'approval',
          description: 'Department manager confirms readiness and approves employee to start working',
          icon: Users,
          status: 'pending',
          approver_role: 'department_manager',
          estimatedTime: '1-2 hours'
        });

        approvalSteps.push({
          step_id: 'department-manager-approval',
          step_name: 'Department Manager Approval',
          approver_role: 'department_manager',
          required: true,
          order: 4
        });

        // Step 13: Welcome & Orientation
        workflowSteps.push({
          id: 'step-13',
          name: 'Welcome & Orientation',
          type: 'notification',
          description: 'Send welcome package, schedule first day orientation, and notify all departments',
          icon: Mail,
          status: 'pending',
          estimatedTime: '1 hour'
        });

        // Step 14: First Day Check-in
        workflowSteps.push({
          id: 'step-14',
          name: 'First Day Check-in',
          type: 'processing',
          description: 'HR conducts first day check-in, collects feedback, and ensures smooth transition',
          icon: CheckCircle2,
          status: 'pending',
          estimatedTime: '30 minutes'
        });

        // Step 15: 30-Day Review
        workflowSteps.push({
          id: 'step-15',
          name: '30-Day Review',
          type: 'review',
          description: 'Schedule 30-day review meeting with manager and HR to assess integration progress',
          icon: Clock,
          status: 'pending',
          estimatedTime: '1 hour'
        });

      } else if (isCampaignWorkflow) {
        // COMPREHENSIVE CAMPAIGN APPROVAL WORKFLOW
        
        // Step 1: Campaign Proposal Submission
        workflowSteps.push({
          id: 'step-1',
          name: 'Campaign Proposal Submission',
          type: 'form_input',
          description: 'Marketing team submits detailed campaign proposal with objectives, target audience, timeline, and budget breakdown',
          icon: Target,
          status: 'pending',
          estimatedTime: '2-4 hours'
        });

        // Step 2: Market Research Validation
        workflowSteps.push({
          id: 'step-2',
          name: 'Market Research Validation',
          type: 'ai_analysis',
          description: 'AI analyzes market trends, competitor analysis, and target demographic data to validate campaign strategy',
          icon: Bot,
          status: 'pending',
          estimatedTime: '30 minutes'
        });

        // Step 3: Creative Brief Development
        workflowSteps.push({
          id: 'step-3',
          name: 'Creative Brief Development',
          type: 'processing',
          description: 'Creative team develops comprehensive brief with messaging, visual concepts, and brand guidelines',
          icon: FileText,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 4: Budget Analysis
        workflowSteps.push({
          id: 'step-4',
          name: 'Budget Analysis',
          type: 'validation',
          description: 'Finance team reviews budget allocation, ROI projections, and cost-benefit analysis',
          icon: DollarSign,
          status: 'pending',
          estimatedTime: '4-6 hours'
        });

        // Step 5: Marketing Manager Approval
        workflowSteps.push({
          id: 'step-5',
          name: 'Marketing Manager Approval',
          type: 'approval',
          description: 'Marketing manager reviews strategy alignment, brand consistency, and campaign feasibility',
          icon: CheckCircle2,
          status: 'pending',
          approver_role: 'marketing_manager',
          estimatedTime: '2-6 hours'
        });
        
        approvalSteps.push({
          step_id: 'marketing-manager-approval',
          step_name: 'Marketing Manager Approval',
          approver_role: 'marketing_manager',
          required: true,
          order: 1
        });

        // Step 6: Legal Review
        workflowSteps.push({
          id: 'step-6',
          name: 'Legal & Compliance Review',
          type: 'review',
          description: 'Legal team reviews campaign content for compliance, trademark issues, and regulatory requirements',
          icon: Gavel,
          status: 'pending',
          estimatedTime: '1-3 days'
        });

        // Step 7: Brand Team Review
        workflowSteps.push({
          id: 'step-7',
          name: 'Brand Guidelines Review',
          type: 'validation',
          description: 'Brand team ensures consistency with brand voice, visual identity, and messaging standards',
          icon: Shield,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 8: Finance Director Approval (for large campaigns)
        if (amount > 50000) {
          workflowSteps.push({
            id: 'step-8',
            name: 'Finance Director Approval',
            type: 'approval',
            description: 'Finance director approval for significant budget allocation and financial impact assessment',
            icon: DollarSign,
            status: 'pending',
            approver_role: 'finance_director',
            condition: 'amount > $50,000',
            estimatedTime: '4-8 hours'
          });
          
          approvalSteps.push({
            step_id: 'finance-director-approval',
            step_name: 'Finance Director Approval',
            approver_role: 'finance_director',
            required: true,
            order: 2,
            condition: 'amount > $50,000'
          });
        }

        // Step 9: Media Planning
        workflowSteps.push({
          id: 'step-9',
          name: 'Media Planning & Channel Selection',
          type: 'processing',
          description: 'Media team develops comprehensive media plan with channel selection, timing, and placement strategy',
          icon: TrendingUp,
          status: 'pending',
          estimatedTime: '2-3 days'
        });

        // Step 10: Creative Asset Development
        workflowSteps.push({
          id: 'step-10',
          name: 'Creative Asset Development',
          type: 'processing',
          description: 'Creative team produces all campaign assets including graphics, copy, videos, and interactive elements',
          icon: FileCheck,
          status: 'pending',
          estimatedTime: '1-2 weeks'
        });

        // Step 11: Executive Approval (for major campaigns)
        if (amount > 100000) {
          workflowSteps.push({
            id: 'step-11',
            name: 'Executive Leadership Approval',
            type: 'approval',
            description: 'C-level executive approval for major strategic marketing initiatives and brand campaigns',
            icon: Users,
            status: 'pending',
            approver_role: 'executive',
            condition: 'amount > $100,000',
            estimatedTime: '1-3 days'
          });
          
          approvalSteps.push({
            step_id: 'executive-approval',
            step_name: 'Executive Leadership Approval',
            approver_role: 'executive',
            required: true,
            order: 3,
            condition: 'amount > $100,000'
          });
        }

        // Step 12: Vendor Coordination
        workflowSteps.push({
          id: 'step-12',
          name: 'Vendor & Partner Coordination',
          type: 'processing',
          description: 'Procurement team coordinates with external vendors, agencies, and media partners for campaign execution',
          icon: Briefcase,
          status: 'pending',
          estimatedTime: '3-5 days'
        });

        // Step 13: Technology Setup
        workflowSteps.push({
          id: 'step-13',
          name: 'Technology & Analytics Setup',
          type: 'processing',
          description: 'IT team sets up tracking pixels, analytics dashboards, and campaign monitoring tools',
          icon: Database,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 14: Campaign Launch Preparation
        workflowSteps.push({
          id: 'step-14',
          name: 'Launch Preparation & Final Review',
          type: 'validation',
          description: 'All teams conduct final review, test all systems, and prepare launch checklist',
          icon: CheckCircle2,
          status: 'pending',
          estimatedTime: '1 day'
        });

        // Step 15: Campaign Execution
        workflowSteps.push({
          id: 'step-15',
          name: 'Campaign Launch & Execution',
          type: 'notification',
          description: 'Execute campaign launch across all channels and notify stakeholders of go-live status',
          icon: Zap,
          status: 'pending',
          estimatedTime: '2-4 hours'
        });

      } else if (isPurchaseWorkflow) {
        // COMPREHENSIVE PURCHASE ORDER WORKFLOW
        
        // Step 1: Purchase Request Initiation
        workflowSteps.push({
          id: 'step-1',
          name: 'Purchase Request Initiation',
          type: 'form_input',
          description: 'Requesting department submits detailed purchase request with specifications, justification, and preferred vendors',
          icon: FileText,
          status: 'pending',
          estimatedTime: '1-2 hours'
        });

        // Step 2: Budget Verification
        workflowSteps.push({
          id: 'step-2',
          name: 'Budget Verification & Allocation',
          type: 'validation',
          description: 'Finance team verifies budget availability and allocates funds for the requested purchase',
          icon: DollarSign,
          status: 'pending',
          estimatedTime: '2-4 hours'
        });

        // Step 3: Vendor Research & Analysis
        workflowSteps.push({
          id: 'step-3',
          name: 'Vendor Research & Analysis',
          type: 'ai_analysis',
          description: 'Procurement team conducts comprehensive vendor analysis including pricing, quality, and reliability assessment',
          icon: Bot,
          status: 'pending',
          estimatedTime: '1-3 days'
        });

        // Step 4: Department Manager Approval
        workflowSteps.push({
          id: 'step-4',
          name: 'Department Manager Approval',
          type: 'approval',
          description: 'Department manager reviews and approves the business need and budget allocation',
          icon: Users,
          status: 'pending',
          approver_role: 'department_manager',
          estimatedTime: '2-6 hours'
        });

        approvalSteps.push({
          step_id: 'department-manager-approval',
          step_name: 'Department Manager Approval',
          approver_role: 'department_manager',
          required: true,
          order: 1
        });

        // Step 5: Procurement Review
        workflowSteps.push({
          id: 'step-5',
          name: 'Procurement Policy Review',
          type: 'validation',
          description: 'Procurement team ensures compliance with purchasing policies and vendor requirements',
          icon: Shield,
          status: 'pending',
          estimatedTime: '4-8 hours'
        });

        // Step 6: Quote Collection & Comparison
        workflowSteps.push({
          id: 'step-6',
          name: 'Quote Collection & Comparison',
          type: 'processing',
          description: 'Procurement team collects multiple vendor quotes and conducts detailed cost-benefit analysis',
          icon: TrendingUp,
          status: 'pending',
          estimatedTime: '3-5 days'
        });

        // Step 7: Technical Evaluation
        workflowSteps.push({
          id: 'step-7',
          name: 'Technical Specification Review',
          type: 'review',
          description: 'Technical team evaluates specifications, compatibility, and integration requirements',
          icon: Database,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 8: Finance Approval (for medium purchases)
        if (amount > 25000) {
          workflowSteps.push({
            id: 'step-8',
            name: 'Finance Team Approval',
            type: 'approval',
            description: 'Finance team approves significant expenditure and validates budget impact',
            icon: DollarSign,
            status: 'pending',
            approver_role: 'finance_analyst',
            condition: 'amount > $25,000',
            estimatedTime: '1-2 hours'
          });
          
          approvalSteps.push({
            step_id: 'finance-approval',
            step_name: 'Finance Team Approval',
            approver_role: 'finance_analyst',
            required: true,
            order: 2,
            condition: 'amount > $25,000'
          });
        }

        // Step 9: Legal Review (for large contracts)
        if (amount > 75000) {
          workflowSteps.push({
            id: 'step-9',
            name: 'Legal Contract Review',
            type: 'review',
            description: 'Legal team reviews vendor contracts, terms and conditions, and liability clauses',
            icon: Gavel,
            status: 'pending',
            condition: 'contracts or amount > $75,000',
            estimatedTime: '2-4 days'
          });
        }

        // Step 10: Executive Approval (for major purchases)
        if (amount > 100000) {
          workflowSteps.push({
            id: 'step-10',
            name: 'Executive Authorization',
            type: 'approval',
            description: 'Senior executive approval for major capital expenditures and strategic purchases',
            icon: Shield,
            status: 'pending',
            approver_role: 'executive',
            condition: 'amount > $100,000',
            estimatedTime: '1-3 days'
          });
          
          approvalSteps.push({
            step_id: 'executive-approval',
            step_name: 'Executive Authorization',
            approver_role: 'executive',
            required: true,
            order: 3,
            condition: 'amount > $100,000'
          });
        }

        // Step 11: Purchase Order Generation
        workflowSteps.push({
          id: 'step-11',
          name: 'Purchase Order Generation',
          type: 'processing',
          description: 'Procurement system generates official purchase order with approved specifications and terms',
          icon: FileCheck,
          status: 'pending',
          estimatedTime: '1-2 hours'
        });

        // Step 12: Vendor Communication
        workflowSteps.push({
          id: 'step-12',
          name: 'Vendor Notification & Coordination',
          type: 'notification',
          description: 'Send purchase order to selected vendor and coordinate delivery timeline and requirements',
          icon: Mail,
          status: 'pending',
          estimatedTime: '30 minutes'
        });

        // Step 13: Delivery Coordination
        workflowSteps.push({
          id: 'step-13',
          name: 'Delivery & Receipt Coordination',
          type: 'processing',
          description: 'Admin team coordinates delivery logistics and prepares receiving procedures',
          icon: Truck,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 14: Quality Inspection
        workflowSteps.push({
          id: 'step-14',
          name: 'Quality Inspection & Acceptance',
          type: 'validation',
          description: 'Technical team inspects delivered goods against specifications and approves acceptance',
          icon: CheckCircle2,
          status: 'pending',
          estimatedTime: '4-8 hours'
        });

        // Step 15: Invoice Processing & Payment
        workflowSteps.push({
          id: 'step-15',
          name: 'Invoice Processing & Payment',
          type: 'processing',
          description: 'Accounts payable processes vendor invoice and initiates payment according to agreed terms',
          icon: CreditCard,
          status: 'pending',
          estimatedTime: '2-3 days'
        });

      } else if (isExpenseWorkflow) {
        // COMPREHENSIVE EXPENSE APPROVAL WORKFLOW
        
        // Step 1: Expense Report Submission
        workflowSteps.push({
          id: 'step-1',
          name: 'Expense Report Submission',
          type: 'form_input',
          description: 'Employee submits detailed expense report with receipts, business purpose, and project allocation',
          icon: FileText,
          status: 'pending',
          estimatedTime: '30-60 minutes'
        });

        // Step 2: Receipt Validation
        workflowSteps.push({
          id: 'step-2',
          name: 'AI Receipt Processing & Validation',
          type: 'ai_analysis',
          description: 'AI system extracts data from receipts, validates amounts, and flags any anomalies or policy violations',
          icon: Bot,
          status: 'pending',
          estimatedTime: '2-5 minutes'
        });

        // Step 3: Policy Compliance Check
        workflowSteps.push({
          id: 'step-3',
          name: 'Expense Policy Compliance',
          type: 'validation',
          description: 'System validates expenses against company policy limits, approved categories, and documentation requirements',
          icon: Shield,
          status: 'pending',
          estimatedTime: '5 minutes'
        });

        // Step 4: Manager Pre-Approval
        workflowSteps.push({
          id: 'step-4',
          name: 'Direct Manager Review',
          type: 'approval',
          description: 'Direct manager reviews business justification and approves expense legitimacy and necessity',
          icon: Users,
          status: 'pending',
          approver_role: 'direct_manager',
          estimatedTime: '1-4 hours'
        });

        approvalSteps.push({
          step_id: 'manager-approval',
          step_name: 'Direct Manager Review',
          approver_role: 'direct_manager',
          required: true,
          order: 1
        });

        // Step 5: Finance Team Review (for significant amounts)
        if (amount > 5000) {
          workflowSteps.push({
            id: 'step-5',
            name: 'Finance Team Detailed Review',
            type: 'validation',
            description: 'Finance team conducts detailed review of large expenses including budget impact and audit trail',
            icon: DollarSign,
            status: 'pending',
            condition: 'amount > $5,000',
            estimatedTime: '2-4 hours'
          });
        }

        // Step 6: Department Budget Verification
        workflowSteps.push({
          id: 'step-6',
          name: 'Department Budget Verification',
          type: 'validation',
          description: 'Finance verifies expense against department budget allocation and remaining funds',
          icon: TrendingUp,
          status: 'pending',
          estimatedTime: '1-2 hours'
        });

        // Step 7: Finance Manager Approval (for larger amounts)
        if (amount > 10000) {
          workflowSteps.push({
            id: 'step-7',
            name: 'Finance Manager Approval',
            type: 'approval',
            description: 'Finance manager approval required for expenses exceeding standard limits',
            icon: DollarSign,
            status: 'pending',
            approver_role: 'finance_manager',
            condition: 'amount > $10,000',
            estimatedTime: '4-8 hours'
          });
          
          approvalSteps.push({
            step_id: 'finance-manager-approval',
            step_name: 'Finance Manager Approval',
            approver_role: 'finance_manager',
            required: true,
            order: 2,
            condition: 'amount > $10,000'
          });
        }

        // Step 8: Executive Approval (for very large amounts)
        if (amount > 25000) {
          workflowSteps.push({
            id: 'step-8',
            name: 'Executive Leadership Approval',
            type: 'approval',
            description: 'C-level executive approval for exceptional expense amounts requiring senior oversight',
            icon: Shield,
            status: 'pending',
            approver_role: 'executive',
            condition: 'amount > $25,000',
            estimatedTime: '1-2 days'
          });
          
          approvalSteps.push({
            step_id: 'executive-approval',
            step_name: 'Executive Leadership Approval',
            approver_role: 'executive',
            required: true,
            order: 3,
            condition: 'amount > $25,000'
          });
        }

        // Step 9: Audit Trail Documentation
        workflowSteps.push({
          id: 'step-9',
          name: 'Audit Documentation',
          type: 'processing',
          description: 'System creates comprehensive audit trail with all approvals, timestamps, and supporting documentation',
          icon: FileCheck,
          status: 'pending',
          estimatedTime: '5 minutes'
        });

        // Step 10: Reimbursement Processing
        workflowSteps.push({
          id: 'step-10',
          name: 'Reimbursement Processing',
          type: 'processing',
          description: 'Payroll team processes approved expense for reimbursement in next payroll cycle',
          icon: CreditCard,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 11: Payment Notification
        workflowSteps.push({
          id: 'step-11',
          name: 'Payment Confirmation',
          type: 'notification',
          description: 'Employee receives notification of approved reimbursement and expected payment date',
          icon: Mail,
          status: 'pending',
          estimatedTime: '5 minutes'
        });

      } else if (isContentWorkflow) {
        // COMPREHENSIVE CONTENT REVIEW WORKFLOW
        
        // Step 1: Content Submission
        workflowSteps.push({
          id: 'step-1',
          name: 'Content Submission & Brief',
          type: 'form_input',
          description: 'Content creator submits material with target audience, distribution channels, and strategic objectives',
          icon: FileText,
          status: 'pending',
          estimatedTime: '1-2 hours'
        });

        // Step 2: AI Content Analysis
        workflowSteps.push({
          id: 'step-2',
          name: 'AI Content Analysis',
          type: 'ai_analysis',
          description: 'AI analyzes content for tone, readability, SEO optimization, and potential compliance issues',
          icon: Bot,
          status: 'pending',
          estimatedTime: '10-15 minutes'
        });

        // Step 3: Editorial Review
        workflowSteps.push({
          id: 'step-3',
          name: 'Editorial Review & Copy Editing',
          type: 'validation',
          description: 'Editorial team reviews content for grammar, style, clarity, and alignment with brand voice',
          icon: FileCheck,
          status: 'pending',
          estimatedTime: '2-4 hours'
        });

        // Step 4: Brand Consistency Review
        workflowSteps.push({
          id: 'step-4',
          name: 'Brand Guidelines Compliance',
          type: 'validation',
          description: 'Brand team ensures content adheres to brand guidelines, messaging, and visual identity standards',
          icon: Shield,
          status: 'pending',
          estimatedTime: '1-2 hours'
        });

        // Step 5: Subject Matter Expert Review
        workflowSteps.push({
          id: 'step-5',
          name: 'Subject Matter Expert Review',
          type: 'review',
          description: 'Industry expert validates technical accuracy, industry compliance, and factual correctness',
          icon: Users,
          status: 'pending',
          estimatedTime: '4-8 hours'
        });

        // Step 6: Legal & Compliance Review
        workflowSteps.push({
          id: 'step-6',
          name: 'Legal & Compliance Review',
          type: 'review',
          description: 'Legal team reviews content for regulatory compliance, copyright issues, and potential liability',
          icon: Gavel,
          status: 'pending',
          estimatedTime: '1-3 days'
        });

        // Step 7: Marketing Manager Approval
        workflowSteps.push({
          id: 'step-7',
          name: 'Marketing Manager Approval',
          type: 'approval',
          description: 'Marketing manager approves content strategy alignment and distribution plan',
          icon: CheckCircle2,
          status: 'pending',
          approver_role: 'marketing_manager',
          estimatedTime: '2-6 hours'
        });

        approvalSteps.push({
          step_id: 'marketing-manager-approval',
          step_name: 'Marketing Manager Approval',
          approver_role: 'marketing_manager',
          required: true,
          order: 1
        });

        // Step 8: SEO Optimization
        workflowSteps.push({
          id: 'step-8',
          name: 'SEO Optimization & Metadata',
          type: 'processing',
          description: 'SEO team optimizes content for search engines and adds appropriate metadata and tags',
          icon: TrendingUp,
          status: 'pending',
          estimatedTime: '1-2 hours'
        });

        // Step 9: Visual Asset Coordination
        workflowSteps.push({
          id: 'step-9',
          name: 'Visual Asset Development',
          type: 'processing',
          description: 'Design team creates or selects appropriate visual assets, graphics, and multimedia elements',
          icon: FileText,
          status: 'pending',
          estimatedTime: '4-8 hours'
        });

        // Step 10: Content Management System Setup
        workflowSteps.push({
          id: 'step-10',
          name: 'CMS Setup & Scheduling',
          type: 'processing',
          description: 'Web team sets up content in CMS with proper formatting, metadata, and publication schedule',
          icon: Database,
          status: 'pending',
          estimatedTime: '1-2 hours'
        });

        // Step 11: Final Quality Assurance
        workflowSteps.push({
          id: 'step-11',
          name: 'Final Quality Assurance',
          type: 'validation',
          description: 'QA team conducts final review of formatted content across all planned distribution channels',
          icon: CheckCircle2,
          status: 'pending',
          estimatedTime: '1-2 hours'
        });

        // Step 12: Publication & Distribution
        workflowSteps.push({
          id: 'step-12',
          name: 'Content Publication',
          type: 'notification',
          description: 'Publish approved content across designated channels and notify stakeholders of go-live status',
          icon: Zap,
          status: 'pending',
          estimatedTime: '30 minutes'
        });

      } else if (isBudgetWorkflow) {
        // COMPREHENSIVE BUDGET REQUEST WORKFLOW
        
        // Step 1: Budget Request Initiation
        workflowSteps.push({
          id: 'step-1',
          name: 'Budget Request Submission',
          type: 'form_input',
          description: 'Department submits detailed budget request with financial projections, business justification, and ROI analysis',
          icon: DollarSign,
          status: 'pending',
          estimatedTime: '3-6 hours'
        });

        // Step 2: Financial Analysis
        workflowSteps.push({
          id: 'step-2',
          name: 'AI Financial Impact Analysis',
          type: 'ai_analysis',
          description: 'AI analyzes budget request against historical data, market trends, and organizational financial health',
          icon: Bot,
          status: 'pending',
          estimatedTime: '15-30 minutes'
        });

        // Step 3: Department Manager Review
        workflowSteps.push({
          id: 'step-3',
          name: 'Department Manager Endorsement',
          type: 'approval',
          description: 'Department manager reviews and endorses budget request with strategic alignment assessment',
          icon: Users,
          status: 'pending',
          approver_role: 'department_manager',
          estimatedTime: '4-8 hours'
        });

        approvalSteps.push({
          step_id: 'department-manager-approval',
          step_name: 'Department Manager Endorsement',
          approver_role: 'department_manager',
          required: true,
          order: 1
        });

        // Step 4: Finance Team Analysis
        workflowSteps.push({
          id: 'step-4',
          name: 'Finance Team Detailed Analysis',
          type: 'validation',
          description: 'Finance analysts conduct comprehensive review of financial projections and budget allocation impact',
          icon: TrendingUp,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 5: Cross-Department Impact Assessment
        workflowSteps.push({
          id: 'step-5',
          name: 'Cross-Department Impact Review',
          type: 'review',
          description: 'Review potential impact on other departments and identify resource allocation conflicts',
          icon: Users,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 6: Finance Director Review
        workflowSteps.push({
          id: 'step-6',
          name: 'Finance Director Approval',
          type: 'approval',
          description: 'Finance director evaluates budget request against overall financial strategy and cash flow projections',
          icon: DollarSign,
          status: 'pending',
          approver_role: 'finance_director',
          estimatedTime: '1-2 days'
        });

        approvalSteps.push({
          step_id: 'finance-director-approval',
          step_name: 'Finance Director Approval',
          approver_role: 'finance_director',
          required: true,
          order: 2
        });

        // Step 7: Executive Committee Review
        workflowSteps.push({
          id: 'step-7',
          name: 'Executive Committee Review',
          type: 'review',
          description: 'Executive team reviews budget request for strategic alignment and organizational priorities',
          icon: Shield,
          status: 'pending',
          estimatedTime: '3-5 days'
        });

        // Step 8: Board Presentation (for major budgets)
        if (amount > 500000) {
          workflowSteps.push({
            id: 'step-8',
            name: 'Board of Directors Presentation',
            type: 'approval',
            description: 'Present major budget request to board of directors for final approval and oversight',
            icon: Users,
            status: 'pending',
            approver_role: 'board',
            condition: 'amount > $500,000',
            estimatedTime: '1-2 weeks'
          });
          
          approvalSteps.push({
            step_id: 'board-approval',
            step_name: 'Board of Directors Approval',
            approver_role: 'board',
            required: true,
            order: 3,
            condition: 'amount > $500,000'
          });
        }

        // Step 9: Budget Allocation
        workflowSteps.push({
          id: 'step-9',
          name: 'Budget Allocation & Setup',
          type: 'processing',
          description: 'Finance team sets up approved budget allocation in financial systems with proper tracking and controls',
          icon: Database,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 10: Monitoring Framework Setup
        workflowSteps.push({
          id: 'step-10',
          name: 'Budget Monitoring Setup',
          type: 'processing',
          description: 'Establish monitoring framework with KPIs, reporting schedule, and variance alert thresholds',
          icon: TrendingUp,
          status: 'pending',
          estimatedTime: '4-8 hours'
        });

        // Step 11: Stakeholder Notification
        workflowSteps.push({
          id: 'step-11',
          name: 'Approval Notification',
          type: 'notification',
          description: 'Notify all stakeholders of budget approval and provide access to allocated funds and reporting tools',
          icon: Mail,
          status: 'pending',
          estimatedTime: '30 minutes'
        });

      } else {
        // DEFAULT COMPREHENSIVE WORKFLOW for custom scenarios
        
        // Step 1: Request Initiation
        workflowSteps.push({
          id: 'step-1',
          name: 'Request Initiation & Documentation',
          type: 'form_input',
          description: 'Submitter provides comprehensive request details with objectives, requirements, and business justification',
          icon: FileText,
          status: 'pending',
          estimatedTime: '1-3 hours'
        });

        // Step 2: AI Analysis
        workflowSteps.push({
          id: 'step-2',
          name: 'AI Analysis & Risk Assessment',
          type: 'ai_analysis',
          description: 'AI analyzes request for complexity, risk factors, resource requirements, and strategic alignment',
          icon: Bot,
          status: 'pending',
          estimatedTime: '15-30 minutes'
        });

        // Step 3: Initial Review
        workflowSteps.push({
          id: 'step-3',
          name: 'Initial Feasibility Review',
          type: 'validation',
          description: 'Cross-functional team assesses technical feasibility, resource availability, and timeline requirements',
          icon: CheckCircle2,
          status: 'pending',
          estimatedTime: '4-8 hours'
        });

        // Step 4: Department Coordination
        workflowSteps.push({
          id: 'step-4',
          name: 'Multi-Department Coordination',
          type: 'processing',
          description: 'Coordinate with all relevant departments to assess impact, dependencies, and resource requirements',
          icon: Users,
          status: 'pending',
          estimatedTime: '1-3 days'
        });

        // Step 5: Manager Approval
        workflowSteps.push({
          id: 'step-5',
          name: 'Manager Approval',
          type: 'approval',
          description: 'Department manager reviews and approves the request with resource allocation confirmation',
          icon: Users,
          status: 'pending',
          approver_role: 'department_manager',
          estimatedTime: '4-12 hours'
        });

        approvalSteps.push({
          step_id: 'manager-approval',
          step_name: 'Manager Approval',
          approver_role: 'department_manager',
          required: true,
          order: 1
        });

        // Step 6: Technical Review
        workflowSteps.push({
          id: 'step-6',
          name: 'Technical Architecture Review',
          type: 'review',
          description: 'Technical team conducts detailed review of implementation approach and system integration requirements',
          icon: Database,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 7: Security & Compliance
        workflowSteps.push({
          id: 'step-7',
          name: 'Security & Compliance Assessment',
          type: 'validation',
          description: 'Security team evaluates request for compliance requirements, data protection, and security implications',
          icon: Shield,
          status: 'pending',
          estimatedTime: '1-2 days'
        });

        // Step 8: Executive Approval
        workflowSteps.push({
          id: 'step-8',
          name: 'Executive Leadership Approval',
          type: 'approval',
          description: 'Senior executive reviews strategic alignment and approves resource allocation for implementation',
          icon: Shield,
          status: 'pending',
          approver_role: 'executive',
          estimatedTime: '1-3 days'
        });

        approvalSteps.push({
          step_id: 'executive-approval',
          step_name: 'Executive Leadership Approval',
          approver_role: 'executive',
          required: true,
          order: 2
        });

        // Step 9: Implementation Planning
        workflowSteps.push({
          id: 'step-9',
          name: 'Implementation Planning',
          type: 'processing',
          description: 'Project team develops detailed implementation plan with timeline, milestones, and resource allocation',
          icon: Calendar,
          status: 'pending',
          estimatedTime: '2-5 days'
        });

        // Step 10: Final Execution
        workflowSteps.push({
          id: 'step-10',
          name: 'Execution & Monitoring',
          type: 'notification',
          description: 'Execute approved plan and establish monitoring framework for progress tracking and success metrics',
          icon: Zap,
          status: 'pending',
          estimatedTime: '1-2 days'
        });
      }

      // Calculate total estimated time based on workflow complexity
      const totalHours = isOnboardingWorkflow ? 
        Math.max(40, workflowSteps.length * 4) : // Onboarding takes longer
        Math.max(12, workflowSteps.length * 3 + (amount > 100000 ? 24 : 0));
      
      const complexity = workflowSteps.length > 14 ? 'high' : workflowSteps.length > 10 ? 'medium' : 'low';

      const generatedWorkflowData = {
        id: `workflow-${Date.now()}`,
        name: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        description: prompt,
        type: selectedWorkflowType || (
          isOnboardingWorkflow ? 'employee_onboarding' : 
          isCampaignWorkflow ? 'campaign_approval' :
          isPurchaseWorkflow ? 'purchase_order' :
          isExpenseWorkflow ? 'expense_approval' :
          isContentWorkflow ? 'content_review' :
          isBudgetWorkflow ? 'budget_request' :
          'custom'
        ),
        amount: amount,
        steps: workflowSteps,
        approvalSteps: approvalSteps,
        created_at: new Date().toISOString(),
        status: 'draft',
        triggers: ['manual', 'form_submission'],
        estimated_duration: isOnboardingWorkflow ? 
          `${Math.ceil(totalHours/8)} business days` : 
          `${Math.ceil(totalHours/8)}-${Math.ceil(totalHours * 1.5/8)} business days`,
        complexity: complexity,
        risk_level: isOnboardingWorkflow ? 'medium' : 
          (amount > 100000 ? 'high' : amount > 50000 ? 'medium' : 'low'),
        departments: isOnboardingWorkflow ? 
          ['HR', 'IT', 'Admin', 'Finance', 'Security'] :
          isCampaignWorkflow ? ['Marketing', 'Creative', 'Legal', 'Finance', 'IT'] :
          isPurchaseWorkflow ? ['Procurement', 'Finance', 'Legal', 'Technical', 'Admin'] :
          isExpenseWorkflow ? ['Finance', 'Management', 'Audit'] :
          isContentWorkflow ? ['Marketing', 'Editorial', 'Legal', 'Brand', 'IT'] :
          isBudgetWorkflow ? ['Finance', 'Executive', 'Strategic Planning'] :
          ['Multi-Department']
      };

      console.log('Generated comprehensive workflow:', generatedWorkflowData);
      
      setGeneratedWorkflow(generatedWorkflowData);
      setWorkflowData(generatedWorkflowData);
      
      toast.success(`🎉 Comprehensive workflow generated! ${workflowSteps.length} steps across ${generatedWorkflowData.departments.length} departments with ${approvalSteps.length} approval levels`);
      
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!generatedWorkflow) {
      toast.error('Please generate a workflow first');
      return;
    }

    setIsExecuting(true);
    
    try {
      console.log('Executing workflow:', generatedWorkflow);

      // Create workflow execution record
      const workflowExecutionData = {
        workflow_name: generatedWorkflow.name,
        workflow_type: generatedWorkflow.type || 'custom',
        submitter_name: 'AI Generated',
        status: 'pending' as WorkflowStatus,
        request_data: {
          description: generatedWorkflow.description,
          amount: generatedWorkflow.amount || 0,
          steps: generatedWorkflow.steps,
          approval_steps: generatedWorkflow.approvalSteps,
          created_at: new Date().toISOString(),
          complexity: generatedWorkflow.complexity,
          estimated_duration: generatedWorkflow.estimated_duration,
          departments: generatedWorkflow.departments,
          risk_level: generatedWorkflow.risk_level
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
        toast.error('Failed to execute workflow: ' + workflowError.message);
        return;
      }

      console.log('Workflow executed successfully:', workflow);

      // Create approval records if there are approval steps
      if (generatedWorkflow.approvalSteps && generatedWorkflow.approvalSteps.length > 0) {
        const approvalRecords = generatedWorkflow.approvalSteps.map((step: any, index: number) => ({
          workflow_id: workflow.id,
          step_id: step.step_id,
          step_name: step.step_name,
          approver_role: step.approver_role,
          status: 'pending' as const,
          order_sequence: index + 1
        }));

        console.log('Creating approval records:', approvalRecords);

        const { error: approvalError } = await supabase
          .from('workflow_approvals')
          .insert(approvalRecords);

        if (approvalError) {
          console.error('Error creating approval records:', approvalError);
          toast.error('Failed to create approval records: ' + approvalError.message);
          return;
        }
      }

      const approvalCount = generatedWorkflow.approvalSteps?.length || 0;
      const departmentCount = generatedWorkflow.departments?.length || 0;
      toast.success(
        `🎉 Comprehensive workflow "${generatedWorkflow.name}" executed successfully! 
        ${approvalCount} approval levels across ${departmentCount} departments. Check the Active tab to monitor progress.`
      );

    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow: ' + (error as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <span>Enhanced AI Workflow Generator</span>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Generate comprehensive, multi-departmental workflows with detailed coordination and approval processes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="workflow-prompt" className="text-base font-medium">
                🤖 Describe Your Complex Business Process
              </Label>
              <Textarea
                id="workflow-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your complex business process... For example: 'When launching a new marketing campaign, we need coordination between Marketing, Creative, Legal, Finance, and IT teams. This involves budget approval, creative development, compliance review, technology setup, and vendor management.'"
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="workflow-type" className="text-base font-medium">
                📂 Workflow Category
              </Label>
              <Select value={selectedWorkflowType} onValueChange={setSelectedWorkflowType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee_onboarding">Employee Onboarding (15+ steps)</SelectItem>
                  <SelectItem value="campaign_approval">Campaign Approval (12+ steps)</SelectItem>
                  <SelectItem value="purchase_order">Purchase Order (15+ steps)</SelectItem>
                  <SelectItem value="expense_approval">Expense Approval (11+ steps)</SelectItem>
                  <SelectItem value="content_review">Content Review (12+ steps)</SelectItem>
                  <SelectItem value="budget_request">Budget Request (11+ steps)</SelectItem>
                  <SelectItem value="custom">Custom Complex Workflow (10+ steps)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateComprehensiveWorkflow} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Comprehensive Multi-Department Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Comprehensive Workflow Diagram
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visual Workflow Diagram */}
      {generatedWorkflow && generatedWorkflow.steps && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-6 w-6" />
                <span>Comprehensive Workflow Diagram</span>
              </div>
              <div className="flex space-x-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  {generatedWorkflow.complexity} complexity
                </Badge>
                <Badge className="bg-purple-500/20 text-white border-purple-300/30">
                  {generatedWorkflow.departments?.length || 0} departments
                </Badge>
                {generatedWorkflow.amount > 0 && (
                  <Badge className="bg-yellow-500/20 text-white border-yellow-300/30">
                    ${generatedWorkflow.amount.toLocaleString()}
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription className="text-green-100">
              {generatedWorkflow.description}
              {generatedWorkflow.departments && (
                <div className="mt-2">
                  <span className="font-medium">Departments involved: </span>
                  {generatedWorkflow.departments.join(', ')}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <VisualWorkflowDiagram workflow={generatedWorkflow} />
            
            {/* Action Buttons */}
            <div className="flex space-x-4 p-6">
              <Button 
                onClick={handleExecuteWorkflow}
                disabled={isExecuting}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg py-3"
              >
                {isExecuting ? (
                  <>
                    <Zap className="h-5 w-5 mr-2 animate-spin" />
                    Executing Comprehensive Workflow...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Execute This Comprehensive Workflow
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setGeneratedWorkflow(null);
                  setPrompt('');
                  setSelectedWorkflowType('');
                }}
                className="bg-white/50 hover:bg-white/70"
              >
                Generate New
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
