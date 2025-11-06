-- Create visitor_analytics table for tracking website visitors
-- This table stores visitor data for analytics purposes

CREATE TABLE IF NOT EXISTS public.visitor_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT, -- Unique visitor identifier (from cookie or fingerprint)
  session_id TEXT, -- Session identifier
  ip_address TEXT, -- Visitor IP address (hashed for privacy)
  user_agent TEXT, -- Browser user agent
  browser TEXT, -- Browser name (Chrome, Firefox, etc.)
  device_type TEXT, -- Mobile, Tablet, Desktop
  os TEXT, -- Operating system
  page_path TEXT NOT NULL, -- Page path visited
  referrer TEXT, -- Where visitor came from
  session_duration INTEGER, -- Session duration in seconds
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When visit occurred
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visited_at ON public.visitor_analytics(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_page_path ON public.visitor_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visitor_id ON public.visitor_analytics(visitor_id);

-- Enable Row Level Security
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert visitor analytics (for tracking)
CREATE POLICY "Anyone can insert visitor analytics"
  ON public.visitor_analytics
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated admins can view analytics
CREATE POLICY "Admins can view visitor analytics"
  ON public.visitor_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.email = auth.jwt() ->> 'email'
      AND accounts.is_admin = true
    )
  );

-- Add comment
COMMENT ON TABLE public.visitor_analytics IS 'Stores visitor analytics data for website tracking and SEO analysis';

