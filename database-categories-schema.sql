-- Categories table for form management
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tag VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  notification_email VARCHAR(255) DEFAULT 'update@bitbeheer.nl',
  form_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_tag ON categories(tag);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Insert default categories
INSERT INTO categories (name, description, tag, is_active, email_notifications, notification_email, form_fields) VALUES
(
  'Livegang Notificaties',
  'Notificaties voor wanneer de website live gaat',
  'livegang',
  true,
  true,
  'update@bitbeheer.nl',
  '[
    {"id": "1", "name": "Naam", "type": "text", "required": false, "placeholder": "Je naam (optioneel)", "order": 1},
    {"id": "2", "name": "E-mail", "type": "email", "required": true, "placeholder": "Je e-mailadres *", "order": 2},
    {"id": "3", "name": "Bericht", "type": "textarea", "required": false, "placeholder": "Extra bericht (optioneel)", "order": 3}
  ]'::jsonb
),
(
  'Opening Website',
  'Formulier voor opening van de website',
  'opening_website',
  true,
  true,
  'update@bitbeheer.nl',
  '[
    {"id": "1", "name": "Naam", "type": "text", "required": false, "placeholder": "Je naam (optioneel)", "order": 1},
    {"id": "2", "name": "E-mail", "type": "email", "required": true, "placeholder": "Je e-mailadres *", "order": 2},
    {"id": "3", "name": "Bericht", "type": "textarea", "required": false, "placeholder": "Extra bericht (optioneel)", "order": 3}
  ]'::jsonb
)
ON CONFLICT (tag) DO NOTHING;

-- Update the users table to reference categories
ALTER TABLE users ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for categories table
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are manageable by service role" ON categories
    FOR ALL USING (true);
