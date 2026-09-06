-- available_slots has row-level security enabled but never got a single
-- policy, so every insert/update/delete was silently rejected -- the admin
-- "Terugkerend Patroon" / "Enkele Tijd" appointment-availability forms have
-- never been able to actually save anything.
--
-- The data itself is low-sensitivity (just bookable date/time slots, no
-- personal info), so reads stay public; writes are admin-only, matching the
-- pattern used on every other admin-managed table.

DROP POLICY IF EXISTS "Anyone can read available slots" ON public.available_slots;
CREATE POLICY "Anyone can read available slots"
  ON public.available_slots FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can insert available slots" ON public.available_slots;
CREATE POLICY "Admin can insert available slots"
  ON public.available_slots FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl');

DROP POLICY IF EXISTS "Admin can update available slots" ON public.available_slots;
CREATE POLICY "Admin can update available slots"
  ON public.available_slots FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl');

DROP POLICY IF EXISTS "Admin can delete available slots" ON public.available_slots;
CREATE POLICY "Admin can delete available slots"
  ON public.available_slots FOR DELETE
  USING ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl');
