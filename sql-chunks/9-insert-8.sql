INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-02', 1441152000, 229.28, 230.58, 226.48, 228.03, 18760400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 229.28,
  price_high = 230.58,
  price_low = 226.48,
  price_open = 228.03,
  volume = 18760400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-03', 1441238400, 227.18, 229.60, 226.67, 229.32, 17482000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 227.18,
  price_high = 229.60,
  price_low = 226.67,
  price_open = 229.32,
  volume = 17482000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-04', 1441324800, 230.30, 230.90, 227.05, 227.21, 20962400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 230.30,
  price_high = 230.90,
  price_low = 227.05,
  price_open = 227.21,
  volume = 20962400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-05', 1441411200, 235.02, 236.14, 229.44, 230.20, 20671400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 235.02,
  price_high = 236.14,
  price_low = 229.44,
  price_open = 230.20,
  volume = 20671400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-06', 1441497600, 239.84, 242.91, 234.68, 234.87, 25473700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 239.84,
  price_high = 242.91,
  price_low = 234.68,
  price_open = 234.87,
  volume = 25473700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-07', 1441584000, 239.85, 242.11, 238.72, 239.93, 21192200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 239.85,
  price_high = 242.11,
  price_low = 238.72,
  price_open = 239.93,
  volume = 21192200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-08', 1441670400, 243.61, 245.78, 239.68, 239.85, 26879200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 243.61,
  price_high = 245.78,
  price_low = 239.68,
  price_open = 239.85,
  volume = 26879200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-09', 1441756800, 238.17, 244.42, 237.82, 243.41, 23635700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 238.17,
  price_high = 244.42,
  price_low = 237.82,
  price_open = 243.41,
  volume = 23635700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-10', 1441843200, 238.48, 241.29, 235.79, 238.34, 21215500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 238.48,
  price_high = 241.29,
  price_low = 235.79,
  price_open = 238.34,
  volume = 21215500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-11', 1441929600, 240.11, 241.17, 238.33, 238.33, 19224700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 240.11,
  price_high = 241.17,
  price_low = 238.33,
  price_open = 238.33,
  volume = 19224700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-12', 1442016000, 235.23, 240.12, 234.75, 239.85, 17962600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 235.23,
  price_high = 240.12,
  price_low = 234.75,
  price_open = 239.85,
  volume = 17962600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-13', 1442102400, 230.51, 235.93, 229.33, 235.24, 18478800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 230.51,
  price_high = 235.93,
  price_low = 229.33,
  price_open = 235.24,
  volume = 18478800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-14', 1442188800, 230.64, 232.44, 227.96, 230.61, 20997800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 230.64,
  price_high = 232.44,
  price_low = 227.96,
  price_open = 230.61,
  volume = 20997800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-15', 1442275200, 230.30, 259.18, 229.82, 230.49, 19177800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 230.30,
  price_high = 259.18,
  price_low = 229.82,
  price_open = 230.49,
  volume = 19177800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-16', 1442361600, 229.09, 231.21, 227.40, 230.25, 20144200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 229.09,
  price_high = 231.21,
  price_low = 227.40,
  price_open = 230.25,
  volume = 20144200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-17', 1442448000, 229.81, 230.29, 228.93, 229.08, 18935400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 229.81,
  price_high = 230.29,
  price_low = 228.93,
  price_open = 229.08,
  volume = 18935400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-18', 1442534400, 232.98, 234.35, 232.18, 233.52, 20242200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 232.98,
  price_high = 234.35,
  price_low = 232.18,
  price_open = 233.52,
  volume = 20242200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-19', 1442620800, 231.49, 233.21, 231.09, 232.86, 12712600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 231.49,
  price_high = 233.21,
  price_low = 231.09,
  price_open = 232.86,
  volume = 12712600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-20', 1442707200, 231.21, 232.37, 230.91, 231.40, 14444700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 231.21,
  price_high = 232.37,
  price_low = 230.91,
  price_open = 231.40,
  volume = 14444700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-21', 1442793600, 227.09, 231.22, 226.52, 231.22, 19678800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 227.09,
  price_high = 231.22,
  price_low = 226.52,
  price_open = 231.22,
  volume = 19678800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-22', 1442880000, 230.62, 232.39, 225.12, 226.97, 25009300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 230.62,
  price_high = 232.39,
  price_low = 225.12,
  price_open = 226.97,
  volume = 25009300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-23', 1442966400, 230.28, 231.84, 229.59, 230.94, 17254100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 230.28,
  price_high = 231.84,
  price_low = 229.59,
  price_open = 230.94,
  volume = 17254100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-24', 1443052800, 234.53, 235.65, 230.29, 230.36, 25097800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 234.53,
  price_high = 235.65,
  price_low = 230.29,
  price_open = 230.36,
  volume = 25097800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-25', 1443139200, 235.14, 237.43, 233.68, 234.36, 22363600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 235.14,
  price_high = 237.43,
  price_low = 233.68,
  price_open = 234.36,
  volume = 22363600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-26', 1443225600, 234.34, 235.40, 233.36, 235.08, 13724100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 234.34,
  price_high = 235.40,
  price_low = 233.36,
  price_open = 235.08,
  volume = 13724100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-27', 1443312000, 232.76, 234.53, 232.48, 234.14, 14179900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 232.76,
  price_high = 234.53,
  price_low = 232.48,
  price_open = 234.14,
  volume = 14179900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-28', 1443398400, 239.14, 239.34, 232.47, 232.84, 24713000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 239.14,
  price_high = 239.34,
  price_low = 232.47,
  price_open = 232.84,
  volume = 24713000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-29', 1443484800, 236.69, 239.80, 235.93, 239.02, 22691300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 236.69,
  price_high = 239.80,
  price_low = 235.93,
  price_open = 239.02,
  volume = 22691300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-09-30', 1443571200, 236.06, 237.73, 235.63, 236.64, 19743500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 236.06,
  price_high = 237.73,
  price_low = 235.63,
  price_open = 236.64,
  volume = 19743500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-01', 1443657600, 237.55, 238.45, 235.62, 236.00, 20488800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 237.55,
  price_high = 238.45,
  price_low = 235.62,
  price_open = 236.00,
  volume = 20488800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-02', 1443744000, 237.29, 238.54, 236.60, 237.26, 19677900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 237.29,
  price_high = 238.54,
  price_low = 236.60,
  price_open = 237.26,
  volume = 19677900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-03', 1443830400, 238.73, 239.32, 236.94, 237.20, 16482700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 238.73,
  price_high = 239.32,
  price_low = 236.94,
  price_open = 237.20,
  volume = 16482700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-04', 1443916800, 238.26, 238.97, 237.94, 238.53, 12999000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 238.26,
  price_high = 238.97,
  price_low = 237.94,
  price_open = 238.53,
  volume = 12999000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-05', 1444003200, 240.38, 240.38, 237.04, 238.15, 23335900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 240.38,
  price_high = 240.38,
  price_low = 237.04,
  price_open = 238.15,
  volume = 23335900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-06', 1444089600, 246.06, 246.93, 240.14, 240.36, 27535100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 246.06,
  price_high = 246.93,
  price_low = 240.14,
  price_open = 240.36,
  volume = 27535100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-07', 1444176000, 242.97, 246.68, 242.59, 246.17, 22999200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 242.97,
  price_high = 246.68,
  price_low = 242.59,
  price_open = 246.17,
  volume = 22999200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-08', 1444262400, 242.30, 244.25, 242.18, 243.07, 18515300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 242.30,
  price_high = 244.25,
  price_low = 242.18,
  price_open = 243.07,
  volume = 18515300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-09', 1444348800, 243.93, 244.23, 242.12, 242.50, 17353100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 243.93,
  price_high = 244.23,
  price_low = 242.12,
  price_open = 242.50,
  volume = 17353100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-10', 1444435200, 244.94, 245.32, 243.07, 243.74, 15912700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 244.94,
  price_high = 245.32,
  price_low = 243.07,
  price_open = 243.74,
  volume = 15912700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-11', 1444521600, 247.05, 247.24, 244.15, 244.74, 16827300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 247.05,
  price_high = 247.24,
  price_low = 244.15,
  price_open = 244.74,
  volume = 16827300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-12', 1444608000, 245.31, 247.45, 245.18, 246.88, 17388300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 245.31,
  price_high = 247.45,
  price_low = 245.18,
  price_open = 246.88,
  volume = 17388300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-13', 1444694400, 249.51, 250.24, 243.76, 245.20, 28198500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 249.51,
  price_high = 250.24,
  price_low = 243.76,
  price_open = 245.20,
  volume = 28198500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-14', 1444780800, 251.99, 254.27, 248.90, 249.49, 27462600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 251.99,
  price_high = 254.27,
  price_low = 248.90,
  price_open = 249.49,
  volume = 27462600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-15', 1444867200, 254.32, 255.96, 252.05, 252.11, 25223500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 254.32,
  price_high = 255.96,
  price_low = 252.05,
  price_open = 252.11,
  volume = 25223500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-16', 1444953600, 262.87, 266.14, 253.93, 254.30, 35901500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 262.87,
  price_high = 266.14,
  price_low = 253.93,
  price_open = 254.30,
  volume = 35901500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-17', 1445040000, 270.64, 273.58, 262.37, 262.75, 43199600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 270.64,
  price_high = 273.58,
  price_low = 262.37,
  price_open = 262.75,
  volume = 43199600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-18', 1445126400, 261.64, 271.67, 260.78, 270.91, 22434300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 261.64,
  price_high = 271.67,
  price_low = 260.78,
  price_open = 270.91,
  volume = 22434300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-19', 1445212800, 263.44, 264.82, 260.95, 261.86, 25258800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 263.44,
  price_high = 264.82,
  price_low = 260.95,
  price_open = 261.86,
  volume = 25258800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-20', 1445299200, 269.46, 270.83, 263.23, 263.57, 30889800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 269.46,
  price_high = 270.83,
  price_low = 263.23,
  price_open = 263.57,
  volume = 30889800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-10-21', 1445385600, 266.27, 270.77, 263.84, 269.31, 25637300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 266.27,
  price_high = 270.77,
  price_low = 263.84,
  price_open = 269.31,
  volume = 25637300,
  year = 2015,
  updated_at = NOW();