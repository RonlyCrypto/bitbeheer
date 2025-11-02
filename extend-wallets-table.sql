-- Extend wallets table with portfolio data fields
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS balance DECIMAL(18, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_received DECIMAL(18, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sent DECIMAL(18, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_seen TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_transaction_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_transaction_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS wallet_data JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_wallets_updated_at ON public.wallets(updated_at);

