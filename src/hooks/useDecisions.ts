
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Decision {
  id: string;
  context: string;
  options: string[];
  recommended_action: string;
  confidence: number;
  reasoning: string;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  impact: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export const useDecisions = () => {
  return useQuery({
    queryKey: ['decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(decision => ({
        ...decision,
        options: Array.isArray(decision.options) ? decision.options : JSON.parse(decision.options as string)
      })) as Decision[];
    }
  });
};

export const useExecuteDecision = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (decisionId: string) => {
      const { error } = await supabase
        .from('decisions')
        .update({ status: 'executed', updated_at: new Date().toISOString() })
        .eq('id', decisionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    }
  });
};
