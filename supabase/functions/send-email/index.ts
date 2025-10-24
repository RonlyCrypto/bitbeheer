import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, template, data } = await req.json()

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create email content based on template
    let htmlContent = ''
    let textContent = ''

    if (template === 'notification') {
      htmlContent = `
        <h2>Nieuwe Notificatie Aanvraag - BitBeheer</h2>
        <p><strong>Categorie:</strong> ${data.category}</p>
        <p><strong>Naam:</strong> ${data.name}</p>
        <p><strong>E-mail:</strong> ${data.email}</p>
        <p><strong>Bericht:</strong> ${data.message}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleString('nl-NL')}</p>
        <hr>
        <p><em>Dit bericht is automatisch verzonden via het BitBeheer notificatie systeem.</em></p>
      `
      
      textContent = `
        Nieuwe Notificatie Aanvraag - BitBeheer
        
        Categorie: ${data.category}
        Naam: ${data.name}
        E-mail: ${data.email}
        Bericht: ${data.message}
        Datum: ${new Date().toLocaleString('nl-NL')}
        
        Dit bericht is automatisch verzonden via het BitBeheer notificatie systeem.
      `
    } else if (template === 'welcome') {
      htmlContent = `
        <h2>Welkom bij BitBeheer!</h2>
        <p>Beste ${data.name},</p>
        <p>Je account is succesvol aangemaakt. Je kunt nu inloggen op onze website.</p>
        <p><strong>Je e-mailadres:</strong> ${data.email}</p>
        <hr>
        <p>Met vriendelijke groet,<br>Het BitBeheer Team</p>
      `
      
      textContent = `
        Welkom bij BitBeheer!
        
        Beste ${data.name},
        
        Je account is succesvol aangemaakt. Je kunt nu inloggen op onze website.
        
        Je e-mailadres: ${data.email}
        
        Met vriendelijke groet,
        Het BitBeheer Team
      `
    } else {
      htmlContent = `
        <h2>${subject}</h2>
        <p>${JSON.stringify(data, null, 2)}</p>
      `
      
      textContent = `${subject}\n\n${JSON.stringify(data, null, 2)}`
    }

    // Send email using Resend (or your preferred email service)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BitBeheer <noreply@bitbeheer.nl>',
        to: [to],
        subject: subject,
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Email sending failed:', errorData)
      
      // Fallback: Log to database for manual sending
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('email_queue')
        .insert({
          to_email: to,
          subject: subject,
          html_content: htmlContent,
          text_content: textContent,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email queued for manual sending',
          queued: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData = await emailResponse.json()
    console.log('Email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
