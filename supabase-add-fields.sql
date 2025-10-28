-- Add bevestigd and actief fields to accounts table
-- This script adds the necessary fields for account verification and activation status

-- Add bevestigd (confirmed/verified) field
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS bevestigd BOOLEAN DEFAULT FALSE;

-- Add actief (active) field  
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS actief BOOLEAN DEFAULT TRUE;

-- Add email_verified field if it doesn't exist
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add verified_at timestamp
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Add verification_token for email verification
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Add verification_token_created timestamp
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS verification_token_created TIMESTAMP WITH TIME ZONE;

-- Update existing admin and test accounts to be confirmed and active
UPDATE public.accounts 
SET 
  bevestigd = TRUE,
  actief = TRUE,
  email_verified = TRUE,
  verified_at = NOW()
WHERE is_admin = TRUE OR is_test = TRUE;

-- Update existing accounts with category 'nieuwe_gebruiker' to be unconfirmed but active
UPDATE public.accounts 
SET 
  bevestigd = FALSE,
  actief = TRUE,
  email_verified = FALSE
WHERE category = 'nieuwe_gebruiker' AND is_admin = FALSE AND is_test = FALSE;

-- Update existing accounts with category 'account_aanmelden' to be unconfirmed but active
UPDATE public.accounts 
SET 
  bevestigd = FALSE,
  actief = TRUE,
  email_verified = FALSE
WHERE category = 'account_aanmelden' AND is_admin = FALSE AND is_test = FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_bevestigd ON public.accounts(bevestigd);
CREATE INDEX IF NOT EXISTS idx_accounts_actief ON public.accounts(actief);
CREATE INDEX IF NOT EXISTS idx_accounts_email_verified ON public.accounts(email_verified);

-- Add comments to document the fields
COMMENT ON COLUMN public.accounts.bevestigd IS 'Whether the account has been confirmed/verified by email';
COMMENT ON COLUMN public.accounts.actief IS 'Whether the account is active and can be used';
COMMENT ON COLUMN public.accounts.email_verified IS 'Whether the email address has been verified';
COMMENT ON COLUMN public.accounts.verified_at IS 'Timestamp when the account was verified';
COMMENT ON COLUMN public.accounts.verification_token IS 'Token used for email verification';
COMMENT ON COLUMN public.accounts.verification_token_created IS 'When the verification token was created';
