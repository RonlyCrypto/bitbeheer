-- Full date of birth instead of just the year, so exact age can be
-- computed (not just "this many years, give or take"). birth_year was
-- only just added and never used by a real signup, so this is a straight
-- replace rather than a data migration.
ALTER TABLE public.accounts DROP COLUMN IF EXISTS birth_year;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS birth_date DATE;
