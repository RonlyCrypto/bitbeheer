#!/usr/bin/env node

/**
 * Bitcoin Price Verification Script
 * Compares our database prices with CoinGecko historical data
 * Identifies discrepancies and creates correction SQL
 */

import fetch from 'node-fetch';
import fs from 'fs';

// July 2025 prices from our current database (what we see)
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
  '2025-07-17': 129750.00, // Known WRONG
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getPriceFromCoinGecko(dateStr) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}&localization=false`,
      { timeout: 10000 }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.market_data?.current_price?.usd) {
      return data.market_data.current_price.usd;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function verifyPrices() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 Bitcoin Price Verification - July 2025');
  console.log('Comparing our database with CoinGecko historical data');
  console.log('='.repeat(70) + '\n');

  const results = [];
  let correct = 0;
  let incorrect = 0;
  const corrections = [];

  const dates = Object.keys(OUR_PRICES).sort();

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const ourPrice = OUR_PRICES[date];

    process.stdout.write(`[${i + 1}/${dates.length}] ${date}: `);

    const cgPrice = await getPriceFromCoinGecko(date);

    if (!cgPrice) {
      console.log('⚠️ Could not fetch CoinGecko price');
      results.push({ date, ourPrice, cgPrice: null, status: 'unknown' });
      await sleep(1000);
      continue;
    }

    // Check if prices match (allow 2% tolerance)
    const tolerance = 0.02;
    const priceDiff = Math.abs(ourPrice - cgPrice) / cgPrice;
    const diffPercent = (priceDiff * 100).toFixed(2);

    if (priceDiff <= tolerance) {
      console.log(`✅ OK (Our: $${ourPrice.toFixed(2)}, CG: $${cgPrice.toFixed(2)}, Diff: ${diffPercent}%)`);
      correct++;
      results.push({ date, ourPrice, cgPrice, status: 'correct', diffPercent });
    } else {
      console.log(`❌ MISMATCH (Our: $${ourPrice.toFixed(2)}, CG: $${cgPrice.toFixed(2)}, Diff: ${diffPercent}%)`);
      incorrect++;
      results.push({ date, ourPrice, cgPrice, status: 'incorrect', diffPercent });
      corrections.push({ date, price: cgPrice });
    }

    await sleep(1000);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Correct:   ${correct}`);
  console.log(`❌ Incorrect: ${incorrect}`);
  console.log(`⚠️  Unknown:   ${results.filter(r => r.status === 'unknown').length}`);
  console.log('='.repeat(70) + '\n');

  // Show incorrect prices
  if (corrections.length > 0) {
    console.log('❌ PRICES THAT NEED CORRECTION:\n');
    console.log('Date         Current (Our)    Correct (CG)     Difference');
    console.log('-'.repeat(70));
    
    for (const result of results.filter(r => r.status === 'incorrect')) {
      const diff = result.cgPrice - result.ourPrice;
      const mark = diff > 0 ? '↑' : '↓';
      console.log(
        `${result.date}   $${result.ourPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(14)}   ` +
        `$${result.cgPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(14)}   ` +
        `${mark} $${Math.abs(diff).toFixed(2)}`
      );
    }

    // Generate SQL corrections
    console.log('\n' + '='.repeat(70));
    console.log('🔧 AUTO-GENERATED SQL CORRECTIONS');
    console.log('='.repeat(70) + '\n');

    const sqlCorrections = corrections
      .map(c => `UPDATE bitcoin_price_data SET price_usd = ${c.price.toFixed(2)} WHERE date = '${c.date}';`)
      .join('\n');

    console.log(sqlCorrections);

    // Save to file
    const filename = 'auto-generated-price-corrections.sql';
    fs.writeFileSync(filename, `-- Auto-Generated Price Corrections from CoinGecko Verification\n-- Generated: ${new Date().toISOString()}\n\n${sqlCorrections}\n\n-- Verification Query\nSELECT date, price_usd FROM bitcoin_price_data WHERE date >= '2025-07-01' AND date <= '2025-07-31' ORDER BY date;\n`);
    console.log(`\n✅ SQL corrections saved to: ${filename}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Verification Complete!');
  console.log('='.repeat(70) + '\n');
}

verifyPrices().catch(console.error);

