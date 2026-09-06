-- Extend bitcoin_price_data table with USD price and hourly tracking

-- Add USD price column if it doesn't exist
ALTER TABLE public.bitcoin_price_data
ADD COLUMN IF NOT EXISTS price_usd NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS price_change_24h NUMERIC(8, 2),
ADD COLUMN IF NOT EXISTS volume_usd NUMERIC(20, 2),
ADD COLUMN IF NOT EXISTS market_cap_usd NUMERIC(20, 2);

-- Create hourly price tracking table for live charts
CREATE TABLE IF NOT EXISTS public.bitcoin_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  price_usd NUMERIC(12, 2) NOT NULL,
  price_eur NUMERIC(12, 2),
  volume_24h NUMERIC(20, 2),
  market_cap NUMERIC(20, 2),
  price_change_24h NUMERIC(8, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_history_timestamp ON public.bitcoin_price_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_history_date ON public.bitcoin_price_history(((timestamp AT TIME ZONE 'UTC')::date));

-- Enable RLS
ALTER TABLE public.bitcoin_price_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read price history (public data)
CREATE POLICY "Bitcoin price history is publicly readable"
  ON public.bitcoin_price_history
  FOR SELECT
  USING (true);

-- Function to get latest Bitcoin price (USD)
CREATE OR REPLACE FUNCTION public.get_latest_bitcoin_price_usd()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'price_usd', price_usd,
    'price_eur', price_eur,
    'volume_24h', volume_usd,
    'market_cap', market_cap_usd,
    'change_24h', price_change_24h,
    'timestamp', timestamp
  ) INTO v_result
  FROM public.bitcoin_price_history
  ORDER BY timestamp DESC
  LIMIT 1;
  
  RETURN v_result;
END;
$$;

-- Function to get price history for last 24 hours
CREATE OR REPLACE FUNCTION public.get_bitcoin_price_last_24h()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_agg(
    json_build_object(
      'timestamp', timestamp,
      'price_usd', price_usd,
      'price_eur', price_eur,
      'volume_24h', volume_24h
    )
    ORDER BY timestamp DESC
  ) FROM public.bitcoin_price_history
  WHERE timestamp > NOW() - INTERVAL '24 hours';
END;
$$;

-- Function to get price history for last 7 days
CREATE OR REPLACE FUNCTION public.get_bitcoin_price_last_7d()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_agg(
    json_build_object(
      'timestamp', timestamp,
      'price_usd', price_usd,
      'price_eur', price_eur
    )
    ORDER BY timestamp ASC
  ) FROM public.bitcoin_price_history
  WHERE timestamp > NOW() - INTERVAL '7 days'
  -- Group by hour to reduce data
  ORDER BY DATE_TRUNC('hour', timestamp);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_latest_bitcoin_price_usd TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_bitcoin_price_last_24h TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_bitcoin_price_last_7d TO authenticated, anon;

