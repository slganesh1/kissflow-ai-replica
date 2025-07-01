
-- Add missing columns to workflow_approvals table for better task management
ALTER TABLE public.workflow_approvals ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.workflow_approvals ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.workflow_approvals ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;

-- Create workflow_tasks table for task queue management
CREATE TABLE IF NOT EXISTS public.workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  assigned_to TEXT,
  assigned_role TEXT,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 1,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE
);

-- Create workflow_execution_log table for audit trail
CREATE TABLE IF NOT EXISTS public.workflow_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  step_id TEXT,
  action TEXT NOT NULL,
  actor TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow_templates table for reusable workflow definitions
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  definition JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo purposes
CREATE POLICY "Allow all operations on workflow_tasks" ON public.workflow_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_execution_log" ON public.workflow_execution_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_templates" ON public.workflow_templates FOR ALL USING (true) WITH CHECK (true);

-- Insert default workflow templates
INSERT INTO public.workflow_templates (name, type, definition) VALUES
('Expense Approval', 'expense_approval', '{
  "steps": [
    {
      "id": "manager-approval",
      "name": "Manager Approval",
      "type": "approval",
      "role": "manager",
      "conditions": []
    },
    {
      "id": "finance-approval",
      "name": "Finance Approval", 
      "type": "approval",
      "role": "finance_director",
      "conditions": [{"field": "amount", "operator": ">", "value": 1000}]
    }
  ]
}'),
('Campaign Approval', 'campaign_approval', '{
  "steps": [
    {
      "id": "marketing-approval",
      "name": "Marketing Manager Approval",
      "type": "approval", 
      "role": "manager",
      "conditions": []
    },
    {
      "id": "finance-approval",
      "name": "Finance Approval",
      "type": "approval",
      "role": "finance_director", 
      "conditions": [{"field": "amount", "operator": ">", "value": 5000}]
    }
  ]
}');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_workflow_id ON public.workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status ON public.workflow_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_log_workflow_id ON public.workflow_execution_log(workflow_id);
