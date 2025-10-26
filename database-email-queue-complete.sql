-- Complete email queue setup voor BitBeheer
-- Voer dit uit in je Supabase SQL Editor

-- 1. Email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- 2. Indexes voor performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email ON email_queue(to_email);

-- 3. Enable Row Level Security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- 4. Policy voor public access (kan later restrictiever gemaakt worden)
CREATE POLICY "Allow public access to email_queue" ON email_queue
  FOR ALL USING (true);

-- 5. Test data (optioneel)
INSERT INTO email_queue (to_email, subject, html_content, text_content, status)
VALUES 
  ('test@example.com', 'Test Email', '<h1>Test</h1>', 'Test', 'pending')
ON CONFLICT DO NOTHING;

-- 6. Verificatie query
SELECT 
  COUNT(*) as total_emails,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_emails,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_emails
FROM email_queue;
