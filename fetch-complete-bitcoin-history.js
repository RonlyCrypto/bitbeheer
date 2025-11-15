#!/usr/bin/env node

/**
 * Fetch COMPLETE Bitcoin history from Yahoo Finance
 * From January 1, 2009 to September 16, 2024
 * Then combine with existing Sept 17, 2024 - Nov 15, 2025 data
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const TICKER = 'BTC-USD';
const START_DATE = new Date('2009-01-01'); // Full history start
const END_DATE = new Date('2024-09-16');   // Day before we already have

// Convert JS date to Unix timestamp
function dateToUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

// Fetch data from Yahoo Finance API
async function fetchYahooData() {
  const startUnix = dateToUnix(START_DATE);
  const endUnix = dateToUnix(END_DATE);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${TICKER}?period1=${startUnix}&period2=${endUnix}&interval=1d&includePrePost=false&events=div,splits`;

  console.log(`📊 Fetching complete Bitcoin history from Yahoo Finance...`);
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

    console.log(`✅ Downloaded ${priceData.length} days of Bitcoin history\n`);
    return priceData;

  } catch (error) {
    console.error('❌ Error fetching from Yahoo Finance:', error.message);
    return [];
  }
}

// Load existing 2025 data
function loadExisting2025Data() {
  try {
    const csvPath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-rebuild-data.csv');
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.split('\n').slice(1); // Skip header
      
      const data = lines
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',');
          return {
            date: parts[0],
            timestamp: parseInt(parts[1]),
            price_usd: parseFloat(parts[5]),
            price_high: parts[3] ? parseFloat(parts[3]) : null,
            price_low: parts[4] ? parseFloat(parts[4]) : null,
            price_open: parts[2] ? parseFloat(parts[2]) : null,
            volume: parseInt(parts[6]),
            avg_price: parseFloat(parts[7]),
            year: parseInt(parts[8])
          };
        });
      
      console.log(`✅ Loaded existing data: ${data.length} records from Sept 17, 2024 onwards\n`);
      return data;
    }
  } catch (error) {
    console.error('⚠️  Could not load existing 2025 data:', error.message);
  }
  return [];
}

// Combine historical + existing data
function combineData(historicalData, existingData) {
  const combined = [...historicalData, ...existingData];
  
  // Remove duplicates (keep existing if date overlaps)
  const seen = new Set();
  const unique = combined.filter(item => {
    if (seen.has(item.date)) return false;
    seen.add(item.date);
    return true;
  });
  
  // Sort by date
  unique.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return unique;
}

// Generate SQL UPDATE statements
function generateSQL(priceData) {
  let sql = `-- ============================================================
-- COMPLETE Bitcoin history: 2009-2025
-- Period: Jan 1, 2009 to Nov 15, 2025
-- Total Records: ${priceData.length}
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- DISABLE TRIGGERS TEMPORARILY (for faster updates)
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- DELETE old data and INSERT complete history
DELETE FROM bitcoin_price_data WHERE date < '2009-01-01' OR date > '2025-11-15';

`;

  // Generate INSERT statements for all records
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
SELECT DISTINCT year FROM bitcoin_price_data ORDER BY year;

-- Show sample from each decade
SELECT date, price_usd FROM bitcoin_price_data 
WHERE date IN ('2009-01-09', '2013-01-01', '2017-01-01', '2020-01-01', '2024-01-01', '2025-11-15')
ORDER BY date;
`;

  return sql;
}

// Main execution
async function main() {
  try {
    console.log('🚀 COMPLETE Bitcoin History Builder\n');

    // Fetch historical data
    const historicalData = await fetchYahooData();

    if (historicalData.length === 0) {
      console.error('❌ No historical data fetched');
      process.exit(1);
    }

    // Load existing 2025 data
    const existingData = loadExisting2025Data();

    // Combine
    const combinedData = combineData(historicalData, existingData);

    console.log(`📊 Combined data stats:`);
    console.log(`   Total records: ${combinedData.length}`);
    console.log(`   Date range: ${combinedData[0].date} to ${combinedData[combinedData.length - 1].date}`);
    console.log(`   Years: ${new Set(combinedData.map(d => d.year)).size} different years\n`);

    // Generate SQL
    const sql = generateSQL(combinedData);

    // Save SQL file
    const sqlFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'complete-bitcoin-history-2009-2025.sql');
    fs.writeFileSync(sqlFilePath, sql);
    console.log(`✅ SQL generated: ${sqlFilePath}`);
    console.log(`   File size: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);

    // Save JSON
    const jsonFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-complete-history.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(combinedData, null, 2));
    console.log(`✅ JSON saved: ${jsonFilePath}`);

    // Save CSV
    const csvHeader = 'date,timestamp,open,high,low,close,volume,avg_price,year\n';
    const csvData = combinedData.map(d => 
      `${d.date},${d.timestamp},${d.price_open || ''},${d.price_high || ''},${d.price_low || ''},${d.price_usd},${d.volume},${d.avg_price ? d.avg_price.toFixed(2) : d.price_usd},${d.year}`
    ).join('\n');
    const csvFilePath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-complete-history.csv');
    fs.writeFileSync(csvFilePath, csvHeader + csvData);
    console.log(`✅ CSV saved: ${csvFilePath}`);

    // Show highlights
    console.log('\n📈 Data Highlights:');
    const prices = combinedData.map(d => d.price_usd).filter(p => p !== null);
    console.log(`   Lowest:  $${Math.min(...prices).toFixed(2)}`);
    console.log(`   Highest: $${Math.max(...prices).toFixed(2)}`);
    console.log(`   Current: $${combinedData[combinedData.length - 1].price_usd.toFixed(2)}`);

    console.log('\n🚀 Next steps:');
    console.log(`   1. Review ${path.basename(sqlFilePath)}`);
    console.log(`   2. Run SQL in Supabase SQL Editor`);
    console.log(`   3. Hard refresh browser (Cmd+Shift+R)`);
    console.log(`   4. Chart now shows 2009-2025! 📊`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

