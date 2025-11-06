-- Fix RLS policies for visitor_analytics table
-- Ensure admins can view analytics and anyone can insert

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert visitor analytics" ON public.visitor_analytics;
DROP POLICY IF EXISTS "Admins can view visitor analytics" ON public.visitor_analytics;

-- Policy: Anyone can insert visitor analytics (for tracking)
-- This allows anonymous users to track their visits
CREATE POLICY "Anyone can insert visitor analytics"
  ON public.visitor_analytics
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated admins can view analytics
-- Check if user is admin via accounts table
CREATE POLICY "Admins can view visitor analytics"
  ON public.visitor_analytics
  FOR SELECT
  USING (
    -- Allow if user is authenticated and is admin
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.email = auth.jwt() ->> 'email'
      AND accounts.is_admin = true
    )
  );

-- Alternative: If you want to allow all authenticated users to view (for testing)
-- Uncomment the following and comment out the above SELECT policy:
-- CREATE POLICY "Authenticated users can view visitor analytics"
--   ON public.visitor_analytics
--   FOR SELECT
--   USING (auth.role() = 'authenticated');

