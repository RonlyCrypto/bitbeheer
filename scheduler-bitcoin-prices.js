/**
 * Bitcoin Price History Scheduler
 * Automatically fills missing Bitcoin price data daily
 * 
 * Usage:
 *   node scheduler-bitcoin-prices.js
 * 
 * Set as a cron job or systemd timer:
 *   0 2 * * * cd /path/to/project && node scheduler-bitcoin-prices.js
 *   (Runs daily at 2 AM UTC)
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🚀 Bitcoin Price Scheduler Started');
console.log(`⏰ Running at: ${new Date().toISOString()}`);

// Validation
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - VITE_SUPABASE_ANON_KEY');
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async insert(table, data) {
    return this.request(table, 'POST', data);
  }

  async select(table, filter) {
    return this.request(table, 'GET', null, filter);
  }
}

async function fetchHistoricalPrice(date) {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/bitcoin/history?date=${date}&localization=false`
    );
    
    if (!response.ok) {
      console.warn(`⚠️ HTTP ${response.status} for ${date}`);
      return null;
    }

    const data = await response.json();

    if (!data.market_data) {
      console.warn(`⚠️ No market data for ${date}`);
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

async function fillLastDaysGaps() {
  const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

  // Fill last 30 days (catch any gaps)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  let current = new Date(startDate);
  let count = 0;
  const failed = [];

  console.log(`\n📊 Filling prices from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];

    try {
      // Check if exists
      const existing = await supabase.select(
        'bitcoin_price_data',
        `date=eq.${dateStr}`
      );

      if (!existing || existing.length === 0) {
        // Fetch price
        const price = await fetchHistoricalPrice(dateStr);

        if (price) {
          // Insert
          await supabase.insert('bitcoin_price_data', [{
            date: dateStr,
            timestamp: Math.floor(current.getTime() / 1000),
            price_usd: price.price_usd,
            price_eur: price.price_eur,
            volume: price.volume_usd,
            market_cap: price.market_cap_usd,
            volume_usd: price.volume_usd,
            market_cap_usd: price.market_cap_usd,
            price_change_24h: 0,
            year: current.getFullYear()
          }]);

          count++;
          console.log(`✅ [${count}] ${dateStr}: $${price.price_usd}`);
        } else {
          failed.push(dateStr);
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error for ${dateStr}:`, error.message);
      failed.push(dateStr);
    }

    current.setDate(current.getDate() + 1);
  }

  console.log(`\n✅ Scheduler completed!`);
  console.log(`   Saved: ${count} prices`);
  console.log(`   Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.warn(`   Failed dates: ${failed.join(', ')}`);
  }

  return {
    success: true,
    saved: count,
    failed: failed.length
  };
}

// Main execution
async function main() {
  try {
    const result = await fillLastDaysGaps();
    console.log(`\n📈 Result:`, result);
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ Fatal error:`, error.message);
    process.exit(1);
  }
}

main();

