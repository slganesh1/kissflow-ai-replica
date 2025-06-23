
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DecisionRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useDecisionRules = () => {
  return useQuery({
    queryKey: ['decision-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decision_rules')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as DecisionRule[];
    }
  });
};
