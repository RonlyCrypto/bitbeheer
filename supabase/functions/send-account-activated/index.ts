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
    const { email, name } = await req.json()

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
          .success { background-color: #f0fdf4; padding: 15px; border-radius: 5px; border-left: 4px solid #22c55e; }
          .features { background-color: #f8fafc; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .feature-item { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Welkom bij BitBeheer, ${name}!</h2>
          </div>
          <div class="success">
            <p><strong>Gefeliciteerd!</strong> Je account is succesvol geactiveerd en je kunt nu volledig gebruik maken van alle BitBeheer functionaliteiten.</p>
          </div>
          <p>Je hebt nu toegang tot:</p>
          <div class="features">
            <div class="feature-item">✅ <strong>Persoonlijke Dashboard</strong> - Overzicht van je Bitcoin portfolio</div>
            <div class="feature-item">✅ <strong>Persoonlijke 1-op-1 begeleiding</strong> - Persoonlijke hulp bij Bitcoin investeren</div>
            <div class="feature-item">✅ <strong>Markt Analyses</strong> - Real-time Bitcoin data en trends</div>
            <div class="feature-item">✅ <strong>Veilige Opslag Tips</strong> - Leer over cold storage en hardware wallets</div>
            <div class="feature-item">✅ <strong>Strategie Advies</strong> - Op maat gemaakte investeringsstrategieën</div>
          </div>
          <p style="text-align: center;">
            <a href="https://www.bitbeheer.nl/user-dashboard" class="button">Ga naar je Dashboard</a>
          </p>
          <p><strong>Volgende stappen:</strong></p>
          <ul>
            <li>Log in op je account</li>
            <li>Vul je profiel aan met je investeringsdoelen</li>
            <li>Plan een kennismakingsgesprek in</li>
            <li>Begin met je Bitcoin reis!</li>
          </ul>
          <p>Heb je vragen? Neem gerust contact met ons op via <a href="mailto:info@bitbeheer.nl">info@bitbeheer.nl</a></p>
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
      🎉 Welkom bij BitBeheer, ${name}!

      Gefeliciteerd! Je account is succesvol geactiveerd en je kunt nu volledig gebruik maken van alle BitBeheer functionaliteiten.

      Je hebt nu toegang tot:
      ✅ Persoonlijke Dashboard - Overzicht van je Bitcoin portfolio
      ✅ 1-op-1 Begeleiding - Persoonlijke hulp bij Bitcoin investeren
      ✅ Markt Analyses - Real-time Bitcoin data en trends
      ✅ Veilige Opslag Tips - Leer over cold storage en hardware wallets
      ✅ Strategie Advies - Op maat gemaakte investeringsstrategieën

      Ga naar je Dashboard: https://www.bitbeheer.nl/user-dashboard

      Volgende stappen:
      - Log in op je account
      - Vul je profiel aan met je investeringsdoelen
      - Plan een kennismakingsgesprek in
      - Begin met je Bitcoin reis!

      Heb je vragen? Neem gerust contact met ons op via info@bitbeheer.nl

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
        subject: '🎉 Account Geactiveerd - Welkom bij BitBeheer!',
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Account activated email sending failed:', errorData)
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          from_email: 'noreply@bitbeheer.nl',
          subject: '🎉 Account Geactiveerd - Welkom bij BitBeheer!',
          html_content: htmlContent,
          text_content: textContent,
          status: 'pending',
          created_at: new Date().toISOString(),
          error_message: errorData
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Account activated email queued for manual sending',
          queued: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData = await emailResponse.json()
    console.log('Account activated email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account activated email sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-account-activated function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
