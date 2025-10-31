-- Create email templates table for managing all email content
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  description TEXT,
  variables JSONB, -- Stores available variables like {{name}}, {{email}}, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write templates
CREATE POLICY "Admins can read email templates"
  ON public.email_templates
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

CREATE POLICY "Admins can insert email templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

CREATE POLICY "Admins can update email templates"
  ON public.email_templates
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

CREATE POLICY "Admins can delete email templates"
  ON public.email_templates
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- Insert default templates
INSERT INTO public.email_templates (template_name, subject, html_content, text_content, description, variables) VALUES
(
  'welcome',
  'Welkom bij BitBeheer! 🎉',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welkom bij BitBeheer!</h1>
    </div>
    <div class="content">
      <h2>Hallo {{name}}! 👋</h2>
      <p>Geweldig dat je je account hebt geactiveerd. Laat me je vertellen wat BitBeheer voor je kan betekenen.</p>
      
      <h3>🎯 Wat BitBeheer voor je doet:</h3>
      <ul>
        <li><strong>💡 Persoonlijke 1-op-1 Begeleiding:</strong> Direct contact met Giovanni voor al je Bitcoin vragen</li>
        <li><strong>🔐 Veilig Bitcoin Kopen & Bewaren:</strong> Leer de beste en veiligste manieren om Bitcoin te kopen en op te slaan</li>
        <li><strong>📊 Eigen beheer:</strong> 24/7 wallet waarde, verkopen wanneer je wilt, 100% controle</li>
        <li><strong>🛠️ Tools & Resources:</strong> Toegang tot alle Bitcoin tools, charts en educatieve content</li>
      </ul>
      
      <h3>🚀 Volgende Stappen:</h3>
      <ol>
        <li>Verken je dashboard en de beschikbare tools</li>
        <li>Plan een kennismakingsgesprek met Giovanni</li>
        <li>Stel je Bitcoin investeringsdoelen vast</li>
        <li>Begin met veilig Bitcoin kopen en bewaren</li>
      </ol>
      
      <h3>📞 Direct Contact</h3>
      <p>Heb je vragen? Giovanni staat klaar om je te helpen!</p>
      <p>📧 info@bitbeheer.nl | 🌐 bitbeheer.nl</p>
      
      <a href="https://bitbeheer.nl" class="button">Ga naar je Dashboard</a>
    </div>
  </div>
</body>
</html>',
  'Welkom bij BitBeheer!

Hallo {{name}}!

Geweldig dat je je account hebt geactiveerd. Laat me je vertellen wat BitBeheer voor je kan betekenen.

Wat BitBeheer voor je doet:
- Persoonlijke 1-op-1 Begeleiding: Direct contact met Giovanni voor al je Bitcoin vragen
- Veilig Bitcoin Kopen & Bewaren: Leer de beste en veiligste manieren om Bitcoin te kopen en op te slaan
- Eigen beheer: 24/7 wallet waarde, verkopen wanneer je wilt, 100% controle
- Tools & Resources: Toegang tot alle Bitcoin tools, charts en educatieve content

Volgende Stappen:
1. Verken je dashboard en de beschikbare tools
2. Plan een kennismakingsgesprek met Giovanni
3. Stel je Bitcoin investeringsdoelen vast
4. Begin met veilig Bitcoin kopen en bewaren

Direct Contact:
Heb je vragen? Giovanni staat klaar om je te helpen!
📧 info@bitbeheer.nl | 🌐 bitbeheer.nl

Ga naar: https://bitbeheer.nl',
  'Welcome email sent after account activation',
  '{"name": "User name", "email": "User email"}'
),
(
  'account_created',
  'Je account is aangemaakt - BitBeheer',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Aangemaakt</h1>
    </div>
    <div class="content">
      <h2>Hallo {{name}}!</h2>
      <p>Je account is succesvol aangemaakt. Verifieer je email om te beginnen.</p>
      <p>Email: {{email}}</p>
      <p>Met vriendelijke groet,<br>Giovanni - BitBeheer</p>
    </div>
  </div>
</body>
</html>',
  'Account Aangemaakt

Hallo {{name}}!

Je account is succesvol aangemaakt. Verifieer je email om te beginnen.

Email: {{email}}

Met vriendelijke groet,
Giovanni - BitBeheer',
  'Email sent when account is created',
  '{"name": "User name", "email": "User email"}'
),
(
  'verification',
  'Verifieer je email - BitBeheer',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verifieer je email</h1>
    <p>Hallo {{name}},</p>
    <p>Klik op de knop hieronder om je email te verifiëren:</p>
    <a href="{{verification_link}}" class="button">Verifieer Email</a>
    <p>Of kopieer deze link: {{verification_link}}</p>
  </div>
</body>
</html>',
  'Verifieer je email

Hallo {{name}},

Klik op deze link om je email te verifiëren: {{verification_link}}',
  'Email verification link',
  '{"name": "User name", "verification_link": "Email verification URL"}'
),
(
  'appointment_confirmed',
  'Je afspraak is bevestigd - BitBeheer',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Afspraak Bevestigd</h1>
    <p>Hallo {{name}},</p>
    <p>Je afspraak is bevestigd!</p>
    <p><strong>Datum:</strong> {{date}}</p>
    <p><strong>Tijd:</strong> {{time}}</p>
    {{#if teams_link}}
    <p><strong>Teams Link:</strong> <a href="{{teams_link}}">{{teams_link}}</a></p>
    {{/if}}
    <p>Met vriendelijke groet,<br>Giovanni - BitBeheer</p>
  </div>
</body>
</html>',
  'Afspraak Bevestigd

Hallo {{name}},

Je afspraak is bevestigd!

Datum: {{date}}
Tijd: {{time}}
{{#if teams_link}}
Teams Link: {{teams_link}}
{{/if}}

Met vriendelijke groet,
Giovanni - BitBeheer',
  'Appointment confirmation email',
  '{"name": "User name", "date": "Appointment date", "time": "Appointment time", "teams_link": "Microsoft Teams link (optional)"}'
);

