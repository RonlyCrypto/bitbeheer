-- Check for price anomalies in bitcoin_price_data
-- Find prices that seem out of range

SELECT 
  id,
  date,
  price_usd,
  LAG(price_usd) OVER (ORDER BY date) AS prev_price,
  LEAD(price_usd) OVER (ORDER BY date) AS next_price,
  ROUND(
    ((price_usd - LAG(price_usd) OVER (ORDER BY date)) / LAG(price_usd) OVER (ORDER BY date) * 100)::numeric,
    2
  ) AS pct_change_from_prev
FROM bitcoin_price_data
ORDER BY date DESC
LIMIT 100;

-- Also check for very high single-day jumps (>10%)
SELECT 
  id,
  date,
  price_usd,
  LAG(price_usd) OVER (ORDER BY date) AS prev_price,
  ROUND(
    ((price_usd - LAG(price_usd) OVER (ORDER BY date)) / LAG(price_usd) OVER (ORDER BY date) * 100)::numeric,
    2
  ) AS pct_change
FROM bitcoin_price_data
WHERE 
  ABS(
    (price_usd - LAG(price_usd) OVER (ORDER BY date)) / LAG(price_usd) OVER (ORDER BY date)
  ) > 0.10
ORDER BY date DESC;

