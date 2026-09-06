-- The accounts table had a single policy: FOR ALL TO public USING (true).
-- Anyone -- including unauthenticated visitors -- could read or write any
-- row, any column: set their own account_approved = true, is_admin = true,
-- change someone else's password_hash, etc. This replaces it with:
--
--   SELECT: your own row, or the admin account.
--   UPDATE (raw table access): admin account only.
--   DELETE: admin account only.
--   INSERT: nobody via the client -- account creation goes through
--     api/create-account.js with the service-role key, which bypasses RLS.
--
-- Regular users get NO direct table-level UPDATE at all. Their two
-- legitimate self-service writes (dashboard opt-in checkboxes, the
-- "Mijn Bitcoin Strategie" editor) go through update_own_account_setting()
-- below instead -- a SECURITY DEFINER function that only ever touches the
-- three columns it explicitly allows, on the caller's own row. This is the
-- part that actually stops "verkeerde dingen schrijven": there is no path,
-- direct or otherwise, for a logged-in user to touch account_approved,
-- is_admin, email_verified, auth_user_id, password_hash, verification_token
-- or reset_token on any row, their own included.

DROP POLICY IF EXISTS "Allow public access to accounts" ON public.accounts;

CREATE POLICY "Users can read their own account"
  ON public.accounts
  FOR SELECT
  USING (
    (auth.jwt() ->> 'email') = email
    OR (auth.jwt() ->> 'email') = 'admin@bitbeheer.nl'
  );

CREATE POLICY "Admin can update any account"
  ON public.accounts
  FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl');

CREATE POLICY "Admin can delete accounts"
  ON public.accounts
  FOR DELETE
  USING ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl');

-- Needed for the "Mijn Bitcoin Strategie" self-editor, which already wrote
-- to this column client-side but the column never existed -- it was
-- silently failing and only ever persisted to localStorage.
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS strategy JSONB;

CREATE OR REPLACE FUNCTION public.update_own_account_setting(
  p_field TEXT,
  p_bool_value BOOLEAN DEFAULT NULL,
  p_json_value JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := auth.jwt() ->> 'email';
BEGIN
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_field = 'milestones_opt_in' THEN
    UPDATE public.accounts SET milestones_opt_in = p_bool_value, updated_at = now() WHERE email = v_email;
  ELSIF p_field = 'ritme_discipline_opt_in' THEN
    UPDATE public.accounts SET ritme_discipline_opt_in = p_bool_value, updated_at = now() WHERE email = v_email;
  ELSIF p_field = 'strategy' THEN
    UPDATE public.accounts SET strategy = p_json_value, updated_at = now() WHERE email = v_email;
  ELSE
    RAISE EXCEPTION 'Field not allowed: %', p_field;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_own_account_setting(TEXT, BOOLEAN, JSONB) TO authenticated;
