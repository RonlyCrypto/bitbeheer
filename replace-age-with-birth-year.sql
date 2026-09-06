-- Swap the raw "age" field for "birth_year" -- age then gets calculated
-- wherever it's shown instead of going stale every year. The age column
-- was only just added and never used by a real signup, so this is a
-- straight replace rather than a data migration.
ALTER TABLE public.accounts DROP COLUMN IF EXISTS age;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS birth_year INTEGER;
