-- Supabase SQL Script: Add Account Verification Fields
-- Execute this in Supabase SQL Editor

-- Step 1: Add new columns to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS bevestigd BOOLEAN DEFAULT FALSE;

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS actief BOOLEAN DEFAULT TRUE;

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS verification_token_created TIMESTAMP WITH TIME ZONE;

-- Step 2: Update existing admin and test accounts
UPDATE public.accounts 
SET 
  bevestigd = TRUE,
  actief = TRUE,
  email_verified = TRUE,
  verified_at = NOW()
WHERE is_admin = TRUE OR is_test = TRUE;

-- Step 3: Update existing user accounts to be unconfirmed but active
UPDATE public.accounts 
SET 
  bevestigd = FALSE,
  actief = TRUE,
  email_verified = FALSE
WHERE (category = 'nieuwe_gebruiker' OR category = 'account_aanmelden') 
  AND is_admin = FALSE 
  AND is_test = FALSE;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_bevestigd ON public.accounts(bevestigd);
CREATE INDEX IF NOT EXISTS idx_accounts_actief ON public.accounts(actief);
CREATE INDEX IF NOT EXISTS idx_accounts_email_verified ON public.accounts(email_verified);

-- Step 5: Verify the changes
SELECT 
  email, 
  name, 
  category, 
  bevestigd, 
  actief, 
  email_verified,
  is_admin,
  is_test
FROM public.accounts 
ORDER BY created_at DESC;
