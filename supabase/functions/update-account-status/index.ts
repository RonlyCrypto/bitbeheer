import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, actief } = await req.json()

    if (!userId || typeof actief !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'userId and actief status are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update account status in accounts table
    const { error: accountsError } = await supabaseClient
      .from('accounts')
      .update({ 
        actief: actief,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (accountsError) {
      console.error('Error updating accounts table:', accountsError)
      return new Response(
        JSON.stringify({ error: 'Failed to update account status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Also update in users table if it exists
    const { error: usersError } = await supabaseClient
      .from('users')
      .update({ 
        actief: actief,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (usersError) {
      console.log('Note: Could not update users table (may not exist):', usersError.message)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Account ${actief ? 'activated' : 'deactivated'} successfully` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-account-status function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
