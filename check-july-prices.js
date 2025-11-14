#!/usr/bin/env node

/**
 * Direct checker: July 2024 Bitcoin prices
 * 
 * Usage:
 *   node check-july-prices.js
 */

import fetch from 'node-fetch';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test dates in July 2024
const julyDates = [
  '2024-07-17',  // The problematic date (was 129k, should be 106k)
  '2024-07-16',
  '2024-07-15',
  '2024-07-14',
  '2024-07-10',
  '2024-07-01',
];

async function getPriceFromSource(dateStr, sourceName, sourceFn) {
  try {
    const price = await sourceFn(dateStr);
    return price;
  } catch (error) {
    console.error(`      ❌ ${sourceName}: ${error.message}`);
    return null;
  }
}

async function getPriceFromCoinGecko(dateStr) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}&localization=false`,
    { timeout: 10000 }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.market_data?.current_price?.usd) {
    return data.market_data.current_price.usd;
  }

  throw new Error('No price data');
}

async function getPriceFromBlockchain(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  const timestamp = Math.floor(date.getTime() / 1000);

  const response = await fetch(
    `https://api.blockchain.com/v3/crypto/prices?symbols=BTC&currencies=USD&timestamp=${timestamp}`,
    { timeout: 10000 }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.BTC?.USD) {
    return data.BTC.USD;
  }

  throw new Error('No price data');
}

async function getPriceFromCryptoCompare(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  const timestamp = Math.floor(date.getTime() / 1000);

  const response = await fetch(
    `https://min-api.cryptocompare.com/data/pricehistorical?fsym=BTC&tsym=USD&ts=${timestamp}&relaxedValidation=true`,
    { timeout: 10000 }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.BTC?.USD) {
    return data.BTC.USD;
  }

  throw new Error('No price data');
}

async function checkDate(dateStr) {
  console.log(`\n📅 ${dateStr}:`);

  // CoinGecko
  console.log(`   🔍 CoinGecko:`);
  const cgPrice = await getPriceFromSource(dateStr, 'CoinGecko', getPriceFromCoinGecko);
  if (cgPrice) {
    console.log(`      ✅ $${cgPrice.toFixed(2)}`);
  }

  await sleep(1000);

  // Blockchain.com
  console.log(`   🔍 Blockchain.com:`);
  const bcPrice = await getPriceFromSource(dateStr, 'Blockchain.com', getPriceFromBlockchain);
  if (bcPrice) {
    console.log(`      ✅ $${bcPrice.toFixed(2)}`);
  }

  await sleep(1000);

  // CryptoCompare
  console.log(`   🔍 CryptoCompare:`);
  const ccPrice = await getPriceFromSource(dateStr, 'CryptoCompare', getPriceFromCryptoCompare);
  if (ccPrice) {
    console.log(`      ✅ $${ccPrice.toFixed(2)}`);
  }

  await sleep(1000);

  // Summary
  const prices = [cgPrice, bcPrice, ccPrice].filter(p => p !== null);
  if (prices.length > 0) {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    console.log(`   📊 Summary for ${dateStr}:`);
    console.log(`      Average: $${avgPrice.toFixed(2)}`);
    console.log(`      Min: $${minPrice.toFixed(2)}`);
    console.log(`      Max: $${maxPrice.toFixed(2)}`);
  }
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Checking July 2024 Bitcoin Prices`);
  console.log(`${'='.repeat(60)}`);

  for (const date of julyDates) {
    await checkDate(date);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Check complete!`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

