-- Fix email templates to remove "Giovanni" and use first_name from user profile
-- Update all templates to end with "Met vriendelijke groet, BitBeheer" instead of "Giovanni - BitBeheer"

-- Update welcome template
UPDATE public.email_templates 
SET body_content = '
  <h1 style="color: #f97316; font-size: 24px; margin: 0 0 20px 0;">Welkom bij BitBeheer!</h1>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Beste {{name}},</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Welkom bij BitBeheer! We zijn blij dat je je hebt aangemeld.</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">We nemen binnen 24 uur contact met je op voor een kennismakingsgesprek.</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br>BitBeheer</p>
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
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br>BitBeheer</p>
'
WHERE template_name = 'verification';

-- Update account_activation template (Bevestig je BitBeheer account - 5 dagen om te activeren)
UPDATE public.email_templates 
SET body_content = '
  <h1 style="color: #f97316; font-size: 24px; margin: 0 0 20px 0;">Bevestig je BitBeheer account</h1>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Beste {{name}},</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Welkom bij BitBeheer! Je account is bijna klaar.</p>
  <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0;">
    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;"><strong>⚠️ Belangrijk:</strong> Je hebt <strong>5 dagen</strong> de tijd om je account te activeren.</p>
  </div>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Klik op de onderstaande knop om je account te activeren:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{verification_link}}" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Activeer Account</a>
  </p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Of kopieer en plak deze link in je browser:</p>
  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;"><a href="{{verification_link}}" style="color: #f97316; word-break: break-all;">{{verification_link}}</a></p>
  <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; border-left: 4px solid #ef4444; margin: 20px 0;">
    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">Let op: Als je deze link niet binnen 5 dagen gebruikt, zal je account automatisch worden verwijderd.</p>
  </div>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br>BitBeheer</p>
'
WHERE template_name = 'account_activation';

-- Update live_announcement template
UPDATE public.email_templates 
SET body_content = '
  <h1 style="color: #f97316; font-size: 24px; margin: 0 0 20px 0;">BitBeheer is nu live! 🚀</h1>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Beste {{name}},</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Geweldig nieuws! BitBeheer is nu live en klaar om je te helpen met je Bitcoin reis.</p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">🎯 Wat je nu kunt doen:</p>
  <ul style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; padding-left: 20px;">
    <li>Persoonlijke 1-op-1 begeleiding boeken</li>
    <li>Veilig Bitcoin kopen en bewaren leren</li>
    <li>Eigen beheer van je Bitcoin opzetten</li>
    <li>Alle tools en resources gebruiken</li>
  </ul>
  <p style="text-align: center; margin: 30px 0;">
    <a href="https://bitbeheer.nl" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Ga naar BitBeheer</a>
  </p>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">Met vriendelijke groet,<br>BitBeheer</p>
'
WHERE template_name = 'live_announcement';

-- Update appointment_confirmed template
UPDATE public.email_templates 
SET body_content = REPLACE(body_content, 'Met vriendelijke groet,<br><strong style="color: #1f2937;">Giovanni</strong><br>BitBeheer', 'Met vriendelijke groet,<br>BitBeheer')
WHERE template_name = 'appointment_confirmed';

-- Update appointment_reminder template
UPDATE public.email_templates 
SET body_content = REPLACE(body_content, 'Met vriendelijke groet,<br><strong style="color: #1f2937;">Giovanni</strong><br>BitBeheer', 'Met vriendelijke groet,<br>BitBeheer')
WHERE template_name = 'appointment_reminder';

-- Update password_reset template
UPDATE public.email_templates 
SET body_content = REPLACE(body_content, 'Met vriendelijke groet,<br><strong style="color: #1f2937;">Giovanni</strong><br>BitBeheer', 'Met vriendelijke groet,<br>BitBeheer')
WHERE template_name = 'password_reset';

