-- Create support_messages table for helpdesk functionality
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  from_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallets table for Bitcoin wallet storage (single wallet per user)
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  type VARCHAR(50) DEFAULT 'bitcoin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure one wallet per email
  UNIQUE(email)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_support_messages_email ON public.support_messages(email);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_wallets_email ON public.wallets(email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_messages
-- Users can read/write their own messages
CREATE POLICY IF NOT EXISTS "Users can read their own messages"
  ON public.support_messages
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email OR auth.jwt() ->> 'email' = 'admin@bitbeheer.nl');

CREATE POLICY IF NOT EXISTS "Users can insert their own messages"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Admin can read all messages
CREATE POLICY IF NOT EXISTS "Admin can read all messages"
  ON public.support_messages
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@bitbeheer.nl');

-- Admin can insert replies
CREATE POLICY IF NOT EXISTS "Admin can insert replies"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@bitbeheer.nl' OR auth.jwt() ->> 'email' = email);

-- RLS Policies for wallets
-- Users can read/write their own wallet
CREATE POLICY IF NOT EXISTS "Users can read their own wallet"
  ON public.wallets
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email OR auth.jwt() ->> 'email' = 'admin@bitbeheer.nl');

CREATE POLICY IF NOT EXISTS "Users can insert their own wallet"
  ON public.wallets
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Admin can read all wallets
CREATE POLICY IF NOT EXISTS "Admin can read all wallets"
  ON public.wallets
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'admin@bitbeheer.nl');

-- Admin can delete wallets
CREATE POLICY IF NOT EXISTS "Admin can delete wallets"
  ON public.wallets
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'admin@bitbeheer.nl');

