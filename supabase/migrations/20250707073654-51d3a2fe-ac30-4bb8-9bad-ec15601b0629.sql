
-- Add SLA configuration table
CREATE TABLE public.workflow_sla_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_type TEXT NOT NULL,
  step_type TEXT NOT NULL,
  sla_hours INTEGER NOT NULL DEFAULT 24,
  escalation_hours INTEGER NOT NULL DEFAULT 48,
  auto_approve_on_expire BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add SLA tracking to workflow executions
ALTER TABLE public.workflow_executions 
ADD COLUMN sla_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN sla_status TEXT DEFAULT 'on_time' CHECK (sla_status IN ('on_time', 'at_risk', 'overdue', 'escalated'));

-- Add escalation tracking
CREATE TABLE public.workflow_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflow_executions(id) NOT NULL,
  approval_id UUID REFERENCES public.workflow_approvals(id),
  escalated_from TEXT NOT NULL,
  escalated_to TEXT NOT NULL,
  escalation_reason TEXT NOT NULL,
  escalated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'cancelled'))
);

-- Add SLA notifications table
CREATE TABLE public.workflow_sla_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflow_executions(id) NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'overdue', 'escalated')),
  recipient_role TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message TEXT NOT NULL
);

-- Insert default SLA configurations
INSERT INTO public.workflow_sla_config (workflow_type, step_type, sla_hours, escalation_hours, auto_approve_on_expire) VALUES
('expense_request', 'approval', 24, 48, false),
('purchase_order', 'approval', 48, 72, false),
('budget_approval', 'approval', 72, 120, false),
('travel_request', 'approval', 24, 48, true),
('contract_review', 'approval', 120, 168, false);

-- Enable RLS on new tables
ALTER TABLE public.workflow_sla_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_sla_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now)
CREATE POLICY "Allow all operations on workflow_sla_config" ON public.workflow_sla_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_escalations" ON public.workflow_escalations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_sla_notifications" ON public.workflow_sla_notifications FOR ALL USING (true) WITH CHECK (true);

-- Create function to check and update SLA status
CREATE OR REPLACE FUNCTION public.update_workflow_sla_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update workflows that are approaching SLA deadline (at risk)
  UPDATE public.workflow_executions 
  SET sla_status = 'at_risk',
      updated_at = now()
  WHERE sla_deadline IS NOT NULL 
    AND sla_deadline > now() 
    AND sla_deadline <= now() + INTERVAL '4 hours'
    AND sla_status = 'on_time'
    AND status IN ('pending', 'in_progress');

  -- Update workflows that have exceeded SLA deadline (overdue)
  UPDATE public.workflow_executions 
  SET sla_status = 'overdue',
      updated_at = now()
  WHERE sla_deadline IS NOT NULL 
    AND sla_deadline < now()
    AND sla_status IN ('on_time', 'at_risk')
    AND status IN ('pending', 'in_progress');
END;
$$;

-- Create function to handle escalations
CREATE OR REPLACE FUNCTION public.escalate_overdue_approvals()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  approval_record RECORD;
  escalation_target TEXT;
BEGIN
  -- Find overdue approvals that need escalation
  FOR approval_record IN 
    SELECT wa.*, we.workflow_type, sc.escalation_hours
    FROM public.workflow_approvals wa
    JOIN public.workflow_executions we ON wa.workflow_id = we.id
    JOIN public.workflow_sla_config sc ON we.workflow_type = sc.workflow_type AND sc.step_type = 'approval'
    WHERE wa.status = 'pending'
      AND wa.assigned_at < now() - (sc.escalation_hours || ' hours')::INTERVAL
      AND wa.escalated = false
  LOOP
    -- Determine escalation target based on current approver role
    escalation_target := CASE 
      WHEN approval_record.approver_role = 'manager' THEN 'senior_manager'
      WHEN approval_record.approver_role = 'senior_manager' THEN 'director'
      WHEN approval_record.approver_role = 'director' THEN 'vp'
      ELSE 'admin'
    END;

    -- Create escalation record
    INSERT INTO public.workflow_escalations (
      workflow_id, 
      approval_id, 
      escalated_from, 
      escalated_to, 
      escalation_reason
    ) VALUES (
      approval_record.workflow_id,
      approval_record.id,
      approval_record.approver_role,
      escalation_target,
      'SLA deadline exceeded - automatic escalation'
    );

    -- Update approval record
    UPDATE public.workflow_approvals 
    SET escalated = true,
        approver_role = escalation_target,
        updated_at = now()
    WHERE id = approval_record.id;

    -- Update workflow SLA status
    UPDATE public.workflow_executions 
    SET sla_status = 'escalated',
        updated_at = now()
    WHERE id = approval_record.workflow_id;

    -- Log the escalation
    INSERT INTO public.workflow_execution_log (
      workflow_id,
      step_id,
      action,
      actor,
      details
    ) VALUES (
      approval_record.workflow_id,
      approval_record.step_id,
      'escalated',
      'system',
      jsonb_build_object(
        'from_role', approval_record.approver_role,
        'to_role', escalation_target,
        'reason', 'SLA deadline exceeded'
      )
    );
  END LOOP;
END;
$$;
