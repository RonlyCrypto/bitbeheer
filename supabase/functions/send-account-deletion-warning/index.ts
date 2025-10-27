import { serve } from 'https://deno.land/std@0.178.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, daysRemaining } = await req.json()

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
          .header { background-color: #fef3c7; padding: 20px; text-align: center; border-bottom: 1px solid #ddd; }
          .button { display: inline-block; background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 0.8em; color: #777; text-align: center; }
          .warning { background-color: #fef3c7; padding: 20px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .urgent { background-color: #fef2f2; padding: 20px; border-radius: 5px; border-left: 4px solid #ef4444; margin: 20px 0; }
          .info { background-color: #f8fafc; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .countdown { font-size: 2em; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ Account Verwijdering Waarschuwing - BitBeheer</h2>
          </div>
          <p>Beste ${name},</p>
          
          <div class="countdown">
            ${daysRemaining === 1 ? '1 DAG' : `${daysRemaining} DAGEN`} OVER!
          </div>

          <div class="urgent">
            <h3>🚨 Belangrijke Waarschuwing</h3>
            <p>Je BitBeheer account wordt binnenkort automatisch verwijderd omdat je e-mailadres nog niet is geverifieerd.</p>
            <p><strong>Verificatie is verplicht om je account actief te houden.</strong></p>
          </div>

          <div class="warning">
            <h3>📧 Wat moet je doen?</h3>
            <ol>
              <li><strong>Controleer je e-mail</strong> (inclusief spam/ongewenste map)</li>
              <li><strong>Zoek naar een e-mail van BitBeheer</strong> met onderwerp "Bevestig je account"</li>
              <li><strong>Klik op de verificatielink</strong> in de e-mail</li>
              <li><strong>Log in op je account</strong> om te bevestigen dat alles werkt</li>
            </ol>
          </div>

          <div class="info">
            <h3>💡 Waarom is verificatie belangrijk?</h3>
            <ul>
              <li>Zorgt voor veiligheid van je account</li>
              <li>Voorkomt spam en misbruik</li>
              <li>Geeft je toegang tot alle BitBeheer functies</li>
              <li>Houdt je op de hoogte van belangrijke updates</li>
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="https://www.bitbeheer.nl/verify-email" class="button">Verifieer Nu Je Account</a>
          </p>

          <div class="urgent">
            <p><strong>⏰ Tijd is bijna op!</strong></p>
            <p>Als je je account niet binnen ${daysRemaining === 1 ? '24 uur' : `${daysRemaining} dagen`} verifieert, wordt je account permanent verwijderd en verlies je alle toegang tot BitBeheer.</p>
          </div>

          <p>Heb je hulp nodig? Neem contact met ons op via <a href="mailto:info@bitbeheer.nl">info@bitbeheer.nl</a></p>
          <p>Met vriendelijke groet,</p>
          <p>Het BitBeheer Team</p>
          <div class="footer">
            <p>&copy; 2026 BitBeheer. Alle rechten voorbehouden.</p>
            <p>Voor vragen: <a href="mailto:info@bitbeheer.nl">info@bitbeheer.nl</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ⚠️ Account Verwijdering Waarschuwing - BitBeheer

      Beste ${name},

      ${daysRemaining === 1 ? '1 DAG' : `${daysRemaining} DAGEN`} OVER!

      🚨 Belangrijke Waarschuwing
      Je BitBeheer account wordt binnenkort automatisch verwijderd omdat je e-mailadres nog niet is geverifieerd.
      Verificatie is verplicht om je account actief te houden.

      📧 Wat moet je doen?
      1. Controleer je e-mail (inclusief spam/ongewenste map)
      2. Zoek naar een e-mail van BitBeheer met onderwerp "Bevestig je account"
      3. Klik op de verificatielink in de e-mail
      4. Log in op je account om te bevestigen dat alles werkt

      💡 Waarom is verificatie belangrijk?
      - Zorgt voor veiligheid van je account
      - Voorkomt spam en misbruik
      - Geeft je toegang tot alle BitBeheer functies
      - Houdt je op de hoogte van belangrijke updates

      Verifieer Nu Je Account: https://www.bitbeheer.nl/verify-email

      ⏰ Tijd is bijna op!
      Als je je account niet binnen ${daysRemaining === 1 ? '24 uur' : `${daysRemaining} dagen`} verifieert, wordt je account permanent verwijderd en verlies je alle toegang tot BitBeheer.

      Heb je hulp nodig? Neem contact met ons op via info@bitbeheer.nl

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
        subject: `⚠️ Account Verwijdering Waarschuwing - ${daysRemaining === 1 ? '1 DAG OVER!' : `${daysRemaining} DAGEN OVER!`}`,
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Account deletion warning email sending failed:', errorData)
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          from_email: 'noreply@bitbeheer.nl',
          subject: `⚠️ Account Verwijdering Waarschuwing - ${daysRemaining === 1 ? '1 DAG OVER!' : `${daysRemaining} DAGEN OVER!`}`,
          html_content: htmlContent,
          text_content: textContent,
          status: 'pending',
          created_at: new Date().toISOString(),
          error_message: errorData
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Account deletion warning email queued for manual sending',
          queued: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData = await emailResponse.json()
    console.log('Account deletion warning email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deletion warning email sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-account-deletion-warning function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
