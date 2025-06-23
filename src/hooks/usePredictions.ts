
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Prediction {
  id: string;
  type: 'workflow_demand' | 'resource_need' | 'bottleneck' | 'completion_time';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
  recommended_action: string;
  based_on: string[];
  created_at: string;
  updated_at: string;
}

export const usePredictions = () => {
  return useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(prediction => ({
        ...prediction,
        based_on: Array.isArray(prediction.based_on) ? prediction.based_on : JSON.parse(prediction.based_on as string)
      })) as Prediction[];
    }
  });
};
