import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseId, tableName, record } = await req.json();
    
    // Get Airtable API key from Supabase secrets
    const airtableApiKey = Deno.env.get('AIRTABLE_API_KEY');
    
    if (!airtableApiKey) {
      console.error('AIRTABLE_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Airtable API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!baseId || !tableName || !record) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: baseId, tableName, or record' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Syncing to Airtable base: ${baseId}, table: ${tableName}`);

    // Make request to Airtable API
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    
    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Airtable API error:', responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to sync to Airtable', 
          details: responseData 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully synced to Airtable:', responseData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        airtableRecord: responseData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in sync-to-airtable function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});