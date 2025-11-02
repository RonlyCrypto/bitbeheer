-- Create Bitcoin price data table in Supabase
-- This stores Bitcoin price history data server-side

CREATE TABLE IF NOT EXISTS public.bitcoin_price_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  price_eur NUMERIC(12, 2) NOT NULL,
  volume NUMERIC(20, 2),
  market_cap NUMERIC(20, 2),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_data_date ON public.bitcoin_price_data(date);
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_data_timestamp ON public.bitcoin_price_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_data_year ON public.bitcoin_price_data(year);

-- Enable RLS
ALTER TABLE public.bitcoin_price_data ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read Bitcoin price data (public data)
CREATE POLICY "Bitcoin price data is publicly readable"
  ON public.bitcoin_price_data
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update (via Edge Functions)
-- Regular users cannot modify price data

-- Function to get Bitcoin price data summary
CREATE OR REPLACE FUNCTION public.get_bitcoin_price_summary()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_year_distribution JSON;
BEGIN
  -- Get data range
  SELECT json_build_object(
    'total_data_points', COUNT(*),
    'date_range', json_build_object(
      'start', MIN(date),
      'end', MAX(date)
    ),
    'available_years', (
      SELECT json_agg(DISTINCT year ORDER BY year)
      FROM public.bitcoin_price_data
    )
  ) INTO v_result
  FROM public.bitcoin_price_data;
  
  RETURN v_result;
END;
$$;

-- Function to get Bitcoin price data for a specific year
CREATE OR REPLACE FUNCTION public.get_bitcoin_price_by_year(p_year INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', id,
      'date', date,
      'timestamp', timestamp,
      'price', price_eur,
      'volume', volume,
      'market_cap', market_cap
    )
    ORDER BY date ASC
  ) INTO v_result
  FROM public.bitcoin_price_data
  WHERE year = p_year;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Function to get latest Bitcoin price
CREATE OR REPLACE FUNCTION public.get_latest_bitcoin_price()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'date', date,
    'timestamp', timestamp,
    'price', price_eur,
    'volume', volume,
    'market_cap', market_cap,
    'last_updated', updated_at
  ) INTO v_result
  FROM public.bitcoin_price_data
  ORDER BY date DESC, updated_at DESC
  LIMIT 1;
  
  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_bitcoin_price_summary TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_bitcoin_price_by_year TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_latest_bitcoin_price TO authenticated, anon;

