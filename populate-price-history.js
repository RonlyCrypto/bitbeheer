/**
 * Populate Bitcoin Price History
 * Adds test data to bitcoin_price_history table for live chart
 * 
 * Usage:
 *   node populate-price-history.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🚀 Populating Bitcoin Price History');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async insert(table, data) {
    const options = {
      method: 'POST',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    const path = `${this.url}/rest/v1/${table}`;
    const response = await fetch(path, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

async function populatePriceHistory() {
  const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Generate last 24 hours of test data
    const now = new Date();
    const priceHistory = [];

    // Base price around current BTC price
    let basePrice = 94000;

    // Generate data every 15 minutes for last 24 hours
    for (let i = 1440; i > 0; i -= 15) {
      const timestamp = new Date(now.getTime() - i * 60 * 1000);

      // Simulate price movement with random walk
      const change = (Math.random() - 0.5) * 200; // ±100
      basePrice += change;
      const volume = 25000000000 + Math.random() * 5000000000;
      const changePercent = (Math.random() - 0.5) * 2;

      priceHistory.push({
        timestamp: timestamp.toISOString(),
        price_usd: basePrice,
        price_eur: basePrice * 0.92,
        volume_24h: volume,
        market_cap: basePrice * 21000000,
        price_change_24h: changePercent
      });
    }

    console.log(`📊 Inserting ${priceHistory.length} price records...`);

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < priceHistory.length; i += batchSize) {
      const batch = priceHistory.slice(i, i + batchSize);
      await supabase.insert('bitcoin_price_history', batch);
      console.log(`✅ Inserted ${Math.min(i + batchSize, priceHistory.length)}/${priceHistory.length}`);
    }

    console.log(`\n✅ Successfully populated ${priceHistory.length} price records!`);
    console.log('📈 You should now see candels in the Live Chart');
    console.log('💡 These are test records - live prices will update automatically');

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

populatePriceHistory();

