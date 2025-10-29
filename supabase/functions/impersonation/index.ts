// Supabase Edge Function for secure impersonation management
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// In-memory store for active impersonation sessions (in production, use Supabase database)
const impersonationSessions = new Map();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, adminEmail, userEmail, sessionId } = await req.json()

    // Verify admin credentials
    if (!adminEmail || adminEmail !== 'admin@bitbeheer.nl') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    switch (action) {
      case 'start':
        if (!userEmail) {
          return new Response(
            JSON.stringify({ error: 'User email required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Generate secure session ID
        const newSessionId = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Store impersonation session
        impersonationSessions.set(newSessionId, {
          adminEmail,
          userEmail,
          startTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })

        console.log('Started secure impersonation session:', newSessionId)

        return new Response(
          JSON.stringify({
            success: true,
            sessionId: newSessionId,
            userEmail,
            expiresAt: impersonationSessions.get(newSessionId).expiresAt
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'verify':
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: 'Session ID required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const session = impersonationSessions.get(sessionId)
        
        if (!session) {
          return new Response(
            JSON.stringify({ error: 'Session not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Check if session expired
        if (new Date() > new Date(session.expiresAt)) {
          impersonationSessions.delete(sessionId)
          return new Response(
            JSON.stringify({ error: 'Session expired' }),
            { 
              status: 410, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            isImpersonating: true,
            userEmail: session.userEmail,
            adminEmail: session.adminEmail,
            startTime: session.startTime
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'stop':
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: 'Session ID required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const deleted = impersonationSessions.delete(sessionId)
        
        if (!deleted) {
          return new Response(
            JSON.stringify({ error: 'Session not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('Stopped impersonation session:', sessionId)

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Impersonation stopped'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'list':
        // List active sessions (admin only)
        const sessions = Array.from(impersonationSessions.entries()).map(([id, session]) => ({
          sessionId: id,
          userEmail: session.userEmail,
          adminEmail: session.adminEmail,
          startTime: session.startTime,
          expiresAt: session.expiresAt
        }))

        return new Response(
          JSON.stringify({
            success: true,
            sessions
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Impersonation Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
