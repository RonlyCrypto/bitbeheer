#!/usr/bin/env node

import fetch from 'node-fetch';

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) { console.error('❌ Set SUPABASE_URL and SUPABASE_ANON_KEY env vars'); process.exit(1); }

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getCoinGeckoPrice(date) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${date}&localization=false`
    );
    const data = await response.json();
    
    if (data.market_data?.current_price?.usd) {
      return data.market_data.current_price.usd;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching CoinGecko price for ${date}:`, error.message);
    return null;
  }
}

async function verifyAndFixPrices() {
  console.log('🔍 Verifying Bitcoin price history against CoinGecko...\n');

  try {
    // Fetch all prices from Supabase
    const response = await fetch(
      `${supabaseUrl}/rest/v1/bitcoin_price_data?select=id,date,price_usd&order=date.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
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
    console.log(`📊 Found ${prices.length} price records in Supabase\n`);

    let correctCount = 0;
    let incorrectCount = 0;
    const incorrectPrices = [];

    for (let i = 0; i < Math.min(prices.length, 50); i++) {
      const record = prices[i];
      console.log(`[${i + 1}/${Math.min(prices.length, 50)}] Checking ${record.date}...`);
      
      const cgPrice = await getCoinGeckoPrice(record.date);
      
      if (!cgPrice) {
        console.log(`  ⚠️  Could not fetch CoinGecko price`);
        continue;
      }

      const tolerance = 0.02; // 2% tolerance
      const priceDiff = Math.abs(record.price_usd - cgPrice) / cgPrice;

      if (priceDiff > tolerance) {
        console.log(
          `  ❌ MISMATCH\n` +
          `     Supabase: $${record.price_usd.toFixed(2)}\n` +
          `     CoinGecko: $${cgPrice.toFixed(2)}\n` +
          `     Diff: ${(priceDiff * 100).toFixed(2)}%`
        );
        incorrectCount++;
        incorrectPrices.push({
          id: record.id,
          date: record.date,
          oldPrice: record.price_usd,
          correctPrice: cgPrice
        });
      } else {
        console.log(`  ✅ OK ($${cgPrice.toFixed(2)})`);
        correctCount++;
      }

      await sleep(500);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Correct: ${correctCount}`);
    console.log(`❌ Incorrect: ${incorrectCount}`);
    console.log(`${'='.repeat(60)}\n`);

    if (incorrectPrices.length > 0) {
      console.log('🔧 Correcting incorrect prices...\n');

      for (const item of incorrectPrices) {
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/bitcoin_price_data?id=eq.${item.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ price_usd: item.correctPrice })
          }
        );

        if (!updateResponse.ok) {
          console.error(`❌ Error updating ${item.date}:`, updateResponse.statusText);
        } else {
          console.log(`✅ Updated ${item.date}: $${item.oldPrice.toFixed(2)} → $${item.correctPrice.toFixed(2)}`);
        }

        await sleep(500);
      }

      console.log(`\n✅ Fixed ${incorrectPrices.length} prices!`);
    }

    console.log('✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

verifyAndFixPrices();

