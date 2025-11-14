/**
 * Generate Yearly Bitcoin Price JSON Files
 * Creates separate JSON files for each year with all price data
 * 
 * Usage:
 *   node generate-yearly-json-files.js
 * 
 * Output: public/bitcoin-data/{YEAR}.json
 */

const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DATA_DIR = path.join(__dirname, 'public', 'bitcoin-data');

console.log('🚀 Bitcoin Yearly JSON Generator Started');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📁 Created directory: ${DATA_DIR}`);
}

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async request(table, filter = null) {
    const options = {
      method: 'GET',
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

    const response = await fetch(path, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async select(table, filter) {
    return this.request(table, filter);
  }
}

async function generateYearlyFiles() {
  const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Get all unique years
    console.log('\n📊 Fetching all years from Supabase...');
    const allData = await supabase.select(
      'bitcoin_price_data',
      'select=year&order=year.asc'
    );

    const years = [...new Set(allData.map(d => d.year))].sort();
    console.log(`✅ Found ${years.length} years: ${years.join(', ')}`);

    let filesCreated = 0;
    let totalRecords = 0;

    // Generate file for each year
    for (const year of years) {
      console.log(`\n📥 Loading ${year} data...`);

      const yearData = await supabase.select(
        'bitcoin_price_data',
        `year=eq.${year}&order=date.asc`
      );

      if (yearData.length === 0) {
        console.warn(`⚠️  No data for ${year}`);
        continue;
      }

      // Transform data
      const yearlyFile = {
        year,
        startDate: yearData[0].date,
        endDate: yearData[yearData.length - 1].date,
        totalDays: yearData.length,
        priceRecords: yearData.map(record => ({
          date: record.date,
          timestamp: record.timestamp,
          price_usd: record.price_usd,
          price_eur: record.price_eur,
          volume_usd: record.volume_usd,
          market_cap_usd: record.market_cap_usd,
          price_change_24h: record.price_change_24h
        })),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      // Save to file
      const filename = path.join(DATA_DIR, `${year}.json`);
      fs.writeFileSync(filename, JSON.stringify(yearlyFile, null, 2));

      filesCreated++;
      totalRecords += yearData.length;

      console.log(`✅ Created ${year}.json`);
      console.log(`   📅 From ${yearlyFile.startDate} to ${yearlyFile.endDate}`);
      console.log(`   📊 ${yearlyFile.totalDays} price records`);
      console.log(`   📦 Size: ${(fs.statSync(filename).size / 1024).toFixed(2)} KB`);
    }

    console.log(`\n✅ Generator Complete!`);
    console.log(`   📁 Files created: ${filesCreated}`);
    console.log(`   📊 Total records: ${totalRecords}`);
    console.log(`   📂 Location: ${DATA_DIR}`);

    // Also create index file
    await createIndexFile(years);

    return true;
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

async function createIndexFile(years) {
  try {
    const indexFile = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      availableYears: years,
      files: years.reduce((acc, year) => {
        acc[year] = {
          filename: `${year}.json`,
          path: `/bitcoin-data/${year}.json`,
          type: 'application/json'
        };
        return acc;
      }, {})
    };

    const indexPath = path.join(DATA_DIR, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(indexFile, null, 2));

    console.log(`✅ Created index.json`);
    console.log(`   📁 Access files at: /bitcoin-data/{YEAR}.json`);
    console.log(`   📋 Index at: /bitcoin-data/index.json`);
  } catch (error) {
    console.error('❌ Error creating index:', error.message);
  }
}

// Run
generateYearlyFiles();

