-- Add account approval status to users table
-- This tracks if user has completed first appointment and been approved

-- Check if column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'account_approved'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN account_approved BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add first_appointment_completed column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'first_appointment_completed'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN first_appointment_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_account_approved ON public.users(account_approved);
CREATE INDEX IF NOT EXISTS idx_users_first_appointment_completed ON public.users(first_appointment_completed);

