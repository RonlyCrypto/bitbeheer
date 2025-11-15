INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-05-25', 1432512000, 237.11, 241.02, 236.64, 240.93, 14423900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 237.11,
  price_high = 241.02,
  price_low = 236.64,
  price_open = 240.93,
  volume = 14423900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-05-26', 1432598400, 237.12, 238.24, 235.69, 237.10, 16425000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 237.12,
  price_high = 238.24,
  price_low = 235.69,
  price_open = 237.10,
  volume = 16425000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-05-27', 1432684800, 237.28, 238.64, 236.70, 237.07, 18837000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 237.28,
  price_high = 238.64,
  price_low = 236.70,
  price_open = 237.07,
  volume = 18837000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-05-28', 1432771200, 237.41, 237.82, 236.65, 237.26, 13829600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 237.41,
  price_high = 237.82,
  price_low = 236.65,
  price_open = 237.26,
  volume = 13829600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-05-29', 1432857600, 237.10, 237.52, 235.73, 237.38, 14805000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 237.10,
  price_high = 237.52,
  price_low = 235.73,
  price_open = 237.38,
  volume = 14805000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-05-30', 1432944000, 233.35, 237.09, 232.05, 237.09, 14098600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 233.35,
  price_high = 237.09,
  price_low = 232.05,
  price_open = 237.09,
  volume = 14098600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-05-31', 1433030400, 230.19, 233.25, 229.54, 233.13, 14730800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 230.19,
  price_high = 233.25,
  price_low = 229.54,
  price_open = 233.13,
  volume = 14730800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-01', 1433116800, 222.93, 231.71, 221.30, 230.23, 26090500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 222.93,
  price_high = 231.71,
  price_low = 221.30,
  price_open = 230.23,
  volume = 26090500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-02', 1433203200, 225.80, 226.42, 222.42, 222.89, 20459000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 225.80,
  price_high = 226.42,
  price_low = 222.42,
  price_open = 222.89,
  volume = 20459000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-03', 1433289600, 225.87, 227.40, 223.93, 225.74, 17752400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 225.87,
  price_high = 227.40,
  price_low = 223.93,
  price_open = 225.74,
  volume = 17752400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-04', 1433376000, 224.32, 226.58, 224.05, 225.77, 14728100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 224.32,
  price_high = 226.58,
  price_low = 224.05,
  price_open = 225.77,
  volume = 14728100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-05', 1433462400, 224.95, 225.97, 223.18, 224.15, 18056500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 224.95,
  price_high = 225.97,
  price_low = 223.18,
  price_open = 224.15,
  volume = 18056500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-06', 1433548800, 225.62, 225.72, 224.38, 225.01, 11131500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 225.62,
  price_high = 225.72,
  price_low = 224.38,
  price_open = 225.01,
  volume = 11131500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-07', 1433635200, 222.88, 226.19, 222.65, 225.60, 13318400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 222.88,
  price_high = 226.19,
  price_low = 222.65,
  price_open = 225.60,
  volume = 13318400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-08', 1433721600, 228.49, 229.46, 222.84, 222.88, 23378400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 228.49,
  price_high = 229.46,
  price_low = 222.84,
  price_open = 222.88,
  volume = 23378400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-09', 1433808000, 229.05, 230.95, 227.93, 228.54, 28353100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 229.05,
  price_high = 230.95,
  price_low = 227.93,
  price_open = 228.54,
  volume = 28353100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-10', 1433894400, 228.80, 229.78, 228.01, 228.99, 15904800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 228.80,
  price_high = 229.78,
  price_low = 228.01,
  price_open = 228.99,
  volume = 15904800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-11', 1433980800, 229.71, 230.29, 228.77, 228.85, 14416000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 229.71,
  price_high = 230.29,
  price_low = 228.77,
  price_open = 228.85,
  volume = 14416000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-12', 1434067200, 229.98, 231.06, 229.31, 229.71, 14017700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 229.98,
  price_high = 231.06,
  price_low = 229.31,
  price_open = 229.71,
  volume = 14017700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-13', 1434153600, 232.40, 232.65, 229.21, 229.92, 13305300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 232.40,
  price_high = 232.65,
  price_low = 229.21,
  price_open = 229.92,
  volume = 13305300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-14', 1434240000, 233.54, 234.86, 232.00, 232.44, 12165900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 233.54,
  price_high = 234.86,
  price_low = 232.00,
  price_open = 232.44,
  volume = 12165900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-15', 1434326400, 236.82, 237.84, 233.42, 233.42, 19912100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 236.82,
  price_high = 237.84,
  price_low = 233.42,
  price_open = 233.42,
  volume = 19912100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-16', 1434412800, 250.90, 251.74, 236.12, 236.76, 41612000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 250.90,
  price_high = 251.74,
  price_low = 236.12,
  price_open = 236.76,
  volume = 41612000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-17', 1434499200, 249.28, 256.85, 246.48, 250.82, 43858400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 249.28,
  price_high = 256.85,
  price_low = 246.48,
  price_open = 250.82,
  volume = 43858400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-18', 1434585600, 249.01, 252.11, 244.13, 249.43, 30980200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 249.01,
  price_high = 252.11,
  price_low = 244.13,
  price_open = 249.43,
  volume = 30980200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-19', 1434672000, 244.61, 250.98, 243.79, 249.04, 23965300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 244.61,
  price_high = 250.98,
  price_low = 243.79,
  price_open = 249.04,
  volume = 23965300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-20', 1434758400, 245.21, 245.83, 240.63, 244.53, 20608100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 245.21,
  price_high = 245.83,
  price_low = 240.63,
  price_open = 244.53,
  volume = 20608100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-21', 1434844800, 243.94, 245.22, 241.88, 245.10, 10600900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 243.94,
  price_high = 245.22,
  price_low = 241.88,
  price_open = 245.10,
  volume = 10600900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-22', 1434931200, 246.99, 247.92, 243.78, 243.97, 17692500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 246.99,
  price_high = 247.92,
  price_low = 243.78,
  price_open = 243.97,
  volume = 17692500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-23', 1435017600, 244.30, 247.30, 243.13, 246.93, 15108700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 244.30,
  price_high = 247.30,
  price_low = 243.13,
  price_open = 246.93,
  volume = 15108700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-24', 1435104000, 240.51, 244.34, 240.51, 244.28, 17344900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 240.51,
  price_high = 244.34,
  price_low = 240.51,
  price_open = 244.28,
  volume = 17344900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-25', 1435190400, 242.80, 243.33, 240.37, 240.37, 16133100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 242.80,
  price_high = 243.33,
  price_low = 240.37,
  price_open = 240.37,
  volume = 16133100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-26', 1435276800, 243.59, 243.75, 241.55, 242.60, 13983500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 243.59,
  price_high = 243.75,
  price_low = 241.55,
  price_open = 242.60,
  volume = 13983500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-27', 1435363200, 250.99, 251.34, 243.12, 243.55, 20488600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 250.99,
  price_high = 251.34,
  price_low = 243.12,
  price_open = 243.55,
  volume = 20488600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-28', 1435449600, 249.01, 251.17, 247.43, 250.96, 15137600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 249.01,
  price_high = 251.17,
  price_low = 247.43,
  price_open = 250.96,
  volume = 15137600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-29', 1435536000, 257.06, 257.17, 248.58, 248.72, 34742900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 257.06,
  price_high = 257.17,
  price_low = 248.58,
  price_open = 248.72,
  volume = 34742900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-06-30', 1435622400, 263.07, 267.87, 255.95, 257.04, 44533800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 263.07,
  price_high = 267.87,
  price_low = 255.95,
  price_open = 257.04,
  volume = 44533800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-01', 1435708800, 258.62, 265.17, 255.77, 263.35, 27029800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 258.62,
  price_high = 265.17,
  price_low = 255.77,
  price_open = 263.35,
  volume = 27029800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-02', 1435795200, 255.41, 261.63, 254.12, 258.55, 21551900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 255.41,
  price_high = 261.63,
  price_low = 254.12,
  price_open = 258.55,
  volume = 21551900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-03', 1435881600, 256.34, 257.08, 253.51, 255.46, 19033800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 256.34,
  price_high = 257.08,
  price_low = 253.51,
  price_open = 255.46,
  volume = 19033800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-04', 1435968000, 260.89, 261.46, 254.20, 256.49, 15620400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 260.89,
  price_high = 261.46,
  price_low = 254.20,
  price_open = 256.49,
  volume = 15620400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-05', 1436054400, 271.91, 274.51, 258.70, 260.80, 44156100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 271.91,
  price_high = 274.51,
  price_low = 258.70,
  price_open = 260.80,
  volume = 44156100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-06', 1436140800, 269.03, 277.42, 267.60, 271.11, 49154800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 269.03,
  price_high = 277.42,
  price_low = 267.60,
  price_open = 271.11,
  volume = 49154800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-07', 1436227200, 266.21, 271.34, 264.83, 269.96, 28857600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 266.21,
  price_high = 271.34,
  price_low = 264.83,
  price_open = 269.96,
  volume = 28857600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-08', 1436313600, 270.79, 272.97, 264.39, 265.98, 36980200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 270.79,
  price_high = 272.97,
  price_low = 264.39,
  price_open = 265.98,
  volume = 36980200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-09', 1436400000, 269.23, 272.33, 267.09, 270.83, 40301200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 269.23,
  price_high = 272.33,
  price_low = 267.09,
  price_open = 270.83,
  volume = 40301200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-10', 1436486400, 284.89, 294.59, 268.80, 269.16, 100390000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 284.89,
  price_high = 294.59,
  price_low = 268.80,
  price_open = 269.16,
  volume = 100390000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-11', 1436572800, 293.11, 298.51, 283.53, 284.88, 41109900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 293.11,
  price_high = 298.51,
  price_low = 283.53,
  price_open = 284.88,
  volume = 41109900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-12', 1436659200, 310.87, 314.39, 292.51, 293.14, 56405000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 310.87,
  price_high = 314.39,
  price_low = 292.51,
  price_open = 293.14,
  volume = 56405000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-07-13', 1436745600, 292.05, 310.95, 281.01, 310.83, 62053900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 292.05,
  price_high = 310.95,
  price_low = 281.01,
  price_open = 310.83,
  volume = 62053900,
  year = 2015,
  updated_at = NOW();