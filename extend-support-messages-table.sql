-- Extend support_messages table with additional fields for better tracking
-- This allows us to track: account source, time, user email, name, lastname, read status, and more

ALTER TABLE public.support_messages
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_lastname VARCHAR(255),
ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS sent_by_account VARCHAR(255), -- Which account sent it (impersonation tracking)
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'support', -- support, system, notification
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal'; -- low, normal, high, urgent

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_admin_email ON public.support_messages(admin_email);
CREATE INDEX IF NOT EXISTS idx_support_messages_sent_by_account ON public.support_messages(sent_by_account);
CREATE INDEX IF NOT EXISTS idx_support_messages_is_read ON public.support_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at);

-- Add foreign key to users table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.support_messages
    ADD CONSTRAINT fk_support_messages_user_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update RLS policies to include new fields
-- First drop existing policies
DROP POLICY IF EXISTS "Users can read their own messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admin can read all messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admin can insert replies" ON public.support_messages;

-- Users can read their own messages
CREATE POLICY "Users can read their own messages" ON public.support_messages
  FOR SELECT
  USING (
    -- User can see messages where email matches their email
    (auth.jwt() ->> 'email')::text = email
    OR
    -- User can see messages where user_id matches their id
    (auth.jwt() ->> 'sub')::uuid = user_id
  );

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages" ON public.support_messages
  FOR INSERT
  WITH CHECK (
    -- User can only insert messages with their own email
    (auth.jwt() ->> 'email')::text = email
    OR
    (auth.jwt() ->> 'sub')::uuid = user_id
  );

-- Admin can read all messages
CREATE POLICY "Admin can read all messages" ON public.support_messages
  FOR SELECT
  USING (
    -- Admin email from JWT
    (auth.jwt() ->> 'email')::text = 'admin@bitbeheer.nl'
    OR
    -- Check if user has admin role in metadata
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Admin can insert replies
CREATE POLICY "Admin can insert replies" ON public.support_messages
  FOR INSERT
  WITH CHECK (
    -- Admin can insert messages with from_admin = true
    from_admin = true AND (
      (auth.jwt() ->> 'email')::text = 'admin@bitbeheer.nl'
      OR
      (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    )
  );

-- Admin can update messages (for read status, etc.)
CREATE POLICY "Admin can update messages" ON public.support_messages
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'email')::text = 'admin@bitbeheer.nl'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

COMMENT ON TABLE public.support_messages IS 'Extended support messages table with user tracking, impersonation support, and read status';

