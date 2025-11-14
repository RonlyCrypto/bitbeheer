#!/usr/bin/env node

/**
 * Fetch and Sync Bitcoin Prices from Yahoo Finance for 2025
 * Downloads all data from Jan 1, 2025 to today
 * Compares with our database and creates corrections
 */

import fetch from 'node-fetch';
import fs from 'fs';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Our current database prices (to be replaced)
const OUR_CURRENT_PRICES = {
  // Will be loaded from bitcoin_price_data table
};

/**
 * Fetch historical Bitcoin data from Yahoo Finance
 */
async function fetchYahooFinanceData() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📊 Fetching Bitcoin Prices from Yahoo Finance (Jan 1 - Dec 31, 2025)');
    console.log('='.repeat(80) + '\n');

    // Timestamps for 2025
    // Jan 1, 2025 00:00 UTC = 1735689600
    // Dec 31, 2025 23:59 UTC = 1767225599
    const period1 = 1735689600; // Jan 1, 2025
    const period2 = 1767225599; // Dec 31, 2025

    console.log('🔗 Connecting to Yahoo Finance API...');
    console.log(`   Date Range: Jan 1, 2025 - Dec 31, 2025\n`);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?interval=1d&period1=${period1}&period2=${period2}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      throw new Error('Invalid response format');
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    const yahooData = {};
    let count = 0;

    for (let i = 0; i < timestamps.length; i++) {
      const date = new Date(timestamps[i] * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const price = closes[i];

      if (price) {
        yahooData[dateStr] = parseFloat(price.toFixed(2));
        count++;
      }
    }

    console.log(`✅ Successfully fetched ${count} data points from Yahoo Finance\n`);

    return yahooData;
  } catch (error) {
    console.error(`❌ Error fetching Yahoo Finance data: ${error.message}`);
    return null;
  }
}

/**
 * Generate SQL UPDATE statements for all fetched data
 */
async function generateSQLUpdates(yahooData) {
  if (!yahooData || Object.keys(yahooData).length === 0) {
    console.error('❌ No data to generate SQL from');
    return null;
  }

  console.log('📝 Generating SQL UPDATE statements...\n');

  const dates = Object.keys(yahooData).sort();
  const updates = [];

  for (const date of dates) {
    const price = yahooData[date];
    updates.push(`UPDATE bitcoin_price_data SET price_usd = ${price} WHERE date = '${date}';`);
  }

  const sql = `-- ============================================================
-- Bitcoin Price Data Update from Yahoo Finance
-- Date Range: Jan 1, 2025 - Dec 31, 2025
-- Generated: ${new Date().toISOString()}
-- Total Records: ${updates.length}
-- ============================================================

${updates.join('\n')}

-- ============================================================
-- VERIFICATION: Show all 2025 data
-- ============================================================
SELECT date, price_usd 
FROM bitcoin_price_data 
WHERE date >= '2025-01-01' AND date <= '2025-12-31'
ORDER BY date DESC
LIMIT 20;

-- ============================================================
-- SUMMARY STATISTICS
-- ============================================================
SELECT 
  'Total 2025 Records' as metric,
  COUNT(*) as count,
  MAX(price_usd) as highest,
  MIN(price_usd) as lowest,
  ROUND(AVG(price_usd), 2) as average
FROM bitcoin_price_data
WHERE date >= '2025-01-01' AND date <= '2025-12-31';
`;

  return { sql, updates, dates, yahooData };
}

/**
 * Save results to files
 */
function saveResults(data) {
  if (!data) return;

  console.log('💾 Saving results...\n');

  // Save SQL file
  const sqlFilename = 'yahoo-finance-2025-complete.sql';
  fs.writeFileSync(sqlFilename, data.sql);
  console.log(`✅ SQL file saved: ${sqlFilename}`);

  // Save JSON with prices
  const jsonFilename = 'yahoo-finance-2025-data.json';
  fs.writeFileSync(jsonFilename, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    totalRecords: data.dates.length,
    dateRange: {
      start: data.dates[0],
      end: data.dates[data.dates.length - 1]
    },
    prices: data.yahooData
  }, null, 2));
  console.log(`✅ JSON data saved: ${jsonFilename}`);

  // Save comparison CSV
  const csvFilename = 'yahoo-finance-2025-data.csv';
  let csv = 'Date,Close Price USD\n';
  for (const date of data.dates) {
    csv += `${date},${data.yahooData[date]}\n`;
  }
  fs.writeFileSync(csvFilename, csv);
  console.log(`✅ CSV data saved: ${csvFilename}`);

  console.log();
}

/**
 * Display summary
 */
function displaySummary(data) {
  if (!data) return;

  console.log('='.repeat(80));
  console.log('📊 YAHOO FINANCE 2025 DATA SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n📈 Total Records: ${data.dates.length}`);
  console.log(`📅 Date Range: ${data.dates[0]} to ${data.dates[data.dates.length - 1]}`);

  // Find min and max
  let minPrice = Infinity;
  let maxPrice = 0;
  let minDate, maxDate;

  for (const date of data.dates) {
    const price = data.yahooData[date];
    if (price < minPrice) {
      minPrice = price;
      minDate = date;
    }
    if (price > maxPrice) {
      maxPrice = price;
      maxDate = date;
    }
  }

  console.log(`\n💰 Highest Price: $${maxPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} on ${maxDate}`);
  console.log(`📉 Lowest Price: $${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} on ${minDate}`);

  // Calculate average
  const avgPrice = Object.values(data.yahooData).reduce((a, b) => a + b, 0) / data.dates.length;
  console.log(`📊 Average Price: $${avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

  console.log('\n' + '='.repeat(80));
  console.log('🎯 NEXT STEPS');
  console.log('='.repeat(80));
  console.log(`\n1. Review the data in: ${data.jsonFilename || 'yahoo-finance-2025-data.json'}`);
  console.log(`2. Copy SQL from: yahoo-finance-2025-complete.sql`);
  console.log(`3. Paste into Supabase SQL Editor`);
  console.log(`4. Click RUN`);
  console.log(`5. Refresh your browser`);
  console.log(`6. ✅ All 2025 prices will be corrected!\n`);

  console.log('='.repeat(80));
  console.log('✨ Complete!\n');
}

/**
 * Main function
 */
async function main() {
  try {
    // Fetch Yahoo Finance data
    const yahooData = await fetchYahooFinanceData();

    if (!yahooData) {
      console.error('❌ Failed to fetch Yahoo Finance data');
      process.exit(1);
    }

    // Generate SQL
    const sqlData = await generateSQLUpdates(yahooData);

    if (!sqlData) {
      console.error('❌ Failed to generate SQL');
      process.exit(1);
    }

    // Save results
    saveResults(sqlData);

    // Display summary
    displaySummary(sqlData);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
main();

