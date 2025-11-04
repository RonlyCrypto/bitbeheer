import { serve } from 'https://deno.land/std@0.178.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch current Bitcoin prices from CoinGecko (EUR and USD)
    const coingeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur,usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true'
    )

    if (!coingeckoResponse.ok) {
      throw new Error(`CoinGecko API error: ${coingeckoResponse.status}`)
    }

    const data = await coingeckoResponse.json()
    const bitcoin = data.bitcoin

    if (!bitcoin || typeof bitcoin.eur !== 'number' || typeof bitcoin.usd !== 'number') {
      throw new Error('Invalid price data from CoinGecko')
    }

    const priceEur = bitcoin.eur
    const priceUsd = bitcoin.usd
    const change24hEur = bitcoin.eur_24h_change || 0
    const change24hUsd = bitcoin.usd_24h_change || 0
    const volume24h = bitcoin.eur_24h_vol || bitcoin.usd_24h_vol || null
    const marketCap = bitcoin.eur_market_cap || bitcoin.usd_market_cap || null

    // Upsert price data using database function
    const { data: upsertData, error: upsertError } = await supabase
      .rpc('upsert_bitcoin_price_minute', {
        p_price_eur: priceEur,
        p_price_usd: priceUsd,
        p_volume_24h: volume24h,
        p_market_cap: marketCap,
        p_change_24h_eur: change24hEur,
        p_change_24h_usd: change24hUsd
      })

    if (upsertError) {
      throw upsertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bitcoin price updated successfully',
        data: {
          eur: priceEur,
          usd: priceUsd,
          change_24h_eur: change24hEur,
          change_24h_usd: change24hUsd,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Error updating Bitcoin price:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update Bitcoin price'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

