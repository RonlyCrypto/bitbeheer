-- Add account approval and first appointment tracking columns to users table
-- If users table doesn't exist, use accounts table instead

-- For users table
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS account_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS first_appointment_completed BOOLEAN DEFAULT FALSE;

-- For accounts table (if that's what you're using)
ALTER TABLE IF EXISTS public.accounts
  ADD COLUMN IF NOT EXISTS account_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS first_appointment_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_account_approved ON public.users(account_approved) WHERE account_approved = FALSE;
CREATE INDEX IF NOT EXISTS idx_accounts_account_approved ON public.accounts(account_approved) WHERE account_approved = FALSE;

