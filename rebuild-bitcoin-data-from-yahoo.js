#!/usr/bin/env node

/**
 * Rebuild Bitcoin price data from Yahoo Finance
 * From September 17, 2024 to today
 * Includes: Open, High, Low, Close, Volume
 * Generates SQL for Supabase update
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const TICKER = 'BTC-USD';
const START_DATE = new Date('2024-09-17'); // Sept 17, 2024
const END_DATE = new Date(); // Today

// Convert JS date to Unix timestamp
function dateToUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

// Fetch data from Yahoo Finance API
async function fetchYahooData() {
  const startUnix = dateToUnix(START_DATE);
  const endUnix = dateToUnix(END_DATE);

  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${TICKER}?modules=price&region=US`;
  
  // Alternative: Use the historical data endpoint
  const historicalUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${TICKER}?period1=${startUnix}&period2=${endUnix}&interval=1d&includePrePost=false&events=div,splits`;

  console.log(`📊 Fetching Bitcoin data from Yahoo Finance...`);
  console.log(`   Period: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`);
  console.log(`   URL: ${historicalUrl}\n`);

  try {
    const response = await fetch(historicalUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      console.error('❌ Invalid response format from Yahoo Finance');
      console.error(JSON.stringify(data, null, 2));
      return [];
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote[0] || {};

    if (timestamps.length === 0) {
      console.warn('⚠️  No data returned from Yahoo Finance');
      return [];
    }

    const priceData = timestamps.map((timestamp, index) => {
      const date = new Date(timestamp * 1000);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

      const open = quotes.open?.[index] || null;
      const high = quotes.high?.[index] || null;
      const low = quotes.low?.[index] || null;
      const close = quotes.close?.[index] || null;
      const volume = quotes.volume?.[index] || 0;

      // Calculate average price (used as purchase price for DCA)
      const validPrices = [open, high, low, close].filter(p => p !== null);
      const avgPrice = validPrices.length > 0 
        ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length 
        : close;

      return {
        date: dateStr,
        timestamp,
        price_usd: close || avgPrice,
        price_high: high,
        price_low: low,
        price_open: open,
        volume,
        avg_price: avgPrice,
        year: date.getFullYear()
      };
    });

    console.log(`✅ Downloaded ${priceData.length} days of Bitcoin data\n`);
    return priceData;

  } catch (error) {
    console.error('❌ Error fetching from Yahoo Finance:', error.message);
    return [];
  }
}

// Generate SQL UPDATE statements
function generateSQL(priceData) {
  let sql = `-- ============================================================
-- REBUILD: Bitcoin data from Yahoo Finance
-- Period: Sept 17, 2024 to Today
-- Total Records: ${priceData.length}
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- DISABLE TRIGGERS TEMPORARILY (for faster updates)
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- FIRST: Delete all data from Sept 17, 2024 onwards
DELETE FROM bitcoin_price_data WHERE date >= '2024-09-17';

-- INSERT NEW DATA FROM YAHOO FINANCE
`;

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
    const highVal = price_high ? price_high.toFixed(2) : 'NULL';
    const lowVal = price_low ? price_low.toFixed(2) : 'NULL';
    const openVal = price_open ? price_open.toFixed(2) : 'NULL';
    const priceVal = price_usd ? price_usd.toFixed(2) : 'NULL';
    const volVal = volume ? volume.toFixed(0) : '0';

    sql += `INSERT INTO bitcoin_price_data (date, timestamp, price_usd, price_eur, price_high, price_low, price_open, volume, year, created_at, updated_at)
VALUES ('${date}', ${timestamp}, ${priceVal}, NULL, ${highVal === 'NULL' ? 'NULL' : priceVal}, ${lowVal === 'NULL' ? 'NULL' : priceVal}, ${openVal === 'NULL' ? 'NULL' : priceVal}, ${volVal}, ${year}, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = ${priceVal},
  price_high = ${highVal === 'NULL' ? 'NULL' : priceVal},
  price_low = ${lowVal === 'NULL' ? 'NULL' : priceVal},
  price_open = ${openVal === 'NULL' ? 'NULL' : priceVal},
  volume = ${volVal},
  year = ${year},
  updated_at = NOW();
`;
  });

  sql += `
-- RE-ENABLE TRIGGERS
ALTER TABLE bitcoin_price_data ENABLE TRIGGER ALL;

-- VERIFY
SELECT COUNT(*) as total_records FROM bitcoin_price_data;
SELECT MIN(date) as oldest_date, MAX(date) as newest_date FROM bitcoin_price_data WHERE date >= '2024-09-17';
`;

  return sql;
}

// Main execution
async function main() {
  try {
    // Fetch data from Yahoo Finance
    const priceData = await fetchYahooData();

    if (priceData.length === 0) {
      console.error('❌ No data to process');
      process.exit(1);
    }

    // Generate SQL
    const sql = generateSQL(priceData);

    // Save SQL file
    const sqlFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'rebuild-bitcoin-data-yahoo.sql');
    fs.writeFileSync(sqlFilePath, sql);
    console.log(`✅ SQL generated: ${sqlFilePath}`);

    // Save JSON data
    const jsonFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-rebuild-data.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(priceData, null, 2));
    console.log(`✅ JSON data saved: ${jsonFilePath}`);

    // Save CSV data
    const csvHeader = 'date,timestamp,open,high,low,close,volume,avg_price,year\n';
    const csvData = priceData.map(d => 
      `${d.date},${d.timestamp},${d.price_open || ''},${d.price_high || ''},${d.price_low || ''},${d.price_usd},${d.volume},${d.avg_price ? d.avg_price.toFixed(2) : d.price_usd},${d.year}`
    ).join('\n');
    const csvFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-rebuild-data.csv');
    fs.writeFileSync(csvFilePath, csvHeader + csvData);
    console.log(`✅ CSV data saved: ${csvFilePath}`);

    // Show summary
    console.log('\n📊 Data Summary:');
    console.log(`   First date: ${priceData[0].date} - $${priceData[0].price_usd.toFixed(2)}`);
    console.log(`   Last date: ${priceData[priceData.length - 1].date} - $${priceData[priceData.length - 1].price_usd.toFixed(2)}`);
    console.log(`   Highest: $${Math.max(...priceData.map(d => d.price_high || d.price_usd)).toFixed(2)}`);
    console.log(`   Lowest: $${Math.min(...priceData.map(d => d.price_low || d.price_usd)).toFixed(2)}`);

    console.log('\n🚀 Next steps:');
    console.log(`   1. Review ${path.basename(sqlFilePath)}`);
    console.log(`   2. Run SQL in Supabase SQL Editor`);
    console.log(`   3. Refresh website to see updated charts`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

