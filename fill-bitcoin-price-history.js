/**
 * Fill missing Bitcoin price history
 * Run this once to populate your database with historical prices
 * 
 * Usage: node fill-bitcoin-price-history.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// For manual setup, you can hardcode these or set in .env
const supabaseUrl = SUPABASE_URL || 'your-supabase-url';
const supabaseKey = SUPABASE_KEY || 'your-supabase-key';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  console.error('Set these in .env file:');
  console.error('  VITE_SUPABASE_URL=...');
  console.error('  VITE_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async request(table, method, data = null, filter = null) {
    const options = {
      method,
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      }
    };

    let path = `${this.url}/rest/v1/${table}`;
    if (filter) {
      path += `?${filter}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(path, options);
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async insert(table, data) {
    return this.request(table, 'POST', data);
  }

  async upsert(table, data) {
    return this.request(table, 'POST', data, 'on_conflict=date');
  }
}

async function fetchHistoricalPrice(date) {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/bitcoin/history?date=${date}&localization=false`
    );
    const data = await response.json();

    if (!data.market_data) {
      console.warn(`⚠️  No data for ${date}`);
      return null;
    }

    return {
      price_usd: data.market_data.current_price.usd,
      price_eur: data.market_data.current_price.eur || 0,
      volume_usd: data.market_data.total_volume.usd || 0,
      market_cap_usd: data.market_data.market_cap.usd || 0
    };
  } catch (error) {
    console.error(`❌ Error fetching ${date}:`, error.message);
    return null;
  }
}

async function fillPriceHistory(startDate, endDate) {
  const supabase = new SupabaseClient(supabaseUrl, supabaseKey);
  console.log(`📊 Filling Bitcoin price history from ${startDate} to ${endDate}`);

  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start);
  let count = 0;
  let total = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const year = current.getFullYear();

    try {
      const price = await fetchHistoricalPrice(dateStr);
      if (price) {
        const record = {
          date: dateStr,
          timestamp: Math.floor(current.getTime() / 1000),
          price_usd: price.price_usd,
          price_eur: price.price_eur,
          volume: price.volume_usd,
          market_cap: price.market_cap_usd,
          volume_usd: price.volume_usd,
          market_cap_usd: price.market_cap_usd,
          price_change_24h: 0,
          year
        };

        await supabase.insert('bitcoin_price_data', [record]);
        count++;
        console.log(`✅ [${count}/${total}] ${dateStr}: $${price.price_usd}`);
      }

      // Rate limiting - CoinGecko has limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error for ${dateStr}:`, error.message);
    }

    current.setDate(current.getDate() + 1);
  }

  console.log(`\n✅ Completed! Saved ${count} price records`);
}

// Main
async function main() {
  // Start from 2020 or any date you want
  const startDate = process.argv[2] || '2020-01-01';
  const endDate = process.argv[3] || new Date().toISOString().split('T')[0];

  try {
    await fillPriceHistory(startDate, endDate);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();

