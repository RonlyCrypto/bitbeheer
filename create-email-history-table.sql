-- Email history table voor BitBeheer
-- Deze tabel houdt alle verstuurde emails bij met volledige geschiedenis

CREATE TABLE IF NOT EXISTS email_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) DEFAULT 'noreply@bitbeheer.nl',
  subject TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  template_name VARCHAR(255),
  email_type VARCHAR(100) NOT NULL, -- 'verification', 'welcome', 'appointment', 'notification', etc.
  html_content TEXT,
  text_content TEXT,
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'failed', 'pending', 'bounced'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  resend_count INTEGER DEFAULT 0,
  last_resent_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id),
  related_user_email VARCHAR(255), -- Email van de gebruiker waar deze email betrekking op heeft
  metadata JSONB, -- Extra data zoals verification token, appointment id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes voor performance
CREATE INDEX IF NOT EXISTS idx_email_history_to_email ON email_history(to_email);
CREATE INDEX IF NOT EXISTS idx_email_history_status ON email_history(status);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON email_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_history_email_type ON email_history(email_type);
CREATE INDEX IF NOT EXISTS idx_email_history_template_id ON email_history(template_id);
CREATE INDEX IF NOT EXISTS idx_email_history_user_id ON email_history(user_id);
CREATE INDEX IF NOT EXISTS idx_email_history_related_user_email ON email_history(related_user_email);

-- Enable Row Level Security
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

-- Policy voor admin access
CREATE POLICY "Allow admin access to email_history" ON email_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        SELECT email FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
      )
    )
  );

