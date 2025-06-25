
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role');

    console.log('Fetching pending approvals for:', { userId, role });

    let query = supabase
      .from('workflow_approvals')
      .select(`
        *,
        workflow_executions!inner(
          workflow_name,
          workflow_type,
          request_data,
          submitter_name,
          created_at
        )
      `)
      .eq('status', 'pending');

    // Filter by approver role if specified
    if (role) {
      query = query.eq('approver_role', role);
    }

    const { data: approvals, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approvals:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending approvals' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ approvals }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-pending-approvals function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
