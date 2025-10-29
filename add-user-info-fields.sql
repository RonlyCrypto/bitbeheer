-- Add user info fields to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS company VARCHAR(100),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS investment_goal VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS newsletter_subscription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_first_name ON public.accounts(first_name);
CREATE INDEX IF NOT EXISTS idx_accounts_last_name ON public.accounts(last_name);
CREATE INDEX IF NOT EXISTS idx_accounts_location ON public.accounts(location);
