INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2014-12-26', 1419552000, 327.92, 331.42, 316.63, 319.15, 16410500, 2014, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 327.92,
  price_high = 331.42,
  price_low = 316.63,
  price_open = 319.15,
  volume = 16410500,
  year = 2014,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2014-12-27', 1419638400, 315.86, 328.91, 312.63, 327.58, 15185200, 2014, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 315.86,
  price_high = 328.91,
  price_low = 312.63,
  price_open = 327.58,
  volume = 15185200,
  year = 2014,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2014-12-28', 1419724800, 317.24, 320.03, 311.08, 316.16, 11676600, 2014, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 317.24,
  price_high = 320.03,
  price_low = 311.08,
  price_open = 316.16,
  volume = 11676600,
  year = 2014,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2014-12-29', 1419811200, 312.67, 320.27, 312.31, 317.70, 12302500, 2014, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 312.67,
  price_high = 320.27,
  price_low = 312.31,
  price_open = 317.70,
  volume = 12302500,
  year = 2014,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2014-12-30', 1419897600, 310.74, 314.81, 309.37, 312.72, 12528300, 2014, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 310.74,
  price_high = 314.81,
  price_low = 309.37,
  price_open = 312.72,
  volume = 12528300,
  year = 2014,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2014-12-31', 1419984000, 320.19, 320.19, 310.21, 310.91, 13942900, 2014, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 320.19,
  price_high = 320.19,
  price_low = 310.21,
  price_open = 310.91,
  volume = 13942900,
  year = 2014,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-01', 1420070400, 314.25, 320.43, 314.00, 320.43, 8036550, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 314.25,
  price_high = 320.43,
  price_low = 314.00,
  price_open = 320.43,
  volume = 8036550,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-02', 1420156800, 315.03, 315.84, 313.57, 314.08, 7860650, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 315.03,
  price_high = 315.84,
  price_low = 313.57,
  price_open = 314.08,
  volume = 7860650,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-03', 1420243200, 281.08, 315.15, 281.08, 314.85, 33054400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 281.08,
  price_high = 315.15,
  price_low = 281.08,
  price_open = 314.85,
  volume = 33054400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-04', 1420329600, 264.20, 287.23, 257.61, 281.15, 55629100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 264.20,
  price_high = 287.23,
  price_low = 257.61,
  price_open = 281.15,
  volume = 55629100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-05', 1420416000, 274.47, 278.34, 265.08, 265.08, 43962800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 274.47,
  price_high = 278.34,
  price_low = 265.08,
  price_open = 265.08,
  volume = 43962800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-06', 1420502400, 286.19, 287.55, 272.70, 274.61, 23245700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 286.19,
  price_high = 287.55,
  price_low = 272.70,
  price_open = 274.61,
  volume = 23245700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-07', 1420588800, 294.34, 298.75, 283.08, 286.08, 24866800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 294.34,
  price_high = 298.75,
  price_low = 283.08,
  price_open = 286.08,
  volume = 24866800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-08', 1420675200, 283.35, 294.14, 282.17, 294.14, 19982500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 283.35,
  price_high = 294.14,
  price_low = 282.17,
  price_open = 294.14,
  volume = 19982500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-09', 1420761600, 290.41, 291.11, 280.53, 282.38, 18718600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 290.41,
  price_high = 291.11,
  price_low = 280.53,
  price_open = 282.38,
  volume = 18718600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-10', 1420848000, 274.80, 288.13, 273.97, 287.30, 15264300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 274.80,
  price_high = 288.13,
  price_low = 273.97,
  price_open = 287.30,
  volume = 15264300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-11', 1420934400, 265.66, 279.64, 265.04, 274.61, 18200800, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 265.66,
  price_high = 279.64,
  price_low = 265.04,
  price_open = 274.61,
  volume = 18200800,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-12', 1421020800, 267.80, 272.20, 265.20, 266.15, 18880300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 267.80,
  price_high = 272.20,
  price_low = 265.20,
  price_open = 266.15,
  volume = 18880300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-13', 1421107200, 225.86, 268.28, 219.91, 267.39, 72843904, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 225.86,
  price_high = 268.28,
  price_low = 219.91,
  price_open = 267.39,
  volume = 72843904,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-14', 1421193600, 178.10, 223.89, 171.51, 223.89, 97638704, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 178.10,
  price_high = 223.89,
  price_low = 171.51,
  price_open = 223.89,
  volume = 97638704,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-15', 1421280000, 209.84, 229.07, 176.90, 176.90, 81773504, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 209.84,
  price_high = 229.07,
  price_low = 176.90,
  price_open = 176.90,
  volume = 81773504,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-16', 1421366400, 208.10, 221.59, 199.77, 209.07, 38421000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 208.10,
  price_high = 221.59,
  price_low = 199.77,
  price_open = 209.07,
  volume = 38421000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-17', 1421452800, 199.26, 211.73, 194.88, 207.83, 23469700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 199.26,
  price_high = 211.73,
  price_low = 194.88,
  price_open = 207.83,
  volume = 23469700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-18', 1421539200, 210.34, 218.70, 194.51, 200.05, 30085100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 210.34,
  price_high = 218.70,
  price_low = 194.51,
  price_open = 200.05,
  volume = 30085100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-19', 1421625600, 214.86, 216.73, 207.32, 211.47, 18658300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 214.86,
  price_high = 216.73,
  price_low = 207.32,
  price_open = 211.47,
  volume = 18658300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-20', 1421712000, 211.32, 215.24, 205.15, 212.91, 24051100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 211.32,
  price_high = 215.24,
  price_low = 205.15,
  price_open = 212.91,
  volume = 24051100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-21', 1421798400, 226.90, 227.79, 211.21, 211.38, 29924600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 226.90,
  price_high = 227.79,
  price_low = 211.21,
  price_open = 211.38,
  volume = 29924600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-22', 1421884800, 233.41, 237.02, 226.43, 227.32, 33544600, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 233.41,
  price_high = 237.02,
  price_low = 226.43,
  price_open = 227.32,
  volume = 33544600,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-23', 1421971200, 232.88, 234.85, 225.20, 233.52, 24621700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 232.88,
  price_high = 234.85,
  price_low = 225.20,
  price_open = 233.52,
  volume = 24621700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-24', 1422057600, 247.85, 248.21, 230.02, 232.70, 24782500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 247.85,
  price_high = 248.21,
  price_low = 230.02,
  price_open = 232.70,
  volume = 24782500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-25', 1422144000, 253.72, 255.07, 243.89, 247.35, 33582700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 253.72,
  price_high = 255.07,
  price_low = 243.89,
  price_open = 247.35,
  volume = 33582700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-26', 1422230400, 273.47, 309.38, 254.08, 254.08, 106794000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 273.47,
  price_high = 309.38,
  price_low = 254.08,
  price_open = 254.08,
  volume = 106794000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-27', 1422316800, 263.48, 275.48, 250.65, 273.17, 44399000, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 263.48,
  price_high = 275.48,
  price_low = 250.65,
  price_open = 273.17,
  volume = 44399000,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-28', 1422403200, 233.91, 266.54, 227.05, 263.35, 44352200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 233.91,
  price_high = 266.54,
  price_low = 227.05,
  price_open = 263.35,
  volume = 44352200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-29', 1422489600, 233.51, 238.71, 220.71, 233.35, 32213400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 233.51,
  price_high = 238.71,
  price_low = 220.71,
  price_open = 233.35,
  volume = 32213400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-30', 1422576000, 226.43, 242.85, 225.84, 232.77, 26605200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 226.43,
  price_high = 242.85,
  price_low = 225.84,
  price_open = 232.77,
  volume = 26605200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-01-31', 1422662400, 217.46, 233.50, 216.31, 226.44, 23348200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 217.46,
  price_high = 233.50,
  price_low = 216.31,
  price_open = 226.44,
  volume = 23348200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-01', 1422748800, 226.97, 231.57, 212.01, 216.87, 29128500, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 226.97,
  price_high = 231.57,
  price_low = 212.01,
  price_open = 216.87,
  volume = 29128500,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-02', 1422835200, 238.23, 242.18, 222.66, 226.49, 30612100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 238.23,
  price_high = 242.18,
  price_low = 222.66,
  price_open = 226.49,
  volume = 30612100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-03', 1422921600, 227.27, 245.96, 224.48, 237.45, 40783700, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 227.27,
  price_high = 245.96,
  price_low = 224.48,
  price_open = 237.45,
  volume = 40783700,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-04', 1423008000, 226.85, 230.06, 221.11, 227.51, 26594300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 226.85,
  price_high = 230.06,
  price_low = 221.11,
  price_open = 227.51,
  volume = 26594300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-05', 1423094400, 217.11, 239.40, 214.73, 227.66, 22516400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 217.11,
  price_high = 239.40,
  price_low = 214.73,
  price_open = 227.66,
  volume = 22516400,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-06', 1423180800, 222.27, 230.51, 216.23, 216.92, 24435300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 222.27,
  price_high = 230.51,
  price_low = 216.23,
  price_open = 216.92,
  volume = 24435300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-07', 1423267200, 227.75, 230.30, 222.61, 222.63, 21604200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 227.75,
  price_high = 230.30,
  price_low = 222.61,
  price_open = 222.63,
  volume = 21604200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-08', 1423353600, 223.41, 229.44, 221.08, 227.69, 17145200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 223.41,
  price_high = 229.44,
  price_low = 221.08,
  price_open = 227.69,
  volume = 17145200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-09', 1423440000, 220.11, 223.98, 217.02, 223.39, 27791300, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 220.11,
  price_high = 223.98,
  price_low = 217.02,
  price_open = 223.39,
  volume = 27791300,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-10', 1423526400, 219.84, 221.81, 215.33, 220.28, 21115100, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 219.84,
  price_high = 221.81,
  price_low = 215.33,
  price_open = 220.28,
  volume = 21115100,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-11', 1423612800, 219.18, 223.41, 218.07, 219.73, 17201900, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 219.18,
  price_high = 223.41,
  price_low = 218.07,
  price_open = 219.73,
  volume = 17201900,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-12', 1423699200, 221.76, 222.20, 217.61, 219.21, 15206200, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 221.76,
  price_high = 222.20,
  price_low = 217.61,
  price_open = 219.21,
  volume = 15206200,
  year = 2015,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2015-02-13', 1423785600, 235.43, 240.26, 221.26, 221.97, 42744400, 2015, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 235.43,
  price_high = 240.26,
  price_low = 221.26,
  price_open = 221.97,
  volume = 42744400,
  year = 2015,
  updated_at = NOW();