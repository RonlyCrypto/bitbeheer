-- ============================================================
-- REBUILD: Bitcoin data from Yahoo Finance
-- Period: Sept 17, 2024 to Today
-- Total Records: 425
-- Generated: 2025-11-15T00:14:11.898Z
-- ============================================================

-- DISABLE TRIGGERS TEMPORARILY (for faster updates)
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- FIRST: Delete all data from Sept 17, 2024 onwards
DELETE FROM bitcoin_price_data WHERE date >= '2024-09-17';

-- INSERT NEW DATA FROM YAHOO FINANCE
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-17', 1726531200, 60308.54, NULL, 60308.54, 60308.54, 60308.54, 38075570118, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60308.54,
  price_high = 60308.54,
  price_low = 60308.54,
  price_open = 60308.54,
  volume = 38075570118,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-18', 1726617600, 61649.68, NULL, 61649.68, 61649.68, 61649.68, 40990702891, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 61649.68,
  price_high = 61649.68,
  price_low = 61649.68,
  price_open = 61649.68,
  volume = 40990702891,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-19', 1726704000, 62940.46, NULL, 62940.46, 62940.46, 62940.46, 42710252573, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62940.46,
  price_high = 62940.46,
  price_low = 62940.46,
  price_open = 62940.46,
  volume = 42710252573,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-20', 1726790400, 63192.98, NULL, 63192.98, 63192.98, 63192.98, 35177164222, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63192.98,
  price_high = 63192.98,
  price_low = 63192.98,
  price_open = 63192.98,
  volume = 35177164222,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-21', 1726876800, 63394.84, NULL, 63394.84, 63394.84, 63394.84, 14408616220, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63394.84,
  price_high = 63394.84,
  price_low = 63394.84,
  price_open = 63394.84,
  volume = 14408616220,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-22', 1726963200, 63648.71, NULL, 63648.71, 63648.71, 63648.71, 20183348802, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63648.71,
  price_high = 63648.71,
  price_low = 63648.71,
  price_open = 63648.71,
  volume = 20183348802,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-23', 1727049600, 63329.80, NULL, 63329.80, 63329.80, 63329.80, 31400285425, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63329.80,
  price_high = 63329.80,
  price_low = 63329.80,
  price_open = 63329.80,
  volume = 31400285425,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-24', 1727136000, 64301.97, NULL, 64301.97, 64301.97, 64301.97, 29938335243, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 64301.97,
  price_high = 64301.97,
  price_low = 64301.97,
  price_open = 64301.97,
  volume = 29938335243,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-25', 1727222400, 63143.14, NULL, 63143.14, 63143.14, 63143.14, 25078377700, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63143.14,
  price_high = 63143.14,
  price_low = 63143.14,
  price_open = 63143.14,
  volume = 25078377700,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-26', 1727308800, 65181.02, NULL, 65181.02, 65181.02, 65181.02, 36873129847, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 65181.02,
  price_high = 65181.02,
  price_low = 65181.02,
  price_open = 65181.02,
  volume = 36873129847,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-27', 1727395200, 65790.66, NULL, 65790.66, 65790.66, 65790.66, 32058813449, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 65790.66,
  price_high = 65790.66,
  price_low = 65790.66,
  price_open = 65790.66,
  volume = 32058813449,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-28', 1727481600, 65887.65, NULL, 65887.65, 65887.65, 65887.65, 15243637984, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 65887.65,
  price_high = 65887.65,
  price_low = 65887.65,
  price_open = 65887.65,
  volume = 15243637984,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-29', 1727568000, 65635.30, NULL, 65635.30, 65635.30, 65635.30, 14788214575, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 65635.30,
  price_high = 65635.30,
  price_low = 65635.30,
  price_open = 65635.30,
  volume = 14788214575,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-09-30', 1727654400, 63329.50, NULL, 63329.50, 63329.50, 63329.50, 37112957475, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63329.50,
  price_high = 63329.50,
  price_low = 63329.50,
  price_open = 63329.50,
  volume = 37112957475,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-01', 1727740800, 60837.01, NULL, 60837.01, 60837.01, 60837.01, 50220923500, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60837.01,
  price_high = 60837.01,
  price_low = 60837.01,
  price_open = 60837.01,
  volume = 50220923500,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-02', 1727827200, 60632.79, NULL, 60632.79, 60632.79, 60632.79, 40762722398, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60632.79,
  price_high = 60632.79,
  price_low = 60632.79,
  price_open = 60632.79,
  volume = 40762722398,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-03', 1727913600, 60759.40, NULL, 60759.40, 60759.40, 60759.40, 36106447279, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60759.40,
  price_high = 60759.40,
  price_low = 60759.40,
  price_open = 60759.40,
  volume = 36106447279,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-04', 1728000000, 62067.48, NULL, 62067.48, 62067.48, 62067.48, 29585472513, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62067.48,
  price_high = 62067.48,
  price_low = 62067.48,
  price_open = 62067.48,
  volume = 29585472513,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-05', 1728086400, 62089.95, NULL, 62089.95, 62089.95, 62089.95, 13305410749, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62089.95,
  price_high = 62089.95,
  price_low = 62089.95,
  price_open = 62089.95,
  volume = 13305410749,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-06', 1728172800, 62818.95, NULL, 62818.95, 62818.95, 62818.95, 14776233667, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62818.95,
  price_high = 62818.95,
  price_low = 62818.95,
  price_open = 62818.95,
  volume = 14776233667,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-07', 1728259200, 62236.66, NULL, 62236.66, 62236.66, 62236.66, 34253562610, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62236.66,
  price_high = 62236.66,
  price_low = 62236.66,
  price_open = 62236.66,
  volume = 34253562610,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-08', 1728345600, 62131.97, NULL, 62131.97, 62131.97, 62131.97, 28134475157, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62131.97,
  price_high = 62131.97,
  price_low = 62131.97,
  price_open = 62131.97,
  volume = 28134475157,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-09', 1728432000, 60582.10, NULL, 60582.10, 60582.10, 60582.10, 27670982363, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60582.10,
  price_high = 60582.10,
  price_low = 60582.10,
  price_open = 60582.10,
  volume = 27670982363,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-10', 1728518400, 60274.50, NULL, 60274.50, 60274.50, 60274.50, 30452813570, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 60274.50,
  price_high = 60274.50,
  price_low = 60274.50,
  price_open = 60274.50,
  volume = 30452813570,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-11', 1728604800, 62445.09, NULL, 62445.09, 62445.09, 62445.09, 30327141594, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62445.09,
  price_high = 62445.09,
  price_low = 62445.09,
  price_open = 62445.09,
  volume = 30327141594,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-12', 1728691200, 63193.02, NULL, 63193.02, 63193.02, 63193.02, 16744110886, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 63193.02,
  price_high = 63193.02,
  price_low = 63193.02,
  price_open = 63193.02,
  volume = 16744110886,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-13', 1728777600, 62851.38, NULL, 62851.38, 62851.38, 62851.38, 18177529690, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 62851.38,
  price_high = 62851.38,
  price_low = 62851.38,
  price_open = 62851.38,
  volume = 18177529690,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-14', 1728864000, 66046.13, NULL, 66046.13, 66046.13, 66046.13, 43706958056, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 66046.13,
  price_high = 66046.13,
  price_low = 66046.13,
  price_open = 66046.13,
  volume = 43706958056,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-15', 1728950400, 67041.11, NULL, 67041.11, 67041.11, 67041.11, 48863870879, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67041.11,
  price_high = 67041.11,
  price_low = 67041.11,
  price_open = 67041.11,
  volume = 48863870879,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-16', 1729036800, 67612.72, NULL, 67612.72, 67612.72, 67612.72, 38195189534, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67612.72,
  price_high = 67612.72,
  price_low = 67612.72,
  price_open = 67612.72,
  volume = 38195189534,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-17', 1729123200, 67399.84, NULL, 67399.84, 67399.84, 67399.84, 32790898511, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67399.84,
  price_high = 67399.84,
  price_low = 67399.84,
  price_open = 67399.84,
  volume = 32790898511,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-18', 1729209600, 68418.79, NULL, 68418.79, 68418.79, 68418.79, 36857165014, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 68418.79,
  price_high = 68418.79,
  price_low = 68418.79,
  price_open = 68418.79,
  volume = 36857165014,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-19', 1729296000, 68362.73, NULL, 68362.73, 68362.73, 68362.73, 14443497908, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 68362.73,
  price_high = 68362.73,
  price_low = 68362.73,
  price_open = 68362.73,
  volume = 14443497908,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-20', 1729382400, 69001.70, NULL, 69001.70, 69001.70, 69001.70, 18975847518, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69001.70,
  price_high = 69001.70,
  price_low = 69001.70,
  price_open = 69001.70,
  volume = 18975847518,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-21', 1729468800, 67367.85, NULL, 67367.85, 67367.85, 67367.85, 37498611780, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67367.85,
  price_high = 67367.85,
  price_low = 67367.85,
  price_open = 67367.85,
  volume = 37498611780,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-22', 1729555200, 67361.41, NULL, 67361.41, 67361.41, 67361.41, 31808472566, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67361.41,
  price_high = 67361.41,
  price_low = 67361.41,
  price_open = 67361.41,
  volume = 31808472566,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-23', 1729641600, 66432.20, NULL, 66432.20, 66432.20, 66432.20, 32263980353, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 66432.20,
  price_high = 66432.20,
  price_low = 66432.20,
  price_open = 66432.20,
  volume = 32263980353,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-24', 1729728000, 68161.05, NULL, 68161.05, 68161.05, 68161.05, 31414428647, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 68161.05,
  price_high = 68161.05,
  price_low = 68161.05,
  price_open = 68161.05,
  volume = 31414428647,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-25', 1729814400, 66642.41, NULL, 66642.41, 66642.41, 66642.41, 41469984306, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 66642.41,
  price_high = 66642.41,
  price_low = 66642.41,
  price_open = 66642.41,
  volume = 41469984306,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-26', 1729900800, 67014.70, NULL, 67014.70, 67014.70, 67014.70, 19588098156, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67014.70,
  price_high = 67014.70,
  price_low = 67014.70,
  price_open = 67014.70,
  volume = 19588098156,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-27', 1729987200, 67929.30, NULL, 67929.30, 67929.30, 67929.30, 16721307878, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67929.30,
  price_high = 67929.30,
  price_low = 67929.30,
  price_open = 67929.30,
  volume = 16721307878,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-28', 1730073600, 69907.76, NULL, 69907.76, 69907.76, 69907.76, 38799856657, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69907.76,
  price_high = 69907.76,
  price_low = 69907.76,
  price_open = 69907.76,
  volume = 38799856657,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-29', 1730160000, 72720.49, NULL, 72720.49, 72720.49, 72720.49, 58541874402, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 72720.49,
  price_high = 72720.49,
  price_low = 72720.49,
  price_open = 72720.49,
  volume = 58541874402,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-30', 1730246400, 72339.54, NULL, 72339.54, 72339.54, 72339.54, 40646637831, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 72339.54,
  price_high = 72339.54,
  price_low = 72339.54,
  price_open = 72339.54,
  volume = 40646637831,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-10-31', 1730332800, 70215.19, NULL, 70215.19, 70215.19, 70215.19, 40627912076, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 70215.19,
  price_high = 70215.19,
  price_low = 70215.19,
  price_open = 70215.19,
  volume = 40627912076,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-01', 1730419200, 69482.47, NULL, 69482.47, 69482.47, 69482.47, 49989795365, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69482.47,
  price_high = 69482.47,
  price_low = 69482.47,
  price_open = 69482.47,
  volume = 49989795365,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-02', 1730505600, 69289.27, NULL, 69289.27, 69289.27, 69289.27, 18184612091, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69289.27,
  price_high = 69289.27,
  price_low = 69289.27,
  price_open = 69289.27,
  volume = 18184612091,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-03', 1730592000, 68741.12, NULL, 68741.12, 68741.12, 68741.12, 34868307655, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 68741.12,
  price_high = 68741.12,
  price_low = 68741.12,
  price_open = 68741.12,
  volume = 34868307655,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-04', 1730678400, 67811.51, NULL, 67811.51, 67811.51, 67811.51, 41184819348, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 67811.51,
  price_high = 67811.51,
  price_low = 67811.51,
  price_open = 67811.51,
  volume = 41184819348,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-05', 1730764800, 69359.56, NULL, 69359.56, 69359.56, 69359.56, 46046889204, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 69359.56,
  price_high = 69359.56,
  price_low = 69359.56,
  price_open = 69359.56,
  volume = 46046889204,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-06', 1730851200, 75639.08, NULL, 75639.08, 75639.08, 75639.08, 118592653963, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 75639.08,
  price_high = 75639.08,
  price_low = 75639.08,
  price_open = 75639.08,
  volume = 118592653963,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-07', 1730937600, 75904.86, NULL, 75904.86, 75904.86, 75904.86, 63467654989, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 75904.86,
  price_high = 75904.86,
  price_low = 75904.86,
  price_open = 75904.86,
  volume = 63467654989,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-08', 1731024000, 76545.48, NULL, 76545.48, 76545.48, 76545.48, 55176858003, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 76545.48,
  price_high = 76545.48,
  price_low = 76545.48,
  price_open = 76545.48,
  volume = 55176858003,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-09', 1731110400, 76778.87, NULL, 76778.87, 76778.87, 76778.87, 29009480361, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 76778.87,
  price_high = 76778.87,
  price_low = 76778.87,
  price_open = 76778.87,
  volume = 29009480361,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-10', 1731196800, 80474.19, NULL, 80474.19, 80474.19, 80474.19, 82570594495, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 80474.19,
  price_high = 80474.19,
  price_low = 80474.19,
  price_open = 80474.19,
  volume = 82570594495,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-11', 1731283200, 88701.48, NULL, 88701.48, 88701.48, 88701.48, 117966845037, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 88701.48,
  price_high = 88701.48,
  price_low = 88701.48,
  price_open = 88701.48,
  volume = 117966845037,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-12', 1731369600, 87955.81, NULL, 87955.81, 87955.81, 87955.81, 133673285375, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87955.81,
  price_high = 87955.81,
  price_low = 87955.81,
  price_open = 87955.81,
  volume = 133673285375,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-13', 1731456000, 90584.16, NULL, 90584.16, 90584.16, 90584.16, 123559027869, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 90584.16,
  price_high = 90584.16,
  price_low = 90584.16,
  price_open = 90584.16,
  volume = 123559027869,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-14', 1731542400, 87250.43, NULL, 87250.43, 87250.43, 87250.43, 87616705248, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87250.43,
  price_high = 87250.43,
  price_low = 87250.43,
  price_open = 87250.43,
  volume = 87616705248,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-15', 1731628800, 91066.01, NULL, 91066.01, 91066.01, 91066.01, 78243109518, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 91066.01,
  price_high = 91066.01,
  price_low = 91066.01,
  price_open = 91066.01,
  volume = 78243109518,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-16', 1731715200, 90558.48, NULL, 90558.48, 90558.48, 90558.48, 44333192814, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 90558.48,
  price_high = 90558.48,
  price_low = 90558.48,
  price_open = 90558.48,
  volume = 44333192814,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-17', 1731801600, 89845.85, NULL, 89845.85, 89845.85, 89845.85, 46350159305, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 89845.85,
  price_high = 89845.85,
  price_low = 89845.85,
  price_open = 89845.85,
  volume = 46350159305,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-18', 1731888000, 90542.64, NULL, 90542.64, 90542.64, 90542.64, 75535775084, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 90542.64,
  price_high = 90542.64,
  price_low = 90542.64,
  price_open = 90542.64,
  volume = 75535775084,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-19', 1731974400, 92343.79, NULL, 92343.79, 92343.79, 92343.79, 74521048295, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 92343.79,
  price_high = 92343.79,
  price_low = 92343.79,
  price_open = 92343.79,
  volume = 74521048295,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-20', 1732060800, 94339.49, NULL, 94339.49, 94339.49, 94339.49, 71730956426, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94339.49,
  price_high = 94339.49,
  price_low = 94339.49,
  price_open = 94339.49,
  volume = 71730956426,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-21', 1732147200, 98504.73, NULL, 98504.73, 98504.73, 98504.73, 106024505582, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98504.73,
  price_high = 98504.73,
  price_low = 98504.73,
  price_open = 98504.73,
  volume = 106024505582,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-22', 1732233600, 98997.66, NULL, 98997.66, 98997.66, 98997.66, 78473580551, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98997.66,
  price_high = 98997.66,
  price_low = 98997.66,
  price_open = 98997.66,
  volume = 78473580551,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-23', 1732320000, 97777.28, NULL, 97777.28, 97777.28, 97777.28, 44414644677, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97777.28,
  price_high = 97777.28,
  price_low = 97777.28,
  price_open = 97777.28,
  volume = 44414644677,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-24', 1732406400, 98013.82, NULL, 98013.82, 98013.82, 98013.82, 51712020623, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98013.82,
  price_high = 98013.82,
  price_low = 98013.82,
  price_open = 98013.82,
  volume = 51712020623,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-25', 1732492800, 93102.30, NULL, 93102.30, 93102.30, 93102.30, 80909462490, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93102.30,
  price_high = 93102.30,
  price_low = 93102.30,
  price_open = 93102.30,
  volume = 80909462490,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-26', 1732579200, 91985.32, NULL, 91985.32, 91985.32, 91985.32, 91656519855, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 91985.32,
  price_high = 91985.32,
  price_low = 91985.32,
  price_open = 91985.32,
  volume = 91656519855,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-27', 1732665600, 95962.53, NULL, 95962.53, 95962.53, 95962.53, 71133452438, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95962.53,
  price_high = 95962.53,
  price_low = 95962.53,
  price_open = 95962.53,
  volume = 71133452438,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-28', 1732752000, 95652.47, NULL, 95652.47, 95652.47, 95652.47, 52260008261, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95652.47,
  price_high = 95652.47,
  price_low = 95652.47,
  price_open = 95652.47,
  volume = 52260008261,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-29', 1732838400, 97461.52, NULL, 97461.52, 97461.52, 97461.52, 54968682476, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97461.52,
  price_high = 97461.52,
  price_low = 97461.52,
  price_open = 97461.52,
  volume = 54968682476,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-11-30', 1732924800, 96449.05, NULL, 96449.05, 96449.05, 96449.05, 31634227866, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96449.05,
  price_high = 96449.05,
  price_low = 96449.05,
  price_open = 96449.05,
  volume = 31634227866,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-01', 1733011200, 97279.79, NULL, 97279.79, 97279.79, 97279.79, 36590695296, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97279.79,
  price_high = 97279.79,
  price_low = 97279.79,
  price_open = 97279.79,
  volume = 36590695296,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-02', 1733097600, 95865.30, NULL, 95865.30, 95865.30, 95865.30, 72680784305, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95865.30,
  price_high = 95865.30,
  price_low = 95865.30,
  price_open = 95865.30,
  volume = 72680784305,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-03', 1733184000, 96002.16, NULL, 96002.16, 96002.16, 96002.16, 67067810961, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96002.16,
  price_high = 96002.16,
  price_low = 96002.16,
  price_open = 96002.16,
  volume = 67067810961,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-04', 1733270400, 98768.53, NULL, 98768.53, 98768.53, 98768.53, 77199817112, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98768.53,
  price_high = 98768.53,
  price_low = 98768.53,
  price_open = 98768.53,
  volume = 77199817112,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-05', 1733356800, 96593.57, NULL, 96593.57, 96593.57, 96593.57, 149218945580, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96593.57,
  price_high = 96593.57,
  price_low = 96593.57,
  price_open = 96593.57,
  volume = 149218945580,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-06', 1733443200, 99920.71, NULL, 99920.71, 99920.71, 99920.71, 94534772658, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99920.71,
  price_high = 99920.71,
  price_low = 99920.71,
  price_open = 99920.71,
  volume = 94534772658,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-07', 1733529600, 99923.34, NULL, 99923.34, 99923.34, 99923.34, 44177510897, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99923.34,
  price_high = 99923.34,
  price_low = 99923.34,
  price_open = 99923.34,
  volume = 44177510897,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-08', 1733616000, 101236.02, NULL, 101236.02, 101236.02, 101236.02, 44125751925, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101236.02,
  price_high = 101236.02,
  price_low = 101236.02,
  price_open = 101236.02,
  volume = 44125751925,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-09', 1733702400, 97432.72, NULL, 97432.72, 97432.72, 97432.72, 110676473908, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97432.72,
  price_high = 97432.72,
  price_low = 97432.72,
  price_open = 97432.72,
  volume = 110676473908,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-10', 1733788800, 96675.43, NULL, 96675.43, 96675.43, 96675.43, 104823780634, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96675.43,
  price_high = 96675.43,
  price_low = 96675.43,
  price_open = 96675.43,
  volume = 104823780634,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-11', 1733875200, 101173.03, NULL, 101173.03, 101173.03, 101173.03, 85391409936, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101173.03,
  price_high = 101173.03,
  price_low = 101173.03,
  price_open = 101173.03,
  volume = 85391409936,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-12', 1733961600, 100043.00, NULL, 100043.00, 100043.00, 100043.00, 72073983533, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100043.00,
  price_high = 100043.00,
  price_low = 100043.00,
  price_open = 100043.00,
  volume = 72073983533,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-13', 1734048000, 101459.26, NULL, 101459.26, 101459.26, 101459.26, 56894751583, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101459.26,
  price_high = 101459.26,
  price_low = 101459.26,
  price_open = 101459.26,
  volume = 56894751583,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-14', 1734134400, 101372.97, NULL, 101372.97, 101372.97, 101372.97, 40422968793, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101372.97,
  price_high = 101372.97,
  price_low = 101372.97,
  price_open = 101372.97,
  volume = 40422968793,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-15', 1734220800, 104298.70, NULL, 104298.70, 104298.70, 104298.70, 51145914137, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104298.70,
  price_high = 104298.70,
  price_low = 104298.70,
  price_open = 104298.70,
  volume = 51145914137,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-16', 1734307200, 106029.72, NULL, 106029.72, 106029.72, 106029.72, 91020417816, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106029.72,
  price_high = 106029.72,
  price_low = 106029.72,
  price_open = 106029.72,
  volume = 91020417816,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-17', 1734393600, 106140.60, NULL, 106140.60, 106140.60, 106140.60, 68589364868, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106140.60,
  price_high = 106140.60,
  price_low = 106140.60,
  price_open = 106140.60,
  volume = 68589364868,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-18', 1734480000, 100041.54, NULL, 100041.54, 100041.54, 100041.54, 93865656139, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100041.54,
  price_high = 100041.54,
  price_low = 100041.54,
  price_open = 100041.54,
  volume = 93865656139,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-19', 1734566400, 97490.95, NULL, 97490.95, 97490.95, 97490.95, 97221662392, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97490.95,
  price_high = 97490.95,
  price_low = 97490.95,
  price_open = 97490.95,
  volume = 97221662392,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-20', 1734652800, 97755.93, NULL, 97755.93, 97755.93, 97755.93, 105634083408, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97755.93,
  price_high = 97755.93,
  price_low = 97755.93,
  price_open = 97755.93,
  volume = 105634083408,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-21', 1734739200, 97224.73, NULL, 97224.73, 97224.73, 97224.73, 51765334294, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97224.73,
  price_high = 97224.73,
  price_low = 97224.73,
  price_open = 97224.73,
  volume = 51765334294,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-22', 1734825600, 95104.94, NULL, 95104.94, 95104.94, 95104.94, 43147981314, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95104.94,
  price_high = 95104.94,
  price_low = 95104.94,
  price_open = 95104.94,
  volume = 43147981314,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-23', 1734912000, 94686.24, NULL, 94686.24, 94686.24, 94686.24, 65239002919, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94686.24,
  price_high = 94686.24,
  price_low = 94686.24,
  price_open = 94686.24,
  volume = 65239002919,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-24', 1734998400, 98676.09, NULL, 98676.09, 98676.09, 98676.09, 47114953674, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98676.09,
  price_high = 98676.09,
  price_low = 98676.09,
  price_open = 98676.09,
  volume = 47114953674,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-25', 1735084800, 99299.20, NULL, 99299.20, 99299.20, 99299.20, 33700394629, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99299.20,
  price_high = 99299.20,
  price_low = 99299.20,
  price_open = 99299.20,
  volume = 33700394629,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-26', 1735171200, 95795.52, NULL, 95795.52, 95795.52, 95795.52, 47054980873, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95795.52,
  price_high = 95795.52,
  price_low = 95795.52,
  price_open = 95795.52,
  volume = 47054980873,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-27', 1735257600, 94164.86, NULL, 94164.86, 94164.86, 94164.86, 52419934565, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94164.86,
  price_high = 94164.86,
  price_low = 94164.86,
  price_open = 94164.86,
  volume = 52419934565,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-28', 1735344000, 95163.93, NULL, 95163.93, 95163.93, 95163.93, 24107436185, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95163.93,
  price_high = 95163.93,
  price_low = 95163.93,
  price_open = 95163.93,
  volume = 24107436185,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-29', 1735430400, 93530.23, NULL, 93530.23, 93530.23, 93530.23, 29635885267, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93530.23,
  price_high = 93530.23,
  price_low = 93530.23,
  price_open = 93530.23,
  volume = 29635885267,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-30', 1735516800, 92643.21, NULL, 92643.21, 92643.21, 92643.21, 56188003691, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 92643.21,
  price_high = 92643.21,
  price_low = 92643.21,
  price_open = 92643.21,
  volume = 56188003691,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2024-12-31', 1735603200, 93429.20, NULL, 93429.20, 93429.20, 93429.20, 43625106843, 2024, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93429.20,
  price_high = 93429.20,
  price_low = 93429.20,
  price_open = 93429.20,
  volume = 43625106843,
  year = 2024,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-01', 1735689600, 94419.76, NULL, 94419.76, 94419.76, 94419.76, 24519888919, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94419.76,
  price_high = 94419.76,
  price_low = 94419.76,
  price_open = 94419.76,
  volume = 24519888919,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-02', 1735776000, 96886.88, NULL, 96886.88, 96886.88, 96886.88, 46009564411, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96886.88,
  price_high = 96886.88,
  price_low = 96886.88,
  price_open = 96886.88,
  volume = 46009564411,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-03', 1735862400, 98107.43, NULL, 98107.43, 98107.43, 98107.43, 35611391163, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98107.43,
  price_high = 98107.43,
  price_low = 98107.43,
  price_open = 98107.43,
  volume = 35611391163,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-04', 1735948800, 98236.23, NULL, 98236.23, 98236.23, 98236.23, 22342608078, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98236.23,
  price_high = 98236.23,
  price_low = 98236.23,
  price_open = 98236.23,
  volume = 22342608078,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-05', 1736035200, 98314.96, NULL, 98314.96, 98314.96, 98314.96, 20525254825, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98314.96,
  price_high = 98314.96,
  price_low = 98314.96,
  price_open = 98314.96,
  volume = 20525254825,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-06', 1736121600, 102078.09, NULL, 102078.09, 102078.09, 102078.09, 51823432705, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102078.09,
  price_high = 102078.09,
  price_low = 102078.09,
  price_open = 102078.09,
  volume = 51823432705,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-07', 1736208000, 96922.70, NULL, 96922.70, 96922.70, 96922.70, 58685738547, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96922.70,
  price_high = 96922.70,
  price_low = 96922.70,
  price_open = 96922.70,
  volume = 58685738547,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-08', 1736294400, 95043.52, NULL, 95043.52, 95043.52, 95043.52, 63875859171, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95043.52,
  price_high = 95043.52,
  price_low = 95043.52,
  price_open = 95043.52,
  volume = 63875859171,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-09', 1736380800, 92484.04, NULL, 92484.04, 92484.04, 92484.04, 62777261693, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 92484.04,
  price_high = 92484.04,
  price_low = 92484.04,
  price_open = 92484.04,
  volume = 62777261693,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-10', 1736467200, 94701.45, NULL, 94701.45, 94701.45, 94701.45, 62058693684, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94701.45,
  price_high = 94701.45,
  price_low = 94701.45,
  price_open = 94701.45,
  volume = 62058693684,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-11', 1736553600, 94566.59, NULL, 94566.59, 94566.59, 94566.59, 18860894100, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94566.59,
  price_high = 94566.59,
  price_low = 94566.59,
  price_open = 94566.59,
  volume = 18860894100,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-12', 1736640000, 94488.44, NULL, 94488.44, 94488.44, 94488.44, 20885130965, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94488.44,
  price_high = 94488.44,
  price_low = 94488.44,
  price_open = 94488.44,
  volume = 20885130965,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-13', 1736726400, 94516.52, NULL, 94516.52, 94516.52, 94516.52, 72978998252, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94516.52,
  price_high = 94516.52,
  price_low = 94516.52,
  price_open = 94516.52,
  volume = 72978998252,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-14', 1736812800, 96534.05, NULL, 96534.05, 96534.05, 96534.05, 53769675818, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96534.05,
  price_high = 96534.05,
  price_low = 96534.05,
  price_open = 96534.05,
  volume = 53769675818,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-15', 1736899200, 100504.49, NULL, 100504.49, 100504.49, 100504.49, 57805923627, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100504.49,
  price_high = 100504.49,
  price_low = 100504.49,
  price_open = 100504.49,
  volume = 57805923627,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-16', 1736985600, 99756.91, NULL, 99756.91, 99756.91, 99756.91, 54103781805, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99756.91,
  price_high = 99756.91,
  price_low = 99756.91,
  price_open = 99756.91,
  volume = 54103781805,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-17', 1737072000, 104462.04, NULL, 104462.04, 104462.04, 104462.04, 71888972663, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104462.04,
  price_high = 104462.04,
  price_low = 104462.04,
  price_open = 104462.04,
  volume = 71888972663,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-18', 1737158400, 104408.07, NULL, 104408.07, 104408.07, 104408.07, 50445655726, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104408.07,
  price_high = 104408.07,
  price_low = 104408.07,
  price_open = 104408.07,
  volume = 50445655726,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-19', 1737244800, 101089.61, NULL, 101089.61, 101089.61, 101089.61, 76789928525, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101089.61,
  price_high = 101089.61,
  price_low = 101089.61,
  price_open = 101089.61,
  volume = 76789928525,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-20', 1737331200, 102016.66, NULL, 102016.66, 102016.66, 102016.66, 126279678351, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102016.66,
  price_high = 102016.66,
  price_low = 102016.66,
  price_open = 102016.66,
  volume = 126279678351,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-21', 1737417600, 106146.27, NULL, 106146.27, 106146.27, 106146.27, 88733878242, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106146.27,
  price_high = 106146.27,
  price_low = 106146.27,
  price_open = 106146.27,
  volume = 88733878242,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-22', 1737504000, 103653.07, NULL, 103653.07, 103653.07, 103653.07, 53878181052, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103653.07,
  price_high = 103653.07,
  price_low = 103653.07,
  price_open = 103653.07,
  volume = 53878181052,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-23', 1737590400, 103960.17, NULL, 103960.17, 103960.17, 103960.17, 104104515428, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103960.17,
  price_high = 103960.17,
  price_low = 103960.17,
  price_open = 103960.17,
  volume = 104104515428,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-24', 1737676800, 104819.48, NULL, 104819.48, 104819.48, 104819.48, 52388229265, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104819.48,
  price_high = 104819.48,
  price_low = 104819.48,
  price_open = 104819.48,
  volume = 52388229265,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-25', 1737763200, 104714.65, NULL, 104714.65, 104714.65, 104714.65, 23888996502, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104714.65,
  price_high = 104714.65,
  price_low = 104714.65,
  price_open = 104714.65,
  volume = 23888996502,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-26', 1737849600, 102682.50, NULL, 102682.50, 102682.50, 102682.50, 22543395879, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102682.50,
  price_high = 102682.50,
  price_low = 102682.50,
  price_open = 102682.50,
  volume = 22543395879,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-27', 1737936000, 102087.69, NULL, 102087.69, 102087.69, 102087.69, 89006608428, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102087.69,
  price_high = 102087.69,
  price_low = 102087.69,
  price_open = 102087.69,
  volume = 89006608428,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-28', 1738022400, 101332.48, NULL, 101332.48, 101332.48, 101332.48, 47180685494, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101332.48,
  price_high = 101332.48,
  price_low = 101332.48,
  price_open = 101332.48,
  volume = 47180685494,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-29', 1738108800, 103703.21, NULL, 103703.21, 103703.21, 103703.21, 47432049818, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103703.21,
  price_high = 103703.21,
  price_low = 103703.21,
  price_open = 103703.21,
  volume = 47432049818,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-30', 1738195200, 104735.30, NULL, 104735.30, 104735.30, 104735.30, 41915744521, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104735.30,
  price_high = 104735.30,
  price_low = 104735.30,
  price_open = 104735.30,
  volume = 41915744521,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-01-31', 1738281600, 102405.02, NULL, 102405.02, 102405.02, 102405.02, 45732764360, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102405.02,
  price_high = 102405.02,
  price_low = 102405.02,
  price_open = 102405.02,
  volume = 45732764360,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-01', 1738368000, 100655.91, NULL, 100655.91, 100655.91, 100655.91, 27757944848, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100655.91,
  price_high = 100655.91,
  price_low = 100655.91,
  price_open = 100655.91,
  volume = 27757944848,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-02', 1738454400, 97688.98, NULL, 97688.98, 97688.98, 97688.98, 63091816853, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97688.98,
  price_high = 97688.98,
  price_low = 97688.98,
  price_open = 97688.98,
  volume = 63091816853,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-03', 1738540800, 101405.42, NULL, 101405.42, 101405.42, 101405.42, 115400897748, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101405.42,
  price_high = 101405.42,
  price_low = 101405.42,
  price_open = 101405.42,
  volume = 115400897748,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-04', 1738627200, 97871.82, NULL, 97871.82, 97871.82, 97871.82, 73002130211, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97871.82,
  price_high = 97871.82,
  price_low = 97871.82,
  price_open = 97871.82,
  volume = 73002130211,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-05', 1738713600, 96615.45, NULL, 96615.45, 96615.45, 96615.45, 49125911241, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96615.45,
  price_high = 96615.45,
  price_low = 96615.45,
  price_open = 96615.45,
  volume = 49125911241,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-06', 1738800000, 96593.30, NULL, 96593.30, 96593.30, 96593.30, 45302471947, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96593.30,
  price_high = 96593.30,
  price_low = 96593.30,
  price_open = 96593.30,
  volume = 45302471947,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-07', 1738886400, 96529.09, NULL, 96529.09, 96529.09, 96529.09, 55741290456, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96529.09,
  price_high = 96529.09,
  price_low = 96529.09,
  price_open = 96529.09,
  volume = 55741290456,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-08', 1738972800, 96482.45, NULL, 96482.45, 96482.45, 96482.45, 22447526395, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96482.45,
  price_high = 96482.45,
  price_low = 96482.45,
  price_open = 96482.45,
  volume = 22447526395,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-09', 1739059200, 96500.09, NULL, 96500.09, 96500.09, 96500.09, 27732901800, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96500.09,
  price_high = 96500.09,
  price_low = 96500.09,
  price_open = 96500.09,
  volume = 27732901800,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-10', 1739145600, 97437.55, NULL, 97437.55, 97437.55, 97437.55, 40078962391, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97437.55,
  price_high = 97437.55,
  price_low = 97437.55,
  price_open = 97437.55,
  volume = 40078962391,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-11', 1739232000, 95747.43, NULL, 95747.43, 95747.43, 95747.43, 37488783272, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95747.43,
  price_high = 95747.43,
  price_low = 95747.43,
  price_open = 95747.43,
  volume = 37488783272,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-12', 1739318400, 97885.86, NULL, 97885.86, 97885.86, 97885.86, 49340445530, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97885.86,
  price_high = 97885.86,
  price_low = 97885.86,
  price_open = 97885.86,
  volume = 49340445530,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-13', 1739404800, 96623.87, NULL, 96623.87, 96623.87, 96623.87, 37147280860, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96623.87,
  price_high = 96623.87,
  price_low = 96623.87,
  price_open = 96623.87,
  volume = 37147280860,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-14', 1739491200, 97508.97, NULL, 97508.97, 97508.97, 97508.97, 32697987277, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97508.97,
  price_high = 97508.97,
  price_low = 97508.97,
  price_open = 97508.97,
  volume = 32697987277,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-15', 1739577600, 97580.35, NULL, 97580.35, 97580.35, 97580.35, 17047266288, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97580.35,
  price_high = 97580.35,
  price_low = 97580.35,
  price_open = 97580.35,
  volume = 17047266288,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-16', 1739664000, 96175.03, NULL, 96175.03, 96175.03, 96175.03, 16536755396, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96175.03,
  price_high = 96175.03,
  price_low = 96175.03,
  price_open = 96175.03,
  volume = 16536755396,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-17', 1739750400, 95773.38, NULL, 95773.38, 95773.38, 95773.38, 27336550690, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95773.38,
  price_high = 95773.38,
  price_low = 95773.38,
  price_open = 95773.38,
  volume = 27336550690,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-18', 1739836800, 95539.55, NULL, 95539.55, 95539.55, 95539.55, 37325720482, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95539.55,
  price_high = 95539.55,
  price_low = 95539.55,
  price_open = 95539.55,
  volume = 37325720482,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-19', 1739923200, 96635.61, NULL, 96635.61, 96635.61, 96635.61, 28990872862, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96635.61,
  price_high = 96635.61,
  price_low = 96635.61,
  price_open = 96635.61,
  volume = 28990872862,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-20', 1740009600, 98333.94, NULL, 98333.94, 98333.94, 98333.94, 31668022771, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 98333.94,
  price_high = 98333.94,
  price_low = 98333.94,
  price_open = 98333.94,
  volume = 31668022771,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-21', 1740096000, 96125.55, NULL, 96125.55, 96125.55, 96125.55, 49608706470, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96125.55,
  price_high = 96125.55,
  price_low = 96125.55,
  price_open = 96125.55,
  volume = 49608706470,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-22', 1740182400, 96577.76, NULL, 96577.76, 96577.76, 96577.76, 18353824477, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96577.76,
  price_high = 96577.76,
  price_low = 96577.76,
  price_open = 96577.76,
  volume = 18353824477,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-23', 1740268800, 96273.92, NULL, 96273.92, 96273.92, 96273.92, 16999478976, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96273.92,
  price_high = 96273.92,
  price_low = 96273.92,
  price_open = 96273.92,
  volume = 16999478976,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-24', 1740355200, 91418.17, NULL, 91418.17, 91418.17, 91418.17, 44046480529, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 91418.17,
  price_high = 91418.17,
  price_low = 91418.17,
  price_open = 91418.17,
  volume = 44046480529,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-25', 1740441600, 88736.17, NULL, 88736.17, 88736.17, 88736.17, 92139104128, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 88736.17,
  price_high = 88736.17,
  price_low = 88736.17,
  price_open = 88736.17,
  volume = 92139104128,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-26', 1740528000, 84347.02, NULL, 84347.02, 84347.02, 84347.02, 64597492134, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84347.02,
  price_high = 84347.02,
  price_low = 84347.02,
  price_open = 84347.02,
  volume = 64597492134,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-27', 1740614400, 84704.23, NULL, 84704.23, 84704.23, 84704.23, 52659591954, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84704.23,
  price_high = 84704.23,
  price_low = 84704.23,
  price_open = 84704.23,
  volume = 52659591954,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-02-28', 1740700800, 84373.01, NULL, 84373.01, 84373.01, 84373.01, 83610570576, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84373.01,
  price_high = 84373.01,
  price_low = 84373.01,
  price_open = 84373.01,
  volume = 83610570576,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-01', 1740787200, 86031.91, NULL, 86031.91, 86031.91, 86031.91, 29190628396, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86031.91,
  price_high = 86031.91,
  price_low = 86031.91,
  price_open = 86031.91,
  volume = 29190628396,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-02', 1740873600, 94248.35, NULL, 94248.35, 94248.35, 94248.35, 58398341092, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94248.35,
  price_high = 94248.35,
  price_low = 94248.35,
  price_open = 94248.35,
  volume = 58398341092,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-03', 1740960000, 86065.67, NULL, 86065.67, 86065.67, 86065.67, 70072228536, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86065.67,
  price_high = 86065.67,
  price_low = 86065.67,
  price_open = 86065.67,
  volume = 70072228536,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-04', 1741046400, 87222.20, NULL, 87222.20, 87222.20, 87222.20, 68095241474, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87222.20,
  price_high = 87222.20,
  price_low = 87222.20,
  price_open = 87222.20,
  volume = 68095241474,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-05', 1741132800, 90623.56, NULL, 90623.56, 90623.56, 90623.56, 50498988027, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 90623.56,
  price_high = 90623.56,
  price_low = 90623.56,
  price_open = 90623.56,
  volume = 50498988027,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-06', 1741219200, 89961.73, NULL, 89961.73, 89961.73, 89961.73, 47749810486, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 89961.73,
  price_high = 89961.73,
  price_low = 89961.73,
  price_open = 89961.73,
  volume = 47749810486,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-07', 1741305600, 86742.67, NULL, 86742.67, 86742.67, 86742.67, 65945677657, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86742.67,
  price_high = 86742.67,
  price_low = 86742.67,
  price_open = 86742.67,
  volume = 65945677657,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-08', 1741392000, 86154.59, NULL, 86154.59, 86154.59, 86154.59, 18206118081, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86154.59,
  price_high = 86154.59,
  price_low = 86154.59,
  price_open = 86154.59,
  volume = 18206118081,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-09', 1741478400, 80601.04, NULL, 80601.04, 80601.04, 80601.04, 30899345977, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 80601.04,
  price_high = 80601.04,
  price_low = 80601.04,
  price_open = 80601.04,
  volume = 30899345977,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-10', 1741564800, 78532.00, NULL, 78532.00, 78532.00, 78532.00, 54061099422, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 78532.00,
  price_high = 78532.00,
  price_low = 78532.00,
  price_open = 78532.00,
  volume = 54061099422,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-11', 1741651200, 82862.21, NULL, 82862.21, 82862.21, 82862.21, 54702837196, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82862.21,
  price_high = 82862.21,
  price_low = 82862.21,
  price_open = 82862.21,
  volume = 54702837196,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-12', 1741737600, 83722.36, NULL, 83722.36, 83722.36, 83722.36, 40353484454, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83722.36,
  price_high = 83722.36,
  price_low = 83722.36,
  price_open = 83722.36,
  volume = 40353484454,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-13', 1741824000, 81066.70, NULL, 81066.70, 81066.70, 81066.70, 31412940153, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 81066.70,
  price_high = 81066.70,
  price_low = 81066.70,
  price_open = 81066.70,
  volume = 31412940153,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-14', 1741910400, 83969.10, NULL, 83969.10, 83969.10, 83969.10, 29588112414, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83969.10,
  price_high = 83969.10,
  price_low = 83969.10,
  price_open = 83969.10,
  volume = 29588112414,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-15', 1741996800, 84343.11, NULL, 84343.11, 84343.11, 84343.11, 13650491277, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84343.11,
  price_high = 84343.11,
  price_low = 84343.11,
  price_open = 84343.11,
  volume = 13650491277,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-16', 1742083200, 82579.69, NULL, 82579.69, 82579.69, 82579.69, 21330270174, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82579.69,
  price_high = 82579.69,
  price_low = 82579.69,
  price_open = 82579.69,
  volume = 21330270174,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-17', 1742169600, 84075.69, NULL, 84075.69, 84075.69, 84075.69, 25092785558, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84075.69,
  price_high = 84075.69,
  price_low = 84075.69,
  price_open = 84075.69,
  volume = 25092785558,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-18', 1742256000, 82718.50, NULL, 82718.50, 82718.50, 82718.50, 24095774594, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82718.50,
  price_high = 82718.50,
  price_low = 82718.50,
  price_open = 82718.50,
  volume = 24095774594,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-19', 1742342400, 86854.23, NULL, 86854.23, 86854.23, 86854.23, 34931960257, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86854.23,
  price_high = 86854.23,
  price_low = 86854.23,
  price_open = 86854.23,
  volume = 34931960257,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-20', 1742428800, 84167.20, NULL, 84167.20, 84167.20, 84167.20, 29028988961, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84167.20,
  price_high = 84167.20,
  price_low = 84167.20,
  price_open = 84167.20,
  volume = 29028988961,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-21', 1742515200, 84043.24, NULL, 84043.24, 84043.24, 84043.24, 19030452299, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84043.24,
  price_high = 84043.24,
  price_low = 84043.24,
  price_open = 84043.24,
  volume = 19030452299,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-22', 1742601600, 83832.48, NULL, 83832.48, 83832.48, 83832.48, 9863214091, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83832.48,
  price_high = 83832.48,
  price_low = 83832.48,
  price_open = 83832.48,
  volume = 9863214091,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-23', 1742688000, 86054.38, NULL, 86054.38, 86054.38, 86054.38, 12594615537, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86054.38,
  price_high = 86054.38,
  price_low = 86054.38,
  price_open = 86054.38,
  volume = 12594615537,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-24', 1742774400, 87498.91, NULL, 87498.91, 87498.91, 87498.91, 34582604933, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87498.91,
  price_high = 87498.91,
  price_low = 87498.91,
  price_open = 87498.91,
  volume = 34582604933,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-25', 1742860800, 87471.70, NULL, 87471.70, 87471.70, 87471.70, 30005840049, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87471.70,
  price_high = 87471.70,
  price_low = 87471.70,
  price_open = 87471.70,
  volume = 30005840049,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-26', 1742947200, 86900.88, NULL, 86900.88, 86900.88, 86900.88, 26704046038, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 86900.88,
  price_high = 86900.88,
  price_low = 86900.88,
  price_open = 86900.88,
  volume = 26704046038,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-27', 1743033600, 87177.10, NULL, 87177.10, 87177.10, 87177.10, 24413471941, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87177.10,
  price_high = 87177.10,
  price_low = 87177.10,
  price_open = 87177.10,
  volume = 24413471941,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-28', 1743120000, 84353.15, NULL, 84353.15, 84353.15, 84353.15, 34198619509, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84353.15,
  price_high = 84353.15,
  price_low = 84353.15,
  price_open = 84353.15,
  volume = 34198619509,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-29', 1743206400, 82597.59, NULL, 82597.59, 82597.59, 82597.59, 16969396135, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82597.59,
  price_high = 82597.59,
  price_low = 82597.59,
  price_open = 82597.59,
  volume = 16969396135,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-30', 1743292800, 82334.52, NULL, 82334.52, 82334.52, 82334.52, 14763760943, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82334.52,
  price_high = 82334.52,
  price_low = 82334.52,
  price_open = 82334.52,
  volume = 14763760943,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-03-31', 1743379200, 82548.91, NULL, 82548.91, 82548.91, 82548.91, 29004228247, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82548.91,
  price_high = 82548.91,
  price_low = 82548.91,
  price_open = 82548.91,
  volume = 29004228247,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-01', 1743465600, 85169.17, NULL, 85169.17, 85169.17, 85169.17, 28175650319, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 85169.17,
  price_high = 85169.17,
  price_low = 85169.17,
  price_open = 85169.17,
  volume = 28175650319,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-02', 1743552000, 82485.71, NULL, 82485.71, 82485.71, 82485.71, 47584398470, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82485.71,
  price_high = 82485.71,
  price_low = 82485.71,
  price_open = 82485.71,
  volume = 47584398470,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-03', 1743638400, 83102.83, NULL, 83102.83, 83102.83, 83102.83, 36852112080, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83102.83,
  price_high = 83102.83,
  price_low = 83102.83,
  price_open = 83102.83,
  volume = 36852112080,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-04', 1743724800, 83843.80, NULL, 83843.80, 83843.80, 83843.80, 45157640207, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83843.80,
  price_high = 83843.80,
  price_low = 83843.80,
  price_open = 83843.80,
  volume = 45157640207,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-05', 1743811200, 83504.80, NULL, 83504.80, 83504.80, 83504.80, 14380803631, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83504.80,
  price_high = 83504.80,
  price_low = 83504.80,
  price_open = 83504.80,
  volume = 14380803631,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-06', 1743897600, 78214.48, NULL, 78214.48, 78214.48, 78214.48, 36294853736, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 78214.48,
  price_high = 78214.48,
  price_low = 78214.48,
  price_open = 78214.48,
  volume = 36294853736,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-07', 1743984000, 79235.34, NULL, 79235.34, 79235.34, 79235.34, 91262424987, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 79235.34,
  price_high = 79235.34,
  price_low = 79235.34,
  price_open = 79235.34,
  volume = 91262424987,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-08', 1744070400, 76271.95, NULL, 76271.95, 76271.95, 76271.95, 48314590749, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 76271.95,
  price_high = 76271.95,
  price_low = 76271.95,
  price_open = 76271.95,
  volume = 48314590749,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-09', 1744156800, 82573.95, NULL, 82573.95, 82573.95, 82573.95, 84213627038, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 82573.95,
  price_high = 82573.95,
  price_low = 82573.95,
  price_open = 82573.95,
  volume = 84213627038,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-10', 1744243200, 79626.14, NULL, 79626.14, 79626.14, 79626.14, 44718000633, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 79626.14,
  price_high = 79626.14,
  price_low = 79626.14,
  price_open = 79626.14,
  volume = 44718000633,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-11', 1744329600, 83404.84, NULL, 83404.84, 83404.84, 83404.84, 41656778779, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83404.84,
  price_high = 83404.84,
  price_low = 83404.84,
  price_open = 83404.84,
  volume = 41656778779,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-12', 1744416000, 85287.11, NULL, 85287.11, 85287.11, 85287.11, 24258059104, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 85287.11,
  price_high = 85287.11,
  price_low = 85287.11,
  price_open = 85287.11,
  volume = 24258059104,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-13', 1744502400, 83684.98, NULL, 83684.98, 83684.98, 83684.98, 28796984817, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83684.98,
  price_high = 83684.98,
  price_low = 83684.98,
  price_open = 83684.98,
  volume = 28796984817,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-14', 1744588800, 84542.39, NULL, 84542.39, 84542.39, 84542.39, 34090769777, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84542.39,
  price_high = 84542.39,
  price_low = 84542.39,
  price_open = 84542.39,
  volume = 34090769777,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-15', 1744675200, 83668.99, NULL, 83668.99, 83668.99, 83668.99, 28040322885, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 83668.99,
  price_high = 83668.99,
  price_low = 83668.99,
  price_open = 83668.99,
  volume = 28040322885,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-16', 1744761600, 84033.87, NULL, 84033.87, 84033.87, 84033.87, 29617804112, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84033.87,
  price_high = 84033.87,
  price_low = 84033.87,
  price_open = 84033.87,
  volume = 29617804112,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-17', 1744848000, 84895.75, NULL, 84895.75, 84895.75, 84895.75, 21276866029, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84895.75,
  price_high = 84895.75,
  price_low = 84895.75,
  price_open = 84895.75,
  volume = 21276866029,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-18', 1744934400, 84450.80, NULL, 84450.80, 84450.80, 84450.80, 12728372364, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 84450.80,
  price_high = 84450.80,
  price_low = 84450.80,
  price_open = 84450.80,
  volume = 12728372364,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-19', 1745020800, 85063.41, NULL, 85063.41, 85063.41, 85063.41, 15259300427, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 85063.41,
  price_high = 85063.41,
  price_low = 85063.41,
  price_open = 85063.41,
  volume = 15259300427,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-20', 1745107200, 85174.30, NULL, 85174.30, 85174.30, 85174.30, 14664050812, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 85174.30,
  price_high = 85174.30,
  price_low = 85174.30,
  price_open = 85174.30,
  volume = 14664050812,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-21', 1745193600, 87518.91, NULL, 87518.91, 87518.91, 87518.91, 41396190190, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 87518.91,
  price_high = 87518.91,
  price_low = 87518.91,
  price_open = 87518.91,
  volume = 41396190190,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-22', 1745280000, 93441.89, NULL, 93441.89, 93441.89, 93441.89, 55899038456, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93441.89,
  price_high = 93441.89,
  price_low = 93441.89,
  price_open = 93441.89,
  volume = 55899038456,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-23', 1745366400, 93699.11, NULL, 93699.11, 93699.11, 93699.11, 41719568821, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93699.11,
  price_high = 93699.11,
  price_low = 93699.11,
  price_open = 93699.11,
  volume = 41719568821,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-24', 1745452800, 93943.80, NULL, 93943.80, 93943.80, 93943.80, 31483175315, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93943.80,
  price_high = 93943.80,
  price_low = 93943.80,
  price_open = 93943.80,
  volume = 31483175315,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-25', 1745539200, 94720.50, NULL, 94720.50, 94720.50, 94720.50, 40915232364, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94720.50,
  price_high = 94720.50,
  price_low = 94720.50,
  price_open = 94720.50,
  volume = 40915232364,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-26', 1745625600, 94646.93, NULL, 94646.93, 94646.93, 94646.93, 17612825123, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94646.93,
  price_high = 94646.93,
  price_low = 94646.93,
  price_open = 94646.93,
  volume = 17612825123,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-27', 1745712000, 93754.84, NULL, 93754.84, 93754.84, 93754.84, 18090367764, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 93754.84,
  price_high = 93754.84,
  price_low = 93754.84,
  price_open = 93754.84,
  volume = 18090367764,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-28', 1745798400, 94978.75, NULL, 94978.75, 94978.75, 94978.75, 32363449569, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94978.75,
  price_high = 94978.75,
  price_low = 94978.75,
  price_open = 94978.75,
  volume = 32363449569,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-29', 1745884800, 94284.79, NULL, 94284.79, 94284.79, 94284.79, 25806129921, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94284.79,
  price_high = 94284.79,
  price_low = 94284.79,
  price_open = 94284.79,
  volume = 25806129921,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-04-30', 1745971200, 94207.31, NULL, 94207.31, 94207.31, 94207.31, 28344679831, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94207.31,
  price_high = 94207.31,
  price_low = 94207.31,
  price_open = 94207.31,
  volume = 28344679831,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-01', 1746057600, 96492.34, NULL, 96492.34, 96492.34, 96492.34, 32875889623, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96492.34,
  price_high = 96492.34,
  price_low = 96492.34,
  price_open = 96492.34,
  volume = 32875889623,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-02', 1746144000, 96910.07, NULL, 96910.07, 96910.07, 96910.07, 26421924677, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96910.07,
  price_high = 96910.07,
  price_low = 96910.07,
  price_open = 96910.07,
  volume = 26421924677,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-03', 1746230400, 95891.80, NULL, 95891.80, 95891.80, 95891.80, 15775154889, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95891.80,
  price_high = 95891.80,
  price_low = 95891.80,
  price_open = 95891.80,
  volume = 15775154889,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-04', 1746316800, 94315.98, NULL, 94315.98, 94315.98, 94315.98, 18198688416, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94315.98,
  price_high = 94315.98,
  price_low = 94315.98,
  price_open = 94315.98,
  volume = 18198688416,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-05', 1746403200, 94748.05, NULL, 94748.05, 94748.05, 94748.05, 25816260327, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 94748.05,
  price_high = 94748.05,
  price_low = 94748.05,
  price_open = 94748.05,
  volume = 25816260327,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-06', 1746489600, 96802.48, NULL, 96802.48, 96802.48, 96802.48, 26551275827, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 96802.48,
  price_high = 96802.48,
  price_low = 96802.48,
  price_open = 96802.48,
  volume = 26551275827,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-07', 1746576000, 97032.32, NULL, 97032.32, 97032.32, 97032.32, 76983822462, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 97032.32,
  price_high = 97032.32,
  price_low = 97032.32,
  price_open = 97032.32,
  volume = 76983822462,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-08', 1746662400, 103241.46, NULL, 103241.46, 103241.46, 103241.46, 69895404397, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103241.46,
  price_high = 103241.46,
  price_low = 103241.46,
  price_open = 103241.46,
  volume = 69895404397,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-09', 1746748800, 102970.85, NULL, 102970.85, 102970.85, 102970.85, 58198593958, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102970.85,
  price_high = 102970.85,
  price_low = 102970.85,
  price_open = 102970.85,
  volume = 58198593958,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-10', 1746835200, 104696.33, NULL, 104696.33, 104696.33, 104696.33, 42276713994, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104696.33,
  price_high = 104696.33,
  price_low = 104696.33,
  price_open = 104696.33,
  volume = 42276713994,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-11', 1746921600, 104106.36, NULL, 104106.36, 104106.36, 104106.36, 46285517406, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104106.36,
  price_high = 104106.36,
  price_low = 104106.36,
  price_open = 104106.36,
  volume = 46285517406,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-12', 1747008000, 102812.95, NULL, 102812.95, 102812.95, 102812.95, 63250475404, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102812.95,
  price_high = 102812.95,
  price_low = 102812.95,
  price_open = 102812.95,
  volume = 63250475404,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-13', 1747094400, 104169.81, NULL, 104169.81, 104169.81, 104169.81, 52608876410, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104169.81,
  price_high = 104169.81,
  price_low = 104169.81,
  price_open = 104169.81,
  volume = 52608876410,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-14', 1747180800, 103539.41, NULL, 103539.41, 103539.41, 103539.41, 45956071155, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103539.41,
  price_high = 103539.41,
  price_low = 103539.41,
  price_open = 103539.41,
  volume = 45956071155,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-15', 1747267200, 103744.64, NULL, 103744.64, 103744.64, 103744.64, 50408241840, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103744.64,
  price_high = 103744.64,
  price_low = 103744.64,
  price_open = 103744.64,
  volume = 50408241840,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-16', 1747353600, 103489.29, NULL, 103489.29, 103489.29, 103489.29, 44386499364, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103489.29,
  price_high = 103489.29,
  price_low = 103489.29,
  price_open = 103489.29,
  volume = 44386499364,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-17', 1747440000, 103191.09, NULL, 103191.09, 103191.09, 103191.09, 37898552742, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103191.09,
  price_high = 103191.09,
  price_low = 103191.09,
  price_open = 103191.09,
  volume = 37898552742,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-18', 1747526400, 106446.01, NULL, 106446.01, 106446.01, 106446.01, 49887082058, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106446.01,
  price_high = 106446.01,
  price_low = 106446.01,
  price_open = 106446.01,
  volume = 49887082058,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-19', 1747612800, 105606.18, NULL, 105606.18, 105606.18, 105606.18, 61761126647, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105606.18,
  price_high = 105606.18,
  price_low = 105606.18,
  price_open = 105606.18,
  volume = 61761126647,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-20', 1747699200, 106791.09, NULL, 106791.09, 106791.09, 106791.09, 36515726122, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106791.09,
  price_high = 106791.09,
  price_low = 106791.09,
  price_open = 106791.09,
  volume = 36515726122,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-21', 1747785600, 109678.08, NULL, 109678.08, 109678.08, 109678.08, 78086364051, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109678.08,
  price_high = 109678.08,
  price_low = 109678.08,
  price_open = 109678.08,
  volume = 78086364051,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-22', 1747872000, 111673.28, NULL, 111673.28, 111673.28, 111673.28, 70157575642, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111673.28,
  price_high = 111673.28,
  price_low = 111673.28,
  price_open = 111673.28,
  volume = 70157575642,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-23', 1747958400, 107287.80, NULL, 107287.80, 107287.80, 107287.80, 67548133399, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107287.80,
  price_high = 107287.80,
  price_low = 107287.80,
  price_open = 107287.80,
  volume = 67548133399,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-24', 1748044800, 107791.16, NULL, 107791.16, 107791.16, 107791.16, 45903627163, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107791.16,
  price_high = 107791.16,
  price_low = 107791.16,
  price_open = 107791.16,
  volume = 45903627163,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-25', 1748131200, 109035.39, NULL, 109035.39, 109035.39, 109035.39, 47518041841, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109035.39,
  price_high = 109035.39,
  price_low = 109035.39,
  price_open = 109035.39,
  volume = 47518041841,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-26', 1748217600, 109440.37, NULL, 109440.37, 109440.37, 109440.37, 45950461571, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109440.37,
  price_high = 109440.37,
  price_low = 109440.37,
  price_open = 109440.37,
  volume = 45950461571,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-27', 1748304000, 108994.64, NULL, 108994.64, 108994.64, 108994.64, 57450176272, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108994.64,
  price_high = 108994.64,
  price_low = 108994.64,
  price_open = 108994.64,
  volume = 57450176272,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-28', 1748390400, 107802.33, NULL, 107802.33, 107802.33, 107802.33, 49155377493, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107802.33,
  price_high = 107802.33,
  price_low = 107802.33,
  price_open = 107802.33,
  volume = 49155377493,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-29', 1748476800, 105641.76, NULL, 105641.76, 105641.76, 105641.76, 56022752042, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105641.76,
  price_high = 105641.76,
  price_low = 105641.76,
  price_open = 105641.76,
  volume = 56022752042,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-30', 1748563200, 103998.57, NULL, 103998.57, 103998.57, 103998.57, 57655287183, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103998.57,
  price_high = 103998.57,
  price_low = 103998.57,
  price_open = 103998.57,
  volume = 57655287183,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-05-31', 1748649600, 104638.09, NULL, 104638.09, 104638.09, 104638.09, 38997843858, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104638.09,
  price_high = 104638.09,
  price_low = 104638.09,
  price_open = 104638.09,
  volume = 38997843858,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-01', 1748736000, 105652.10, NULL, 105652.10, 105652.10, 105652.10, 37397056873, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105652.10,
  price_high = 105652.10,
  price_low = 105652.10,
  price_open = 105652.10,
  volume = 37397056873,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-02', 1748822400, 105881.53, NULL, 105881.53, 105881.53, 105881.53, 45819706290, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105881.53,
  price_high = 105881.53,
  price_low = 105881.53,
  price_open = 105881.53,
  volume = 45819706290,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-03', 1748908800, 105432.47, NULL, 105432.47, 105432.47, 105432.47, 46196508367, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105432.47,
  price_high = 105432.47,
  price_low = 105432.47,
  price_open = 105432.47,
  volume = 46196508367,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-04', 1748995200, 104731.98, NULL, 104731.98, 104731.98, 104731.98, 44544857105, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104731.98,
  price_high = 104731.98,
  price_low = 104731.98,
  price_open = 104731.98,
  volume = 44544857105,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-05', 1749081600, 101575.95, NULL, 101575.95, 101575.95, 101575.95, 57479298400, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101575.95,
  price_high = 101575.95,
  price_low = 101575.95,
  price_open = 101575.95,
  volume = 57479298400,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-06', 1749168000, 104390.34, NULL, 104390.34, 104390.34, 104390.34, 48856653697, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104390.34,
  price_high = 104390.34,
  price_low = 104390.34,
  price_open = 104390.34,
  volume = 48856653697,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-07', 1749254400, 105615.63, NULL, 105615.63, 105615.63, 105615.63, 38365033776, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105615.63,
  price_high = 105615.63,
  price_low = 105615.63,
  price_open = 105615.63,
  volume = 38365033776,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-08', 1749340800, 105793.65, NULL, 105793.65, 105793.65, 105793.65, 36626232328, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105793.65,
  price_high = 105793.65,
  price_low = 105793.65,
  price_open = 105793.65,
  volume = 36626232328,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-09', 1749427200, 110294.10, NULL, 110294.10, 110294.10, 110294.10, 55903193732, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110294.10,
  price_high = 110294.10,
  price_low = 110294.10,
  price_open = 110294.10,
  volume = 55903193732,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-10', 1749513600, 110257.23, NULL, 110257.23, 110257.23, 110257.23, 54700101509, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110257.23,
  price_high = 110257.23,
  price_low = 110257.23,
  price_open = 110257.23,
  volume = 54700101509,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-11', 1749600000, 108686.63, NULL, 108686.63, 108686.63, 108686.63, 50842662052, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108686.63,
  price_high = 108686.63,
  price_low = 108686.63,
  price_open = 108686.63,
  volume = 50842662052,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-12', 1749686400, 105929.05, NULL, 105929.05, 105929.05, 105929.05, 54843867968, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105929.05,
  price_high = 105929.05,
  price_low = 105929.05,
  price_open = 105929.05,
  volume = 54843867968,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-13', 1749772800, 106090.97, NULL, 106090.97, 106090.97, 106090.97, 69550440846, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106090.97,
  price_high = 106090.97,
  price_low = 106090.97,
  price_open = 106090.97,
  volume = 69550440846,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-14', 1749859200, 105472.41, NULL, 105472.41, 105472.41, 105472.41, 38007870453, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105472.41,
  price_high = 105472.41,
  price_low = 105472.41,
  price_open = 105472.41,
  volume = 38007870453,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-15', 1749945600, 105552.02, NULL, 105552.02, 105552.02, 105552.02, 36744307742, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105552.02,
  price_high = 105552.02,
  price_low = 105552.02,
  price_open = 105552.02,
  volume = 36744307742,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-16', 1750032000, 106796.76, NULL, 106796.76, 106796.76, 106796.76, 50366626945, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106796.76,
  price_high = 106796.76,
  price_low = 106796.76,
  price_open = 106796.76,
  volume = 50366626945,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-17', 1750118400, 104601.12, NULL, 104601.12, 104601.12, 104601.12, 55964092176, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104601.12,
  price_high = 104601.12,
  price_low = 104601.12,
  price_open = 104601.12,
  volume = 55964092176,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-18', 1750204800, 104883.33, NULL, 104883.33, 104883.33, 104883.33, 47318089133, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104883.33,
  price_high = 104883.33,
  price_low = 104883.33,
  price_open = 104883.33,
  volume = 47318089133,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-19', 1750291200, 104684.29, NULL, 104684.29, 104684.29, 104684.29, 37333806920, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104684.29,
  price_high = 104684.29,
  price_low = 104684.29,
  price_open = 104684.29,
  volume = 37333806920,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-20', 1750377600, 103309.60, NULL, 103309.60, 103309.60, 103309.60, 50951862476, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103309.60,
  price_high = 103309.60,
  price_low = 103309.60,
  price_open = 103309.60,
  volume = 50951862476,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-21', 1750464000, 102257.41, NULL, 102257.41, 102257.41, 102257.41, 38360555118, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102257.41,
  price_high = 102257.41,
  price_low = 102257.41,
  price_open = 102257.41,
  volume = 38360555118,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-22', 1750550400, 100987.14, NULL, 100987.14, 100987.14, 100987.14, 65536997201, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 100987.14,
  price_high = 100987.14,
  price_low = 100987.14,
  price_open = 100987.14,
  volume = 65536997201,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-23', 1750636800, 105577.77, NULL, 105577.77, 105577.77, 105577.77, 65237759656, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105577.77,
  price_high = 105577.77,
  price_low = 105577.77,
  price_open = 105577.77,
  volume = 65237759656,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-24', 1750723200, 106045.63, NULL, 106045.63, 106045.63, 106045.63, 48822986421, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106045.63,
  price_high = 106045.63,
  price_low = 106045.63,
  price_open = 106045.63,
  volume = 48822986421,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-25', 1750809600, 107361.26, NULL, 107361.26, 107361.26, 107361.26, 51624120283, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107361.26,
  price_high = 107361.26,
  price_low = 107361.26,
  price_open = 107361.26,
  volume = 51624120283,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-26', 1750896000, 106960.00, NULL, 106960.00, 106960.00, 106960.00, 43891990613, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106960.00,
  price_high = 106960.00,
  price_low = 106960.00,
  price_open = 106960.00,
  volume = 43891990613,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-27', 1750982400, 107088.43, NULL, 107088.43, 107088.43, 107088.43, 45353692675, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107088.43,
  price_high = 107088.43,
  price_low = 107088.43,
  price_open = 107088.43,
  volume = 45353692675,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-28', 1751068800, 107327.70, NULL, 107327.70, 107327.70, 107327.70, 30037708335, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107327.70,
  price_high = 107327.70,
  price_low = 107327.70,
  price_open = 107327.70,
  volume = 30037708335,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-29', 1751155200, 108385.57, NULL, 108385.57, 108385.57, 108385.57, 35534874438, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108385.57,
  price_high = 108385.57,
  price_low = 108385.57,
  price_open = 108385.57,
  volume = 35534874438,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-06-30', 1751241600, 107135.34, NULL, 107135.34, 107135.34, 107135.34, 42064804590, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107135.34,
  price_high = 107135.34,
  price_low = 107135.34,
  price_open = 107135.34,
  volume = 42064804590,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-01', 1751328000, 105698.28, NULL, 105698.28, 105698.28, 105698.28, 44110692247, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105698.28,
  price_high = 105698.28,
  price_low = 105698.28,
  price_open = 105698.28,
  volume = 44110692247,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-02', 1751414400, 108859.32, NULL, 108859.32, 108859.32, 108859.32, 56248657737, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108859.32,
  price_high = 108859.32,
  price_low = 108859.32,
  price_open = 108859.32,
  volume = 56248657737,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-03', 1751500800, 109647.98, NULL, 109647.98, 109647.98, 109647.98, 50494742270, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109647.98,
  price_high = 109647.98,
  price_low = 109647.98,
  price_open = 109647.98,
  volume = 50494742270,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-04', 1751587200, 108034.34, NULL, 108034.34, 108034.34, 108034.34, 42616442656, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108034.34,
  price_high = 108034.34,
  price_low = 108034.34,
  price_open = 108034.34,
  volume = 42616442656,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-05', 1751673600, 108231.18, NULL, 108231.18, 108231.18, 108231.18, 30615537520, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108231.18,
  price_high = 108231.18,
  price_low = 108231.18,
  price_open = 108231.18,
  volume = 30615537520,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-06', 1751760000, 109232.07, NULL, 109232.07, 109232.07, 109232.07, 36746020463, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109232.07,
  price_high = 109232.07,
  price_low = 109232.07,
  price_open = 109232.07,
  volume = 36746020463,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-07', 1751846400, 108299.85, NULL, 108299.85, 108299.85, 108299.85, 45415696597, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108299.85,
  price_high = 108299.85,
  price_low = 108299.85,
  price_open = 108299.85,
  volume = 45415696597,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-08', 1751932800, 108950.27, NULL, 108950.27, 108950.27, 108950.27, 44282204127, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108950.27,
  price_high = 108950.27,
  price_low = 108950.27,
  price_open = 108950.27,
  volume = 44282204127,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-09', 1752019200, 111326.55, NULL, 111326.55, 111326.55, 111326.55, 57927418065, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111326.55,
  price_high = 111326.55,
  price_low = 111326.55,
  price_open = 111326.55,
  volume = 57927418065,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-10', 1752105600, 115987.20, NULL, 115987.20, 115987.20, 115987.20, 95911605728, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115987.20,
  price_high = 115987.20,
  price_low = 115987.20,
  price_open = 115987.20,
  volume = 95911605728,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-11', 1752192000, 117516.99, NULL, 117516.99, 117516.99, 117516.99, 86928361085, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117516.99,
  price_high = 117516.99,
  price_low = 117516.99,
  price_open = 117516.99,
  volume = 86928361085,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-12', 1752278400, 117435.23, NULL, 117435.23, 117435.23, 117435.23, 45524560304, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117435.23,
  price_high = 117435.23,
  price_low = 117435.23,
  price_open = 117435.23,
  volume = 45524560304,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-13', 1752364800, 119116.12, NULL, 119116.12, 119116.12, 119116.12, 49021091807, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119116.12,
  price_high = 119116.12,
  price_low = 119116.12,
  price_open = 119116.12,
  volume = 49021091807,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-14', 1752451200, 119849.70, NULL, 119849.70, 119849.70, 119849.70, 181746419401, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119849.70,
  price_high = 119849.70,
  price_low = 119849.70,
  price_open = 119849.70,
  volume = 181746419401,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-15', 1752537600, 117777.19, NULL, 117777.19, 117777.19, 117777.19, 98321661181, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117777.19,
  price_high = 117777.19,
  price_low = 117777.19,
  price_open = 117777.19,
  volume = 98321661181,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-16', 1752624000, 118738.51, NULL, 118738.51, 118738.51, 118738.51, 72162029070, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118738.51,
  price_high = 118738.51,
  price_low = 118738.51,
  price_open = 118738.51,
  volume = 72162029070,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-17', 1752710400, 119289.84, NULL, 119289.84, 119289.84, 119289.84, 72363841798, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119289.84,
  price_high = 119289.84,
  price_low = 119289.84,
  price_open = 119289.84,
  volume = 72363841798,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-18', 1752796800, 118003.23, NULL, 118003.23, 118003.23, 118003.23, 77945799785, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118003.23,
  price_high = 118003.23,
  price_low = 118003.23,
  price_open = 118003.23,
  volume = 77945799785,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-19', 1752883200, 117939.98, NULL, 117939.98, 117939.98, 117939.98, 47564562765, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117939.98,
  price_high = 117939.98,
  price_low = 117939.98,
  price_open = 117939.98,
  volume = 47564562765,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-20', 1752969600, 117300.79, NULL, 117300.79, 117300.79, 117300.79, 57515447231, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117300.79,
  price_high = 117300.79,
  price_low = 117300.79,
  price_open = 117300.79,
  volume = 57515447231,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-21', 1753056000, 117439.54, NULL, 117439.54, 117439.54, 117439.54, 69820091744, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117439.54,
  price_high = 117439.54,
  price_low = 117439.54,
  price_open = 117439.54,
  volume = 69820091744,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-22', 1753142400, 119995.41, NULL, 119995.41, 119995.41, 119995.41, 79217583118, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119995.41,
  price_high = 119995.41,
  price_low = 119995.41,
  price_open = 119995.41,
  volume = 79217583118,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-23', 1753228800, 118754.96, NULL, 118754.96, 118754.96, 118754.96, 66608604537, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118754.96,
  price_high = 118754.96,
  price_low = 118754.96,
  price_open = 118754.96,
  volume = 66608604537,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-24', 1753315200, 118368.00, NULL, 118368.00, 118368.00, 118368.00, 72627318560, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118368.00,
  price_high = 118368.00,
  price_low = 118368.00,
  price_open = 118368.00,
  volume = 72627318560,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-25', 1753401600, 117635.88, NULL, 117635.88, 117635.88, 117635.88, 104857024569, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117635.88,
  price_high = 117635.88,
  price_low = 117635.88,
  price_open = 117635.88,
  volume = 104857024569,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-26', 1753488000, 117947.37, NULL, 117947.37, 117947.37, 117947.37, 48508954046, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117947.37,
  price_high = 117947.37,
  price_low = 117947.37,
  price_open = 117947.37,
  volume = 48508954046,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-27', 1753574400, 119448.49, NULL, 119448.49, 119448.49, 119448.49, 54683390892, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119448.49,
  price_high = 119448.49,
  price_low = 119448.49,
  price_open = 119448.49,
  volume = 54683390892,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-28', 1753660800, 117924.48, NULL, 117924.48, 117924.48, 117924.48, 64822943193, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117924.48,
  price_high = 117924.48,
  price_low = 117924.48,
  price_open = 117924.48,
  volume = 64822943193,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-29', 1753747200, 117922.15, NULL, 117922.15, 117922.15, 117922.15, 68463107433, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117922.15,
  price_high = 117922.15,
  price_low = 117922.15,
  price_open = 117922.15,
  volume = 68463107433,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-30', 1753833600, 117831.19, NULL, 117831.19, 117831.19, 117831.19, 68896148592, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117831.19,
  price_high = 117831.19,
  price_low = 117831.19,
  price_open = 117831.19,
  volume = 68896148592,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-07-31', 1753920000, 115758.20, NULL, 115758.20, 115758.20, 115758.20, 69370346018, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115758.20,
  price_high = 115758.20,
  price_low = 115758.20,
  price_open = 115758.20,
  volume = 69370346018,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-01', 1754006400, 113320.09, NULL, 113320.09, 113320.09, 113320.09, 91294530181, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113320.09,
  price_high = 113320.09,
  price_low = 113320.09,
  price_open = 113320.09,
  volume = 91294530181,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-02', 1754092800, 112526.91, NULL, 112526.91, 112526.91, 112526.91, 56870866000, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112526.91,
  price_high = 112526.91,
  price_low = 112526.91,
  price_open = 112526.91,
  volume = 56870866000,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-03', 1754179200, 114217.67, NULL, 114217.67, 114217.67, 114217.67, 48099615826, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114217.67,
  price_high = 114217.67,
  price_low = 114217.67,
  price_open = 114217.67,
  volume = 48099615826,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-04', 1754265600, 115071.88, NULL, 115071.88, 115071.88, 115071.88, 35783028986, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115071.88,
  price_high = 115071.88,
  price_low = 115071.88,
  price_open = 115071.88,
  volume = 35783028986,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-05', 1754352000, 114141.45, NULL, 114141.45, 114141.45, 114141.45, 61039182286, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114141.45,
  price_high = 114141.45,
  price_low = 114141.45,
  price_open = 114141.45,
  volume = 61039182286,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-06', 1754438400, 115028.00, NULL, 115028.00, 115028.00, 115028.00, 56379133510, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115028.00,
  price_high = 115028.00,
  price_low = 115028.00,
  price_open = 115028.00,
  volume = 56379133510,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-07', 1754524800, 117496.90, NULL, 117496.90, 117496.90, 117496.90, 64051649681, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117496.90,
  price_high = 117496.90,
  price_low = 117496.90,
  price_open = 117496.90,
  volume = 64051649681,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-08', 1754611200, 116688.73, NULL, 116688.73, 116688.73, 116688.73, 59713005166, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116688.73,
  price_high = 116688.73,
  price_low = 116688.73,
  price_open = 116688.73,
  volume = 59713005166,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-09', 1754697600, 116500.36, NULL, 116500.36, 116500.36, 116500.36, 54004312429, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116500.36,
  price_high = 116500.36,
  price_low = 116500.36,
  price_open = 116500.36,
  volume = 54004312429,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-10', 1754784000, 119306.76, NULL, 119306.76, 119306.76, 119306.76, 64755458694, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 119306.76,
  price_high = 119306.76,
  price_low = 119306.76,
  price_open = 119306.76,
  volume = 64755458694,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-11', 1754870400, 118731.45, NULL, 118731.45, 118731.45, 118731.45, 90528784177, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118731.45,
  price_high = 118731.45,
  price_low = 118731.45,
  price_open = 118731.45,
  volume = 90528784177,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-12', 1754956800, 120172.91, NULL, 120172.91, 120172.91, 120172.91, 72803657984, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 120172.91,
  price_high = 120172.91,
  price_low = 120172.91,
  price_open = 120172.91,
  volume = 72803657984,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-13', 1755043200, 123344.06, NULL, 123344.06, 123344.06, 123344.06, 90904808795, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 123344.06,
  price_high = 123344.06,
  price_low = 123344.06,
  price_open = 123344.06,
  volume = 90904808795,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-14', 1755129600, 118359.58, NULL, 118359.58, 118359.58, 118359.58, 104055627395, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118359.58,
  price_high = 118359.58,
  price_low = 118359.58,
  price_open = 118359.58,
  volume = 104055627395,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-15', 1755216000, 117398.35, NULL, 117398.35, 117398.35, 117398.35, 68665353159, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117398.35,
  price_high = 117398.35,
  price_low = 117398.35,
  price_open = 117398.35,
  volume = 68665353159,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-16', 1755302400, 117491.35, NULL, 117491.35, 117491.35, 117491.35, 48036922378, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117491.35,
  price_high = 117491.35,
  price_low = 117491.35,
  price_open = 117491.35,
  volume = 48036922378,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-17', 1755388800, 117453.06, NULL, 117453.06, 117453.06, 117453.06, 45852169525, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117453.06,
  price_high = 117453.06,
  price_low = 117453.06,
  price_open = 117453.06,
  volume = 45852169525,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-18', 1755475200, 116252.31, NULL, 116252.31, 116252.31, 116252.31, 72787808090, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116252.31,
  price_high = 116252.31,
  price_low = 116252.31,
  price_open = 116252.31,
  volume = 72787808090,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-19', 1755561600, 112831.18, NULL, 112831.18, 112831.18, 112831.18, 71657600353, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112831.18,
  price_high = 112831.18,
  price_low = 112831.18,
  price_open = 112831.18,
  volume = 71657600353,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-20', 1755648000, 114274.74, NULL, 114274.74, 114274.74, 114274.74, 67993811526, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114274.74,
  price_high = 114274.74,
  price_low = 114274.74,
  price_open = 114274.74,
  volume = 67993811526,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-21', 1755734400, 112419.03, NULL, 112419.03, 112419.03, 112419.03, 57817883700, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112419.03,
  price_high = 112419.03,
  price_low = 112419.03,
  price_open = 112419.03,
  volume = 57817883700,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-22', 1755820800, 116874.09, NULL, 116874.09, 116874.09, 116874.09, 82528088240, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116874.09,
  price_high = 116874.09,
  price_low = 116874.09,
  price_open = 116874.09,
  volume = 82528088240,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-23', 1755907200, 115374.33, NULL, 115374.33, 115374.33, 115374.33, 55377142586, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115374.33,
  price_high = 115374.33,
  price_low = 115374.33,
  price_open = 115374.33,
  volume = 55377142586,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-24', 1755993600, 113458.43, NULL, 113458.43, 113458.43, 113458.43, 73961489632, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113458.43,
  price_high = 113458.43,
  price_low = 113458.43,
  price_open = 113458.43,
  volume = 73961489632,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-25', 1756080000, 110124.35, NULL, 110124.35, 110124.35, 110124.35, 85706860190, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110124.35,
  price_high = 110124.35,
  price_low = 110124.35,
  price_open = 110124.35,
  volume = 85706860190,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-26', 1756166400, 111802.66, NULL, 111802.66, 111802.66, 111802.66, 69396320317, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111802.66,
  price_high = 111802.66,
  price_low = 111802.66,
  price_open = 111802.66,
  volume = 69396320317,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-27', 1756252800, 111222.06, NULL, 111222.06, 111222.06, 111222.06, 62137056409, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111222.06,
  price_high = 111222.06,
  price_low = 111222.06,
  price_open = 111222.06,
  volume = 62137056409,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-28', 1756339200, 112544.80, NULL, 112544.80, 112544.80, 112544.80, 58860155962, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112544.80,
  price_high = 112544.80,
  price_low = 112544.80,
  price_open = 112544.80,
  volume = 58860155962,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-29', 1756425600, 108410.84, NULL, 108410.84, 108410.84, 108410.84, 77843379644, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108410.84,
  price_high = 108410.84,
  price_low = 108410.84,
  price_open = 108410.84,
  volume = 77843379644,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-30', 1756512000, 108808.07, NULL, 108808.07, 108808.07, 108808.07, 51486264208, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108808.07,
  price_high = 108808.07,
  price_low = 108808.07,
  price_open = 108808.07,
  volume = 51486264208,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-08-31', 1756598400, 108236.71, NULL, 108236.71, 108236.71, 108236.71, 47986191770, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108236.71,
  price_high = 108236.71,
  price_low = 108236.71,
  price_open = 108236.71,
  volume = 47986191770,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-01', 1756684800, 109250.59, NULL, 109250.59, 109250.59, 109250.59, 66870372995, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109250.59,
  price_high = 109250.59,
  price_low = 109250.59,
  price_open = 109250.59,
  volume = 66870372995,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-02', 1756771200, 111200.59, NULL, 111200.59, 111200.59, 111200.59, 74776999491, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111200.59,
  price_high = 111200.59,
  price_low = 111200.59,
  price_open = 111200.59,
  volume = 74776999491,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-03', 1756857600, 111723.21, NULL, 111723.21, 111723.21, 111723.21, 61119643565, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111723.21,
  price_high = 111723.21,
  price_low = 111723.21,
  price_open = 111723.21,
  volume = 61119643565,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-04', 1756944000, 110723.60, NULL, 110723.60, 110723.60, 110723.60, 60131132901, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110723.60,
  price_high = 110723.60,
  price_low = 110723.60,
  price_open = 110723.60,
  volume = 60131132901,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-05', 1757030400, 110650.98, NULL, 110650.98, 110650.98, 110650.98, 60241647677, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110650.98,
  price_high = 110650.98,
  price_low = 110650.98,
  price_open = 110650.98,
  volume = 60241647677,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-06', 1757116800, 110224.70, NULL, 110224.70, 110224.70, 110224.70, 21500719036, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110224.70,
  price_high = 110224.70,
  price_low = 110224.70,
  price_open = 110224.70,
  volume = 21500719036,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-07', 1757203200, 111167.62, NULL, 111167.62, 111167.62, 111167.62, 24618007520, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111167.62,
  price_high = 111167.62,
  price_low = 111167.62,
  price_open = 111167.62,
  volume = 24618007520,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-08', 1757289600, 112071.43, NULL, 112071.43, 112071.43, 112071.43, 40212813407, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112071.43,
  price_high = 112071.43,
  price_low = 112071.43,
  price_open = 112071.43,
  volume = 40212813407,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-09', 1757376000, 111530.55, NULL, 111530.55, 111530.55, 111530.55, 45984480722, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111530.55,
  price_high = 111530.55,
  price_low = 111530.55,
  price_open = 111530.55,
  volume = 45984480722,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-10', 1757462400, 113955.36, NULL, 113955.36, 113955.36, 113955.36, 56377473784, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113955.36,
  price_high = 113955.36,
  price_low = 113955.36,
  price_open = 113955.36,
  volume = 56377473784,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-11', 1757548800, 115507.54, NULL, 115507.54, 115507.54, 115507.54, 45685065332, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115507.54,
  price_high = 115507.54,
  price_low = 115507.54,
  price_open = 115507.54,
  volume = 45685065332,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-12', 1757635200, 116101.58, NULL, 116101.58, 116101.58, 116101.58, 54785725894, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116101.58,
  price_high = 116101.58,
  price_low = 116101.58,
  price_open = 116101.58,
  volume = 54785725894,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-13', 1757721600, 115950.51, NULL, 115950.51, 115950.51, 115950.51, 34549454947, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115950.51,
  price_high = 115950.51,
  price_low = 115950.51,
  price_open = 115950.51,
  volume = 34549454947,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-14', 1757808000, 115407.66, NULL, 115407.66, 115407.66, 115407.66, 32798036057, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115407.66,
  price_high = 115407.66,
  price_low = 115407.66,
  price_open = 115407.66,
  volume = 32798036057,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-15', 1757894400, 115444.88, NULL, 115444.88, 115444.88, 115444.88, 52937859416, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115444.88,
  price_high = 115444.88,
  price_low = 115444.88,
  price_open = 115444.88,
  volume = 52937859416,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-16', 1757980800, 116843.19, NULL, 116843.19, 116843.19, 116843.19, 45781744593, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116843.19,
  price_high = 116843.19,
  price_low = 116843.19,
  price_open = 116843.19,
  volume = 45781744593,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-17', 1758067200, 116468.51, NULL, 116468.51, 116468.51, 116468.51, 60528025996, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 116468.51,
  price_high = 116468.51,
  price_low = 116468.51,
  price_open = 116468.51,
  volume = 60528025996,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-18', 1758153600, 117137.20, NULL, 117137.20, 117137.20, 117137.20, 49457272032, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 117137.20,
  price_high = 117137.20,
  price_low = 117137.20,
  price_open = 117137.20,
  volume = 49457272032,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-19', 1758240000, 115688.86, NULL, 115688.86, 115688.86, 115688.86, 38828473971, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115688.86,
  price_high = 115688.86,
  price_low = 115688.86,
  price_open = 115688.86,
  volume = 38828473971,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-20', 1758326400, 115721.96, NULL, 115721.96, 115721.96, 115721.96, 22864449614, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115721.96,
  price_high = 115721.96,
  price_low = 115721.96,
  price_open = 115721.96,
  volume = 22864449614,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-21', 1758412800, 115306.09, NULL, 115306.09, 115306.09, 115306.09, 22495852193, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115306.09,
  price_high = 115306.09,
  price_low = 115306.09,
  price_open = 115306.09,
  volume = 22495852193,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-22', 1758499200, 112748.51, NULL, 112748.51, 112748.51, 112748.51, 70684158591, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112748.51,
  price_high = 112748.51,
  price_low = 112748.51,
  price_open = 112748.51,
  volume = 70684158591,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-23', 1758585600, 112014.50, NULL, 112014.50, 112014.50, 112014.50, 47211853279, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112014.50,
  price_high = 112014.50,
  price_low = 112014.50,
  price_open = 112014.50,
  volume = 47211853279,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-24', 1758672000, 113328.63, NULL, 113328.63, 113328.63, 113328.63, 48044595085, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113328.63,
  price_high = 113328.63,
  price_low = 113328.63,
  price_open = 113328.63,
  volume = 48044595085,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-25', 1758758400, 109049.29, NULL, 109049.29, 109049.29, 109049.29, 75528654284, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109049.29,
  price_high = 109049.29,
  price_low = 109049.29,
  price_open = 109049.29,
  volume = 75528654284,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-26', 1758844800, 109712.83, NULL, 109712.83, 109712.83, 109712.83, 57738288949, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109712.83,
  price_high = 109712.83,
  price_low = 109712.83,
  price_open = 109712.83,
  volume = 57738288949,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-27', 1758931200, 109681.95, NULL, 109681.95, 109681.95, 109681.95, 26308042910, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109681.95,
  price_high = 109681.95,
  price_low = 109681.95,
  price_open = 109681.95,
  volume = 26308042910,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-28', 1759017600, 112122.64, NULL, 112122.64, 112122.64, 112122.64, 33371048505, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112122.64,
  price_high = 112122.64,
  price_low = 112122.64,
  price_open = 112122.64,
  volume = 33371048505,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-29', 1759104000, 114400.38, NULL, 114400.38, 114400.38, 114400.38, 60000147466, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114400.38,
  price_high = 114400.38,
  price_low = 114400.38,
  price_open = 114400.38,
  volume = 60000147466,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-09-30', 1759190400, 114056.09, NULL, 114056.09, 114056.09, 114056.09, 58986330258, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114056.09,
  price_high = 114056.09,
  price_low = 114056.09,
  price_open = 114056.09,
  volume = 58986330258,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-01', 1759276800, 118648.93, NULL, 118648.93, 118648.93, 118648.93, 71328680132, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 118648.93,
  price_high = 118648.93,
  price_low = 118648.93,
  price_open = 118648.93,
  volume = 71328680132,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-02', 1759363200, 120681.26, NULL, 120681.26, 120681.26, 120681.26, 71415163912, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 120681.26,
  price_high = 120681.26,
  price_low = 120681.26,
  price_open = 120681.26,
  volume = 71415163912,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-03', 1759449600, 122266.53, NULL, 122266.53, 122266.53, 122266.53, 83941392228, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 122266.53,
  price_high = 122266.53,
  price_low = 122266.53,
  price_open = 122266.53,
  volume = 83941392228,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-04', 1759536000, 122425.43, NULL, 122425.43, 122425.43, 122425.43, 36769171735, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 122425.43,
  price_high = 122425.43,
  price_low = 122425.43,
  price_open = 122425.43,
  volume = 36769171735,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-05', 1759622400, 123513.48, NULL, 123513.48, 123513.48, 123513.48, 73689317763, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 123513.48,
  price_high = 123513.48,
  price_low = 123513.48,
  price_open = 123513.48,
  volume = 73689317763,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-06', 1759708800, 124752.53, NULL, 124752.53, 124752.53, 124752.53, 72568881188, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 124752.53,
  price_high = 124752.53,
  price_low = 124752.53,
  price_open = 124752.53,
  volume = 72568881188,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-07', 1759795200, 121451.38, NULL, 121451.38, 121451.38, 121451.38, 76149412513, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 121451.38,
  price_high = 121451.38,
  price_low = 121451.38,
  price_open = 121451.38,
  volume = 76149412513,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-08', 1759881600, 123354.87, NULL, 123354.87, 123354.87, 123354.87, 65354305286, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 123354.87,
  price_high = 123354.87,
  price_low = 123354.87,
  price_open = 123354.87,
  volume = 65354305286,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-09', 1759968000, 121705.59, NULL, 121705.59, 121705.59, 121705.59, 74653009425, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 121705.59,
  price_high = 121705.59,
  price_low = 121705.59,
  price_open = 121705.59,
  volume = 74653009425,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-10', 1760054400, 113214.37, NULL, 113214.37, 113214.37, 113214.37, 153125018868, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113214.37,
  price_high = 113214.37,
  price_low = 113214.37,
  price_open = 113214.37,
  volume = 153125018868,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-11', 1760140800, 110807.88, NULL, 110807.88, 110807.88, 110807.88, 110236934340, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110807.88,
  price_high = 110807.88,
  price_low = 110807.88,
  price_open = 110807.88,
  volume = 110236934340,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-12', 1760227200, 115169.77, NULL, 115169.77, 115169.77, 115169.77, 93710414091, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115169.77,
  price_high = 115169.77,
  price_low = 115169.77,
  price_open = 115169.77,
  volume = 93710414091,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-13', 1760313600, 115271.08, NULL, 115271.08, 115271.08, 115271.08, 71582026739, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 115271.08,
  price_high = 115271.08,
  price_low = 115271.08,
  price_open = 115271.08,
  volume = 71582026739,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-14', 1760400000, 113118.66, NULL, 113118.66, 113118.66, 113118.66, 92212917403, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 113118.66,
  price_high = 113118.66,
  price_low = 113118.66,
  price_open = 113118.66,
  volume = 92212917403,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-15', 1760486400, 110783.16, NULL, 110783.16, 110783.16, 110783.16, 72574132855, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110783.16,
  price_high = 110783.16,
  price_low = 110783.16,
  price_open = 110783.16,
  volume = 72574132855,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-16', 1760572800, 108186.04, NULL, 108186.04, 108186.04, 108186.04, 87306423067, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108186.04,
  price_high = 108186.04,
  price_low = 108186.04,
  price_open = 108186.04,
  volume = 87306423067,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-17', 1760659200, 106467.79, NULL, 106467.79, 106467.79, 106467.79, 99703051669, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106467.79,
  price_high = 106467.79,
  price_low = 106467.79,
  price_open = 106467.79,
  volume = 99703051669,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-18', 1760745600, 107198.27, NULL, 107198.27, 107198.27, 107198.27, 37779905278, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107198.27,
  price_high = 107198.27,
  price_low = 107198.27,
  price_open = 107198.27,
  volume = 37779905278,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-19', 1760832000, 108666.71, NULL, 108666.71, 108666.71, 108666.71, 47657008953, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108666.71,
  price_high = 108666.71,
  price_low = 108666.71,
  price_open = 108666.71,
  volume = 47657008953,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-20', 1760918400, 110588.93, NULL, 110588.93, 110588.93, 110588.93, 63507793085, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110588.93,
  price_high = 110588.93,
  price_low = 110588.93,
  price_open = 110588.93,
  volume = 63507793085,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-21', 1761004800, 108476.89, NULL, 108476.89, 108476.89, 108476.89, 101194375480, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108476.89,
  price_high = 108476.89,
  price_low = 108476.89,
  price_open = 108476.89,
  volume = 101194375480,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-22', 1761091200, 107688.59, NULL, 107688.59, 107688.59, 107688.59, 80807013218, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 107688.59,
  price_high = 107688.59,
  price_low = 107688.59,
  price_open = 107688.59,
  volume = 80807013218,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-23', 1761177600, 110069.73, NULL, 110069.73, 110069.73, 110069.73, 54944076060, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110069.73,
  price_high = 110069.73,
  price_low = 110069.73,
  price_open = 110069.73,
  volume = 54944076060,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-24', 1761264000, 111033.92, NULL, 111033.92, 111033.92, 111033.92, 48160816980, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111033.92,
  price_high = 111033.92,
  price_low = 111033.92,
  price_open = 111033.92,
  volume = 48160816980,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-25', 1761350400, 111641.73, NULL, 111641.73, 111641.73, 111641.73, 24707667305, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 111641.73,
  price_high = 111641.73,
  price_low = 111641.73,
  price_open = 111641.73,
  volume = 24707667305,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-26', 1761436800, 114472.45, NULL, 114472.45, 114472.45, 114472.45, 41708524143, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114472.45,
  price_high = 114472.45,
  price_low = 114472.45,
  price_open = 114472.45,
  volume = 41708524143,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-27', 1761523200, 114119.33, NULL, 114119.33, 114119.33, 114119.33, 61761358733, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 114119.33,
  price_high = 114119.33,
  price_low = 114119.33,
  price_open = 114119.33,
  volume = 61761358733,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-28', 1761609600, 112956.16, NULL, 112956.16, 112956.16, 112956.16, 64528066504, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 112956.16,
  price_high = 112956.16,
  price_low = 112956.16,
  price_open = 112956.16,
  volume = 64528066504,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-29', 1761696000, 110055.30, NULL, 110055.30, 110055.30, 110055.30, 62192043469, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110055.30,
  price_high = 110055.30,
  price_low = 110055.30,
  price_open = 110055.30,
  volume = 62192043469,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-30', 1761782400, 108305.55, NULL, 108305.55, 108305.55, 108305.55, 69673964814, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 108305.55,
  price_high = 108305.55,
  price_low = 108305.55,
  price_open = 108305.55,
  volume = 69673964814,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-10-31', 1761868800, 109556.16, NULL, 109556.16, 109556.16, 109556.16, 60090359560, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 109556.16,
  price_high = 109556.16,
  price_low = 109556.16,
  price_open = 109556.16,
  volume = 60090359560,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-01', 1761955200, 110064.02, NULL, 110064.02, 110064.02, 110064.02, 25871668762, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110064.02,
  price_high = 110064.02,
  price_low = 110064.02,
  price_open = 110064.02,
  volume = 25871668762,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-02', 1762041600, 110639.63, NULL, 110639.63, 110639.63, 110639.63, 34284209459, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 110639.63,
  price_high = 110639.63,
  price_low = 110639.63,
  price_open = 110639.63,
  volume = 34284209459,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-03', 1762128000, 106547.52, NULL, 106547.52, 106547.52, 106547.52, 72852006359, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 106547.52,
  price_high = 106547.52,
  price_low = 106547.52,
  price_open = 106547.52,
  volume = 72852006359,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-04', 1762214400, 101590.52, NULL, 101590.52, 101590.52, 101590.52, 110967184773, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101590.52,
  price_high = 101590.52,
  price_low = 101590.52,
  price_open = 101590.52,
  volume = 110967184773,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-05', 1762300800, 103891.84, NULL, 103891.84, 103891.84, 103891.84, 77584934804, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103891.84,
  price_high = 103891.84,
  price_low = 103891.84,
  price_open = 103891.84,
  volume = 77584934804,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-06', 1762387200, 101301.29, NULL, 101301.29, 101301.29, 101301.29, 63932752861, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101301.29,
  price_high = 101301.29,
  price_low = 101301.29,
  price_open = 101301.29,
  volume = 63932752861,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-07', 1762473600, 103372.41, NULL, 103372.41, 103372.41, 103372.41, 92168030081, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 103372.41,
  price_high = 103372.41,
  price_low = 103372.41,
  price_open = 103372.41,
  volume = 92168030081,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-08', 1762560000, 102282.12, NULL, 102282.12, 102282.12, 102282.12, 51446691095, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102282.12,
  price_high = 102282.12,
  price_low = 102282.12,
  price_open = 102282.12,
  volume = 51446691095,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-09', 1762646400, 104719.64, NULL, 104719.64, 104719.64, 104719.64, 59679243013, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 104719.64,
  price_high = 104719.64,
  price_low = 104719.64,
  price_open = 104719.64,
  volume = 59679243013,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-10', 1762732800, 105996.59, NULL, 105996.59, 105996.59, 105996.59, 69585887229, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 105996.59,
  price_high = 105996.59,
  price_low = 105996.59,
  price_open = 105996.59,
  volume = 69585887229,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-11', 1762819200, 102997.47, NULL, 102997.47, 102997.47, 102997.47, 71130078574, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 102997.47,
  price_high = 102997.47,
  price_low = 102997.47,
  price_open = 102997.47,
  volume = 71130078574,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-12', 1762905600, 101663.19, NULL, 101663.19, 101663.19, 101663.19, 64347179408, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 101663.19,
  price_high = 101663.19,
  price_low = 101663.19,
  price_open = 101663.19,
  volume = 64347179408,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-13', 1762992000, 99697.49, NULL, 99697.49, 99697.49, 99697.49, 101546815416, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 99697.49,
  price_high = 99697.49,
  price_low = 99697.49,
  price_open = 99697.49,
  volume = 101546815416,
  year = 2025,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2025-11-15', 1763165520, 95093.25, NULL, 95093.25, 95093.25, 95093.25, 114121752576, 2025, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 95093.25,
  price_high = 95093.25,
  price_low = 95093.25,
  price_open = 95093.25,
  volume = 114121752576,
  year = 2025,
  updated_at = NOW();

-- RE-ENABLE TRIGGERS
ALTER TABLE bitcoin_price_data ENABLE TRIGGER ALL;

-- VERIFY
SELECT COUNT(*) as total_records FROM bitcoin_price_data;
SELECT MIN(date) as oldest_date, MAX(date) as newest_date FROM bitcoin_price_data WHERE date >= '2024-09-17';
