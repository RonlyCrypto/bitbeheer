-- Create table to track which admin messages users have read
CREATE TABLE IF NOT EXISTS public.user_chat_read_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email)
);

-- Enable RLS
ALTER TABLE public.user_chat_read_status ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own read status
CREATE POLICY "Users can read their own chat read status"
  ON public.user_chat_read_status
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can insert their own chat read status"
  ON public.user_chat_read_status
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can update their own chat read status"
  ON public.user_chat_read_status
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

-- Admin can read all read statuses
CREATE POLICY "Admin can read all user chat read status"
  ON public.user_chat_read_status
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_chat_read_status_user_email ON public.user_chat_read_status(user_email);

