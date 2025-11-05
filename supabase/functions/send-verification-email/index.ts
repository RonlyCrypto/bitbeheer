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

  console.log('Processing verification email request')

  try {
    const { email, name, verificationToken } = await req.json()

    if (!email || !verificationToken) {
      return new Response(
        JSON.stringify({ error: 'Email and verification token are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create verification URL
    const verificationUrl = `https://www.bitbeheer.nl/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    // Email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bevestig je BitBeheer account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f7931a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f7931a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welkom bij BitBeheer!</h1>
          </div>
          <div class="content">
            <h2>Beste ${name || 'gebruiker'}!</h2>
            
            <p>Welkom bij BitBeheer! Je account is bijna klaar.</p>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚠️ Belangrijk:</strong> Je hebt <strong>5 dagen</strong> de tijd om je account te activeren.</p>
            </div>
            
            <p>Klik op de onderstaande knop om je account te activeren:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Activeer Account</a>
            </div>
            
            <p>Of kopieer en plak deze link in je browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;"><a href="${verificationUrl}" style="color: #f97316;">${verificationUrl}</a></p>
            
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <p style="margin: 0;">Let op: Als je deze link niet binnen 5 dagen gebruikt, zal je account automatisch worden verwijderd.</p>
            </div>
            
            <p style="margin-top: 30px;">Met vriendelijke groet,<br>BitBeheer</p>
          </div>
          <div class="footer">
            <p>BitBeheer.nl | Persoonlijke begeleiding bij het investeren in Bitcoin</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Bevestig je BitBeheer account

Beste ${name || 'gebruiker'},

Welkom bij BitBeheer! Je account is bijna klaar.

BELANGRIJK: Je hebt 5 dagen de tijd om je account te activeren.

Om je account te activeren, ga naar deze link:
${verificationUrl}

Let op: Als je deze link niet binnen 5 dagen gebruikt, zal je account automatisch worden verwijderd.

Met vriendelijke groet,
BitBeheer
    `

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BitBeheer <noreply@bitbeheer.nl>',
        to: [email],
        subject: '🚀 Bevestig je BitBeheer account - 5 dagen om te activeren',
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Verification email sending failed:', errorData)
      
      // Fallback: Log to database for manual sending
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          subject: 'Bevestig je BitBeheer account',
          html_content: htmlContent,
          text_content: textContent,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification email queued for manual sending',
          queued: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData = await emailResponse.json()
    console.log('Verification email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
