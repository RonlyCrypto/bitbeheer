#!/usr/bin/env node

/**
 * Daily Bitcoin Price Sync from Yahoo Finance
 * 
 * This script:
 * - Runs every day at a scheduled time
 * - Fetches yesterday's Bitcoin data from Yahoo Finance
 * - Updates Supabase with OHLC data (Open, High, Low, Close)
 * - Calculates average price for DCA purchases
 * 
 * Usage:
 *   node sync-daily-bitcoin-price.js              // Sync yesterday's data
 *   node sync-daily-bitcoin-price.js --date 2025-01-15  // Sync specific date
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const TICKER = 'BTC-USD';
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Convert JS date to Unix timestamp
function dateToUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

// Get yesterday's date or custom date
function getTargetDate(dateStr = null) {
  if (dateStr) {
    return new Date(dateStr);
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

// Fetch single day data from Yahoo Finance
async function fetchDayData(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const startUnix = dateToUnix(startOfDay);
  const endUnix = dateToUnix(endOfDay);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${TICKER}?period1=${startUnix}&period2=${endUnix}&interval=1d&includePrePost=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.chart?.result?.[0]?.timestamp) {
      console.warn(`⚠️  No data for ${date.toISOString().split('T')[0]}`);
      return null;
    }

    const result = data.chart.result[0];
    const timestamp = result.timestamp[0];
    const quote = result.indicators.quote[0];

    const open = quote.open?.[0];
    const high = quote.high?.[0];
    const low = quote.low?.[0];
    const close = quote.close?.[0];
    const volume = quote.volume?.[0] || 0;

    if (!close) {
      console.warn(`⚠️  Incomplete data for ${date.toISOString().split('T')[0]}`);
      return null;
    }

    // Calculate average price
    const validPrices = [open, high, low, close].filter(p => p !== null && p !== undefined);
    const avgPrice = validPrices.length > 0 
      ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length 
      : close;

    return {
      date: date.toISOString().split('T')[0],
      timestamp,
      price_usd: parseFloat(close.toFixed(2)),
      price_high: high ? parseFloat(high.toFixed(2)) : null,
      price_low: low ? parseFloat(low.toFixed(2)) : null,
      price_open: open ? parseFloat(open.toFixed(2)) : null,
      volume: Math.floor(volume),
      avg_price: parseFloat(avgPrice.toFixed(2)),
      year: date.getFullYear()
    };

  } catch (error) {
    console.error(`❌ Error fetching Yahoo data for ${date.toISOString().split('T')[0]}:`, error.message);
    return null;
  }
}

// Update Supabase with new data
async function updateSupabase(priceData) {
  try {
    const { data, error } = await supabase
      .from('bitcoin_price_data')
      .upsert({
        date: priceData.date,
        timestamp: priceData.timestamp,
        price_usd: priceData.price_usd,
        price_high: priceData.price_high,
        price_low: priceData.price_low,
        price_open: priceData.price_open,
        volume: priceData.volume,
        year: priceData.year,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date'
      });

    if (error) {
      throw new Error(error.message);
    }

    return true;

  } catch (error) {
    console.error(`❌ Error updating Supabase:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let dateStr = null;

  // Parse arguments
  if (args.includes('--date') && args.length > args.indexOf('--date') + 1) {
    dateStr = args[args.indexOf('--date') + 1];
  }

  const targetDate = getTargetDate(dateStr);
  const dateDisplay = targetDate.toISOString().split('T')[0];

  console.log(`📊 Syncing Bitcoin price data...`);
  console.log(`   Date: ${dateDisplay}`);
  console.log(`   Source: Yahoo Finance\n`);

  // Fetch data
  const priceData = await fetchDayData(targetDate);

  if (!priceData) {
    console.error(`❌ Failed to fetch data for ${dateDisplay}`);
    process.exit(1);
  }

  console.log(`✅ Yahoo Finance data:`);
  console.log(`   Open:  $${priceData.price_open || 'N/A'}`);
  console.log(`   High:  $${priceData.price_high || 'N/A'}`);
  console.log(`   Low:   $${priceData.price_low || 'N/A'}`);
  console.log(`   Close: $${priceData.price_usd}`);
  console.log(`   Avg:   $${priceData.avg_price}`);
  console.log(`   Vol:   ${(priceData.volume / 1e9).toFixed(2)}B\n`);

  // Update Supabase
  const success = await updateSupabase(priceData);

  if (success) {
    console.log(`✅ Updated Supabase for ${dateDisplay}`);
    console.log(`\n🚀 Charts will update after page refresh`);
  } else {
    console.error(`❌ Failed to update Supabase`);
    process.exit(1);
  }
}

main();

