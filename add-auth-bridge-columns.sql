-- Bridges the custom `accounts` table (registration/approval bookkeeping)
-- to real Supabase Auth identities, and adds password-reset support.
--
-- verification_expires was referenced by api/verify-email-token.js but
-- never actually existed on this table -- the expiry check silently
-- never fired. auth_user_id links an account row to the Supabase Auth
-- user created once someone finishes activation and picks a password.
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auth_user_id UUID,
ADD COLUMN IF NOT EXISTS reset_token VARCHAR,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_accounts_reset_token ON public.accounts(reset_token);
