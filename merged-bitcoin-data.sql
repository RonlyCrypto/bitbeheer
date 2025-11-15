-- ============================================================
-- MERGED Bitcoin history: 2010-2025
-- Existing CSV (2010-2025) + Yahoo gap (2014-09-16) + Yahoo recent (2024-11-15)
-- Total Records: 425
-- Generated: 2025-11-15T00:57:48.429Z
-- ============================================================

-- DISABLE TRIGGERS
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- CLEAR old data
DELETE FROM bitcoin_price_data WHERE date >= '2010-01-01';

INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-17', EXTRACT(EPOCH FROM '2024-09-17'::timestamp)::bigint, 60308.54, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60308.54,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-18', EXTRACT(EPOCH FROM '2024-09-18'::timestamp)::bigint, 61649.68, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 61649.68,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-19', EXTRACT(EPOCH FROM '2024-09-19'::timestamp)::bigint, 62940.46, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62940.46,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-20', EXTRACT(EPOCH FROM '2024-09-20'::timestamp)::bigint, 63192.98, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63192.98,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-21', EXTRACT(EPOCH FROM '2024-09-21'::timestamp)::bigint, 63394.84, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63394.84,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-22', EXTRACT(EPOCH FROM '2024-09-22'::timestamp)::bigint, 63648.71, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63648.71,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-23', EXTRACT(EPOCH FROM '2024-09-23'::timestamp)::bigint, 63329.80, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63329.80,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-24', EXTRACT(EPOCH FROM '2024-09-24'::timestamp)::bigint, 64301.97, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 64301.97,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-25', EXTRACT(EPOCH FROM '2024-09-25'::timestamp)::bigint, 63143.14, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63143.14,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-26', EXTRACT(EPOCH FROM '2024-09-26'::timestamp)::bigint, 65181.02, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 65181.02,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-27', EXTRACT(EPOCH FROM '2024-09-27'::timestamp)::bigint, 65790.66, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 65790.66,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-28', EXTRACT(EPOCH FROM '2024-09-28'::timestamp)::bigint, 65887.65, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 65887.65,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-29', EXTRACT(EPOCH FROM '2024-09-29'::timestamp)::bigint, 65635.30, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 65635.30,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-09-30', EXTRACT(EPOCH FROM '2024-09-30'::timestamp)::bigint, 63329.50, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63329.50,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-01', EXTRACT(EPOCH FROM '2024-10-01'::timestamp)::bigint, 60837.01, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60837.01,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-02', EXTRACT(EPOCH FROM '2024-10-02'::timestamp)::bigint, 60632.79, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60632.79,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-03', EXTRACT(EPOCH FROM '2024-10-03'::timestamp)::bigint, 60759.40, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60759.40,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-04', EXTRACT(EPOCH FROM '2024-10-04'::timestamp)::bigint, 62067.48, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62067.48,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-05', EXTRACT(EPOCH FROM '2024-10-05'::timestamp)::bigint, 62089.95, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62089.95,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-06', EXTRACT(EPOCH FROM '2024-10-06'::timestamp)::bigint, 62818.95, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62818.95,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-07', EXTRACT(EPOCH FROM '2024-10-07'::timestamp)::bigint, 62236.66, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62236.66,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-08', EXTRACT(EPOCH FROM '2024-10-08'::timestamp)::bigint, 62131.97, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62131.97,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-09', EXTRACT(EPOCH FROM '2024-10-09'::timestamp)::bigint, 60582.10, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60582.10,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-10', EXTRACT(EPOCH FROM '2024-10-10'::timestamp)::bigint, 60274.50, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60274.50,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-11', EXTRACT(EPOCH FROM '2024-10-11'::timestamp)::bigint, 62445.09, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62445.09,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-12', EXTRACT(EPOCH FROM '2024-10-12'::timestamp)::bigint, 63193.02, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63193.02,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-13', EXTRACT(EPOCH FROM '2024-10-13'::timestamp)::bigint, 62851.38, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62851.38,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-14', EXTRACT(EPOCH FROM '2024-10-14'::timestamp)::bigint, 66046.13, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 66046.13,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-15', EXTRACT(EPOCH FROM '2024-10-15'::timestamp)::bigint, 67041.11, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67041.11,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-16', EXTRACT(EPOCH FROM '2024-10-16'::timestamp)::bigint, 67612.72, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67612.72,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-17', EXTRACT(EPOCH FROM '2024-10-17'::timestamp)::bigint, 67399.84, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67399.84,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-18', EXTRACT(EPOCH FROM '2024-10-18'::timestamp)::bigint, 68418.79, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 68418.79,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-19', EXTRACT(EPOCH FROM '2024-10-19'::timestamp)::bigint, 68362.73, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 68362.73,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-20', EXTRACT(EPOCH FROM '2024-10-20'::timestamp)::bigint, 69001.70, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69001.70,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-21', EXTRACT(EPOCH FROM '2024-10-21'::timestamp)::bigint, 67367.85, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67367.85,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-22', EXTRACT(EPOCH FROM '2024-10-22'::timestamp)::bigint, 67361.41, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67361.41,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-23', EXTRACT(EPOCH FROM '2024-10-23'::timestamp)::bigint, 66432.20, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 66432.20,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-24', EXTRACT(EPOCH FROM '2024-10-24'::timestamp)::bigint, 68161.05, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 68161.05,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-25', EXTRACT(EPOCH FROM '2024-10-25'::timestamp)::bigint, 66642.41, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 66642.41,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-26', EXTRACT(EPOCH FROM '2024-10-26'::timestamp)::bigint, 67014.70, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67014.70,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-27', EXTRACT(EPOCH FROM '2024-10-27'::timestamp)::bigint, 67929.30, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67929.30,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-28', EXTRACT(EPOCH FROM '2024-10-28'::timestamp)::bigint, 69907.76, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69907.76,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-29', EXTRACT(EPOCH FROM '2024-10-29'::timestamp)::bigint, 72720.49, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 72720.49,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-30', EXTRACT(EPOCH FROM '2024-10-30'::timestamp)::bigint, 72339.54, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 72339.54,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-10-31', EXTRACT(EPOCH FROM '2024-10-31'::timestamp)::bigint, 70215.19, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 70215.19,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-01', EXTRACT(EPOCH FROM '2024-11-01'::timestamp)::bigint, 69482.47, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69482.47,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-02', EXTRACT(EPOCH FROM '2024-11-02'::timestamp)::bigint, 69289.27, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69289.27,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-03', EXTRACT(EPOCH FROM '2024-11-03'::timestamp)::bigint, 68741.12, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 68741.12,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-04', EXTRACT(EPOCH FROM '2024-11-04'::timestamp)::bigint, 67811.51, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67811.51,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-05', EXTRACT(EPOCH FROM '2024-11-05'::timestamp)::bigint, 69359.56, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69359.56,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-06', EXTRACT(EPOCH FROM '2024-11-06'::timestamp)::bigint, 75639.08, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 75639.08,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-07', EXTRACT(EPOCH FROM '2024-11-07'::timestamp)::bigint, 75904.86, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 75904.86,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-08', EXTRACT(EPOCH FROM '2024-11-08'::timestamp)::bigint, 76545.48, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 76545.48,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-09', EXTRACT(EPOCH FROM '2024-11-09'::timestamp)::bigint, 76778.87, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 76778.87,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-10', EXTRACT(EPOCH FROM '2024-11-10'::timestamp)::bigint, 80474.19, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 80474.19,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-11', EXTRACT(EPOCH FROM '2024-11-11'::timestamp)::bigint, 88701.48, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 88701.48,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-12', EXTRACT(EPOCH FROM '2024-11-12'::timestamp)::bigint, 87955.81, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87955.81,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-13', EXTRACT(EPOCH FROM '2024-11-13'::timestamp)::bigint, 90584.16, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 90584.16,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-14', EXTRACT(EPOCH FROM '2024-11-14'::timestamp)::bigint, 87250.43, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87250.43,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-15', EXTRACT(EPOCH FROM '2024-11-15'::timestamp)::bigint, 91066.01, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 91066.01,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-16', EXTRACT(EPOCH FROM '2024-11-16'::timestamp)::bigint, 90558.48, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 90558.48,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-17', EXTRACT(EPOCH FROM '2024-11-17'::timestamp)::bigint, 89845.85, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 89845.85,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-18', EXTRACT(EPOCH FROM '2024-11-18'::timestamp)::bigint, 90542.64, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 90542.64,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-19', EXTRACT(EPOCH FROM '2024-11-19'::timestamp)::bigint, 92343.79, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 92343.79,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-20', EXTRACT(EPOCH FROM '2024-11-20'::timestamp)::bigint, 94339.49, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94339.49,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-21', EXTRACT(EPOCH FROM '2024-11-21'::timestamp)::bigint, 98504.73, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98504.73,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-22', EXTRACT(EPOCH FROM '2024-11-22'::timestamp)::bigint, 98997.66, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98997.66,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-23', EXTRACT(EPOCH FROM '2024-11-23'::timestamp)::bigint, 97777.28, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97777.28,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-24', EXTRACT(EPOCH FROM '2024-11-24'::timestamp)::bigint, 98013.82, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98013.82,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-25', EXTRACT(EPOCH FROM '2024-11-25'::timestamp)::bigint, 93102.30, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93102.30,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-26', EXTRACT(EPOCH FROM '2024-11-26'::timestamp)::bigint, 91985.32, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 91985.32,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-27', EXTRACT(EPOCH FROM '2024-11-27'::timestamp)::bigint, 95962.53, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95962.53,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-28', EXTRACT(EPOCH FROM '2024-11-28'::timestamp)::bigint, 95652.47, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95652.47,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-29', EXTRACT(EPOCH FROM '2024-11-29'::timestamp)::bigint, 97461.52, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97461.52,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-11-30', EXTRACT(EPOCH FROM '2024-11-30'::timestamp)::bigint, 96449.05, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96449.05,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-01', EXTRACT(EPOCH FROM '2024-12-01'::timestamp)::bigint, 97279.79, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97279.79,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-02', EXTRACT(EPOCH FROM '2024-12-02'::timestamp)::bigint, 95865.30, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95865.30,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-03', EXTRACT(EPOCH FROM '2024-12-03'::timestamp)::bigint, 96002.16, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96002.16,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-04', EXTRACT(EPOCH FROM '2024-12-04'::timestamp)::bigint, 98768.53, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98768.53,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-05', EXTRACT(EPOCH FROM '2024-12-05'::timestamp)::bigint, 96593.57, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96593.57,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-06', EXTRACT(EPOCH FROM '2024-12-06'::timestamp)::bigint, 99920.71, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99920.71,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-07', EXTRACT(EPOCH FROM '2024-12-07'::timestamp)::bigint, 99923.34, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99923.34,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-08', EXTRACT(EPOCH FROM '2024-12-08'::timestamp)::bigint, 101236.02, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101236.02,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-09', EXTRACT(EPOCH FROM '2024-12-09'::timestamp)::bigint, 97432.72, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97432.72,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-10', EXTRACT(EPOCH FROM '2024-12-10'::timestamp)::bigint, 96675.43, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96675.43,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-11', EXTRACT(EPOCH FROM '2024-12-11'::timestamp)::bigint, 101173.03, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101173.03,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-12', EXTRACT(EPOCH FROM '2024-12-12'::timestamp)::bigint, 100043.00, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100043.00,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-13', EXTRACT(EPOCH FROM '2024-12-13'::timestamp)::bigint, 101459.26, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101459.26,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-14', EXTRACT(EPOCH FROM '2024-12-14'::timestamp)::bigint, 101372.97, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101372.97,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-15', EXTRACT(EPOCH FROM '2024-12-15'::timestamp)::bigint, 104298.70, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104298.70,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-16', EXTRACT(EPOCH FROM '2024-12-16'::timestamp)::bigint, 106029.72, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106029.72,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-17', EXTRACT(EPOCH FROM '2024-12-17'::timestamp)::bigint, 106140.60, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106140.60,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-18', EXTRACT(EPOCH FROM '2024-12-18'::timestamp)::bigint, 100041.54, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100041.54,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-19', EXTRACT(EPOCH FROM '2024-12-19'::timestamp)::bigint, 97490.95, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97490.95,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-20', EXTRACT(EPOCH FROM '2024-12-20'::timestamp)::bigint, 97755.93, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97755.93,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-21', EXTRACT(EPOCH FROM '2024-12-21'::timestamp)::bigint, 97224.73, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97224.73,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-22', EXTRACT(EPOCH FROM '2024-12-22'::timestamp)::bigint, 95104.94, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95104.94,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-23', EXTRACT(EPOCH FROM '2024-12-23'::timestamp)::bigint, 94686.24, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94686.24,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-24', EXTRACT(EPOCH FROM '2024-12-24'::timestamp)::bigint, 98676.09, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98676.09,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-25', EXTRACT(EPOCH FROM '2024-12-25'::timestamp)::bigint, 99299.20, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99299.20,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-26', EXTRACT(EPOCH FROM '2024-12-26'::timestamp)::bigint, 95795.52, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95795.52,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-27', EXTRACT(EPOCH FROM '2024-12-27'::timestamp)::bigint, 94164.86, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94164.86,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-28', EXTRACT(EPOCH FROM '2024-12-28'::timestamp)::bigint, 95163.93, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95163.93,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-29', EXTRACT(EPOCH FROM '2024-12-29'::timestamp)::bigint, 93530.23, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93530.23,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-30', EXTRACT(EPOCH FROM '2024-12-30'::timestamp)::bigint, 92643.21, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 92643.21,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2024-12-31', EXTRACT(EPOCH FROM '2024-12-31'::timestamp)::bigint, 93429.20, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93429.20,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-01', EXTRACT(EPOCH FROM '2025-01-01'::timestamp)::bigint, 94419.76, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94419.76,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-02', EXTRACT(EPOCH FROM '2025-01-02'::timestamp)::bigint, 96886.88, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96886.88,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-03', EXTRACT(EPOCH FROM '2025-01-03'::timestamp)::bigint, 98107.43, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98107.43,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-04', EXTRACT(EPOCH FROM '2025-01-04'::timestamp)::bigint, 98236.23, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98236.23,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-05', EXTRACT(EPOCH FROM '2025-01-05'::timestamp)::bigint, 98314.96, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98314.96,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-06', EXTRACT(EPOCH FROM '2025-01-06'::timestamp)::bigint, 102078.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102078.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-07', EXTRACT(EPOCH FROM '2025-01-07'::timestamp)::bigint, 96922.70, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96922.70,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-08', EXTRACT(EPOCH FROM '2025-01-08'::timestamp)::bigint, 95043.52, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95043.52,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-09', EXTRACT(EPOCH FROM '2025-01-09'::timestamp)::bigint, 92484.04, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 92484.04,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-10', EXTRACT(EPOCH FROM '2025-01-10'::timestamp)::bigint, 94701.45, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94701.45,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-11', EXTRACT(EPOCH FROM '2025-01-11'::timestamp)::bigint, 94566.59, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94566.59,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-12', EXTRACT(EPOCH FROM '2025-01-12'::timestamp)::bigint, 94488.44, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94488.44,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-13', EXTRACT(EPOCH FROM '2025-01-13'::timestamp)::bigint, 94516.52, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94516.52,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-14', EXTRACT(EPOCH FROM '2025-01-14'::timestamp)::bigint, 96534.05, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96534.05,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-15', EXTRACT(EPOCH FROM '2025-01-15'::timestamp)::bigint, 100504.49, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100504.49,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-16', EXTRACT(EPOCH FROM '2025-01-16'::timestamp)::bigint, 99756.91, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99756.91,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-17', EXTRACT(EPOCH FROM '2025-01-17'::timestamp)::bigint, 104462.04, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104462.04,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-18', EXTRACT(EPOCH FROM '2025-01-18'::timestamp)::bigint, 104408.07, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104408.07,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-19', EXTRACT(EPOCH FROM '2025-01-19'::timestamp)::bigint, 101089.61, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101089.61,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-20', EXTRACT(EPOCH FROM '2025-01-20'::timestamp)::bigint, 102016.66, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102016.66,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-21', EXTRACT(EPOCH FROM '2025-01-21'::timestamp)::bigint, 106146.27, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106146.27,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-22', EXTRACT(EPOCH FROM '2025-01-22'::timestamp)::bigint, 103653.07, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103653.07,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-23', EXTRACT(EPOCH FROM '2025-01-23'::timestamp)::bigint, 103960.17, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103960.17,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-24', EXTRACT(EPOCH FROM '2025-01-24'::timestamp)::bigint, 104819.48, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104819.48,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-25', EXTRACT(EPOCH FROM '2025-01-25'::timestamp)::bigint, 104714.65, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104714.65,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-26', EXTRACT(EPOCH FROM '2025-01-26'::timestamp)::bigint, 102682.50, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102682.50,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-27', EXTRACT(EPOCH FROM '2025-01-27'::timestamp)::bigint, 102087.69, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102087.69,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-28', EXTRACT(EPOCH FROM '2025-01-28'::timestamp)::bigint, 101332.48, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101332.48,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-29', EXTRACT(EPOCH FROM '2025-01-29'::timestamp)::bigint, 103703.21, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103703.21,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-30', EXTRACT(EPOCH FROM '2025-01-30'::timestamp)::bigint, 104735.30, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104735.30,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-01-31', EXTRACT(EPOCH FROM '2025-01-31'::timestamp)::bigint, 102405.02, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102405.02,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-01', EXTRACT(EPOCH FROM '2025-02-01'::timestamp)::bigint, 100655.91, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100655.91,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-02', EXTRACT(EPOCH FROM '2025-02-02'::timestamp)::bigint, 97688.98, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97688.98,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-03', EXTRACT(EPOCH FROM '2025-02-03'::timestamp)::bigint, 101405.42, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101405.42,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-04', EXTRACT(EPOCH FROM '2025-02-04'::timestamp)::bigint, 97871.82, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97871.82,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-05', EXTRACT(EPOCH FROM '2025-02-05'::timestamp)::bigint, 96615.45, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96615.45,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-06', EXTRACT(EPOCH FROM '2025-02-06'::timestamp)::bigint, 96593.30, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96593.30,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-07', EXTRACT(EPOCH FROM '2025-02-07'::timestamp)::bigint, 96529.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96529.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-08', EXTRACT(EPOCH FROM '2025-02-08'::timestamp)::bigint, 96482.45, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96482.45,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-09', EXTRACT(EPOCH FROM '2025-02-09'::timestamp)::bigint, 96500.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96500.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-10', EXTRACT(EPOCH FROM '2025-02-10'::timestamp)::bigint, 97437.55, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97437.55,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-11', EXTRACT(EPOCH FROM '2025-02-11'::timestamp)::bigint, 95747.43, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95747.43,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-12', EXTRACT(EPOCH FROM '2025-02-12'::timestamp)::bigint, 97885.86, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97885.86,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-13', EXTRACT(EPOCH FROM '2025-02-13'::timestamp)::bigint, 96623.87, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96623.87,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-14', EXTRACT(EPOCH FROM '2025-02-14'::timestamp)::bigint, 97508.97, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97508.97,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-15', EXTRACT(EPOCH FROM '2025-02-15'::timestamp)::bigint, 97580.35, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97580.35,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-16', EXTRACT(EPOCH FROM '2025-02-16'::timestamp)::bigint, 96175.03, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96175.03,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-17', EXTRACT(EPOCH FROM '2025-02-17'::timestamp)::bigint, 95773.38, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95773.38,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-18', EXTRACT(EPOCH FROM '2025-02-18'::timestamp)::bigint, 95539.55, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95539.55,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-19', EXTRACT(EPOCH FROM '2025-02-19'::timestamp)::bigint, 96635.61, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96635.61,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-20', EXTRACT(EPOCH FROM '2025-02-20'::timestamp)::bigint, 98333.94, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98333.94,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-21', EXTRACT(EPOCH FROM '2025-02-21'::timestamp)::bigint, 96125.55, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96125.55,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-22', EXTRACT(EPOCH FROM '2025-02-22'::timestamp)::bigint, 96577.76, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96577.76,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-23', EXTRACT(EPOCH FROM '2025-02-23'::timestamp)::bigint, 96273.92, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96273.92,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-24', EXTRACT(EPOCH FROM '2025-02-24'::timestamp)::bigint, 91418.17, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 91418.17,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-25', EXTRACT(EPOCH FROM '2025-02-25'::timestamp)::bigint, 88736.17, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 88736.17,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-26', EXTRACT(EPOCH FROM '2025-02-26'::timestamp)::bigint, 84347.02, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84347.02,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-27', EXTRACT(EPOCH FROM '2025-02-27'::timestamp)::bigint, 84704.23, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84704.23,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-02-28', EXTRACT(EPOCH FROM '2025-02-28'::timestamp)::bigint, 84373.01, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84373.01,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-01', EXTRACT(EPOCH FROM '2025-03-01'::timestamp)::bigint, 86031.91, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86031.91,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-02', EXTRACT(EPOCH FROM '2025-03-02'::timestamp)::bigint, 94248.35, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94248.35,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-03', EXTRACT(EPOCH FROM '2025-03-03'::timestamp)::bigint, 86065.67, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86065.67,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-04', EXTRACT(EPOCH FROM '2025-03-04'::timestamp)::bigint, 87222.20, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87222.20,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-05', EXTRACT(EPOCH FROM '2025-03-05'::timestamp)::bigint, 90623.56, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 90623.56,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-06', EXTRACT(EPOCH FROM '2025-03-06'::timestamp)::bigint, 89961.73, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 89961.73,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-07', EXTRACT(EPOCH FROM '2025-03-07'::timestamp)::bigint, 86742.67, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86742.67,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-08', EXTRACT(EPOCH FROM '2025-03-08'::timestamp)::bigint, 86154.59, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86154.59,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-09', EXTRACT(EPOCH FROM '2025-03-09'::timestamp)::bigint, 80601.04, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 80601.04,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-10', EXTRACT(EPOCH FROM '2025-03-10'::timestamp)::bigint, 78532.00, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 78532.00,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-11', EXTRACT(EPOCH FROM '2025-03-11'::timestamp)::bigint, 82862.21, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82862.21,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-12', EXTRACT(EPOCH FROM '2025-03-12'::timestamp)::bigint, 83722.36, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83722.36,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-13', EXTRACT(EPOCH FROM '2025-03-13'::timestamp)::bigint, 81066.70, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 81066.70,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-14', EXTRACT(EPOCH FROM '2025-03-14'::timestamp)::bigint, 83969.10, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83969.10,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-15', EXTRACT(EPOCH FROM '2025-03-15'::timestamp)::bigint, 84343.11, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84343.11,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-16', EXTRACT(EPOCH FROM '2025-03-16'::timestamp)::bigint, 82579.69, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82579.69,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-17', EXTRACT(EPOCH FROM '2025-03-17'::timestamp)::bigint, 84075.69, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84075.69,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-18', EXTRACT(EPOCH FROM '2025-03-18'::timestamp)::bigint, 82718.50, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82718.50,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-19', EXTRACT(EPOCH FROM '2025-03-19'::timestamp)::bigint, 86854.23, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86854.23,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-20', EXTRACT(EPOCH FROM '2025-03-20'::timestamp)::bigint, 84167.20, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84167.20,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-21', EXTRACT(EPOCH FROM '2025-03-21'::timestamp)::bigint, 84043.24, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84043.24,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-22', EXTRACT(EPOCH FROM '2025-03-22'::timestamp)::bigint, 83832.48, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83832.48,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-23', EXTRACT(EPOCH FROM '2025-03-23'::timestamp)::bigint, 86054.38, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86054.38,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-24', EXTRACT(EPOCH FROM '2025-03-24'::timestamp)::bigint, 87498.91, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87498.91,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-25', EXTRACT(EPOCH FROM '2025-03-25'::timestamp)::bigint, 87471.70, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87471.70,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-26', EXTRACT(EPOCH FROM '2025-03-26'::timestamp)::bigint, 86900.88, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86900.88,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-27', EXTRACT(EPOCH FROM '2025-03-27'::timestamp)::bigint, 87177.10, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87177.10,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-28', EXTRACT(EPOCH FROM '2025-03-28'::timestamp)::bigint, 84353.15, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84353.15,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-29', EXTRACT(EPOCH FROM '2025-03-29'::timestamp)::bigint, 82597.59, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82597.59,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-30', EXTRACT(EPOCH FROM '2025-03-30'::timestamp)::bigint, 82334.52, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82334.52,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-03-31', EXTRACT(EPOCH FROM '2025-03-31'::timestamp)::bigint, 82548.91, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82548.91,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-01', EXTRACT(EPOCH FROM '2025-04-01'::timestamp)::bigint, 85169.17, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 85169.17,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-02', EXTRACT(EPOCH FROM '2025-04-02'::timestamp)::bigint, 82485.71, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82485.71,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-03', EXTRACT(EPOCH FROM '2025-04-03'::timestamp)::bigint, 83102.83, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83102.83,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-04', EXTRACT(EPOCH FROM '2025-04-04'::timestamp)::bigint, 83843.80, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83843.80,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-05', EXTRACT(EPOCH FROM '2025-04-05'::timestamp)::bigint, 83504.80, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83504.80,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-06', EXTRACT(EPOCH FROM '2025-04-06'::timestamp)::bigint, 78214.48, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 78214.48,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-07', EXTRACT(EPOCH FROM '2025-04-07'::timestamp)::bigint, 79235.34, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 79235.34,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-08', EXTRACT(EPOCH FROM '2025-04-08'::timestamp)::bigint, 76271.95, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 76271.95,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-09', EXTRACT(EPOCH FROM '2025-04-09'::timestamp)::bigint, 82573.95, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82573.95,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-10', EXTRACT(EPOCH FROM '2025-04-10'::timestamp)::bigint, 79626.14, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 79626.14,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-11', EXTRACT(EPOCH FROM '2025-04-11'::timestamp)::bigint, 83404.84, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83404.84,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-12', EXTRACT(EPOCH FROM '2025-04-12'::timestamp)::bigint, 85287.11, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 85287.11,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-13', EXTRACT(EPOCH FROM '2025-04-13'::timestamp)::bigint, 83684.98, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83684.98,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-14', EXTRACT(EPOCH FROM '2025-04-14'::timestamp)::bigint, 84542.39, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84542.39,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-15', EXTRACT(EPOCH FROM '2025-04-15'::timestamp)::bigint, 83668.99, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83668.99,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-16', EXTRACT(EPOCH FROM '2025-04-16'::timestamp)::bigint, 84033.87, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84033.87,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-17', EXTRACT(EPOCH FROM '2025-04-17'::timestamp)::bigint, 84895.75, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84895.75,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-18', EXTRACT(EPOCH FROM '2025-04-18'::timestamp)::bigint, 84450.80, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84450.80,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-19', EXTRACT(EPOCH FROM '2025-04-19'::timestamp)::bigint, 85063.41, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 85063.41,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-20', EXTRACT(EPOCH FROM '2025-04-20'::timestamp)::bigint, 85174.30, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 85174.30,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-21', EXTRACT(EPOCH FROM '2025-04-21'::timestamp)::bigint, 87518.91, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87518.91,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-22', EXTRACT(EPOCH FROM '2025-04-22'::timestamp)::bigint, 93441.89, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93441.89,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-23', EXTRACT(EPOCH FROM '2025-04-23'::timestamp)::bigint, 93699.11, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93699.11,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-24', EXTRACT(EPOCH FROM '2025-04-24'::timestamp)::bigint, 93943.80, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93943.80,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-25', EXTRACT(EPOCH FROM '2025-04-25'::timestamp)::bigint, 94720.50, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94720.50,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-26', EXTRACT(EPOCH FROM '2025-04-26'::timestamp)::bigint, 94646.93, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94646.93,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-27', EXTRACT(EPOCH FROM '2025-04-27'::timestamp)::bigint, 93754.84, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93754.84,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-28', EXTRACT(EPOCH FROM '2025-04-28'::timestamp)::bigint, 94978.75, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94978.75,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-29', EXTRACT(EPOCH FROM '2025-04-29'::timestamp)::bigint, 94284.79, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94284.79,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-04-30', EXTRACT(EPOCH FROM '2025-04-30'::timestamp)::bigint, 94207.31, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94207.31,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-01', EXTRACT(EPOCH FROM '2025-05-01'::timestamp)::bigint, 96492.34, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96492.34,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-02', EXTRACT(EPOCH FROM '2025-05-02'::timestamp)::bigint, 96910.07, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96910.07,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-03', EXTRACT(EPOCH FROM '2025-05-03'::timestamp)::bigint, 95891.80, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95891.80,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-04', EXTRACT(EPOCH FROM '2025-05-04'::timestamp)::bigint, 94315.98, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94315.98,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-05', EXTRACT(EPOCH FROM '2025-05-05'::timestamp)::bigint, 94748.05, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94748.05,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-06', EXTRACT(EPOCH FROM '2025-05-06'::timestamp)::bigint, 96802.48, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96802.48,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-07', EXTRACT(EPOCH FROM '2025-05-07'::timestamp)::bigint, 97032.32, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97032.32,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-08', EXTRACT(EPOCH FROM '2025-05-08'::timestamp)::bigint, 103241.46, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103241.46,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-09', EXTRACT(EPOCH FROM '2025-05-09'::timestamp)::bigint, 102970.85, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102970.85,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-10', EXTRACT(EPOCH FROM '2025-05-10'::timestamp)::bigint, 104696.33, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104696.33,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-11', EXTRACT(EPOCH FROM '2025-05-11'::timestamp)::bigint, 104106.36, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104106.36,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-12', EXTRACT(EPOCH FROM '2025-05-12'::timestamp)::bigint, 102812.95, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102812.95,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-13', EXTRACT(EPOCH FROM '2025-05-13'::timestamp)::bigint, 104169.81, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104169.81,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-14', EXTRACT(EPOCH FROM '2025-05-14'::timestamp)::bigint, 103539.41, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103539.41,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-15', EXTRACT(EPOCH FROM '2025-05-15'::timestamp)::bigint, 103744.64, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103744.64,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-16', EXTRACT(EPOCH FROM '2025-05-16'::timestamp)::bigint, 103489.29, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103489.29,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-17', EXTRACT(EPOCH FROM '2025-05-17'::timestamp)::bigint, 103191.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103191.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-18', EXTRACT(EPOCH FROM '2025-05-18'::timestamp)::bigint, 106446.01, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106446.01,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-19', EXTRACT(EPOCH FROM '2025-05-19'::timestamp)::bigint, 105606.18, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105606.18,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-20', EXTRACT(EPOCH FROM '2025-05-20'::timestamp)::bigint, 106791.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106791.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-21', EXTRACT(EPOCH FROM '2025-05-21'::timestamp)::bigint, 109678.08, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109678.08,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-22', EXTRACT(EPOCH FROM '2025-05-22'::timestamp)::bigint, 111673.28, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111673.28,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-23', EXTRACT(EPOCH FROM '2025-05-23'::timestamp)::bigint, 107287.80, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107287.80,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-24', EXTRACT(EPOCH FROM '2025-05-24'::timestamp)::bigint, 107791.16, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107791.16,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-25', EXTRACT(EPOCH FROM '2025-05-25'::timestamp)::bigint, 109035.39, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109035.39,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-26', EXTRACT(EPOCH FROM '2025-05-26'::timestamp)::bigint, 109440.37, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109440.37,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-27', EXTRACT(EPOCH FROM '2025-05-27'::timestamp)::bigint, 108994.64, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108994.64,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-28', EXTRACT(EPOCH FROM '2025-05-28'::timestamp)::bigint, 107802.33, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107802.33,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-29', EXTRACT(EPOCH FROM '2025-05-29'::timestamp)::bigint, 105641.76, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105641.76,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-30', EXTRACT(EPOCH FROM '2025-05-30'::timestamp)::bigint, 103998.57, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103998.57,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-05-31', EXTRACT(EPOCH FROM '2025-05-31'::timestamp)::bigint, 104638.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104638.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-01', EXTRACT(EPOCH FROM '2025-06-01'::timestamp)::bigint, 105652.10, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105652.10,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-02', EXTRACT(EPOCH FROM '2025-06-02'::timestamp)::bigint, 105881.53, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105881.53,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-03', EXTRACT(EPOCH FROM '2025-06-03'::timestamp)::bigint, 105432.47, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105432.47,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-04', EXTRACT(EPOCH FROM '2025-06-04'::timestamp)::bigint, 104731.98, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104731.98,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-05', EXTRACT(EPOCH FROM '2025-06-05'::timestamp)::bigint, 101575.95, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101575.95,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-06', EXTRACT(EPOCH FROM '2025-06-06'::timestamp)::bigint, 104390.34, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104390.34,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-07', EXTRACT(EPOCH FROM '2025-06-07'::timestamp)::bigint, 105615.63, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105615.63,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-08', EXTRACT(EPOCH FROM '2025-06-08'::timestamp)::bigint, 105793.65, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105793.65,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-09', EXTRACT(EPOCH FROM '2025-06-09'::timestamp)::bigint, 110294.10, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110294.10,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-10', EXTRACT(EPOCH FROM '2025-06-10'::timestamp)::bigint, 110257.23, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110257.23,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-11', EXTRACT(EPOCH FROM '2025-06-11'::timestamp)::bigint, 108686.63, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108686.63,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-12', EXTRACT(EPOCH FROM '2025-06-12'::timestamp)::bigint, 105929.05, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105929.05,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-13', EXTRACT(EPOCH FROM '2025-06-13'::timestamp)::bigint, 106090.97, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106090.97,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-14', EXTRACT(EPOCH FROM '2025-06-14'::timestamp)::bigint, 105472.41, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105472.41,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-15', EXTRACT(EPOCH FROM '2025-06-15'::timestamp)::bigint, 105552.02, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105552.02,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-16', EXTRACT(EPOCH FROM '2025-06-16'::timestamp)::bigint, 106796.76, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106796.76,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-17', EXTRACT(EPOCH FROM '2025-06-17'::timestamp)::bigint, 104601.12, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104601.12,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-18', EXTRACT(EPOCH FROM '2025-06-18'::timestamp)::bigint, 104883.33, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104883.33,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-19', EXTRACT(EPOCH FROM '2025-06-19'::timestamp)::bigint, 104684.29, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104684.29,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-20', EXTRACT(EPOCH FROM '2025-06-20'::timestamp)::bigint, 103309.60, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103309.60,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-21', EXTRACT(EPOCH FROM '2025-06-21'::timestamp)::bigint, 102257.41, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102257.41,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-22', EXTRACT(EPOCH FROM '2025-06-22'::timestamp)::bigint, 100987.14, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100987.14,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-23', EXTRACT(EPOCH FROM '2025-06-23'::timestamp)::bigint, 105577.77, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105577.77,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-24', EXTRACT(EPOCH FROM '2025-06-24'::timestamp)::bigint, 106045.63, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106045.63,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-25', EXTRACT(EPOCH FROM '2025-06-25'::timestamp)::bigint, 107361.26, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107361.26,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-26', EXTRACT(EPOCH FROM '2025-06-26'::timestamp)::bigint, 106960.00, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106960.00,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-27', EXTRACT(EPOCH FROM '2025-06-27'::timestamp)::bigint, 107088.43, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107088.43,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-28', EXTRACT(EPOCH FROM '2025-06-28'::timestamp)::bigint, 107327.70, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107327.70,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-29', EXTRACT(EPOCH FROM '2025-06-29'::timestamp)::bigint, 108385.57, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108385.57,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-06-30', EXTRACT(EPOCH FROM '2025-06-30'::timestamp)::bigint, 107135.34, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107135.34,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-01', EXTRACT(EPOCH FROM '2025-07-01'::timestamp)::bigint, 105698.28, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105698.28,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-02', EXTRACT(EPOCH FROM '2025-07-02'::timestamp)::bigint, 108859.32, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108859.32,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-03', EXTRACT(EPOCH FROM '2025-07-03'::timestamp)::bigint, 109647.98, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109647.98,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-04', EXTRACT(EPOCH FROM '2025-07-04'::timestamp)::bigint, 108034.34, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108034.34,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-05', EXTRACT(EPOCH FROM '2025-07-05'::timestamp)::bigint, 108231.18, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108231.18,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-06', EXTRACT(EPOCH FROM '2025-07-06'::timestamp)::bigint, 109232.07, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109232.07,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-07', EXTRACT(EPOCH FROM '2025-07-07'::timestamp)::bigint, 108299.85, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108299.85,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-08', EXTRACT(EPOCH FROM '2025-07-08'::timestamp)::bigint, 108950.27, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108950.27,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-09', EXTRACT(EPOCH FROM '2025-07-09'::timestamp)::bigint, 111326.55, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111326.55,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-10', EXTRACT(EPOCH FROM '2025-07-10'::timestamp)::bigint, 115987.20, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115987.20,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-11', EXTRACT(EPOCH FROM '2025-07-11'::timestamp)::bigint, 117516.99, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117516.99,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-12', EXTRACT(EPOCH FROM '2025-07-12'::timestamp)::bigint, 117435.23, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117435.23,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-13', EXTRACT(EPOCH FROM '2025-07-13'::timestamp)::bigint, 119116.12, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119116.12,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-14', EXTRACT(EPOCH FROM '2025-07-14'::timestamp)::bigint, 119849.70, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119849.70,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-15', EXTRACT(EPOCH FROM '2025-07-15'::timestamp)::bigint, 117777.19, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117777.19,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-16', EXTRACT(EPOCH FROM '2025-07-16'::timestamp)::bigint, 118738.51, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118738.51,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-17', EXTRACT(EPOCH FROM '2025-07-17'::timestamp)::bigint, 119289.84, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119289.84,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-18', EXTRACT(EPOCH FROM '2025-07-18'::timestamp)::bigint, 118003.23, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118003.23,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-19', EXTRACT(EPOCH FROM '2025-07-19'::timestamp)::bigint, 117939.98, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117939.98,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-20', EXTRACT(EPOCH FROM '2025-07-20'::timestamp)::bigint, 117300.79, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117300.79,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-21', EXTRACT(EPOCH FROM '2025-07-21'::timestamp)::bigint, 117439.54, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117439.54,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-22', EXTRACT(EPOCH FROM '2025-07-22'::timestamp)::bigint, 119995.41, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119995.41,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-23', EXTRACT(EPOCH FROM '2025-07-23'::timestamp)::bigint, 118754.96, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118754.96,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-24', EXTRACT(EPOCH FROM '2025-07-24'::timestamp)::bigint, 118368.00, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118368.00,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-25', EXTRACT(EPOCH FROM '2025-07-25'::timestamp)::bigint, 117635.88, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117635.88,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-26', EXTRACT(EPOCH FROM '2025-07-26'::timestamp)::bigint, 117947.37, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117947.37,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-27', EXTRACT(EPOCH FROM '2025-07-27'::timestamp)::bigint, 119448.49, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119448.49,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-28', EXTRACT(EPOCH FROM '2025-07-28'::timestamp)::bigint, 117924.48, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117924.48,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-29', EXTRACT(EPOCH FROM '2025-07-29'::timestamp)::bigint, 117922.15, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117922.15,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-30', EXTRACT(EPOCH FROM '2025-07-30'::timestamp)::bigint, 117831.19, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117831.19,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-07-31', EXTRACT(EPOCH FROM '2025-07-31'::timestamp)::bigint, 115758.20, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115758.20,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-01', EXTRACT(EPOCH FROM '2025-08-01'::timestamp)::bigint, 113320.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113320.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-02', EXTRACT(EPOCH FROM '2025-08-02'::timestamp)::bigint, 112526.91, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112526.91,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-03', EXTRACT(EPOCH FROM '2025-08-03'::timestamp)::bigint, 114217.67, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114217.67,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-04', EXTRACT(EPOCH FROM '2025-08-04'::timestamp)::bigint, 115071.88, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115071.88,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-05', EXTRACT(EPOCH FROM '2025-08-05'::timestamp)::bigint, 114141.45, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114141.45,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-06', EXTRACT(EPOCH FROM '2025-08-06'::timestamp)::bigint, 115028.00, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115028.00,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-07', EXTRACT(EPOCH FROM '2025-08-07'::timestamp)::bigint, 117496.90, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117496.90,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-08', EXTRACT(EPOCH FROM '2025-08-08'::timestamp)::bigint, 116688.73, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116688.73,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-09', EXTRACT(EPOCH FROM '2025-08-09'::timestamp)::bigint, 116500.36, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116500.36,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-10', EXTRACT(EPOCH FROM '2025-08-10'::timestamp)::bigint, 119306.76, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119306.76,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-11', EXTRACT(EPOCH FROM '2025-08-11'::timestamp)::bigint, 118731.45, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118731.45,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-12', EXTRACT(EPOCH FROM '2025-08-12'::timestamp)::bigint, 120172.91, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 120172.91,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-13', EXTRACT(EPOCH FROM '2025-08-13'::timestamp)::bigint, 123344.06, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 123344.06,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-14', EXTRACT(EPOCH FROM '2025-08-14'::timestamp)::bigint, 118359.58, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118359.58,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-15', EXTRACT(EPOCH FROM '2025-08-15'::timestamp)::bigint, 117398.35, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117398.35,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-16', EXTRACT(EPOCH FROM '2025-08-16'::timestamp)::bigint, 117491.35, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117491.35,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-17', EXTRACT(EPOCH FROM '2025-08-17'::timestamp)::bigint, 117453.06, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117453.06,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-18', EXTRACT(EPOCH FROM '2025-08-18'::timestamp)::bigint, 116252.31, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116252.31,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-19', EXTRACT(EPOCH FROM '2025-08-19'::timestamp)::bigint, 112831.18, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112831.18,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-20', EXTRACT(EPOCH FROM '2025-08-20'::timestamp)::bigint, 114274.74, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114274.74,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-21', EXTRACT(EPOCH FROM '2025-08-21'::timestamp)::bigint, 112419.03, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112419.03,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-22', EXTRACT(EPOCH FROM '2025-08-22'::timestamp)::bigint, 116874.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116874.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-23', EXTRACT(EPOCH FROM '2025-08-23'::timestamp)::bigint, 115374.33, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115374.33,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-24', EXTRACT(EPOCH FROM '2025-08-24'::timestamp)::bigint, 113458.43, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113458.43,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-25', EXTRACT(EPOCH FROM '2025-08-25'::timestamp)::bigint, 110124.35, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110124.35,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-26', EXTRACT(EPOCH FROM '2025-08-26'::timestamp)::bigint, 111802.66, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111802.66,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-27', EXTRACT(EPOCH FROM '2025-08-27'::timestamp)::bigint, 111222.06, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111222.06,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-28', EXTRACT(EPOCH FROM '2025-08-28'::timestamp)::bigint, 112544.80, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112544.80,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-29', EXTRACT(EPOCH FROM '2025-08-29'::timestamp)::bigint, 108410.84, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108410.84,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-30', EXTRACT(EPOCH FROM '2025-08-30'::timestamp)::bigint, 108808.07, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108808.07,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-08-31', EXTRACT(EPOCH FROM '2025-08-31'::timestamp)::bigint, 108236.71, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108236.71,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-01', EXTRACT(EPOCH FROM '2025-09-01'::timestamp)::bigint, 109250.59, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109250.59,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-02', EXTRACT(EPOCH FROM '2025-09-02'::timestamp)::bigint, 111200.59, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111200.59,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-03', EXTRACT(EPOCH FROM '2025-09-03'::timestamp)::bigint, 111723.21, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111723.21,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-04', EXTRACT(EPOCH FROM '2025-09-04'::timestamp)::bigint, 110723.60, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110723.60,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-05', EXTRACT(EPOCH FROM '2025-09-05'::timestamp)::bigint, 110650.98, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110650.98,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-06', EXTRACT(EPOCH FROM '2025-09-06'::timestamp)::bigint, 110224.70, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110224.70,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-07', EXTRACT(EPOCH FROM '2025-09-07'::timestamp)::bigint, 111167.62, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111167.62,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-08', EXTRACT(EPOCH FROM '2025-09-08'::timestamp)::bigint, 112071.43, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112071.43,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-09', EXTRACT(EPOCH FROM '2025-09-09'::timestamp)::bigint, 111530.55, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111530.55,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-10', EXTRACT(EPOCH FROM '2025-09-10'::timestamp)::bigint, 113955.36, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113955.36,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-11', EXTRACT(EPOCH FROM '2025-09-11'::timestamp)::bigint, 115507.54, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115507.54,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-12', EXTRACT(EPOCH FROM '2025-09-12'::timestamp)::bigint, 116101.58, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116101.58,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-13', EXTRACT(EPOCH FROM '2025-09-13'::timestamp)::bigint, 115950.51, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115950.51,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-14', EXTRACT(EPOCH FROM '2025-09-14'::timestamp)::bigint, 115407.66, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115407.66,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-15', EXTRACT(EPOCH FROM '2025-09-15'::timestamp)::bigint, 115444.88, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115444.88,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-16', EXTRACT(EPOCH FROM '2025-09-16'::timestamp)::bigint, 116843.19, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116843.19,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-17', EXTRACT(EPOCH FROM '2025-09-17'::timestamp)::bigint, 116468.51, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116468.51,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-18', EXTRACT(EPOCH FROM '2025-09-18'::timestamp)::bigint, 117137.20, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117137.20,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-19', EXTRACT(EPOCH FROM '2025-09-19'::timestamp)::bigint, 115688.86, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115688.86,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-20', EXTRACT(EPOCH FROM '2025-09-20'::timestamp)::bigint, 115721.96, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115721.96,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-21', EXTRACT(EPOCH FROM '2025-09-21'::timestamp)::bigint, 115306.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115306.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-22', EXTRACT(EPOCH FROM '2025-09-22'::timestamp)::bigint, 112748.51, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112748.51,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-23', EXTRACT(EPOCH FROM '2025-09-23'::timestamp)::bigint, 112014.50, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112014.50,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-24', EXTRACT(EPOCH FROM '2025-09-24'::timestamp)::bigint, 113328.63, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113328.63,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-25', EXTRACT(EPOCH FROM '2025-09-25'::timestamp)::bigint, 109049.29, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109049.29,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-26', EXTRACT(EPOCH FROM '2025-09-26'::timestamp)::bigint, 109712.83, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109712.83,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-27', EXTRACT(EPOCH FROM '2025-09-27'::timestamp)::bigint, 109681.95, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109681.95,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-28', EXTRACT(EPOCH FROM '2025-09-28'::timestamp)::bigint, 112122.64, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112122.64,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-29', EXTRACT(EPOCH FROM '2025-09-29'::timestamp)::bigint, 114400.38, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114400.38,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-09-30', EXTRACT(EPOCH FROM '2025-09-30'::timestamp)::bigint, 114056.09, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114056.09,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-01', EXTRACT(EPOCH FROM '2025-10-01'::timestamp)::bigint, 118648.93, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118648.93,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-02', EXTRACT(EPOCH FROM '2025-10-02'::timestamp)::bigint, 120681.26, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 120681.26,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-03', EXTRACT(EPOCH FROM '2025-10-03'::timestamp)::bigint, 122266.53, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 122266.53,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-04', EXTRACT(EPOCH FROM '2025-10-04'::timestamp)::bigint, 122425.43, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 122425.43,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-05', EXTRACT(EPOCH FROM '2025-10-05'::timestamp)::bigint, 123513.48, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 123513.48,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-06', EXTRACT(EPOCH FROM '2025-10-06'::timestamp)::bigint, 124752.53, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 124752.53,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-07', EXTRACT(EPOCH FROM '2025-10-07'::timestamp)::bigint, 121451.38, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 121451.38,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-08', EXTRACT(EPOCH FROM '2025-10-08'::timestamp)::bigint, 123354.87, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 123354.87,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-09', EXTRACT(EPOCH FROM '2025-10-09'::timestamp)::bigint, 121705.59, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 121705.59,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-10', EXTRACT(EPOCH FROM '2025-10-10'::timestamp)::bigint, 113214.37, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113214.37,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-11', EXTRACT(EPOCH FROM '2025-10-11'::timestamp)::bigint, 110807.88, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110807.88,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-12', EXTRACT(EPOCH FROM '2025-10-12'::timestamp)::bigint, 115169.77, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115169.77,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-13', EXTRACT(EPOCH FROM '2025-10-13'::timestamp)::bigint, 115271.08, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115271.08,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-14', EXTRACT(EPOCH FROM '2025-10-14'::timestamp)::bigint, 113118.66, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113118.66,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-15', EXTRACT(EPOCH FROM '2025-10-15'::timestamp)::bigint, 110783.16, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110783.16,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-16', EXTRACT(EPOCH FROM '2025-10-16'::timestamp)::bigint, 108186.04, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108186.04,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-17', EXTRACT(EPOCH FROM '2025-10-17'::timestamp)::bigint, 106467.79, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106467.79,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-18', EXTRACT(EPOCH FROM '2025-10-18'::timestamp)::bigint, 107198.27, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107198.27,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-19', EXTRACT(EPOCH FROM '2025-10-19'::timestamp)::bigint, 108666.71, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108666.71,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-20', EXTRACT(EPOCH FROM '2025-10-20'::timestamp)::bigint, 110588.93, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110588.93,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-21', EXTRACT(EPOCH FROM '2025-10-21'::timestamp)::bigint, 108476.89, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108476.89,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-22', EXTRACT(EPOCH FROM '2025-10-22'::timestamp)::bigint, 107688.59, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107688.59,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-23', EXTRACT(EPOCH FROM '2025-10-23'::timestamp)::bigint, 110069.73, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110069.73,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-24', EXTRACT(EPOCH FROM '2025-10-24'::timestamp)::bigint, 111033.92, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111033.92,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-25', EXTRACT(EPOCH FROM '2025-10-25'::timestamp)::bigint, 111641.73, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111641.73,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-26', EXTRACT(EPOCH FROM '2025-10-26'::timestamp)::bigint, 114472.45, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114472.45,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-27', EXTRACT(EPOCH FROM '2025-10-27'::timestamp)::bigint, 114119.33, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114119.33,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-28', EXTRACT(EPOCH FROM '2025-10-28'::timestamp)::bigint, 112956.16, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112956.16,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-29', EXTRACT(EPOCH FROM '2025-10-29'::timestamp)::bigint, 110055.30, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110055.30,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-30', EXTRACT(EPOCH FROM '2025-10-30'::timestamp)::bigint, 108305.55, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108305.55,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-10-31', EXTRACT(EPOCH FROM '2025-10-31'::timestamp)::bigint, 109556.16, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109556.16,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-01', EXTRACT(EPOCH FROM '2025-11-01'::timestamp)::bigint, 110064.02, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110064.02,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-02', EXTRACT(EPOCH FROM '2025-11-02'::timestamp)::bigint, 110639.63, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110639.63,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-03', EXTRACT(EPOCH FROM '2025-11-03'::timestamp)::bigint, 106547.52, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106547.52,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-04', EXTRACT(EPOCH FROM '2025-11-04'::timestamp)::bigint, 101590.52, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101590.52,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-05', EXTRACT(EPOCH FROM '2025-11-05'::timestamp)::bigint, 103891.84, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103891.84,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-06', EXTRACT(EPOCH FROM '2025-11-06'::timestamp)::bigint, 101301.29, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101301.29,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-07', EXTRACT(EPOCH FROM '2025-11-07'::timestamp)::bigint, 103372.41, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103372.41,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-08', EXTRACT(EPOCH FROM '2025-11-08'::timestamp)::bigint, 102282.12, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102282.12,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-09', EXTRACT(EPOCH FROM '2025-11-09'::timestamp)::bigint, 104719.64, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104719.64,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-10', EXTRACT(EPOCH FROM '2025-11-10'::timestamp)::bigint, 105996.59, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105996.59,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-11', EXTRACT(EPOCH FROM '2025-11-11'::timestamp)::bigint, 102997.47, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102997.47,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-12', EXTRACT(EPOCH FROM '2025-11-12'::timestamp)::bigint, 101663.19, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101663.19,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-13', EXTRACT(EPOCH FROM '2025-11-13'::timestamp)::bigint, 99697.49, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99697.49,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-14', EXTRACT(EPOCH FROM '2025-11-14'::timestamp)::bigint, NULL, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = NULL,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('2025-11-15', EXTRACT(EPOCH FROM '2025-11-15'::timestamp)::bigint, 95093.25, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95093.25,
  year = 2025,
  updated_at = NOW();

-- RE-ENABLE TRIGGERS
ALTER TABLE bitcoin_price_data ENABLE TRIGGER ALL;

-- VERIFY
SELECT COUNT(*) as total_records FROM bitcoin_price_data WHERE date >= '2010-01-01';
SELECT MIN(date) as oldest, MAX(date) as newest FROM bitcoin_price_data WHERE date >= '2010-01-01';
SELECT DISTINCT year FROM bitcoin_price_data WHERE date >= '2010-01-01' ORDER BY year;

-- Show sample records
SELECT date, price_usd, year FROM bitcoin_price_data 
WHERE date IN ('2010-01-01', '2015-01-01', '2020-01-01', '2024-01-01', '2025-11-15')
ORDER BY date;
