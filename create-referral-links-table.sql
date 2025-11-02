-- Create referral_links table for managing important links in footer
CREATE TABLE IF NOT EXISTS public.referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  section_title TEXT NOT NULL DEFAULT 'Belangrijke Links',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_referral_links_order ON public.referral_links(order_index);

-- Create index on is_active for filtering active links
CREATE INDEX IF NOT EXISTS idx_referral_links_active ON public.referral_links(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone authenticated can view referral links" ON public.referral_links;
DROP POLICY IF EXISTS "Admins can manage referral links" ON public.referral_links;

-- Policy: Anyone authenticated can view active referral links
CREATE POLICY "Anyone authenticated can view referral links"
  ON public.referral_links
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Public can view active referral links (for footer display)
CREATE POLICY "Public can view active referral links"
  ON public.referral_links
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy: Only admins can insert, update, and delete referral links
CREATE POLICY "Admins can manage referral links"
  ON public.referral_links
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl' 
    OR auth.jwt() ->> 'email' LIKE '%@bitbeheer.nl'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl' 
    OR auth.jwt() ->> 'email' LIKE '%@bitbeheer.nl'
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_referral_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_referral_links_updated_at ON public.referral_links;

CREATE TRIGGER update_referral_links_updated_at
  BEFORE UPDATE ON public.referral_links
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_links_updated_at();

-- Insert default referral links
INSERT INTO public.referral_links (title, url, section_title, order_index, is_active)
VALUES
  ('Bitcoin.org - Officiële Site', 'https://bitcoin.org', 'Belangrijke Links', 1, true),
  ('CoinGecko - Prijsdata', 'https://www.coingecko.com', 'Belangrijke Links', 2, true),
  ('Blockchain Explorer', 'https://www.blockchain.com/explorer', 'Belangrijke Links', 3, true)
ON CONFLICT DO NOTHING;

