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
    const { email, name, resetToken } = await req.json()

    if (!email || !name || !resetToken) {
      return new Response(
        JSON.stringify({ error: 'Email, name, and resetToken are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resetLink = `https://www.bitbeheer.nl/reset-password?token=${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .header { background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 1px solid #ddd; }
          .button { display: inline-block; background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 0.8em; color: #777; text-align: center; }
          .warning { color: #dc2626; font-weight: bold; }
          .info { background-color: #f0f9ff; padding: 15px; border-radius: 5px; border-left: 4px solid #0ea5e9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Wachtwoord Reset - BitBeheer</h2>
          </div>
          <p>Beste ${name},</p>
          <p>Je hebt een wachtwoord reset aangevraagd voor je BitBeheer account. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Wachtwoord Resetten</a>
          </p>
          <div class="info">
            <p><strong>Belangrijke informatie:</strong></p>
            <ul>
              <li>Deze link is 24 uur geldig</li>
              <li>Als je deze reset niet hebt aangevraagd, kun je deze email negeren</li>
              <li>Je huidige wachtwoord blijft geldig tot je een nieuw wachtwoord instelt</li>
            </ul>
          </div>
          <p class="warning">Let op: Controleer ook je spam- of ongewenste map als je de e-mail niet kunt vinden.</p>
          <p>Met vriendelijke groet,</p>
          <p>Het BitBeheer Team</p>
          <div class="footer">
            <p>&copy; 2026 BitBeheer. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Wachtwoord Reset - BitBeheer

      Beste ${name},

      Je hebt een wachtwoord reset aangevraagd voor je BitBeheer account. 
      Klik op de onderstaande link om een nieuw wachtwoord in te stellen:

      ${resetLink}

      Belangrijke informatie:
      - Deze link is 24 uur geldig
      - Als je deze reset niet hebt aangevraagd, kun je deze email negeren
      - Je huidige wachtwoord blijft geldig tot je een nieuw wachtwoord instelt

      Met vriendelijke groet,
      Het BitBeheer Team

      © 2026 BitBeheer. Alle rechten voorbehouden.
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
        subject: '🔐 Wachtwoord Reset - BitBeheer',
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Password reset email sending failed:', errorData)
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          from_email: 'noreply@bitbeheer.nl',
          subject: '🔐 Wachtwoord Reset - BitBeheer',
          html_content: htmlContent,
          text_content: textContent,
          status: 'pending',
          created_at: new Date().toISOString(),
          error_message: errorData
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset email queued for manual sending',
          queued: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData = await emailResponse.json()
    console.log('Password reset email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-password-reset function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
