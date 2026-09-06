// Writes Bitcoin price snapshots on behalf of the client.
// Runs with the service role key so the browser never needs write access
// to bitcoin_price_data / bitcoin_price_history (those tables stay read-only for anon/authenticated).

import { serve } from 'https://deno.land/std@0.178.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceData {
  price_usd: number
  price_eur: number
  volume_24h: number
  market_cap: number
  price_change_24h: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { type, date, priceData } = body as { type: 'hourly' | 'daily'; date?: string; priceData: PriceData }

    if (!priceData || typeof priceData.price_usd !== 'number') {
      throw new Error('Missing or invalid priceData')
    }

    if (type === 'hourly') {
      const { error } = await supabase
        .from('bitcoin_price_history')
        .insert([{
          timestamp: new Date().toISOString(),
          price_usd: priceData.price_usd,
          price_eur: priceData.price_eur,
          volume_24h: priceData.volume_24h,
          market_cap: priceData.market_cap,
          price_change_24h: priceData.price_change_24h,
        }])

      if (error) throw error
    } else if (type === 'daily') {
      if (!date) throw new Error('Missing date for daily price save')

      const { error } = await supabase
        .from('bitcoin_price_data')
        .upsert([{
          date,
          timestamp: new Date(date).getTime() / 1000,
          price_usd: priceData.price_usd,
          price_eur: priceData.price_eur,
          volume: priceData.volume_24h,
          market_cap: priceData.market_cap,
          volume_usd: priceData.volume_24h,
          market_cap_usd: priceData.market_cap,
          price_change_24h: priceData.price_change_24h,
          year: new Date(date).getFullYear(),
        }], { onConflict: 'date' })

      if (error) throw error
    } else {
      throw new Error(`Unknown type: ${type}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error saving Bitcoin price:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to save Bitcoin price' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
