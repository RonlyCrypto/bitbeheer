-- Check price for June 26, 2024 in our database
SELECT 
  date,
  price_usd,
  price_high,
  price_low,
  price_open,
  year
FROM bitcoin_price_data
WHERE date = '2024-06-26';
