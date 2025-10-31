-- Create table to track which chats admin has read
CREATE TABLE IF NOT EXISTS public.chat_read_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL DEFAULT 'admin@bitbeheer.nl',
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email, admin_email)
);

-- Enable RLS
ALTER TABLE public.chat_read_status ENABLE ROW LEVEL SECURITY;

-- Admin can read/write all read statuses
CREATE POLICY "Admin can read chat read status"
  ON public.chat_read_status
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

CREATE POLICY "Admin can insert chat read status"
  ON public.chat_read_status
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

CREATE POLICY "Admin can update chat read status"
  ON public.chat_read_status
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- Users can read their own read status (if needed)
CREATE POLICY "Users can read their own read status"
  ON public.chat_read_status
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_read_status_user_email ON public.chat_read_status(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_read_status_admin_email ON public.chat_read_status(admin_email);

