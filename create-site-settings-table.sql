-- The "soon online" launch gate (SiteAccessControl -> SoonOnlinePage) was
-- reading its on/off flag from localStorage, which is per-browser. Only the
-- admin's own browser ever saw the site as "live" after flipping the
-- toggle -- every other visitor's browser still defaulted to true (soon
-- online) forever, since nothing ever wrote 'false' to their localStorage.
-- Moving the flag into the database so every visitor reads the same value.
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.site_settings (key, value)
VALUES ('soon_online_mode', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can update site settings" ON public.site_settings;
CREATE POLICY "Admin can update site settings"
  ON public.site_settings FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@bitbeheer.nl');
