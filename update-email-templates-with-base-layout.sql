-- Update email templates to use body_content format (content without full HTML wrapper)
-- The base layout will be applied automatically via emailLayout.ts utility

-- First, add body_content column if it doesn't exist
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS body_content TEXT;

-- Update existing templates to extract body content
-- We'll migrate html_content to body_content for existing templates

-- Update live_announcement template
UPDATE public.email_templates 
SET body_content = '
  <h1 style="color: #f97316; font-size: 24px; margin: 0 0 20px 0;">BitBeheer is nu live! 🚀</h1>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Beste {{name}},</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Geweldig nieuws! BitBeheer is nu live en klaar om je te helpen met je Bitcoin reis.</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;"><strong style="color: #1f2937;">🎯 Wat je nu kunt doen:</strong></p>
  <ul style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
    <li style="margin-bottom: 8px;">Persoonlijke 1-op-1 begeleiding boeken</li>
    <li style="margin-bottom: 8px;">Veilig Bitcoin kopen en bewaren leren</li>
    <li style="margin-bottom: 8px;">Eigen beheer van je Bitcoin opzetten</li>
    <li style="margin-bottom: 8px;">Alle tools en resources gebruiken</li>
  </ul>
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://bitbeheer.nl" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Ga naar BitBeheer</a>
  </p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br><strong style="color: #1f2937;">Giovanni</strong><br>BitBeheer</p>
'
WHERE template_name = 'live_announcement';

-- Update welcome template
UPDATE public.email_templates 
SET body_content = '
  <h1 style="color: #f97316; font-size: 24px; margin: 0 0 20px 0;">Welkom bij BitBeheer!</h1>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Beste {{name}},</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Welkom bij BitBeheer! We zijn blij dat je je hebt aangemeld.</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">We nemen binnen 24 uur contact met je op voor een kennismakingsgesprek.</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br><strong style="color: #1f2937;">Giovanni</strong><br>BitBeheer</p>
'
WHERE template_name = 'welcome';

-- Update verification template
UPDATE public.email_templates 
SET body_content = '
  <h1 style="color: #f97316; font-size: 24px; margin: 0 0 20px 0;">Bevestig je email adres</h1>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Beste {{name}},</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Klik op de onderstaande link om je email adres te bevestigen:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{verification_link}}" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Bevestig Email</a>
  </p>
  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">Of kopieer en plak deze link in je browser:<br><a href="{{verification_link}}" style="color: #f97316; word-break: break-all;">{{verification_link}}</a></p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br><strong style="color: #1f2937;">Giovanni</strong><br>BitBeheer</p>
'
WHERE template_name = 'verification';

-- Update appointment_confirmed template
UPDATE public.email_templates 
SET body_content = '
  <h1 style="color: #f97316; font-size: 24px; margin: 0 0 20px 0;">Je afspraak is bevestigd!</h1>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Beste {{name}},</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Je afspraak is bevestigd voor {{date}}.</p>
  {{#if teams_link}}
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Je kunt deelnemen via deze Microsoft Teams link:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{teams_link}}" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Deelnemen aan Teams Meeting</a>
  </p>
  {{/if}}
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br><strong style="color: #1f2937;">Giovanni</strong><br>BitBeheer</p>
'
WHERE template_name = 'appointment_confirmed';

-- Insert new account_activation template
INSERT INTO public.email_templates (template_name, subject, html_content, text_content, body_content, description, is_active)
VALUES (
  'account_activation',
  'Bevestig je BitBeheer account - 5 dagen om te activeren',
  '', -- Will be generated from body_content
  'Beste {{name}},\n\nWelkom bij BitBeheer! Je account is bijna klaar.\n\nJe hebt 5 dagen de tijd om je account te activeren door op de onderstaande link te klikken:\n\n{{verification_link}}\n\nNa activering kun je gebruik maken van alle functies van BitBeheer.\n\nAls je deze link niet binnen 5 dagen gebruikt, zal je account automatisch worden verwijderd.\n\nMet vriendelijke groet,\nGiovanni\nBitBeheer',
  '
  <h1 style="color: #f97316; font-size: 24px; margin: 0 0 20px 0;">Bevestig je BitBeheer account</h1>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Beste {{name}},</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Welkom bij BitBeheer! Je account is bijna klaar.</p>
  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="color: #92400e; font-size: 16px; line-height: 1.6; margin: 0;"><strong>⚠️ Belangrijk:</strong> Je hebt <strong>{{activation_deadline}}</strong> de tijd om je account te activeren.</p>
  </div>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Klik op de onderstaande knop om je account te activeren:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{verification_link}}" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Activeer Account</a>
  </p>
  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">Of kopieer en plak deze link in je browser:<br><a href="{{verification_link}}" style="color: #f97316; word-break: break-all;">{{verification_link}}</a></p>
  <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0;"><strong>Let op:</strong> Als je deze link niet binnen {{activation_deadline}} gebruikt, zal je account automatisch worden verwijderd.</p>
  </div>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br><strong style="color: #1f2937;">Giovanni</strong><br>BitBeheer</p>
  ',
  'Account activatie template met 5 dagen deadline',
  true
)
ON CONFLICT (template_name) DO NOTHING;

-- Note: html_content will be dynamically generated from body_content using the base layout
-- when emails are sent. This ensures all emails use the same base design.

