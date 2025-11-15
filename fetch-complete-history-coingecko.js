#!/usr/bin/env node

/**
 * Fetch COMPLETE Bitcoin history from CoinGecko
 * From January 1, 2009 to Today
 * CoinGecko provides free historical data without API key needed
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const COIN_ID = 'bitcoin';
const VS_CURRENCY = 'usd';

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch historical data from CoinGecko
 * CoinGecko API endpoint for historical data
 */
async function fetchFromCoinGecko() {
  console.log(`📊 Fetching complete Bitcoin history from CoinGecko...`);
  console.log(`   Coin: ${COIN_ID}`);
  console.log(`   Currency: ${VS_CURRENCY}`);
  console.log(`   Period: 2009-01-01 to today\n`);

  const allData = [];
  let page = 1;
  const perPage = 250; // Max per request

  try {
    // Get complete market history using the public endpoint (no API key needed)
    const url = `https://api.coingecko.com/api/v3/coins/${COIN_ID}/market_chart?vs_currency=${VS_CURRENCY}&days=max`;

    console.log(`   Fetching: ${url.substring(0, 80)}...\n`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BitBeheer/1.0)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.prices || data.prices.length === 0) {
      console.error('❌ No price data returned from CoinGecko');
      return [];
    }

    console.log(`✅ Downloaded ${data.prices.length} daily prices from CoinGecko\n`);

    // Convert CoinGecko format to our format
    const priceData = data.prices.map((pricePoint, index) => {
      const timestamp = Math.floor(pricePoint[0] / 1000); // Convert ms to seconds
      const date = new Date(pricePoint[0]);
      const dateStr = date.toISOString().split('T')[0];

      // For OHLC, we'll use the closing price as all values
      // (CoinGecko's market_chart only provides daily close)
      const price = parseFloat(pricePoint[1]);

      return {
        date: dateStr,
        timestamp,
        price_usd: price,
        price_high: price,      // Using close as OHLC proxy
        price_low: price,
        price_open: price,
        volume: 0,              // Not available in this endpoint
        avg_price: price,
        year: date.getFullYear()
      };
    });

    // Filter to only keep data from 2009 onwards and remove duplicates
    const seen = new Set();
    const unique = priceData.filter(item => {
      const year = item.year;
      if (year < 2009 || seen.has(item.date)) return false;
      seen.add(item.date);
      return true;
    });

    return unique;

  } catch (error) {
    console.error('❌ Error fetching from CoinGecko:', error.message);
    
    if (error.message.includes('429')) {
      console.log('\n⚠️  Rate limit hit! CoinGecko allows limited free requests.');
      console.log('   Wait a moment and try again, or use Yahoo Finance data.');
    }
    
    return [];
  }
}

/**
 * Load existing Supabase data to merge with new data
 */
function loadExistingData() {
  try {
    const sqlPath = path.join('/Users/giovanni/AI code/DCA platform', 'rebuild-bitcoin-data-yahoo.sql');
    if (fs.existsSync(sqlPath)) {
      console.log('✅ Found existing Yahoo Finance data\n');
      return true;
    }
  } catch (error) {
    console.error('⚠️  Could not find existing data:', error.message);
  }
  return false;
}

/**
 * Generate SQL INSERT statements
 */
