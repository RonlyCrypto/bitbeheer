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
          .info { background-color: #f8fafc; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📧 Aanmelding Bevestigd - BitBeheer</h2>
          </div>
          <div class="success">
            <p><strong>Bedankt ${name}!</strong> Je bent succesvol aangemeld voor BitBeheer updates.</p>
          </div>
          <p>Je ontvangt nu automatisch:</p>
          <div class="info">
            <ul>
              <li>🚀 <strong>Launch notificaties</strong> - Wanneer BitBeheer live gaat</li>
              <li>📈 <strong>Markt updates</strong> - Belangrijke Bitcoin ontwikkelingen</li>
              <li>💡 <strong>Tips & tricks</strong> - Praktische Bitcoin begeleiding</li>
              <li>🎯 <strong>Exclusieve aanbiedingen</strong> - Speciale deals voor leden</li>
            </ul>
          </div>
          <p>We houden je op de hoogte van alle belangrijke ontwikkelingen en je bent een van de eersten die toegang krijgt wanneer BitBeheer volledig live gaat!</p>
          <p style="text-align: center;">
            <a href="https://www.bitbeheer.nl" class="button">Bezoek BitBeheer</a>
          </p>
          <p><strong>Wat kun je verwachten?</strong></p>
          <ul>
            <li>Persoonlijke 1-op-1 begeleiding bij Bitcoin investeren</li>
            <li>Veilige opslag methoden en best practices</li>
            <li>Real-time markt analyses en trends</li>
            <li>Strategieën voor verschillende investeringsdoelen</li>
          </ul>
          <p>Heb je vragen? Neem gerust contact met ons op via <a href="mailto:info@bitbeheer.nl">info@bitbeheer.nl</a></p>
          <p>Met vriendelijke groet,</p>
          <p>Het BitBeheer Team</p>
          <div class="footer">
            <p>&copy; 2026 BitBeheer. Alle rechten voorbehouden.</p>
            <p><a href="https://www.bitbeheer.nl/unsubscribe?email=${email}">Uitschrijven</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      📧 Aanmelding Bevestigd - BitBeheer

      Bedankt ${name}! Je bent succesvol aangemeld voor BitBeheer updates.

      Je ontvangt nu automatisch:
      🚀 Launch notificaties - Wanneer BitBeheer live gaat
      📈 Markt updates - Belangrijke Bitcoin ontwikkelingen
      💡 Tips & tricks - Praktische Bitcoin begeleiding
      🎯 Exclusieve aanbiedingen - Speciale deals voor leden

      We houden je op de hoogte van alle belangrijke ontwikkelingen en je bent een van de eersten die toegang krijgt wanneer BitBeheer volledig live gaat!

      Bezoek BitBeheer: https://www.bitbeheer.nl

      Wat kun je verwachten?
      - Persoonlijke 1-op-1 begeleiding bij Bitcoin investeren
      - Veilige opslag methoden en best practices
      - Real-time markt analyses en trends
      - Strategieën voor verschillende investeringsdoelen

      Heb je vragen? Neem gerust contact met ons op via info@bitbeheer.nl

      Met vriendelijke groet,
      Het BitBeheer Team

      © 2026 BitBeheer. Alle rechten voorbehouden.
      Uitschrijven: https://www.bitbeheer.nl/unsubscribe?email=${email}
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
        subject: '📧 Aanmelding Bevestigd - Je bent op de hoogte!',
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Notification confirmation email sending failed:', errorData)
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          from_email: 'noreply@bitbeheer.nl',
          subject: '📧 Aanmelding Bevestigd - Je bent op de hoogte!',
          html_content: htmlContent,
          text_content: textContent,
          status: 'pending',
          created_at: new Date().toISOString(),
          error_message: errorData
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Notification confirmation email queued for manual sending',
          queued: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData = await emailResponse.json()
    console.log('Notification confirmation email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification confirmation email sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-notification-confirmation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
