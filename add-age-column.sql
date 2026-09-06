-- Leeftijd (age) is now a required field on the full Aanmelden signup form,
-- shown per account in the admin Accounts view.
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS age INTEGER;
