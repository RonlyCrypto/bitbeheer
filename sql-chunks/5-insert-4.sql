INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-14', 1423872000, 257.32, 259.81, 235.53, 235.53, 49732500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 257.32,
  price_high = 259.81,
  price_low = 235.53,
  price_open = 235.53,
  volume = 49732500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-15', 1423958400, 234.82, 265.61, 227.68, 257.51, 56552400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 234.82,
  price_high = 265.61,
  price_low = 227.68,
  price_open = 257.51,
  volume = 56552400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-16', 1424044800, 233.84, 239.52, 229.02, 234.82, 28153700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 233.84,
  price_high = 239.52,
  price_low = 229.02,
  price_open = 234.82,
  volume = 28153700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-17', 1424131200, 243.61, 245.77, 232.31, 233.42, 27363100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 243.61,
  price_high = 245.77,
  price_low = 232.31,
  price_open = 233.42,
  volume = 27363100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-18', 1424217600, 236.33, 244.25, 232.34, 243.78, 25200800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 236.33,
  price_high = 244.25,
  price_low = 232.34,
  price_open = 243.78,
  volume = 25200800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-19', 1424304000, 240.28, 242.67, 235.59, 236.41, 18270500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 240.28,
  price_high = 242.67,
  price_low = 235.59,
  price_open = 236.41,
  volume = 18270500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-20', 1424390400, 243.78, 247.10, 239.30, 240.25, 23876700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 243.78,
  price_high = 247.10,
  price_low = 239.30,
  price_open = 240.25,
  volume = 23876700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-21', 1424476800, 244.53, 255.32, 243.18, 243.75, 12284200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 244.53,
  price_high = 255.32,
  price_low = 243.18,
  price_open = 243.75,
  volume = 12284200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-22', 1424563200, 235.98, 246.39, 233.85, 244.54, 19527000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 235.98,
  price_high = 246.39,
  price_low = 233.85,
  price_open = 244.54,
  volume = 19527000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-23', 1424649600, 238.89, 240.11, 232.42, 235.99, 16400000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 238.89,
  price_high = 240.11,
  price_low = 232.42,
  price_open = 235.99,
  volume = 16400000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-24', 1424736000, 238.74, 239.90, 236.40, 239.00, 14200400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 238.74,
  price_high = 239.90,
  price_low = 236.40,
  price_open = 239.00,
  volume = 14200400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-25', 1424822400, 237.47, 239.34, 235.53, 238.89, 11496200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 237.47,
  price_high = 239.34,
  price_low = 235.53,
  price_open = 238.89,
  volume = 11496200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-26', 1424908800, 236.43, 237.71, 234.26, 237.34, 13619400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 236.43,
  price_high = 237.71,
  price_low = 234.26,
  price_open = 237.34,
  volume = 13619400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-27', 1424995200, 253.83, 256.65, 236.44, 236.44, 44013900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 253.83,
  price_high = 256.65,
  price_low = 236.44,
  price_open = 236.44,
  volume = 44013900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-28', 1425081600, 254.26, 254.69, 249.48, 253.52, 13949300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 254.26,
  price_high = 254.69,
  price_low = 249.48,
  price_open = 253.52,
  volume = 13949300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-01', 1425168000, 260.20, 261.66, 245.93, 254.28, 25213700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 260.20,
  price_high = 261.66,
  price_low = 245.93,
  price_open = 254.28,
  volume = 25213700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-02', 1425254400, 275.67, 276.30, 258.31, 260.36, 40465700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 275.67,
  price_high = 276.30,
  price_low = 258.31,
  price_open = 260.36,
  volume = 40465700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-03', 1425340800, 281.70, 285.80, 268.16, 275.05, 50461300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 281.70,
  price_high = 285.80,
  price_low = 268.16,
  price_open = 275.05,
  volume = 50461300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-04', 1425427200, 273.09, 284.23, 268.13, 281.99, 41383000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 273.09,
  price_high = 284.23,
  price_low = 268.13,
  price_open = 281.99,
  volume = 41383000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-05', 1425513600, 276.18, 281.67, 264.77, 272.74, 41302400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 276.18,
  price_high = 281.67,
  price_low = 264.77,
  price_open = 272.74,
  volume = 41302400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-06', 1425600000, 272.72, 277.61, 270.02, 275.60, 28918900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 272.72,
  price_high = 277.61,
  price_low = 270.02,
  price_open = 275.60,
  volume = 28918900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-07', 1425686400, 276.26, 277.85, 270.13, 272.29, 17825900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 276.26,
  price_high = 277.85,
  price_low = 270.13,
  price_open = 272.29,
  volume = 17825900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-08', 1425772800, 274.35, 277.86, 272.57, 276.43, 22067900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 274.35,
  price_high = 277.86,
  price_low = 272.57,
  price_open = 276.43,
  volume = 22067900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-09', 1425859200, 289.61, 292.70, 273.89, 274.81, 59178200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 289.61,
  price_high = 292.70,
  price_low = 273.89,
  price_open = 274.81,
  volume = 59178200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-10', 1425945600, 291.76, 300.04, 289.74, 289.86, 67770800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 291.76,
  price_high = 300.04,
  price_low = 289.74,
  price_open = 289.86,
  volume = 67770800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-11', 1426032000, 296.38, 297.39, 290.51, 291.52, 33963900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 296.38,
  price_high = 297.39,
  price_low = 290.51,
  price_open = 291.52,
  volume = 33963900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-12', 1426118400, 294.35, 297.09, 292.41, 296.13, 32585200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 294.35,
  price_high = 297.09,
  price_low = 292.41,
  price_open = 296.13,
  volume = 32585200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-13', 1426204800, 285.34, 294.50, 285.34, 294.12, 31421500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 285.34,
  price_high = 294.50,
  price_low = 285.34,
  price_open = 294.12,
  volume = 31421500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-14', 1426291200, 281.89, 286.34, 280.98, 284.44, 22612300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 281.89,
  price_high = 286.34,
  price_low = 280.98,
  price_open = 284.44,
  volume = 22612300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-15', 1426377600, 286.39, 286.53, 281.00, 281.42, 11970100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 286.39,
  price_high = 286.53,
  price_low = 281.00,
  price_open = 281.42,
  volume = 11970100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-16', 1426464000, 290.59, 294.11, 285.68, 285.68, 21516100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 290.59,
  price_high = 294.11,
  price_low = 285.68,
  price_open = 285.68,
  volume = 21516100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-17', 1426550400, 285.51, 292.36, 284.37, 290.60, 21497200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 285.51,
  price_high = 292.36,
  price_low = 284.37,
  price_open = 290.60,
  volume = 21497200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-18', 1426636800, 256.30, 285.34, 249.87, 285.07, 57008000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 256.30,
  price_high = 285.34,
  price_low = 249.87,
  price_open = 285.07,
  volume = 57008000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-19', 1426723200, 260.93, 264.24, 248.64, 255.88, 52732000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 260.93,
  price_high = 264.24,
  price_low = 248.64,
  price_open = 255.88,
  volume = 52732000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-20', 1426809600, 261.75, 264.85, 259.16, 260.96, 18456700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 261.75,
  price_high = 264.85,
  price_low = 259.16,
  price_open = 260.96,
  volume = 18456700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-21', 1426896000, 260.02, 262.20, 255.65, 261.64, 17130100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 260.02,
  price_high = 262.20,
  price_low = 255.65,
  price_open = 261.64,
  volume = 17130100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-22', 1426982400, 267.96, 269.75, 259.59, 259.92, 18438100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 267.96,
  price_high = 269.75,
  price_low = 259.59,
  price_open = 259.92,
  volume = 18438100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-23', 1427068800, 266.74, 277.30, 261.74, 267.89, 22811900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 266.74,
  price_high = 277.30,
  price_low = 261.74,
  price_open = 267.89,
  volume = 22811900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-24', 1427155200, 245.60, 267.00, 244.15, 266.58, 40073700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 245.60,
  price_high = 267.00,
  price_low = 244.15,
  price_open = 266.58,
  volume = 40073700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-25', 1427241600, 246.20, 249.19, 236.51, 247.47, 35866900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 246.20,
  price_high = 249.19,
  price_low = 236.51,
  price_open = 247.47,
  volume = 35866900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-26', 1427328000, 248.53, 254.35, 244.90, 246.28, 25730000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 248.53,
  price_high = 254.35,
  price_low = 244.90,
  price_open = 246.28,
  volume = 25730000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-27', 1427414400, 247.03, 256.81, 245.21, 248.57, 17274900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 247.03,
  price_high = 256.81,
  price_low = 245.21,
  price_open = 248.57,
  volume = 17274900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-28', 1427500800, 252.80, 254.21, 246.98, 246.98, 16040900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 252.80,
  price_high = 254.21,
  price_low = 246.98,
  price_open = 246.98,
  volume = 16040900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-29', 1427587200, 242.71, 253.14, 240.85, 252.74, 21699400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 242.71,
  price_high = 253.14,
  price_low = 240.85,
  price_open = 252.74,
  volume = 21699400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-30', 1427673600, 247.53, 249.24, 239.21, 242.88, 23009600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 247.53,
  price_high = 249.24,
  price_low = 239.21,
  price_open = 242.88,
  volume = 23009600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-03-31', 1427760000, 244.22, 248.73, 242.74, 247.45, 22672000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 244.22,
  price_high = 248.73,
  price_low = 242.74,
  price_open = 247.45,
  volume = 22672000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-04-01', 1427846400, 247.27, 247.54, 241.16, 244.22, 22877200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 247.27,
  price_high = 247.54,
  price_low = 241.16,
  price_open = 244.22,
  volume = 22877200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-04-02', 1427932800, 253.01, 254.46, 245.42, 247.09, 26272600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 253.01,
  price_high = 254.46,
  price_low = 245.42,
  price_open = 247.09,
  volume = 26272600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-04-03', 1428019200, 254.32, 256.04, 251.88, 253.07, 23146600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 254.32,
  price_high = 256.04,
  price_low = 251.88,
  price_open = 253.07,
  volume = 23146600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-04-04', 1428105600, 253.70, 255.26, 251.10, 254.29, 12493500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 253.70,
  price_high = 255.26,
  price_low = 251.10,
  price_open = 254.29,
  volume = 12493500,
  year = 2015,
  updated_at = NOW();