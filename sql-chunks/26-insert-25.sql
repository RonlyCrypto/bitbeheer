INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2017-12-30', 1514592000, 12952.20, 14681.90, 12350.10, 14681.90, 14452599808, 2017, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 12952.20,
  price_high = 14681.90,
  price_low = 12350.10,
  price_open = 14681.90,
  volume = 14452599808,
  year = 2017,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2017-12-31', 1514678400, 14156.40, 14377.40, 12755.60, 12897.70, 12136299520, 2017, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 14156.40,
  price_high = 14377.40,
  price_low = 12755.60,
  price_open = 12897.70,
  volume = 12136299520,
  year = 2017,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-01', 1514764800, 13657.20, 14112.20, 13154.70, 14112.20, 10291200000, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 13657.20,
  price_high = 14112.20,
  price_low = 13154.70,
  price_open = 14112.20,
  volume = 10291200000,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-02', 1514851200, 14982.10, 15444.60, 13163.60, 13625.00, 16846600192, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 14982.10,
  price_high = 15444.60,
  price_low = 13163.60,
  price_open = 13625.00,
  volume = 16846600192,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-03', 1514937600, 15201.00, 15572.80, 14844.50, 14978.20, 16871900160, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 15201.00,
  price_high = 15572.80,
  price_low = 14844.50,
  price_open = 14978.20,
  volume = 16871900160,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-04', 1515024000, 15599.20, 15739.70, 14522.20, 15270.70, 21783199744, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 15599.20,
  price_high = 15739.70,
  price_low = 14522.20,
  price_open = 15270.70,
  volume = 21783199744,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-05', 1515110400, 17429.50, 17705.20, 15202.80, 15477.20, 23840899072, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 17429.50,
  price_high = 17705.20,
  price_low = 15202.80,
  price_open = 15477.20,
  volume = 23840899072,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-06', 1515196800, 17527.00, 17712.40, 16764.60, 17462.10, 18314600448, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 17527.00,
  price_high = 17712.40,
  price_low = 16764.60,
  price_open = 17462.10,
  volume = 18314600448,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-07', 1515283200, 16477.60, 17579.60, 16087.70, 17527.30, 15866000384, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 16477.60,
  price_high = 17579.60,
  price_low = 16087.70,
  price_open = 17527.30,
  volume = 15866000384,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-08', 1515369600, 15170.10, 16537.90, 14208.20, 16476.20, 18413899776, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 15170.10,
  price_high = 16537.90,
  price_low = 14208.20,
  price_open = 16476.20,
  volume = 18413899776,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-09', 1515456000, 14595.40, 15497.50, 14424.00, 15123.70, 16659999744, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 14595.40,
  price_high = 15497.50,
  price_low = 14424.00,
  price_open = 15123.70,
  volume = 16659999744,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-10', 1515542400, 14973.30, 14973.30, 13691.20, 14588.50, 18500800512, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 14973.30,
  price_high = 14973.30,
  price_low = 13691.20,
  price_open = 14588.50,
  volume = 18500800512,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-11', 1515628800, 13405.80, 15018.80, 13105.90, 14968.20, 16534099968, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 13405.80,
  price_high = 15018.80,
  price_low = 13105.90,
  price_open = 14968.20,
  volume = 16534099968,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-12', 1515715200, 13980.60, 14229.90, 13158.10, 13453.90, 12065699840, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 13980.60,
  price_high = 14229.90,
  price_low = 13158.10,
  price_open = 13453.90,
  volume = 12065699840,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-13', 1515801600, 14360.20, 14659.50, 13952.40, 13952.40, 12763599872, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 14360.20,
  price_high = 14659.50,
  price_low = 13952.40,
  price_open = 13952.40,
  volume = 12763599872,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-14', 1515888000, 13772.00, 14511.80, 13268.00, 14370.80, 11084099584, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 13772.00,
  price_high = 14511.80,
  price_low = 13268.00,
  price_open = 14370.80,
  volume = 11084099584,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-15', 1515974400, 13819.80, 14445.50, 13641.70, 13767.30, 12750799872, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 13819.80,
  price_high = 14445.50,
  price_low = 13641.70,
  price_open = 13767.30,
  volume = 12750799872,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-16', 1516060800, 11490.50, 13843.10, 10194.90, 13836.10, 18853799936, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11490.50,
  price_high = 13843.10,
  price_low = 10194.90,
  price_open = 13836.10,
  volume = 18853799936,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-17', 1516147200, 11188.60, 11678.00, 9402.29, 11431.10, 18830600192, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11188.60,
  price_high = 11678.00,
  price_low = 9402.29,
  price_open = 11431.10,
  volume = 18830600192,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-18', 1516233600, 11474.90, 12107.30, 10942.50, 11198.80, 15020399616, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11474.90,
  price_high = 12107.30,
  price_low = 10942.50,
  price_open = 11198.80,
  volume = 15020399616,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-19', 1516320000, 11607.40, 11992.80, 11172.10, 11429.80, 10740400128, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11607.40,
  price_high = 11992.80,
  price_low = 11172.10,
  price_open = 11429.80,
  volume = 10740400128,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-20', 1516406400, 12899.20, 13103.00, 11656.20, 11656.20, 11801700352, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 12899.20,
  price_high = 13103.00,
  price_low = 11656.20,
  price_open = 11656.20,
  volume = 11801700352,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-21', 1516492800, 11600.10, 12895.90, 11288.20, 12889.20, 9935179776, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11600.10,
  price_high = 12895.90,
  price_low = 11288.20,
  price_open = 12889.20,
  volume = 9935179776,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-22', 1516579200, 10931.40, 11966.40, 10240.20, 11633.10, 10537400320, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10931.40,
  price_high = 11966.40,
  price_low = 10240.20,
  price_open = 11633.10,
  volume = 10537400320,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-23', 1516665600, 10868.40, 11377.60, 10129.70, 10944.50, 9660609536, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10868.40,
  price_high = 11377.60,
  price_low = 10129.70,
  price_open = 10944.50,
  volume = 9660609536,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-24', 1516752000, 11359.40, 11501.40, 10639.80, 10903.40, 9940989952, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11359.40,
  price_high = 11501.40,
  price_low = 10639.80,
  price_open = 10903.40,
  volume = 9940989952,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-25', 1516838400, 11259.40, 11785.70, 11057.40, 11421.70, 8873169920, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11259.40,
  price_high = 11785.70,
  price_low = 11057.40,
  price_open = 11421.70,
  volume = 8873169920,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-26', 1516924800, 11171.40, 11656.70, 10470.30, 11256.00, 9746199552, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11171.40,
  price_high = 11656.70,
  price_low = 10470.30,
  price_open = 11256.00,
  volume = 9746199552,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-27', 1517011200, 11440.70, 11614.90, 10989.20, 11174.90, 7583269888, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11440.70,
  price_high = 11614.90,
  price_low = 10989.20,
  price_open = 11174.90,
  volume = 7583269888,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-28', 1517097600, 11786.30, 12040.30, 11475.30, 11475.30, 8350360064, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11786.30,
  price_high = 12040.30,
  price_low = 11475.30,
  price_open = 11475.30,
  volume = 8350360064,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-29', 1517184000, 11296.40, 11875.60, 11179.20, 11755.50, 7107359744, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11296.40,
  price_high = 11875.60,
  price_low = 11179.20,
  price_open = 11755.50,
  volume = 7107359744,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-30', 1517270400, 10106.30, 11307.20, 10036.20, 11306.80, 8637859840, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10106.30,
  price_high = 11307.20,
  price_low = 10036.20,
  price_open = 11306.80,
  volume = 8637859840,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-01-31', 1517356800, 10221.10, 10381.60, 9777.42, 10108.20, 8041160192, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10221.10,
  price_high = 10381.60,
  price_low = 9777.42,
  price_open = 10108.20,
  volume = 8041160192,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-01', 1517443200, 9170.54, 10288.80, 8812.28, 10237.30, 9959400448, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9170.54,
  price_high = 10288.80,
  price_low = 8812.28,
  price_open = 10237.30,
  volume = 9959400448,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-02', 1517529600, 8830.75, 9142.28, 7796.49, 9142.28, 12726899712, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8830.75,
  price_high = 9142.28,
  price_low = 7796.49,
  price_open = 9142.28,
  volume = 12726899712,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-03', 1517616000, 9174.91, 9430.75, 8251.63, 8852.12, 7263790080, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9174.91,
  price_high = 9430.75,
  price_low = 8251.63,
  price_open = 8852.12,
  volume = 7263790080,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-04', 1517702400, 8277.01, 9334.87, 8031.22, 9175.70, 7073549824, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8277.01,
  price_high = 9334.87,
  price_low = 8031.22,
  price_open = 9175.70,
  volume = 7073549824,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-05', 1517788800, 6955.27, 8364.84, 6756.68, 8270.54, 9285289984, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 6955.27,
  price_high = 8364.84,
  price_low = 6756.68,
  price_open = 8270.54,
  volume = 9285289984,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-06', 1517875200, 7754.00, 7850.70, 6048.26, 7051.75, 13999800320, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7754.00,
  price_high = 7850.70,
  price_low = 6048.26,
  price_open = 7051.75,
  volume = 13999800320,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-07', 1517961600, 7621.30, 8509.11, 7236.79, 7755.49, 9169280000, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 7621.30,
  price_high = 8509.11,
  price_low = 7236.79,
  price_open = 7755.49,
  volume = 9169280000,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-08', 1518048000, 8265.59, 8558.77, 7637.86, 7637.86, 9346750464, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8265.59,
  price_high = 8558.77,
  price_low = 7637.86,
  price_open = 7637.86,
  volume = 9346750464,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-09', 1518134400, 8736.98, 8736.98, 7884.71, 8271.84, 6784820224, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8736.98,
  price_high = 8736.98,
  price_low = 7884.71,
  price_open = 8271.84,
  volume = 6784820224,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-10', 1518220800, 8621.90, 9122.55, 8295.47, 8720.08, 7780960256, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8621.90,
  price_high = 9122.55,
  price_low = 8295.47,
  price_open = 8720.08,
  volume = 7780960256,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-11', 1518307200, 8129.97, 8616.13, 7931.10, 8616.13, 6122189824, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8129.97,
  price_high = 8616.13,
  price_low = 7931.10,
  price_open = 8616.13,
  volume = 6122189824,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-12', 1518393600, 8926.57, 8985.92, 8141.43, 8141.43, 6256439808, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8926.57,
  price_high = 8985.92,
  price_low = 8141.43,
  price_open = 8141.43,
  volume = 6256439808,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-13', 1518480000, 8598.31, 8958.47, 8455.41, 8926.72, 5696719872, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 8598.31,
  price_high = 8958.47,
  price_low = 8455.41,
  price_open = 8926.72,
  volume = 5696719872,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-14', 1518566400, 9494.63, 9518.54, 8599.92, 8599.92, 7909819904, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 9494.63,
  price_high = 9518.54,
  price_low = 8599.92,
  price_open = 8599.92,
  volume = 7909819904,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-15', 1518652800, 10166.40, 10234.80, 9395.58, 9488.32, 9062540288, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10166.40,
  price_high = 10234.80,
  price_low = 9395.58,
  price_open = 9488.32,
  volume = 9062540288,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-16', 1518739200, 10233.90, 10324.10, 9824.82, 10135.70, 7296159744, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 10233.90,
  price_high = 10324.10,
  price_low = 9824.82,
  price_open = 10135.70,
  volume = 7296159744,
  year = 2018,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2018-02-17', 1518825600, 11112.70, 11139.50, 10149.40, 10207.50, 8660880384, 2018, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 11112.70,
  price_high = 11139.50,
  price_low = 10149.40,
  price_open = 10207.50,
  volume = 8660880384,
  year = 2018,
  updated_at = NOW();