-- Extend visitor_analytics table with location and additional analytics data
-- This adds country, city, and IP address tracking

ALTER TABLE public.visitor_analytics 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS language TEXT;

-- Create index for country queries
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_country ON public.visitor_analytics(country);

-- Note: Cannot create index on DATE(visited_at) directly as DATE() is not IMMUTABLE
-- Instead, we can create a functional index with date_trunc or use visited_at directly
-- For date-based queries, use: WHERE visited_at >= '2024-01-01' AND visited_at < '2024-01-02'
-- The existing idx_visitor_analytics_visited_at index from create-visitor-analytics-table.sql is sufficient

-- Add comment
COMMENT ON COLUMN public.visitor_analytics.country IS 'Country name from visitor IP geolocation';
COMMENT ON COLUMN public.visitor_analytics.country_code IS 'ISO country code (e.g., NL, US)';
COMMENT ON COLUMN public.visitor_analytics.city IS 'City name from visitor IP geolocation';
COMMENT ON COLUMN public.visitor_analytics.region IS 'Region/state from visitor IP geolocation';
COMMENT ON COLUMN public.visitor_analytics.timezone IS 'Timezone of visitor';
COMMENT ON COLUMN public.visitor_analytics.language IS 'Browser language preference';

