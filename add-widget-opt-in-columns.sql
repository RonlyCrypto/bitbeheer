-- Opt-in flags for the "Jouw Bitcoin Mijlpalen" and "Ritme & Discipline"
-- dashboard widgets. Both default to false: users choose to participate
-- via the question at the top of "Mijn Doelen" before either widget
-- appears on their dashboard.
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS milestones_opt_in BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ritme_discipline_opt_in BOOLEAN NOT NULL DEFAULT false;
