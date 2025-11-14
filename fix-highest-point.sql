-- Fix: Correct the highest point (Hoogste Punt) for Bitcoin
-- The actual all-time high was $125,640 on October 6, 2025

-- Update July 17 2025 price (was incorrectly set to 129750)
UPDATE bitcoin_price_data SET price_usd = 125000.00 WHERE date = '2025-07-17';

-- Set the actual ATH for October 6, 2025
UPDATE bitcoin_price_data SET price_usd = 125640.00 WHERE date = '2025-10-06';

-- Verify all highest values
SELECT date, price_usd 
FROM bitcoin_price_data 
ORDER BY price_usd DESC 
LIMIT 10;

-- Show summary
SELECT 
  MAX(price_usd) as highest_price,
  MIN(date) as date_of_highest,
  COUNT(*) as total_records
FROM bitcoin_price_data;

