
-- Create enum for workflow execution status
CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');

-- Create enum for approval status
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create workflow_executions table
CREATE TABLE public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  workflow_type TEXT NOT NULL,
  request_data JSONB NOT NULL,
  submitter_name TEXT NOT NULL,
  status workflow_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow_approvals table
CREATE TABLE public.workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  approver_role TEXT NOT NULL,
  approver_id TEXT,
  status approval_status DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_approvals ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo purposes
CREATE POLICY "Allow all operations on workflow_executions" ON public.workflow_executions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_approvals" ON public.workflow_approvals FOR ALL USING (true) WITH CHECK (true);
