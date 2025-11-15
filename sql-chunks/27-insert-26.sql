INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-18', 1518912000, 10551.80, 11349.80, 10326.00, 11123.40, 8744009728, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10551.80,
  price_high = 11349.80,
  price_low = 10326.00,
  price_open = 11123.40,
  volume = 8744009728,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-19', 1518998400, 11225.30, 11273.80, 10513.20, 10552.60, 7652089856, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11225.30,
  price_high = 11273.80,
  price_low = 10513.20,
  price_open = 10552.60,
  volume = 7652089856,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-20', 1519084800, 11403.70, 11958.50, 11231.80, 11231.80, 9926540288, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11403.70,
  price_high = 11958.50,
  price_low = 11231.80,
  price_open = 11231.80,
  volume = 9926540288,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-21', 1519171200, 10690.40, 11418.50, 10479.10, 11372.20, 9405339648, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10690.40,
  price_high = 11418.50,
  price_low = 10479.10,
  price_open = 11372.20,
  volume = 9405339648,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-22', 1519257600, 10005.00, 11039.10, 9939.09, 10660.40, 8040079872, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10005.00,
  price_high = 11039.10,
  price_low = 9939.09,
  price_open = 10660.40,
  volume = 8040079872,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-23', 1519344000, 10301.10, 10487.30, 9734.56, 9937.07, 7739500032, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10301.10,
  price_high = 10487.30,
  price_low = 9734.56,
  price_open = 9937.07,
  volume = 7739500032,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-24', 1519430400, 9813.07, 10597.20, 9546.97, 10287.70, 6917929984, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9813.07,
  price_high = 10597.20,
  price_low = 9546.97,
  price_open = 10287.70,
  volume = 6917929984,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-25', 1519516800, 9664.73, 9923.22, 9407.06, 9796.42, 5706939904, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9664.73,
  price_high = 9923.22,
  price_low = 9407.06,
  price_open = 9796.42,
  volume = 5706939904,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-26', 1519603200, 10366.70, 10475.00, 9501.73, 9669.43, 7287690240, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10366.70,
  price_high = 10475.00,
  price_low = 9501.73,
  price_open = 9669.43,
  volume = 7287690240,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-27', 1519689600, 10725.60, 10878.50, 10246.10, 10393.90, 6966179840, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10725.60,
  price_high = 10878.50,
  price_low = 10246.10,
  price_open = 10393.90,
  volume = 6966179840,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-28', 1519776000, 10397.90, 11089.80, 10393.10, 10687.20, 6936189952, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10397.90,
  price_high = 11089.80,
  price_low = 10393.10,
  price_open = 10687.20,
  volume = 6936189952,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-01', 1519862400, 10951.00, 11052.30, 10352.70, 10385.00, 7317279744, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10951.00,
  price_high = 11052.30,
  price_low = 10352.70,
  price_open = 10385.00,
  volume = 7317279744,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-02', 1519948800, 11086.40, 11189.00, 10850.10, 10977.40, 7620590080, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11086.40,
  price_high = 11189.00,
  price_low = 10850.10,
  price_open = 10977.40,
  volume = 7620590080,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-03', 1520035200, 11489.70, 11528.20, 11002.40, 11101.90, 6690570240, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11489.70,
  price_high = 11528.20,
  price_low = 11002.40,
  price_open = 11101.90,
  volume = 6690570240,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-04', 1520121600, 11512.60, 11512.60, 11136.10, 11497.40, 6084149760, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11512.60,
  price_high = 11512.60,
  price_low = 11136.10,
  price_open = 11497.40,
  volume = 6084149760,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-05', 1520208000, 11573.30, 11704.10, 11443.90, 11532.40, 6468539904, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11573.30,
  price_high = 11704.10,
  price_low = 11443.90,
  price_open = 11532.40,
  volume = 6468539904,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-06', 1520294400, 10779.90, 11500.10, 10694.30, 11500.10, 6832169984, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10779.90,
  price_high = 11500.10,
  price_low = 10694.30,
  price_open = 11500.10,
  volume = 6832169984,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-07', 1520380800, 9965.57, 10929.50, 9692.12, 10803.90, 8797910016, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9965.57,
  price_high = 10929.50,
  price_low = 9692.12,
  price_open = 10803.90,
  volume = 8797910016,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-08', 1520467200, 9395.01, 10147.40, 9335.87, 9951.44, 7186089984, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9395.01,
  price_high = 10147.40,
  price_low = 9335.87,
  price_open = 9951.44,
  volume = 7186089984,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-09', 1520553600, 9337.55, 9466.35, 8513.03, 9414.69, 8704190464, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9337.55,
  price_high = 9466.35,
  price_low = 8513.03,
  price_open = 9414.69,
  volume = 8704190464,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-10', 1520640000, 8866.00, 9531.32, 8828.47, 9350.59, 5386319872, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8866.00,
  price_high = 9531.32,
  price_low = 8828.47,
  price_open = 9350.59,
  volume = 5386319872,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-11', 1520726400, 9578.63, 9711.89, 8607.12, 8852.78, 6296370176, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9578.63,
  price_high = 9711.89,
  price_low = 8607.12,
  price_open = 8852.78,
  volume = 6296370176,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-12', 1520812800, 9205.12, 9937.50, 8956.43, 9602.93, 6457399808, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9205.12,
  price_high = 9937.50,
  price_low = 8956.43,
  price_open = 9602.93,
  volume = 6457399808,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-13', 1520899200, 9194.85, 9470.38, 8958.19, 9173.04, 5991139840, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9194.85,
  price_high = 9470.38,
  price_low = 8958.19,
  price_open = 9173.04,
  volume = 5991139840,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-14', 1520985600, 8269.81, 9355.85, 8068.59, 9214.65, 6438230016, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8269.81,
  price_high = 9355.85,
  price_low = 8068.59,
  price_open = 9214.65,
  volume = 6438230016,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-15', 1521072000, 8300.86, 8428.35, 7783.05, 8290.76, 6834429952, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8300.86,
  price_high = 8428.35,
  price_low = 7783.05,
  price_open = 8290.76,
  volume = 6834429952,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-16', 1521158400, 8338.35, 8585.15, 8005.31, 8322.91, 5289379840, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8338.35,
  price_high = 8585.15,
  price_low = 8005.31,
  price_open = 8322.91,
  volume = 5289379840,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-17', 1521244800, 7916.88, 8346.53, 7812.82, 8321.91, 4426149888, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7916.88,
  price_high = 8346.53,
  price_low = 7812.82,
  price_open = 8321.91,
  volume = 4426149888,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-18', 1521331200, 8223.68, 8245.51, 7397.99, 7890.52, 6639190016, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8223.68,
  price_high = 8245.51,
  price_low = 7397.99,
  price_open = 7890.52,
  volume = 6639190016,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-19', 1521417600, 8630.65, 8675.87, 8182.40, 8344.12, 6729110016, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8630.65,
  price_high = 8675.87,
  price_low = 8182.40,
  price_open = 8344.12,
  volume = 6729110016,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-20', 1521504000, 8913.47, 9051.02, 8389.89, 8619.67, 6361789952, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8913.47,
  price_high = 9051.02,
  price_low = 8389.89,
  price_open = 8619.67,
  volume = 6361789952,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-21', 1521590400, 8929.28, 9177.37, 8846.33, 8937.48, 6043129856, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8929.28,
  price_high = 9177.37,
  price_low = 8846.33,
  price_open = 8937.48,
  volume = 6043129856,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-22', 1521676800, 8728.47, 9100.71, 8564.90, 8939.44, 5530390016, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8728.47,
  price_high = 9100.71,
  price_low = 8564.90,
  price_open = 8939.44,
  volume = 5530390016,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-23', 1521763200, 8879.62, 8879.62, 8360.62, 8736.25, 5954120192, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8879.62,
  price_high = 8879.62,
  price_low = 8360.62,
  price_open = 8736.25,
  volume = 5954120192,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-24', 1521849600, 8668.12, 8996.18, 8665.70, 8901.95, 5664600064, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8668.12,
  price_high = 8996.18,
  price_low = 8665.70,
  price_open = 8901.95,
  volume = 5664600064,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-25', 1521936000, 8495.78, 8682.01, 8449.10, 8612.81, 4569880064, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8495.78,
  price_high = 8682.01,
  price_low = 8449.10,
  price_open = 8612.81,
  volume = 4569880064,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-26', 1522022400, 8209.40, 8530.08, 7921.43, 8498.47, 5921039872, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8209.40,
  price_high = 8530.08,
  price_low = 7921.43,
  price_open = 8498.47,
  volume = 5921039872,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-27', 1522108800, 7833.04, 8232.78, 7797.28, 8200.00, 5378250240, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7833.04,
  price_high = 8232.78,
  price_low = 7797.28,
  price_open = 8200.00,
  volume = 5378250240,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-28', 1522195200, 7954.48, 8122.89, 7809.17, 7836.83, 4935289856, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7954.48,
  price_high = 8122.89,
  price_low = 7809.17,
  price_open = 7836.83,
  volume = 4935289856,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-29', 1522281600, 7165.70, 7994.33, 7081.38, 7979.07, 6361229824, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7165.70,
  price_high = 7994.33,
  price_low = 7081.38,
  price_open = 7979.07,
  volume = 6361229824,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-30', 1522368000, 6890.52, 7276.66, 6683.93, 7171.45, 6289509888, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 6890.52,
  price_high = 7276.66,
  price_low = 6683.93,
  price_open = 7171.45,
  volume = 6289509888,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-03-31', 1522454400, 6973.53, 7207.85, 6863.52, 6892.48, 4553269760, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 6973.53,
  price_high = 7207.85,
  price_low = 6863.52,
  price_open = 6892.48,
  volume = 4553269760,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-04-01', 1522540800, 6844.23, 7060.95, 6526.87, 7003.06, 4532100096, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 6844.23,
  price_high = 7060.95,
  price_low = 6526.87,
  price_open = 7003.06,
  volume = 4532100096,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-04-02', 1522627200, 7083.80, 7135.47, 6816.58, 6844.86, 4333440000, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7083.80,
  price_high = 7135.47,
  price_low = 6816.58,
  price_open = 6844.86,
  volume = 4333440000,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-04-03', 1522713600, 7456.11, 7530.94, 7072.49, 7102.26, 5499700224, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7456.11,
  price_high = 7530.94,
  price_low = 7072.49,
  price_open = 7102.26,
  volume = 5499700224,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-04-04', 1522800000, 6853.84, 7469.88, 6803.88, 7456.41, 4936000000, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 6853.84,
  price_high = 7469.88,
  price_low = 6803.88,
  price_open = 7456.41,
  volume = 4936000000,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-04-05', 1522886400, 6811.47, 6933.82, 6644.80, 6848.65, 5639320064, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 6811.47,
  price_high = 6933.82,
  price_low = 6644.80,
  price_open = 6848.65,
  volume = 5639320064,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-04-06', 1522972800, 6636.32, 6857.49, 6575.00, 6815.96, 3766810112, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 6636.32,
  price_high = 6857.49,
  price_low = 6575.00,
  price_open = 6815.96,
  volume = 3766810112,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-04-07', 1523059200, 6911.09, 7050.54, 6630.51, 6630.51, 3976610048, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 6911.09,
  price_high = 7050.54,
  price_low = 6630.51,
  price_open = 6630.51,
  volume = 3976610048,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-04-08', 1523145600, 7023.52, 7111.56, 6919.98, 6919.98, 3652499968, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7023.52,
  price_high = 7111.56,
  price_low = 6919.98,
  price_open = 6919.98,
  volume = 3652499968,
  year = 2018,
  updated_at = NOW();