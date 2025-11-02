-- Create wallet_history table to track all wallet additions and removals for admin
CREATE TABLE IF NOT EXISTS public.wallet_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  wallet_id UUID,
  wallet_address VARCHAR(255) NOT NULL,
  wallet_name VARCHAR(255),
  action VARCHAR(50) NOT NULL, -- 'added' or 'removed'
  wallet_balance DECIMAL(18, 8),
  transaction_count INTEGER,
  removed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Store wallet data snapshot for history
  wallet_data_snapshot JSONB,
  
  CONSTRAINT action_check CHECK (action IN ('added', 'removed'))
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_history_user_email ON public.wallet_history(user_email);
CREATE INDEX IF NOT EXISTS idx_wallet_history_wallet_id ON public.wallet_history(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_history_created_at ON public.wallet_history(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_history_action ON public.wallet_history(action);

-- Enable RLS
ALTER TABLE public.wallet_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can read all history, users can only read their own
DROP POLICY IF EXISTS "Admins can read all wallet history" ON public.wallet_history;
CREATE POLICY "Admins can read all wallet history"
  ON public.wallet_history
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

DROP POLICY IF EXISTS "Users can read their own wallet history" ON public.wallet_history;
CREATE POLICY "Users can read their own wallet history"
  ON public.wallet_history
  FOR SELECT
  USING (
    user_email = (auth.jwt() ->> 'email')
  );

-- Service role can insert (for backend operations)
DROP POLICY IF EXISTS "Service role can insert wallet history" ON public.wallet_history;
CREATE POLICY "Service role can insert wallet history"
  ON public.wallet_history
  FOR INSERT
  WITH CHECK (true);

