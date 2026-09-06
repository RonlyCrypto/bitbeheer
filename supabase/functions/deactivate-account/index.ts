import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('id, email, auth_user_id, deactivated_at, is_admin, is_test')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError || !account) {
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (account.is_admin || account.is_test) {
      return new Response(
        JSON.stringify({ error: 'Admin- en testaccounts kunnen niet verwijderd worden' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (account.deactivated_at) {
      return new Response(
        JSON.stringify({ success: true, message: 'Account was already deactivated' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Revoke the real login identity, if one was ever created (accounts that
    // never made it past email verification never got an auth_user_id).
    if (account.auth_user_id) {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(account.auth_user_id)
      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError)
        // Continue anyway -- the row still gets marked deactivated below, and
        // a dangling auth identity with no matching accounts row can't reach
        // anything in the app since every route looks the user up by email.
      }
    }

    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        deactivated_at: new Date().toISOString(),
        auth_user_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error marking account deactivated:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to deactivate account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in deactivate-account function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
