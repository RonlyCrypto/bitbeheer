-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  description TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on template_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON public.email_templates(template_name);

-- Create index on is_active for filtering active templates
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all templates
CREATE POLICY "Anyone authenticated can view email templates"
  ON public.email_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert templates
-- Admins are identified by email domain (@bitbeheer.nl) or specific admin email
CREATE POLICY "Admins can insert email templates"
  ON public.email_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl' 
    OR auth.jwt() ->> 'email' LIKE '%@bitbeheer.nl'
  );

-- Policy: Only admins can update templates
CREATE POLICY "Admins can update email templates"
  ON public.email_templates
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl' 
    OR auth.jwt() ->> 'email' LIKE '%@bitbeheer.nl'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl' 
    OR auth.jwt() ->> 'email' LIKE '%@bitbeheer.nl'
  );

-- Policy: Only admins can delete templates
CREATE POLICY "Admins can delete email templates"
  ON public.email_templates
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl' 
    OR auth.jwt() ->> 'email' LIKE '%@bitbeheer.nl'
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- Insert some default templates if they don't exist
INSERT INTO public.email_templates (template_name, subject, html_content, text_content, description, is_active)
VALUES
  (
    'welcome',
    'Welkom bij BitBeheer!',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #f97316;">Welkom bij BitBeheer!</h1>
  <p>Beste {{name}},</p>
  <p>Welkom bij BitBeheer! We zijn blij dat je je hebt aangemeld.</p>
  <p>We nemen binnen 24 uur contact met je op voor een kennismakingsgesprek.</p>
  <p>Met vriendelijke groet,<br>Giovanni - BitBeheer</p>
</body>
</html>',
    'Welkom bij BitBeheer!\n\nBeste {{name}},\n\nWelkom bij BitBeheer! We zijn blij dat je je hebt aangemeld.\n\nWe nemen binnen 24 uur contact met je op voor een kennismakingsgesprek.\n\nMet vriendelijke groet,\nGiovanni - BitBeheer',
    'Welkomstemail voor nieuwe gebruikers',
    true
  ),
  (
    'verification',
    'Bevestig je email adres - BitBeheer',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #f97316;">Bevestig je email adres</h1>
  <p>Beste {{name}},</p>
  <p>Klik op de onderstaande link om je email adres te bevestigen:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{verification_link}}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Bevestig Email</a>
  </p>
  <p>Met vriendelijke groet,<br>Giovanni - BitBeheer</p>
</body>
</html>',
    'Bevestig je email adres - BitBeheer\n\nBeste {{name}},\n\nKlik op de onderstaande link om je email adres te bevestigen:\n\n{{verification_link}}\n\nMet vriendelijke groet,\nGiovanni - BitBeheer',
    'Email verificatie template',
    true
  ),
  (
    'appointment_confirmed',
    'Je afspraak is bevestigd - BitBeheer',
    '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #f97316;">Je afspraak is bevestigd!</h1>
  <p>Beste {{name}},</p>
  <p>Je afspraak is bevestigd voor {{date}}.</p>
  {{#if teams_link}}
  <p>Je kunt deelnemen via deze Microsoft Teams link:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="{{teams_link}}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Deelnemen aan Teams Meeting</a>
  </p>
  {{/if}}
  <p>Met vriendelijke groet,<br>Giovanni - BitBeheer</p>
</body>
</html>',
    'Je afspraak is bevestigd - BitBeheer\n\nBeste {{name}},\n\nJe afspraak is bevestigd voor {{date}}.\n\n{{#if teams_link}}Teams link: {{teams_link}}{{/if}}\n\nMet vriendelijke groet,\nGiovanni - BitBeheer',
    'Afspraak bevestiging template',
    true
  )
ON CONFLICT (template_name) DO NOTHING;
