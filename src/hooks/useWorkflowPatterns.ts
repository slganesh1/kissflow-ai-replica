
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowPattern {
  id: string;
  name: string;
  frequency: string;
  next_predicted: string;
  confidence: number;
  triggers: string[];
  suggested_preparation: string;
  created_at: string;
  updated_at: string;
}

export const useWorkflowPatterns = () => {
  return useQuery({
    queryKey: ['workflow-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_patterns')
        .select('*')
        .order('next_predicted', { ascending: true });
      
      if (error) throw error;
      
      return data.map(pattern => ({
        ...pattern,
        triggers: Array.isArray(pattern.triggers) ? pattern.triggers : JSON.parse(pattern.triggers as string)
      })) as WorkflowPattern[];
    }
  });
};
