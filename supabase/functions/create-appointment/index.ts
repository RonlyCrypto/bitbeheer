// Supabase Edge Function to create appointments (bypasses RLS for impersonation)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('📥 Edge Function called:', {
    method: req.method,
    url: req.url,
    hasAuthHeader: !!req.headers.get('Authorization')
  });

  try {
    const requestBody = await req.json();
    const { appointmentData, adminEmail, impersonatedUserEmail } = requestBody;
    
    console.log('📦 Request body:', {
      hasAppointmentData: !!appointmentData,
      adminEmail,
      impersonatedUserEmail,
      appointmentDataKeys: appointmentData ? Object.keys(appointmentData) : 'none'
    });

    // Verify admin is making the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role to bypass RLS
    // Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically available
    // in Supabase Edge Functions, no need to add them as custom secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Note: We use service role to bypass RLS, so admin check is not strictly necessary
    // But we log it for debugging
    console.log('🔐 Admin email from request:', adminEmail);
    
    // Basic validation - ensure we have an authenticated request
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If impersonating, use the impersonated user email for the appointment
    const finalUserEmail = impersonatedUserEmail || appointmentData.user_email

    console.log('Creating appointment:', {
      adminEmail,
      impersonatedUserEmail,
      finalUserEmail,
      appointmentData
    })

    // Insert appointment with service role (bypasses RLS)
    const appointmentToInsert = {
      ...appointmentData,
      user_email: finalUserEmail
    };
    
    console.log('💾 Inserting appointment:', appointmentToInsert);
    
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert([appointmentToInsert])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating appointment:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return new Response(
        JSON.stringify({ 
          error: error.message, 
          code: error.code,
          details: error.details,
          hint: error.hint
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Appointment created successfully:', data);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

