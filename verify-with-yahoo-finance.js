#!/usr/bin/env node

/**
 * Bitcoin Price Verification with Yahoo Finance
 * Compares our database prices with Yahoo Finance historical data
 * Creates automatic corrections
 */

import fetch from 'node-fetch';
import fs from 'fs';

// Our current July 2025 prices
const OUR_PRICES = {
  '2025-07-01': 62450.00,
  '2025-07-02': 62180.00,
  '2025-07-03': 61620.00,
  '2025-07-04': 60180.00,
  '2025-07-05': 60520.00,
  '2025-07-06': 61890.00,
  '2025-07-07': 62350.00,
  '2025-07-08': 62880.00,
  '2025-07-09': 63420.00,
  '2025-07-10': 64150.00,
  '2025-07-11': 63750.00,
  '2025-07-12': 62980.00,
  '2025-07-13': 61450.00,
  '2025-07-14': 60890.00,
  '2025-07-15': 62420.00,
  '2025-07-16': 63150.00,
  '2025-07-17': 129750.00, // WRONG - should be ~125000
  '2025-07-18': 107350.00,
  '2025-07-19': 106850.00,
  '2025-07-20': 106300.00,
  '2025-07-21': 105680.00,
  '2025-07-22': 105120.00,
  '2025-07-23': 104580.00,
  '2025-07-24': 104120.00,
  '2025-07-25': 104650.00,
  '2025-07-26': 105230.00,
  '2025-07-27': 105980.00,
  '2025-07-28': 106520.00,
  '2025-07-29': 107150.00,
  '2025-07-30': 107820.00,
  '2025-07-31': 108420.00,
};

// Yahoo Finance data for July 2025 (fetching via API)
async function getYahooFinanceData() {
  try {
    console.log('📊 Fetching Yahoo Finance data for Bitcoin (BTC-USD)...\n');

    // Yahoo Finance API endpoint for historical data
    // Format: https://query1.finance.yahoo.com/v10/finance/quoteSummary/BTC-USD?modules=price
    
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?interval=1d&period1=1746086400&period2=1751270400',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      console.log('⚠️ Could not fetch Yahoo Finance data directly');
      return null;
    }

    const data = await response.json();
    
    if (data.chart && data.chart.result && data.chart.result[0]) {
      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const closes = result.indicators.quote[0].close;

      const yahooData = {};
      
      for (let i = 0; i < timestamps.length; i++) {
        const date = new Date(timestamps[i] * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const price = closes[i];

        // Only include July 2025 data
        if (dateStr.startsWith('2025-07')) {
          yahooData[dateStr] = price;
        }
      }

      return yahooData;
    }

    return null;
  } catch (error) {
    console.log(`⚠️ Error fetching Yahoo Finance: ${error.message}`);
    return null;
  }
}

async function verifyAndCompare() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Bitcoin Price Verification - Yahoo Finance vs Our Database');
  console.log('='.repeat(80) + '\n');

  const yahooData = await getYahooFinanceData();

  if (!yahooData) {
    console.log('❌ Could not fetch Yahoo Finance data');
    console.log('\n📋 Alternative: Manual Verification Instructions\n');
    console.log('Visit: https://finance.yahoo.com/quote/BTC-USD/history/');
    console.log('Compare these dates with our data:');
    console.log('\nOur July 2025 Data:');
    console.log('Date         Price');
    console.log('-'.repeat(30));
    
    const dates = Object.keys(OUR_PRICES).sort();
    for (const date of dates) {
      console.log(`${date}   $${OUR_PRICES[date].toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    }

    console.log('\n✅ Action: Check each date on Yahoo Finance and note any discrepancies');
    console.log('📝 Then provide the correct prices, and I\'ll create the fix SQL\n');
    return;
  }

  console.log('✅ Yahoo Finance data fetched!\n');
  console.log('📊 COMPARISON RESULTS:\n');
  console.log('Date         Our Price    Yahoo Price  Diff %     Status');
  console.log('-'.repeat(80));

  const corrections = [];
  let correct = 0;
  let incorrect = 0;

  const dates = Object.keys(OUR_PRICES).sort();

  for (const date of dates) {
    const ourPrice = OUR_PRICES[date];
    const yahooPrice = yahooData[date];

    if (!yahooPrice) {
      console.log(`${date}   $${ourPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(12)}   (No data)   -        ⚠️`);
      continue;
    }

    const diff = ourPrice - yahooPrice;
    const diffPercent = ((diff / yahooPrice) * 100).toFixed(2);
    const tolerance = 2; // 2% tolerance

    if (Math.abs(parseFloat(diffPercent)) <= tolerance) {
      console.log(`${date}   $${ourPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(12)}   $${yahooPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(12)}   ${diffPercent.padStart(6)}%  ✅`);
      correct++;
    } else {
      console.log(`${date}   $${ourPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(12)}   $${yahooPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(12)}   ${diffPercent.padStart(6)}%  ❌`);
      incorrect++;
      corrections.push({ date, price: yahooPrice });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Correct:   ${correct}`);
  console.log(`❌ Incorrect: ${incorrect}`);

  if (corrections.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🔧 AUTO-GENERATED SQL CORRECTIONS');
    console.log('='.repeat(80) + '\n');

    const sqlCorrections = corrections
      .map(c => `UPDATE bitcoin_price_data SET price_usd = ${c.price.toFixed(2)} WHERE date = '${c.date}';`)
      .join('\n');

    console.log(sqlCorrections);

    // Save to file
    const filename = 'yahoo-finance-corrections.sql';
    const fullSQL = `-- Auto-Generated Price Corrections from Yahoo Finance\n-- Generated: ${new Date().toISOString()}\n\n${sqlCorrections}\n\n-- Verification\nSELECT date, price_usd FROM bitcoin_price_data WHERE date >= '2025-07-01' AND date <= '2025-07-31' ORDER BY date;\n`;
    
    fs.writeFileSync(filename, fullSQL);
    console.log(`\n✅ SQL corrections saved to: ${filename}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ Verification Complete!');
  console.log('='.repeat(80) + '\n');
}

verifyAndCompare().catch(console.error);

