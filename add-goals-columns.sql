-- Add missing columns to goals table
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS monthly_investment DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS bitcoin_price_at_creation DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS target_bitcoin_amount DECIMAL(18, 8);

-- Add comments
COMMENT ON COLUMN public.goals.monthly_investment IS 'Monthly investment amount for monthly goals';
COMMENT ON COLUMN public.goals.bitcoin_price_at_creation IS 'Bitcoin price at the time of goal creation';
COMMENT ON COLUMN public.goals.target_bitcoin_amount IS 'Target amount in Bitcoin (for BTC goals)';

