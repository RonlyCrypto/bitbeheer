-- Make price_eur nullable (allow NULL values)
ALTER TABLE bitcoin_price_data 
ALTER COLUMN price_eur DROP NOT NULL;

-- Verify
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'bitcoin_price_data' AND column_name = 'price_eur';
