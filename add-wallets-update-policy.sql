-- The wallets table had no UPDATE policy at all, so every attempt by the
-- app to persist a fresh balance/transaction sync back to the row was
-- silently rejected by RLS (0 rows affected, no error surfaced). Pages
-- that read the cached row (e.g. the Portfolio page) kept showing stale
-- data indefinitely, even though the live in-memory dashboard view looked
-- correct. Mirrors the existing "own row by email" SELECT policy.
CREATE POLICY "Users can update their own wallet"
  ON public.wallets
  FOR UPDATE
  USING ((auth.jwt() ->> 'email') = email)
  WITH CHECK ((auth.jwt() ->> 'email') = email);
