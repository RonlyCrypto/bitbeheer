import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch price from CoinGecko
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

// Main function
async function verifyAndFixPrices() {
  console.log('🔍 Verifying Bitcoin price history against CoinGecko...\n');

  // Fetch all prices from Supabase
  const { data: prices, error } = await supabase
    .from('bitcoin_price_data')
    .select('id, date, price_usd')
    .order('date', { ascending: false });

  if (error) {
    console.error('❌ Error fetching prices from Supabase:', error);
    process.exit(1);
  }

  console.log(`📊 Found ${prices.length} price records in Supabase\n`);

  let correctCount = 0;
  let incorrectCount = 0;
  const incorrectPrices = [];

  for (let i = 0; i < prices.length; i++) {
    const record = prices[i];
    const cgPrice = await getCoinGeckoPrice(record.date);
    
    if (!cgPrice) {
      console.log(`⚠️  [${i + 1}/${prices.length}] ${record.date}: Could not fetch CoinGecko price`);
      continue;
    }

    // Compare prices (allow 1% tolerance due to different data sources)
    const tolerance = 0.01; // 1%
    const priceDiff = Math.abs(record.price_usd - cgPrice) / cgPrice;

    if (priceDiff > tolerance) {
      console.log(
        `❌ [${i + 1}/${prices.length}] ${record.date}: MISMATCH\n` +
        `   Supabase: $${record.price_usd.toFixed(2)}\n` +
        `   CoinGecko: $${cgPrice.toFixed(2)}\n` +
        `   Difference: ${(priceDiff * 100).toFixed(2)}%\n`
      );
      incorrectCount++;
      incorrectPrices.push({
        id: record.id,
        date: record.date,
        oldPrice: record.price_usd,
        correctPrice: cgPrice
      });
    } else {
      console.log(`✅ [${i + 1}/${prices.length}] ${record.date}: OK ($${cgPrice.toFixed(2)})`);
      correctCount++;
    }

    // Rate limit: wait a bit between requests
    if ((i + 1) % 10 === 0) {
      console.log('⏳ Rate limiting... waiting 2 seconds\n');
      await sleep(2000);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Correct: ${correctCount}`);
  console.log(`❌ Incorrect: ${incorrectCount}`);
  console.log(`${'='.repeat(60)}\n`);

  if (incorrectPrices.length > 0) {
    console.log('🔧 Correcting incorrect prices...\n');

    for (const item of incorrectPrices) {
      const { error: updateError } = await supabase
        .from('bitcoin_price_data')
        .update({ price_usd: item.correctPrice })
        .eq('id', item.id);

      if (updateError) {
        console.error(`❌ Error updating ${item.date}:`, updateError);
      } else {
        console.log(`✅ Updated ${item.date}: $${item.oldPrice.toFixed(2)} → $${item.correctPrice.toFixed(2)}`);
      }

      // Rate limit
      await sleep(500);
    }

    console.log(`\n✅ Fixed ${incorrectPrices.length} prices!`);
  }

  console.log('✅ Verification complete!');
}

verifyAndFixPrices().catch(console.error);

