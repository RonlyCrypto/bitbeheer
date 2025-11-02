// Supabase Edge Function to import Bitcoin CSV data
// This function can be called to automatically import CSV data to bitcoin_price_data table

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, csvData, csvUrl } = await req.json();

    if (action === 'import_csv_data') {
      // Import CSV data from request body
      if (!csvData || !Array.isArray(csvData)) {
        return new Response(
          JSON.stringify({ error: 'Invalid csvData format. Expected array of price data.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Transform data to match database schema
      const priceData = csvData.map((item: any) => {
        const date = new Date(item.date);
        return {
          date: date.toISOString().split('T')[0], // YYYY-MM-DD
          timestamp: date.getTime(),
          price_eur: parseFloat(item.price),
          volume: item.volume ? parseFloat(item.volume) : null,
          market_cap: item.market_cap ? parseFloat(item.market_cap) : null,
          year: date.getFullYear(),
          updated_at: new Date().toISOString()
        };
      });

      // Insert in batches of 1000
      let totalInserted = 0;
      let errors: any[] = [];

      for (let i = 0; i < priceData.length; i += 1000) {
        const batch = priceData.slice(i, i + 1000);
        const { error } = await supabase
          .from('bitcoin_price_data')
          .upsert(batch, { onConflict: 'date' });

        if (error) {
          errors.push({ batch: Math.floor(i / 1000) + 1, error: error.message });
        } else {
          totalInserted += batch.length;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          inserted: totalInserted,
          total: priceData.length,
          errors: errors.length > 0 ? errors : undefined
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'import_from_url') {
      // Import CSV from URL (e.g., from public folder)
      if (!csvUrl) {
        return new Response(
          JSON.stringify({ error: 'csvUrl is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Fetch CSV from URL
        const csvResponse = await fetch(csvUrl);
        if (!csvResponse.ok) {
          throw new Error(`Failed to fetch CSV: ${csvResponse.status}`);
        }

        const csvText = await csvResponse.text();
        const lines = csvText.trim().split('\n');
        const priceData: any[] = [];

        // Parse CSV (skip header)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          let columns;
          if (line.includes(';')) {
            columns = line.split(';');
          } else {
            columns = line.split(',');
          }

          if (columns.length >= 2) {
            const dateStr = columns[0].replace(/"/g, '').trim();
            const priceStr = columns[1].replace(/"/g, '').replace(',', '.').trim();
            const volumeStr = columns[2] ? columns[2].replace(/"/g, '').trim() : null;

            const price = parseFloat(priceStr);
            if (!isNaN(price) && dateStr) {
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                priceData.push({
                  date: date.toISOString().split('T')[0],
                  timestamp: date.getTime(),
                  price_eur: price,
                  volume: volumeStr ? parseFloat(volumeStr) : null,
                  market_cap: null,
                  year: date.getFullYear(),
                  updated_at: new Date().toISOString()
                });
              }
            }
          }
        }

        if (priceData.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No valid data found in CSV' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Insert in batches
        let totalInserted = 0;
        for (let i = 0; i < priceData.length; i += 1000) {
          const batch = priceData.slice(i, i + 1000);
          const { error } = await supabase
            .from('bitcoin_price_data')
            .upsert(batch, { onConflict: 'date' });

          if (error) {
            console.error(`Error inserting batch ${Math.floor(i / 1000) + 1}:`, error);
          } else {
            totalInserted += batch.length;
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            inserted: totalInserted,
            total: priceData.length,
            source: csvUrl
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fetchError) {
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch or parse CSV',
            message: fetchError instanceof Error ? fetchError.message : 'Unknown error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'get_summary') {
      // Get data summary
      const { data: summary, error: summaryError } = await supabase
        .rpc('get_bitcoin_price_summary');

      if (summaryError) {
        throw summaryError;
      }

      return new Response(
        JSON.stringify({ success: true, summary }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: import_csv_data, import_from_url, or get_summary' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-bitcoin-csv function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

