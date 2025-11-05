import { serve } from 'https://deno.land/std@0.178.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    const { email, name, loginTime, ipAddress, userAgent } = await req.json()

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: 'Email and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .header { background-color: #f0f9ff; padding: 20px; text-align: center; border-bottom: 1px solid #ddd; }
          .button { display: inline-block; background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 0.8em; color: #777; text-align: center; }
          .info { background-color: #f8fafc; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; }
          .security { background-color: #f0fdf4; padding: 15px; border-radius: 5px; border-left: 4px solid #22c55e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Login Bevestiging - BitBeheer</h2>
          </div>
          <p>Beste ${name || 'gebruiker'},</p>
          <p>Er is zojuist ingelogd op je BitBeheer account. Hier zijn de details:</p>
          
          <div class="info">
            <h3>Login Details:</h3>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Tijd:</strong> ${loginTime || new Date().toLocaleString('nl-NL')}</li>
              ${ipAddress ? `<li><strong>IP Adres:</strong> ${ipAddress}</li>` : ''}
              ${userAgent ? `<li><strong>Apparaat:</strong> ${userAgent}</li>` : ''}
            </ul>
          </div>

          <div class="security">
            <h3>🛡️ Veiligheidstips:</h3>
            <ul>
              <li>Zorg dat je altijd uitlogt op gedeelde computers</li>
              <li>Gebruik een sterk en uniek wachtwoord</li>
              <li>Activeer tweefactorauthenticatie indien beschikbaar</li>
              <li>Controleer regelmatig je account activiteit</li>
            </ul>
          </div>

          <div class="warning">
            <p><strong>⚠️ Was dit niet jij?</strong></p>
            <p>Als je deze login niet hebt uitgevoerd, wijzig dan onmiddellijk je wachtwoord en neem contact met ons op via <a href="mailto:info@bitbeheer.nl">info@bitbeheer.nl</a></p>
          </div>

          <p style="text-align: center;">
            <a href="https://www.bitbeheer.nl/user-dashboard" class="button">Ga naar je Dashboard</a>
          </p>

          <p>Met vriendelijke groet,<br>BitBeheer</p>
          <div class="footer">
            <p>&copy; 2026 BitBeheer. Alle rechten voorbehouden.</p>
            <p>Voor vragen: <a href="mailto:info@bitbeheer.nl">info@bitbeheer.nl</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      🔐 Login Bevestiging - BitBeheer

      Beste ${name || 'gebruiker'},

      Er is zojuist ingelogd op je BitBeheer account. Hier zijn de details:

      Login Details:
      - Email: ${email}
      - Tijd: ${loginTime || new Date().toLocaleString('nl-NL')}
      ${ipAddress ? `- IP Adres: ${ipAddress}` : ''}
      ${userAgent ? `- Apparaat: ${userAgent}` : ''}

      🛡️ Veiligheidstips:
      - Zorg dat je altijd uitlogt op gedeelde computers
      - Gebruik een sterk en uniek wachtwoord
      - Activeer tweefactorauthenticatie indien beschikbaar
      - Controleer regelmatig je account activiteit

      ⚠️ Was dit niet jij?
      Als je deze login niet hebt uitgevoerd, wijzig dan onmiddellijk je wachtwoord en neem contact met ons op via info@bitbeheer.nl

      Ga naar je Dashboard: https://www.bitbeheer.nl/user-dashboard

      Met vriendelijke groet,
      Het BitBeheer Team

      © 2026 BitBeheer. Alle rechten voorbehouden.
      Voor vragen: info@bitbeheer.nl
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BitBeheer <noreply@bitbeheer.nl>',
        to: [email],
        subject: '🔐 Login Bevestiging - BitBeheer',
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Login confirmation email sending failed:', errorData)
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          from_email: 'noreply@bitbeheer.nl',
          subject: '🔐 Login Bevestiging - BitBeheer',
          html_content: htmlContent,
          text_content: textContent,
          status: 'pending',
          created_at: new Date().toISOString(),
          error_message: errorData
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Login confirmation email queued for manual sending',
          queued: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData = await emailResponse.json()
    console.log('Login confirmation email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Login confirmation email sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-login-confirmation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
