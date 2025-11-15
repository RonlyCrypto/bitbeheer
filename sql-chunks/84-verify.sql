-- RE-ENABLE TRIGGERS
ALTER TABLE bitcoin_price_data ENABLE TRIGGER ALL;

-- VERIFY
SELECT COUNT(*) as total_2014_plus FROM bitcoin_price_data WHERE date >= '2014-01-01';
SELECT MIN(date) as oldest, MAX(date) as newest FROM bitcoin_price_data WHERE date >= '2014-01-01';
SELECT DISTINCT year FROM bitcoin_price_data WHERE date >= '2014-01-01' ORDER BY year;

-- Show sample data from each year
SELECT date, price_usd, price_high, price_low FROM bitcoin_price_data
WHERE date IN ('2014-01-01', '2017-01-01', '2020-01-01', '2023-01-01', '2024-06-26', '2024-12-31', date(NOW()))
ORDER BY date;
