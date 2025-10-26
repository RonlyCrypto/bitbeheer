-- Email queue table voor BitBeheer
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

-- Indexes voor performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email ON email_queue(to_email);

-- Enable Row Level Security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Policy voor public access
CREATE POLICY "Allow public access to email_queue" ON email_queue
  FOR ALL USING (true);
