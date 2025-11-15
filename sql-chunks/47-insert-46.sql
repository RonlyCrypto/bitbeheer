INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-14', 1605312000, 16068.14, 16317.81, 15749.19, 16317.81, 27481710135, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 16068.14,
  price_high = 16317.81,
  price_low = 15749.19,
  price_open = 16317.81,
  volume = 27481710135,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-15', 1605398400, 15955.59, 16123.11, 15793.53, 16068.14, 23653867583, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 15955.59,
  price_high = 16123.11,
  price_low = 15793.53,
  price_open = 16068.14,
  volume = 23653867583,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-16', 1605484800, 16716.11, 16816.18, 15880.71, 15955.58, 31526766675, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 16716.11,
  price_high = 16816.18,
  price_low = 15880.71,
  price_open = 15955.58,
  volume = 31526766675,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-17', 1605571200, 17645.41, 17782.92, 16564.54, 16685.69, 39006849170, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 17645.41,
  price_high = 17782.92,
  price_low = 16564.54,
  price_open = 16685.69,
  volume = 39006849170,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-18', 1605657600, 17804.01, 18393.95, 17352.91, 17645.19, 49064800278, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 17804.01,
  price_high = 18393.95,
  price_low = 17352.91,
  price_open = 17645.19,
  volume = 49064800278,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-19', 1605744000, 17817.09, 18119.55, 17382.55, 17803.86, 36985055355, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 17817.09,
  price_high = 18119.55,
  price_low = 17382.55,
  price_open = 17803.86,
  volume = 36985055355,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-20', 1605830400, 18621.31, 18773.23, 17765.79, 17817.08, 36992873940, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18621.31,
  price_high = 18773.23,
  price_low = 17765.79,
  price_open = 17817.08,
  volume = 36992873940,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-21', 1605916800, 18642.23, 18936.62, 18444.36, 18621.32, 39650210707, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18642.23,
  price_high = 18936.62,
  price_low = 18444.36,
  price_open = 18621.32,
  volume = 39650210707,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-22', 1606003200, 18370.00, 18688.97, 17671.38, 18642.23, 41280434226, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18370.00,
  price_high = 18688.97,
  price_low = 17671.38,
  price_open = 18642.23,
  volume = 41280434226,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-23', 1606089600, 18364.12, 18711.43, 18000.80, 18370.02, 42741112308, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18364.12,
  price_high = 18711.43,
  price_low = 18000.80,
  price_open = 18370.02,
  volume = 42741112308,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-24', 1606176000, 19107.46, 19348.27, 18128.66, 18365.02, 51469565009, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19107.46,
  price_high = 19348.27,
  price_low = 18128.66,
  price_open = 18365.02,
  volume = 51469565009,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-25', 1606262400, 18732.12, 19390.96, 18581.15, 19104.41, 43710357371, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18732.12,
  price_high = 19390.96,
  price_low = 18581.15,
  price_open = 19104.41,
  volume = 43710357371,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-26', 1606348800, 17150.62, 18866.29, 16351.04, 18729.84, 61396835737, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 17150.62,
  price_high = 18866.29,
  price_low = 16351.04,
  price_open = 18729.84,
  volume = 61396835737,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-27', 1606435200, 17108.40, 17445.02, 16526.42, 17153.91, 38886494645, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 17108.40,
  price_high = 17445.02,
  price_low = 16526.42,
  price_open = 17153.91,
  volume = 38886494645,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-28', 1606521600, 17717.41, 17853.94, 16910.65, 17112.93, 32601040734, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 17717.41,
  price_high = 17853.94,
  price_low = 16910.65,
  price_open = 17112.93,
  volume = 32601040734,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-29', 1606608000, 18177.48, 18283.63, 17559.12, 17719.63, 31133957704, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18177.48,
  price_high = 18283.63,
  price_low = 17559.12,
  price_open = 17719.63,
  volume = 31133957704,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-11-30', 1606694400, 19625.84, 19749.26, 18178.32, 18178.32, 47728480399, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19625.84,
  price_high = 19749.26,
  price_low = 18178.32,
  price_open = 18178.32,
  volume = 47728480399,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-01', 1606780800, 18803.00, 19845.97, 18321.92, 19633.77, 49633658712, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18803.00,
  price_high = 19845.97,
  price_low = 18321.92,
  price_open = 19633.77,
  volume = 49633658712,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-02', 1606867200, 19201.09, 19308.33, 18347.72, 18801.74, 37387697139, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19201.09,
  price_high = 19308.33,
  price_low = 18347.72,
  price_open = 18801.74,
  volume = 37387697139,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-03', 1606953600, 19445.40, 19566.19, 18925.79, 19205.93, 31930317405, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19445.40,
  price_high = 19566.19,
  price_low = 18925.79,
  price_open = 19205.93,
  volume = 31930317405,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-04', 1607040000, 18699.77, 19511.40, 18697.19, 19446.97, 33872388058, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18699.77,
  price_high = 19511.40,
  price_low = 18697.19,
  price_open = 19446.97,
  volume = 33872388058,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-05', 1607126400, 19154.23, 19160.45, 18590.19, 18698.38, 27242455064, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19154.23,
  price_high = 19160.45,
  price_low = 18590.19,
  price_open = 18698.38,
  volume = 27242455064,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-06', 1607212800, 19345.12, 19390.50, 18897.89, 19154.18, 25293775714, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19345.12,
  price_high = 19390.50,
  price_low = 18897.89,
  price_open = 19154.18,
  volume = 25293775714,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-07', 1607299200, 19191.63, 19411.83, 18931.14, 19343.13, 26896357742, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19191.63,
  price_high = 19411.83,
  price_low = 18931.14,
  price_open = 19343.13,
  volume = 26896357742,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-08', 1607385600, 18321.14, 19283.48, 18269.95, 19191.53, 31692288756, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18321.14,
  price_high = 19283.48,
  price_low = 18269.95,
  price_open = 19191.53,
  volume = 31692288756,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-09', 1607472000, 18553.92, 18626.29, 17935.55, 18320.88, 34420373071, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18553.92,
  price_high = 18626.29,
  price_low = 17935.55,
  price_open = 18320.88,
  volume = 34420373071,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-10', 1607558400, 18264.99, 18553.30, 17957.06, 18553.30, 25547132265, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18264.99,
  price_high = 18553.30,
  price_low = 17957.06,
  price_open = 18553.30,
  volume = 25547132265,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-11', 1607644800, 18058.90, 18268.45, 17619.53, 18263.93, 27919640985, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18058.90,
  price_high = 18268.45,
  price_low = 17619.53,
  price_open = 18263.93,
  volume = 27919640985,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-12', 1607731200, 18803.66, 18919.55, 18046.04, 18051.32, 21752580802, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 18803.66,
  price_high = 18919.55,
  price_low = 18046.04,
  price_open = 18051.32,
  volume = 21752580802,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-13', 1607817600, 19142.38, 19381.54, 18734.33, 18806.77, 25450468637, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19142.38,
  price_high = 19381.54,
  price_low = 18734.33,
  price_open = 18806.77,
  volume = 25450468637,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-14', 1607904000, 19246.64, 19305.10, 19012.71, 19144.49, 22473997681, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19246.64,
  price_high = 19305.10,
  price_low = 19012.71,
  price_open = 19144.49,
  volume = 22473997681,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-15', 1607990400, 19417.08, 19525.01, 19079.84, 19246.92, 26741982541, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 19417.08,
  price_high = 19525.01,
  price_low = 19079.84,
  price_open = 19246.92,
  volume = 26741982541,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-16', 1608076800, 21310.60, 21458.91, 19298.32, 19418.82, 44409011479, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 21310.60,
  price_high = 21458.91,
  price_low = 19298.32,
  price_open = 19418.82,
  volume = 44409011479,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-17', 1608163200, 22805.16, 23642.66, 21234.68, 21308.35, 71378606374, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 22805.16,
  price_high = 23642.66,
  price_low = 21234.68,
  price_open = 21308.35,
  volume = 71378606374,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-18', 1608249600, 23137.96, 23238.60, 22399.81, 22806.80, 40387896275, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 23137.96,
  price_high = 23238.60,
  price_low = 22399.81,
  price_open = 22806.80,
  volume = 40387896275,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-19', 1608336000, 23869.83, 24085.86, 22826.47, 23132.87, 38487546580, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 23869.83,
  price_high = 24085.86,
  price_low = 22826.47,
  price_open = 23132.87,
  volume = 38487546580,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-20', 1608422400, 23477.29, 24209.66, 23147.71, 23861.77, 37844228422, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 23477.29,
  price_high = 24209.66,
  price_low = 23147.71,
  price_open = 23861.77,
  volume = 37844228422,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-21', 1608508800, 22803.08, 24059.98, 22159.37, 23474.46, 45852713981, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 22803.08,
  price_high = 24059.98,
  price_low = 22159.37,
  price_open = 23474.46,
  volume = 45852713981,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-22', 1608595200, 23783.03, 23789.90, 22430.61, 22794.04, 44171632681, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 23783.03,
  price_high = 23789.90,
  price_low = 22430.61,
  price_open = 22794.04,
  volume = 44171632681,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-23', 1608681600, 23241.35, 24024.49, 22802.65, 23781.97, 51146161904, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 23241.35,
  price_high = 24024.49,
  price_low = 22802.65,
  price_open = 23781.97,
  volume = 51146161904,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-24', 1608768000, 23735.95, 23768.34, 22777.60, 23240.20, 41080759713, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 23735.95,
  price_high = 23768.34,
  price_low = 22777.60,
  price_open = 23240.20,
  volume = 41080759713,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-25', 1608854400, 24664.79, 24710.10, 23463.67, 23733.57, 42068395846, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 24664.79,
  price_high = 24710.10,
  price_low = 23463.67,
  price_open = 23733.57,
  volume = 42068395846,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-26', 1608940800, 26437.04, 26718.07, 24522.69, 24677.02, 48332647295, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 26437.04,
  price_high = 26718.07,
  price_low = 24522.69,
  price_open = 24677.02,
  volume = 48332647295,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-27', 1609027200, 26272.29, 28288.84, 25922.77, 26439.37, 66479895605, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 26272.29,
  price_high = 28288.84,
  price_low = 25922.77,
  price_open = 26439.37,
  volume = 66479895605,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-28', 1609113600, 27084.81, 27389.11, 26207.64, 26280.82, 49056742893, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 27084.81,
  price_high = 27389.11,
  price_low = 26207.64,
  price_open = 26280.82,
  volume = 49056742893,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-29', 1609200000, 27362.44, 27370.72, 25987.30, 27081.81, 45265946774, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 27362.44,
  price_high = 27370.72,
  price_low = 25987.30,
  price_open = 27081.81,
  volume = 45265946774,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-30', 1609286400, 28840.95, 28937.74, 27360.09, 27360.09, 51287442704, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 28840.95,
  price_high = 28937.74,
  price_low = 27360.09,
  price_open = 27360.09,
  volume = 51287442704,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2020-12-31', 1609372800, 29001.72, 29244.88, 28201.99, 28841.57, 46754964848, 2020, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 29001.72,
  price_high = 29244.88,
  price_low = 28201.99,
  price_open = 28841.57,
  volume = 46754964848,
  year = 2020,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2021-01-01', 1609459200, 29374.15, 29600.63, 28803.59, 28994.01, 40730301359, 2021, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 29374.15,
  price_high = 29600.63,
  price_low = 28803.59,
  price_open = 28994.01,
  volume = 40730301359,
  year = 2021,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2021-01-02', 1609545600, 32127.27, 33155.12, 29091.18, 29376.46, 67865420765, 2021, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 32127.27,
  price_high = 33155.12,
  price_low = 29091.18,
  price_open = 29376.46,
  volume = 67865420765,
  year = 2021,
  updated_at = NOW();