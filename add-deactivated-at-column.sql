-- Soft-delete support: when an admin deletes a user's account, we keep the
-- accounts row (so signup/appointment/portfolio history is never lost) but
-- mark it deactivated and remove its Supabase Auth identity so it can never
-- log in again. deactivated_at is NULL for every normal account; once set,
-- the account is treated as gone everywhere in the UI.
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
