// Supabase Edge Function to get visitor IP address
// This is more secure than getting IP from client-side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    // Get IP from request headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare
    
    // Use the first IP from x-forwarded-for if available, otherwise use x-real-ip or cf-connecting-ip
    const ip = forwardedFor?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown';
    
    return new Response(
      JSON.stringify({ ip }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

