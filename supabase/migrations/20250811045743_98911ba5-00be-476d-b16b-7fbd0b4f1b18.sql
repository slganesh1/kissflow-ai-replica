-- Enable realtime for workflow execution tables
ALTER TABLE public.workflow_executions REPLICA IDENTITY FULL;
ALTER TABLE public.workflow_execution_log REPLICA IDENTITY FULL;
ALTER TABLE public.workflow_approvals REPLICA IDENTITY FULL;

-- Add workflow_executions to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_executions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_execution_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_approvals;