function generateSQL(priceData) {
  let sql = `-- ============================================================
-- COMPLETE Bitcoin history from CoinGecko
-- Period: ${priceData.length > 0 ? priceData[0].date : 'N/A'} to ${priceData.length > 0 ? priceData[priceData.length - 1].date : 'N/A'}
-- Total Records: ${priceData.length}
-- Source: CoinGecko API
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- DISABLE TRIGGERS TEMPORARILY (for faster updates)
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- CLEAR old CoinGecko data (keep only 2024-09-17 onwards which is Yahoo data)
DELETE FROM bitcoin_price_data WHERE date < '2024-09-17';

`;

  // Generate INSERT statements
  priceData.forEach(data => {
    const {
      date,
      timestamp,
      price_usd,
      price_high,
      price_low,
      price_open,
      volume,
      year
    } = data;

    // Handle null values safely
    const priceVal = price_usd ? price_usd.toFixed(2) : 'NULL';
    const highVal = price_high ? price_high.toFixed(2) : 'NULL';
    const lowVal = price_low ? price_low.toFixed(2) : 'NULL';
    const openVal = price_open ? price_open.toFixed(2) : 'NULL';
    const volVal = volume ? Math.floor(volume) : '0';

    sql += `INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('${date}', ${timestamp}, ${priceVal}, ${highVal}, ${lowVal}, ${openVal}, ${volVal}, ${year}, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = COALESCE(EXCLUDED.price_usd, price_usd),
  price_high = COALESCE(EXCLUDED.price_high, price_high),
  price_low = COALESCE(EXCLUDED.price_low, price_low),
  price_open = COALESCE(EXCLUDED.price_open, price_open),
  volume = COALESCE(EXCLUDED.volume, volume),
  year = ${year},
  updated_at = NOW();
`;
  });

  sql += `
-- RE-ENABLE TRIGGERS
ALTER TABLE bitcoin_price_data ENABLE TRIGGER ALL;

-- VERIFY
SELECT COUNT(*) as total_records FROM bitcoin_price_data;
SELECT MIN(date) as oldest_date, MAX(date) as newest_date FROM bitcoin_price_data;
SELECT DISTINCT year FROM bitcoin_price_data ORDER BY year DESC;

-- Show sample data from each decade
SELECT date, price_usd, year FROM bitcoin_price_data 
WHERE date IN ('2009-01-09', '2013-01-01', '2017-01-01', '2020-01-01', '2024-01-01', '2025-11-15')
ORDER BY date;
`;

  return sql;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 COMPLETE Bitcoin History - CoinGecko Edition\n');

    // Fetch from CoinGecko
    const coingeckoData = await fetchFromCoinGecko();

    if (coingeckoData.length === 0) {
      console.error('❌ Failed to fetch data from CoinGecko');
      process.exit(1);
    }

    console.log(`📊 Data Summary:`);
    console.log(`   Total records: ${coingeckoData.length}`);
    console.log(`   Date range: ${coingeckoData[0].date} to ${coingeckoData[coingeckoData.length - 1].date}`);
    
    const years = new Set(coingeckoData.map(d => d.year));
    console.log(`   Years covered: ${years.size} (${Array.from(years).sort().join(', ')})`);
    
    const prices = coingeckoData.map(d => d.price_usd).filter(p => p);
    console.log(`   Lowest:  $${Math.min(...prices).toFixed(2)}`);
    console.log(`   Highest: $${Math.max(...prices).toFixed(2)}\n`);

    // Generate SQL
    const sql = generateSQL(coingeckoData);

    // Save SQL file
    const sqlFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'complete-bitcoin-history-coingecko.sql');
    fs.writeFileSync(sqlFilePath, sql);
    console.log(`✅ SQL generated: ${sqlFilePath}`);
    console.log(`   File size: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);

    // Save JSON
    const jsonFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-complete-history-coingecko.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(coingeckoData, null, 2));
    console.log(`✅ JSON saved: ${jsonFilePath}`);

    // Save CSV
    const csvHeader = 'date,timestamp,open,high,low,close,volume,avg_price,year\n';
    const csvData = coingeckoData.map(d => 
      `${d.date},${d.timestamp},${d.price_open || ''},${d.price_high || ''},${d.price_low || ''},${d.price_usd},${d.volume},${d.avg_price ? d.avg_price.toFixed(2) : d.price_usd},${d.year}`
    ).join('\n');
    const csvFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-complete-history-coingecko.csv');
    fs.writeFileSync(csvFilePath, csvHeader + csvData);
    console.log(`✅ CSV saved: ${csvFilePath}`);

    console.log('\n🚀 Next steps:');
    console.log(`   1. Open ${path.basename(sqlFilePath)}`);
    console.log(`   2. Copy all content`);
    console.log(`   3. Paste into Supabase SQL Editor`);
    console.log(`   4. Click RUN`);
    console.log(`   5. Hard refresh browser (Cmd+Shift+R)`);
    console.log(`   6. Bitcoin chart now shows complete 2009-today history! 📊`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

