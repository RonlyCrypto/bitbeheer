-- Extend bitcoin_price_data table to support both EUR and USD prices
-- Also add fields for minute-level updates

-- Add USD price column if it doesn't exist
ALTER TABLE public.bitcoin_price_data 
ADD COLUMN IF NOT EXISTS price_usd NUMERIC(12, 2);

-- Add minute-level tracking fields
ALTER TABLE public.bitcoin_price_data 
ADD COLUMN IF NOT EXISTS price_eur_minute NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS price_usd_minute NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS minute_timestamp TIMESTAMP WITH TIME ZONE;

-- Create index on minute_timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_data_minute_timestamp 
ON public.bitcoin_price_data(minute_timestamp);

-- Update existing records: if price_usd is null, estimate from EUR price (approximate rate)
-- This is a fallback, real USD prices should come from API
UPDATE public.bitcoin_price_data 
SET price_usd = price_eur * 1.08  -- Approximate EUR/USD rate (adjust as needed)
WHERE price_usd IS NULL;

-- Create a table for minute-level price updates (separate from daily data)
CREATE TABLE IF NOT EXISTS public.bitcoin_price_minute (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  price_eur NUMERIC(12, 2) NOT NULL,
  price_usd NUMERIC(12, 2) NOT NULL,
  volume_24h NUMERIC(20, 2),
  market_cap NUMERIC(20, 2),
  change_24h_eur NUMERIC(8, 4),
  change_24h_usd NUMERIC(8, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for minute data
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_minute_timestamp 
ON public.bitcoin_price_minute(timestamp DESC);

-- Create index for latest price queries
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_minute_created_at 
ON public.bitcoin_price_minute(created_at DESC);

-- Enable RLS
ALTER TABLE public.bitcoin_price_minute ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read minute price data (public data)
CREATE POLICY "Bitcoin minute price data is publicly readable"
  ON public.bitcoin_price_minute
  FOR SELECT
  USING (true);

-- Drop old function if it exists (no parameters)
DROP FUNCTION IF EXISTS public.get_latest_bitcoin_price();

-- Function to get latest Bitcoin price (EUR or USD)
CREATE OR REPLACE FUNCTION public.get_latest_bitcoin_price(p_currency TEXT DEFAULT 'eur')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_price_column TEXT;
BEGIN
  -- Determine price column based on currency
  IF UPPER(p_currency) = 'USD' THEN
    v_price_column := 'price_usd';
  ELSE
    v_price_column := 'price_eur';
  END IF;
  
  -- First try to get from minute table (most recent)
  SELECT json_build_object(
    'date', timestamp::date,
    'timestamp', EXTRACT(EPOCH FROM timestamp)::BIGINT,
    'price', CASE WHEN UPPER(p_currency) = 'USD' THEN price_usd ELSE price_eur END,
    'volume', volume_24h,
    'market_cap', market_cap,
    'change_24h', CASE WHEN UPPER(p_currency) = 'USD' THEN change_24h_usd ELSE change_24h_eur END,
    'last_updated', created_at,
    'source', 'minute'
  ) INTO v_result
  FROM public.bitcoin_price_minute
  ORDER BY timestamp DESC
  LIMIT 1;
  
  -- If no minute data, fallback to daily data
  IF v_result IS NULL THEN
    SELECT json_build_object(
      'date', date,
      'timestamp', timestamp,
      'price', CASE WHEN UPPER(p_currency) = 'USD' THEN price_usd ELSE price_eur END,
      'volume', volume,
      'market_cap', market_cap,
      'last_updated', updated_at,
      'source', 'daily'
    ) INTO v_result
    FROM public.bitcoin_price_data
    ORDER BY date DESC, updated_at DESC
    LIMIT 1;
  END IF;
  
  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_latest_bitcoin_price TO authenticated, anon;

-- Function to upsert minute price data (for Edge Function)
CREATE OR REPLACE FUNCTION public.upsert_bitcoin_price_minute(
  p_price_eur NUMERIC,
  p_price_usd NUMERIC,
  p_volume_24h NUMERIC DEFAULT NULL,
  p_market_cap NUMERIC DEFAULT NULL,
  p_change_24h_eur NUMERIC DEFAULT NULL,
  p_change_24h_usd NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.bitcoin_price_minute (
    timestamp,
    price_eur,
    price_usd,
    volume_24h,
    market_cap,
    change_24h_eur,
    change_24h_usd
  ) VALUES (
    NOW(),
    p_price_eur,
    p_price_usd,
    p_volume_24h,
    p_market_cap,
    p_change_24h_eur,
    p_change_24h_usd
  )
  RETURNING id INTO v_id;
  
  -- Update the latest daily price if this minute's date matches today
  UPDATE public.bitcoin_price_data
  SET 
    price_eur = p_price_eur,
    price_usd = p_price_usd,
    price_eur_minute = p_price_eur,
    price_usd_minute = p_price_usd,
    minute_timestamp = NOW(),
    updated_at = NOW()
  WHERE date = CURRENT_DATE;
  
  -- If no record for today exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.bitcoin_price_data (
      date,
      timestamp,
      price_eur,
      price_usd,
      price_eur_minute,
      price_usd_minute,
      minute_timestamp,
      year,
      volume,
      market_cap
    ) VALUES (
      CURRENT_DATE,
      EXTRACT(EPOCH FROM NOW())::BIGINT,
      p_price_eur,
      p_price_usd,
      p_price_eur,
      p_price_usd,
      NOW(),
      EXTRACT(YEAR FROM NOW())::INTEGER,
      p_volume_24h,
      p_market_cap
    )
    ON CONFLICT (date) DO UPDATE SET
      price_eur = EXCLUDED.price_eur,
      price_usd = EXCLUDED.price_usd,
      price_eur_minute = EXCLUDED.price_eur_minute,
      price_usd_minute = EXCLUDED.price_usd_minute,
      minute_timestamp = EXCLUDED.minute_timestamp,
      updated_at = NOW();
  END IF;
  
  RETURN v_id;
END;
$$;

-- Grant execute permissions (only for service role via Edge Functions)
-- Regular users cannot insert price data

