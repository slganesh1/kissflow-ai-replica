
-- Create enum types for better data integrity
CREATE TYPE decision_status AS ENUM ('pending', 'approved', 'executed', 'rejected');
CREATE TYPE decision_impact AS ENUM ('low', 'medium', 'high');
CREATE TYPE prediction_type AS ENUM ('workflow_demand', 'resource_need', 'bottleneck', 'completion_time');

-- Table for storing smart decisions
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context TEXT NOT NULL,
  options JSONB NOT NULL,
  recommended_action TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT NOT NULL,
  status decision_status DEFAULT 'pending',
  impact decision_impact NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing decision rules
CREATE TABLE public.decision_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  action TEXT NOT NULL,
  priority INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing predictions
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type prediction_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  probability DECIMAL(3,2) NOT NULL CHECK (probability >= 0 AND probability <= 1),
  timeframe TEXT NOT NULL,
  impact decision_impact NOT NULL,
  recommended_action TEXT NOT NULL,
  based_on JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing workflow patterns
CREATE TABLE public.workflow_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  next_predicted TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  triggers JSONB NOT NULL,
  suggested_preparation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing optimization metrics
CREATE TABLE public.optimization_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  current_value DECIMAL NOT NULL,
  previous_value DECIMAL,
  change_percentage DECIMAL,
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert some sample data for immediate functionality
INSERT INTO public.decisions (context, options, recommended_action, confidence, reasoning, status, impact) VALUES
('High volume of expense requests detected', '["Auto-approve under $500", "Route to manager", "Batch process"]', 'Auto-approve under $500', 0.87, 'Historical data shows 95% approval rate for expenses under $500 with current user', 'pending', 'medium'),
('Marketing campaign deadline approaching', '["Expedite approval", "Request extension", "Proceed with reduced scope"]', 'Expedite approval', 0.92, 'Campaign aligns with Q4 strategy and budget is within limits', 'approved', 'high');

INSERT INTO public.decision_rules (name, condition, action, priority, enabled) VALUES
('Auto-approve low-value expenses', 'amount < $500 AND user.history.approval_rate > 0.9', 'approve_automatically', 1, true),
('Escalate urgent requests', 'priority = "urgent" AND amount > $1000', 'escalate_to_director', 2, true),
('Batch process similar requests', 'category = same AND count > 5', 'batch_process', 3, true);

INSERT INTO public.predictions (type, title, description, probability, timeframe, impact, recommended_action, based_on) VALUES
('workflow_demand', 'Expense Approval Surge Expected', 'High volume of expense approvals predicted for next week due to quarter-end', 0.89, 'Next 5-7 days', 'high', 'Pre-allocate additional approval agents and setup auto-approval rules', '["Historical Q-end patterns", "Current expense trends", "Calendar events"]'),
('bottleneck', 'Marketing Approval Bottleneck', 'Marketing director likely to become workflow bottleneck with 5 campaigns pending', 0.76, 'Next 2-3 days', 'medium', 'Delegate approval authority or batch similar requests', '["Current workload", "Approval velocity", "Pending requests"]'),
('resource_need', 'Additional Processing Power Required', 'AI analysis workload expected to increase by 40% due to holiday campaigns', 0.82, 'Next 10 days', 'medium', 'Scale up processing resources and optimize AI agent allocation', '["Seasonal patterns", "Campaign schedules", "Resource utilization"]');

INSERT INTO public.workflow_patterns (name, frequency, next_predicted, confidence, triggers, suggested_preparation) VALUES
('Monthly Budget Review', 'Every 1st Monday', now() + interval '5 days', 0.95, '["Calendar event", "Finance department activity"]', 'Prepare budget reports and schedule finance team availability'),
('Product Launch Workflows', 'Quarterly + adhoc', now() + interval '15 days', 0.73, '["Product roadmap", "Marketing calendar"]', 'Setup cross-team coordination workflows and approval chains'),
('Compliance Check Cycles', 'Every 2 weeks', now() + interval '3 days', 0.91, '["Regulatory calendar", "Audit schedules"]', 'Prepare compliance documentation and assign review agents');

INSERT INTO public.optimization_metrics (metric_name, metric_type, current_value, previous_value, change_percentage) VALUES
('Processing Speed', 'performance', 115, 100, 15),
('Error Rate', 'quality', 92, 100, -8),
('Resource Efficiency', 'efficiency', 112, 100, 12),
('User Satisfaction', 'satisfaction', 107, 100, 7);

-- Enable Row Level Security (optional for now - making tables public for demo)
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_metrics ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo purposes (you may want to restrict these later)
CREATE POLICY "Allow all operations on decisions" ON public.decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on decision_rules" ON public.decision_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on predictions" ON public.predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on workflow_patterns" ON public.workflow_patterns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on optimization_metrics" ON public.optimization_metrics FOR ALL USING (true) WITH CHECK (true);
