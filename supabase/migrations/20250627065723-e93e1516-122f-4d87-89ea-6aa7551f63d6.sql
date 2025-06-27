
-- Add order_sequence column to workflow_approvals table
ALTER TABLE public.workflow_approvals 
ADD COLUMN order_sequence INTEGER;

-- Update existing records to have a default order_sequence value
UPDATE public.workflow_approvals 
SET order_sequence = 1 
WHERE order_sequence IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.workflow_approvals 
ALTER COLUMN order_sequence SET NOT NULL;
