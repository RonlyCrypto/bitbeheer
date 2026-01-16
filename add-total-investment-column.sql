-- Add total_investment column to wallets table
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS total_investment DECIMAL(18, 2) DEFAULT 0;

-- Add comment
COMMENT ON COLUMN public.wallets.total_investment IS 'Total investment amount (USD) calculated from buy transactions only';

