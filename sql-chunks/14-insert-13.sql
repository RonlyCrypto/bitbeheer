INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-09', 1462752000, 460.48, 462.48, 456.53, 458.21, 55493100, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 460.48,
  price_high = 462.48,
  price_low = 456.53,
  price_open = 458.21,
  volume = 55493100,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-10', 1462838400, 450.89, 461.93, 448.95, 460.52, 58956100, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 450.89,
  price_high = 461.93,
  price_low = 448.95,
  price_open = 460.52,
  volume = 58956100,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-11', 1462924800, 452.73, 454.58, 450.86, 450.86, 50605200, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 452.73,
  price_high = 454.58,
  price_low = 450.86,
  price_open = 450.86,
  volume = 50605200,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-12', 1463011200, 454.77, 454.95, 449.25, 452.45, 59849300, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 454.77,
  price_high = 454.95,
  price_low = 449.25,
  price_open = 452.45,
  volume = 59849300,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-13', 1463097600, 455.67, 457.05, 453.45, 454.85, 60845000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 455.67,
  price_high = 457.05,
  price_low = 453.45,
  price_open = 454.85,
  volume = 60845000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-14', 1463184000, 455.67, 456.84, 454.79, 455.82, 37209000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 455.67,
  price_high = 456.84,
  price_low = 454.79,
  price_open = 455.82,
  volume = 37209000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-15', 1463270400, 457.57, 458.69, 455.46, 455.76, 28514000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 457.57,
  price_high = 458.69,
  price_low = 455.46,
  price_open = 455.76,
  volume = 28514000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-16', 1463356800, 454.16, 458.20, 452.95, 457.59, 59171500, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 454.16,
  price_high = 458.20,
  price_low = 452.95,
  price_open = 457.59,
  volume = 59171500,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-17', 1463443200, 453.78, 455.07, 453.61, 454.01, 64100300, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 453.78,
  price_high = 455.07,
  price_low = 453.61,
  price_open = 454.01,
  volume = 64100300,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-18', 1463529600, 454.62, 456.00, 453.30, 453.69, 86850096, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 454.62,
  price_high = 456.00,
  price_low = 453.30,
  price_open = 453.69,
  volume = 86850096,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-19', 1463616000, 438.71, 454.63, 438.71, 454.52, 96027400, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 438.71,
  price_high = 454.63,
  price_low = 438.71,
  price_open = 454.52,
  volume = 96027400,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-20', 1463702400, 442.68, 444.05, 437.39, 437.79, 81987904, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 442.68,
  price_high = 444.05,
  price_low = 437.39,
  price_open = 437.79,
  volume = 81987904,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-21', 1463788800, 443.19, 443.78, 441.71, 442.97, 42762300, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 443.19,
  price_high = 443.78,
  price_low = 441.71,
  price_open = 442.97,
  volume = 42762300,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-22', 1463875200, 439.32, 443.43, 439.04, 443.22, 39657600, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 439.32,
  price_high = 443.43,
  price_low = 439.04,
  price_open = 443.22,
  volume = 39657600,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-23', 1463961600, 444.15, 444.35, 438.82, 439.35, 50582500, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 444.15,
  price_high = 444.35,
  price_low = 438.82,
  price_open = 439.35,
  volume = 50582500,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-24', 1464048000, 445.98, 447.10, 443.93, 444.29, 65783100, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 445.98,
  price_high = 447.10,
  price_low = 443.93,
  price_open = 444.29,
  volume = 65783100,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-25', 1464134400, 449.60, 450.30, 446.06, 446.06, 65231000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 449.60,
  price_high = 450.30,
  price_low = 446.06,
  price_open = 446.06,
  volume = 65231000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-26', 1464220800, 453.38, 453.64, 447.90, 449.67, 65203800, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 453.38,
  price_high = 453.64,
  price_low = 447.90,
  price_open = 449.67,
  volume = 65203800,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-27', 1464307200, 473.46, 478.15, 453.52, 453.52, 164780992, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 473.46,
  price_high = 478.15,
  price_low = 453.52,
  price_open = 453.52,
  volume = 164780992,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-28', 1464393600, 530.04, 533.47, 472.70, 473.03, 181199008, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 530.04,
  price_high = 533.47,
  price_low = 472.70,
  price_open = 473.03,
  volume = 181199008,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-29', 1464480000, 526.23, 553.96, 512.18, 527.48, 148736992, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 526.23,
  price_high = 553.96,
  price_low = 512.18,
  price_open = 527.48,
  volume = 148736992,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-30', 1464566400, 533.86, 544.35, 522.96, 528.47, 87958704, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 533.86,
  price_high = 544.35,
  price_low = 522.96,
  price_open = 528.47,
  volume = 87958704,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-05-31', 1464652800, 531.39, 546.62, 520.66, 534.19, 138450000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 531.39,
  price_high = 546.62,
  price_low = 520.66,
  price_open = 534.19,
  volume = 138450000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-01', 1464739200, 536.92, 543.08, 525.64, 531.11, 86061800, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 536.92,
  price_high = 543.08,
  price_low = 525.64,
  price_open = 531.11,
  volume = 86061800,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-02', 1464825600, 537.97, 540.35, 533.08, 536.52, 60378200, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 537.97,
  price_high = 540.35,
  price_low = 533.08,
  price_open = 536.52,
  volume = 60378200,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-03', 1464912000, 569.19, 574.64, 536.92, 537.68, 122020000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 569.19,
  price_high = 574.64,
  price_low = 536.92,
  price_open = 537.68,
  volume = 122020000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-04', 1464998400, 572.73, 590.13, 564.24, 569.71, 94925296, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 572.73,
  price_high = 590.13,
  price_low = 564.24,
  price_open = 569.71,
  volume = 94925296,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-05', 1465084800, 574.98, 582.81, 569.18, 573.31, 68874096, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 574.98,
  price_high = 582.81,
  price_low = 569.18,
  price_open = 573.31,
  volume = 68874096,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-06', 1465171200, 585.54, 586.47, 574.60, 574.60, 72138896, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 585.54,
  price_high = 586.47,
  price_low = 574.60,
  price_open = 574.60,
  volume = 72138896,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-07', 1465257600, 576.60, 590.26, 567.51, 585.45, 107770000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 576.60,
  price_high = 590.26,
  price_low = 567.51,
  price_open = 585.45,
  volume = 107770000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-08', 1465344000, 581.65, 582.84, 573.13, 577.17, 80265800, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 581.65,
  price_high = 582.84,
  price_low = 573.13,
  price_open = 577.17,
  volume = 80265800,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-09', 1465430400, 574.63, 582.20, 570.95, 582.20, 71301000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 574.63,
  price_high = 582.20,
  price_low = 570.95,
  price_open = 582.20,
  volume = 71301000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-10', 1465516800, 577.47, 579.13, 573.33, 575.84, 66991900, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 577.47,
  price_high = 579.13,
  price_low = 573.33,
  price_open = 575.84,
  volume = 66991900,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-11', 1465603200, 606.73, 607.12, 578.67, 578.67, 82357000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 606.73,
  price_high = 607.12,
  price_low = 578.67,
  price_open = 578.67,
  volume = 82357000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-12', 1465689600, 672.78, 684.84, 607.04, 609.68, 277084992, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 672.78,
  price_high = 684.84,
  price_low = 607.04,
  price_open = 609.68,
  volume = 277084992,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-13', 1465776000, 704.38, 716.00, 664.49, 671.65, 243295008, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 704.38,
  price_high = 716.00,
  price_low = 664.49,
  price_open = 671.65,
  volume = 243295008,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-14', 1465862400, 685.56, 704.50, 662.80, 704.50, 186694000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 685.56,
  price_high = 704.50,
  price_low = 662.80,
  price_open = 704.50,
  volume = 186694000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-15', 1465948800, 694.47, 696.30, 672.56, 685.68, 99223800, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 694.47,
  price_high = 696.30,
  price_low = 672.56,
  price_open = 685.68,
  volume = 99223800,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-16', 1466035200, 766.31, 773.72, 696.52, 696.52, 271633984, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 766.31,
  price_high = 773.72,
  price_low = 696.52,
  price_open = 696.52,
  volume = 271633984,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-17', 1466121600, 748.91, 775.36, 716.56, 768.49, 363320992, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 748.91,
  price_high = 775.36,
  price_low = 716.56,
  price_open = 768.49,
  volume = 363320992,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-18', 1466208000, 756.23, 777.99, 733.93, 748.76, 252718000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 756.23,
  price_high = 777.99,
  price_low = 733.93,
  price_open = 748.76,
  volume = 252718000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-19', 1466294400, 763.78, 766.62, 745.63, 756.69, 136184992, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 763.78,
  price_high = 766.62,
  price_low = 745.63,
  price_open = 756.69,
  volume = 136184992,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-20', 1466380800, 737.23, 764.08, 732.73, 763.93, 174511008, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 737.23,
  price_high = 764.08,
  price_low = 732.73,
  price_open = 763.93,
  volume = 174511008,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-21', 1466467200, 666.65, 735.88, 639.07, 735.88, 309944000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 666.65,
  price_high = 735.88,
  price_low = 639.07,
  price_open = 735.88,
  volume = 309944000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-22', 1466553600, 596.12, 678.67, 587.48, 665.91, 266392992, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 596.12,
  price_high = 678.67,
  price_low = 587.48,
  price_open = 665.91,
  volume = 266392992,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-23', 1466640000, 623.98, 629.33, 558.14, 597.44, 253462000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 623.98,
  price_high = 629.33,
  price_low = 558.14,
  price_open = 597.44,
  volume = 253462000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-24', 1466726400, 665.30, 681.73, 625.27, 625.58, 224316992, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 665.30,
  price_high = 681.73,
  price_low = 625.27,
  price_open = 625.58,
  volume = 224316992,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-25', 1466812800, 665.12, 691.73, 646.56, 665.28, 126656000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 665.12,
  price_high = 691.73,
  price_low = 646.56,
  price_open = 665.28,
  volume = 126656000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-26', 1466899200, 629.37, 665.98, 616.93, 665.93, 109225000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 629.37,
  price_high = 665.98,
  price_low = 616.93,
  price_open = 665.93,
  volume = 109225000,
  year = 2016,
  updated_at = NOW();
INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('2016-06-27', 1466985600, 655.28, 655.28, 620.52, 629.35, 122134000, 2016, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = 655.28,
  price_high = 655.28,
  price_low = 620.52,
  price_open = 629.35,
  volume = 122134000,
  year = 2016,
  updated_at = NOW();