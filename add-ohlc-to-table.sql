-- Add OHLC columns to bitcoin_price_data table
ALTER TABLE bitcoin_price_data
ADD COLUMN IF NOT EXISTS price_open DECIMAL(18,2),
ADD COLUMN IF NOT EXISTS price_high DECIMAL(18,2),
ADD COLUMN IF NOT EXISTS price_low DECIMAL(18,2);

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bitcoin_price_data'
ORDER BY ordinal_position;
