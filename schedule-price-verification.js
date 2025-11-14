#!/usr/bin/env node

/**
 * Bitcoin Price Verification & Auto-Fix Scheduler
 * 
 * This script runs periodically to verify Bitcoin prices against CoinGecko
 * and automatically fixes any discrepancies.
 * 
 * Usage:
 *   node schedule-price-verification.js
 * 
 * Note: Keep this running in the background or use a process manager like PM2
 */

import cron from 'node-cron';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.error('   Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

console.log(`✅ Loaded Supabase config: ${SUPABASE_URL}`);

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch price from CoinGecko
async function getCoinGeckoPrice(dateStr) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}&localization=false`
    );

    if (!response.ok) {
      console.error(`   ⚠️ CoinGecko error for ${dateStr}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data.market_data?.current_price?.usd) {
      return data.market_data.current_price.usd;
    }

    return null;
  } catch (error) {
    console.error(`   ⚠️ Error fetching CoinGecko price for ${dateStr}:`, error.message);
    return null;
  }
}

// Main verification and fix function
async function verifyAndFixPrices() {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Starting verification at ${timestamp}`);
  console.log(`${'='.repeat(60)}`);

  try {
    // Fetch all prices from Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bitcoin_price_data?select=id,date,price_usd&order=date.desc&limit=100`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`);
      const text = await response.text();
      console.error(text);
      return;
    }

    const prices = await response.json();
    console.log(`\n📊 Found ${prices.length} price records`);

    let correctCount = 0;
    let incorrectCount = 0;
    const fixedPrices = [];

    for (let i = 0; i < prices.length; i++) {
      const record = prices[i];
      console.log(`\n[${i + 1}/${prices.length}] Checking ${record.date}...`);

      const cgPrice = await getCoinGeckoPrice(record.date);

      if (!cgPrice) {
        console.log(`   ⚠️ Could not fetch CoinGecko price`);
        continue;
      }

      const tolerance = 0.02; // 2%
      const priceDiff = Math.abs(record.price_usd - cgPrice) / cgPrice;

      if (priceDiff > tolerance) {
        console.log(
          `   ❌ MISMATCH:\n` +
          `      Supabase: $${record.price_usd.toFixed(2)}\n` +
          `      CoinGecko: $${cgPrice.toFixed(2)}\n` +
          `      Difference: ${(priceDiff * 100).toFixed(2)}%`
        );
        incorrectCount++;
        fixedPrices.push({
          id: record.id,
          date: record.date,
          oldPrice: record.price_usd,
          newPrice: cgPrice
        });
      } else {
        console.log(`   ✅ OK ($${cgPrice.toFixed(2)})`);
        correctCount++;
      }

      // Rate limit: respectful to CoinGecko API
      await sleep(1000);
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📈 Verification Results:`);
    console.log(`   ✅ Correct: ${correctCount}`);
    console.log(`   ❌ Incorrect: ${incorrectCount}`);
    console.log(`${'='.repeat(60)}`);

    // Fix incorrect prices
    if (fixedPrices.length > 0) {
      console.log(`\n🔧 Fixing ${fixedPrices.length} incorrect prices...\n`);

      for (const item of fixedPrices) {
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/bitcoin_price_data?id=eq.${item.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ price_usd: item.newPrice })
          }
        );

        if (!updateResponse.ok) {
          console.error(`   ❌ Error updating ${item.date}:`, updateResponse.statusText);
        } else {
          console.log(
            `   ✅ Fixed ${item.date}: $${item.oldPrice.toFixed(2)} → $${item.newPrice.toFixed(2)}`
          );
        }

        await sleep(500);
      }

      console.log(`\n✅ Fixed ${fixedPrices.length} prices!`);
    } else {
      console.log(`\n✅ All prices are correct!`);
    }

    console.log(`\n✅ Verification complete at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(`\n❌ Error during verification:`, error.message);
    console.error(error);
  }
}

// Schedule the job
// Runs every day at 2:00 AM
const scheduleTime = '0 2 * * *';

console.log(`\n🎯 Scheduling price verification...`);
console.log(`📅 Schedule: Daily at 02:00 (UTC)`);
console.log(`🔗 Supabase: ${SUPABASE_URL}`);
console.log(`\n✅ Scheduler started! Press Ctrl+C to stop.\n`);

// Run once on start
console.log('🚀 Running initial verification...');
verifyAndFixPrices().catch(console.error);

// Schedule for future runs
cron.schedule(scheduleTime, () => {
  verifyAndFixPrices().catch(console.error);
}, {
  timezone: 'UTC'
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 Scheduler stopped');
  process.exit(0);
});

// Graceful error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  console.log('⏳ Scheduler will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  console.log('⏳ Scheduler will continue running...');
});

