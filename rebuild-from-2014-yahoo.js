#!/usr/bin/env node

/**
 * Rebuild ALL Bitcoin data from 2014 onwards using Yahoo Finance
 * This will REPLACE all existing data from 2014-11-15
 * Keep only 2009-2013 if available
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const TICKER = 'BTC-USD';
const START_DATE = new Date('2014-01-01'); // Start from 2014
const END_DATE = new Date(); // Today

// Convert JS date to Unix timestamp
function dateToUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

// Fetch data from Yahoo Finance API
async function fetchYahooData() {
  const startUnix = dateToUnix(START_DATE);
  const endUnix = dateToUnix(END_DATE);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${TICKER}?period1=${startUnix}&period2=${endUnix}&interval=1d&includePrePost=false&events=div,splits`;

  console.log(`📊 Fetching Bitcoin data from Yahoo Finance...`);
  console.log(`   Period: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`);
  console.log(`   URL: ${url}\n`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      console.error('❌ Invalid response format from Yahoo Finance');
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
      const dateStr = date.toISOString().split('T')[0];

      const open = quotes.open?.[index];
      const high = quotes.high?.[index];
      const low = quotes.low?.[index];
      const close = quotes.close?.[index];
      const volume = quotes.volume?.[index] || 0;

      // Calculate average price
      const validPrices = [open, high, low, close].filter(p => p !== null && p !== undefined);
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

    console.log(`✅ Downloaded ${priceData.length} days of Bitcoin data from Yahoo\n`);
    return priceData;

  } catch (error) {
    console.error('❌ Error fetching from Yahoo Finance:', error.message);
    return [];
  }
}

// Generate SQL UPDATE/INSERT statements
function generateSQL(priceData) {
  let sql = `-- ============================================================
-- REBUILD: Bitcoin data from Yahoo Finance 2014-TODAY
-- This REPLACES all data from 2014-01-01 onwards
-- Period: ${priceData.length > 0 ? priceData[0].date : 'N/A'} to ${priceData.length > 0 ? priceData[priceData.length - 1].date : 'N/A'}
-- Total Records: ${priceData.length}
-- Source: Yahoo Finance (AUTHORITATIVE)
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- DISABLE TRIGGERS TEMPORARILY (for faster updates)
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- CLEAR all data from 2014 onwards (keep only pre-2014 if exists)
DELETE FROM bitcoin_price_data WHERE date >= '2014-01-01';

-- INSERT COMPLETE YAHOO FINANCE DATA FROM 2014 TO TODAY
`;

  // Generate INSERT statements for each day
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
  price_usd = ${priceVal},
  price_high = ${highVal},
  price_low = ${lowVal},
  price_open = ${openVal},
  volume = ${volVal},
  year = ${year},
  updated_at = NOW();
`;
  });

  sql += `
-- RE-ENABLE TRIGGERS
ALTER TABLE bitcoin_price_data ENABLE TRIGGER ALL;

-- VERIFY
SELECT COUNT(*) as total_2014_plus FROM bitcoin_price_data WHERE date >= '2014-01-01';
SELECT MIN(date) as oldest, MAX(date) as newest FROM bitcoin_price_data WHERE date >= '2014-01-01';
SELECT DISTINCT year FROM bitcoin_price_data WHERE date >= '2014-01-01' ORDER BY year;

-- Show sample data from each year
SELECT date, price_usd, price_high, price_low FROM bitcoin_price_data
WHERE date IN ('2014-01-01', '2017-01-01', '2020-01-01', '2023-01-01', '2024-06-26', '2024-12-31', date(NOW()))
ORDER BY date;
`;

  return sql;
}

// Main execution
async function main() {
  try {
    console.log('🚀 REBUILD Bitcoin Data from Yahoo Finance 2014-TODAY\n');

    // Fetch from Yahoo Finance
    const yahooData = await fetchYahooData();

    if (yahooData.length === 0) {
      console.error('❌ Failed to fetch data from Yahoo Finance');
      process.exit(1);
    }

    console.log(`📊 Data Summary:`);
    console.log(`   Total records: ${yahooData.length}`);
    console.log(`   Date range: ${yahooData[0].date} to ${yahooData[yahooData.length - 1].date}`);
    
    const years = new Set(yahooData.map(d => d.year));
    console.log(`   Years covered: ${Array.from(years).sort().join(', ')}`);
    
    const prices = yahooData.map(d => d.price_usd).filter(p => p);
    console.log(`   Lowest:  $${Math.min(...prices).toFixed(2)}`);
    console.log(`   Highest: $${Math.max(...prices).toFixed(2)}\n`);

    // Generate SQL
    const sql = generateSQL(yahooData);

    // Save SQL file
    const sqlFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'rebuild-from-2014-yahoo.sql');
    fs.writeFileSync(sqlFilePath, sql);
    console.log(`✅ SQL generated: ${sqlFilePath}`);
    console.log(`   File size: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);

    // Save JSON
    const jsonFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-2014-today-yahoo.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(yahooData, null, 2));
    console.log(`✅ JSON saved: ${jsonFilePath}`);

    // Save CSV
    const csvHeader = 'date,timestamp,open,high,low,close,volume,avg_price,year\n';
    const csvData = yahooData.map(d => 
      `${d.date},${d.timestamp},${d.price_open || ''},${d.price_high || ''},${d.price_low || ''},${d.price_usd},${d.volume},${d.avg_price.toFixed(2)},${d.year}`
    ).join('\n');
    const csvFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-2014-today-yahoo.csv');
    fs.writeFileSync(csvFilePath, csvHeader + csvData);
    console.log(`✅ CSV saved: ${csvFilePath}`);

    console.log('\n🚀 CRITICAL: Next steps:');
    console.log(`   1. Open Supabase SQL Editor`);
    console.log(`   2. Copy content from: ${path.basename(sqlFilePath)}`);
    console.log(`   3. Paste into SQL Editor`);
    console.log(`   4. Click RUN`);
    console.log(`   5. This will DELETE all data from 2014+ and INSERT Yahoo data`);
    console.log(`   6. Hard refresh browser (Cmd+Shift+R)`);
    console.log(`   7. Bitcoin chart now shows CORRECT 2014-today prices! 📊`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

