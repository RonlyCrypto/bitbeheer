-- ============================================================
-- Add OHLC columns to bitcoin_price_data table
-- ============================================================

-- Add new columns if they don't exist
ALTER TABLE bitcoin_price_data
ADD COLUMN IF NOT EXISTS price_open DECIMAL(18,2),
ADD COLUMN IF NOT EXISTS price_high DECIMAL(18,2),
ADD COLUMN IF NOT EXISTS price_low DECIMAL(18,2),
ADD COLUMN IF NOT EXISTS price_avg DECIMAL(18,2);

-- Add NOT NULL constraint to important columns
ALTER TABLE bitcoin_price_data
ALTER COLUMN date SET NOT NULL;

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_data_date ON bitcoin_price_data(date);

-- Create index on year for faster filtering
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_data_year ON bitcoin_price_data(year);

-- Add trigger to auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_bitcoin_price_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bitcoin_price_data_update_trigger ON bitcoin_price_data;

CREATE TRIGGER bitcoin_price_data_update_trigger
BEFORE UPDATE ON bitcoin_price_data
FOR EACH ROW
EXECUTE FUNCTION update_bitcoin_price_timestamp();

-- Verification
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'bitcoin_price_data'
ORDER BY ordinal_position;

