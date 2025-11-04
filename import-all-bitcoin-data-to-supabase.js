/**
 * Import all Bitcoin price data from CSV files (2009-2025) into Supabase
 * This script reads all CSV files and imports them into the bitcoin_price_data table
 * 
 * Usage: node import-all-bitcoin-data-to-supabase.js
 * 
 * Required environment variables:
 * - VITE_SUPABASE_URL or SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Try to load .env file if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Load environment variables
let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// If still missing, use hardcoded URL from codebase (found in src/lib/supabase.ts)
if (!supabaseUrl) {
  supabaseUrl = 'https://clqbnkvnydlxtimiazqf.supabase.co';
  console.log('ℹ️  Using Supabase URL from codebase:', supabaseUrl);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY!');
  console.error('');
  console.error('Please provide your Supabase Service Role Key.');
  console.error('You can find it in: Supabase Dashboard → Settings → API → service_role key');
  console.error('');
  console.error('Option 1: Set environment variable:');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.error('');
  console.error('Option 2: Add to .env file:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Early Bitcoin data (2009) - approximate prices
const earlyBitcoinData2009 = [
  { date: '2009-01-03', price_usd: 0.0008, price_eur: 0.0007 }, // Genesis block
  { date: '2009-01-12', price_usd: 0.0008, price_eur: 0.0007 }, // First transaction
  { date: '2009-10-05', price_usd: 0.0008, price_eur: 0.0007 }, // First exchange rate
  { date: '2009-12-31', price_usd: 0.0008, price_eur: 0.0007 }, // End of 2009
];

function parseCSV(csvText, filename) {
  const lines = csvText.trim().split('\n');
  const data = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle different CSV formats (semicolon or comma separated)
    let columns;
    if (line.includes(';')) {
      columns = line.split(';');
    } else if (line.includes(',')) {
      columns = line.split(',');
    } else {
      continue;
    }

    if (columns.length >= 2) {
      // Clean up date and price strings
      let dateStr = columns[0].replace(/"/g, '').trim();
      let priceStr = columns[1].replace(/"/g, '').trim();

      // Handle European number format (comma as decimal separator)
      // Replace comma with dot for decimal parsing
      priceStr = priceStr.replace(/,/g, '.');

      // Handle date formats
      // Remove time part if present (e.g., "2010-01-31 00:00:00" -> "2010-01-31")
      if (dateStr.includes(' ')) {
        dateStr = dateStr.split(' ')[0];
      }
      
      if (dateStr.includes('/')) {
        // Convert DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format
          dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      const price = parseFloat(priceStr);
      if (!isNaN(price) && dateStr && price > 0) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const timestamp = Math.floor(date.getTime() / 1000);
          const dateFormatted = dateStr.split('T')[0]; // Ensure YYYY-MM-DD format

          // Determine if price is EUR or USD based on filename or data
          // Most CSV files in public/ contain EUR prices
          let priceEur = price;
          let priceUsd = price;

          // If filename suggests EUR, assume EUR
          if (filename.toLowerCase().includes('eur') || filename.toLowerCase().includes('kraken')) {
            priceEur = price;
            // Convert EUR to USD (approximate rate 1.08, but this should be historical)
            priceUsd = price * 1.08;
          } else {
            // For most CSV files, assume EUR (based on the format we see)
            // But we can convert if needed
            priceEur = price;
            // Rough conversion: EUR to USD (adjust rate based on historical data)
            priceUsd = price * 1.08;
          }

          data.push({
            date: dateFormatted,
            timestamp: timestamp,
            price_eur: Math.round(priceEur * 100) / 100,
            price_usd: Math.round(priceUsd * 100) / 100,
            year: year,
            volume: columns[2] ? parseFloat(columns[2].replace(/"/g, '').replace(/,/g, '.')) : null,
            market_cap: null
          });
        }
      }
    }
  }

  return data;
}

async function importYearData(year) {
  try {
    const csvPath = path.join(process.cwd(), 'public', `bitcoin-price-history-${year}.csv`);
    
    if (!fs.existsSync(csvPath)) {
      console.log(`⚠️  CSV file not found for year ${year}: ${csvPath}`);
      return [];
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const data = parseCSV(csvText, `bitcoin-price-history-${year}.csv`);
    
    console.log(`📊 Loaded ${data.length} data points for year ${year}`);
    return data;
  } catch (error) {
    console.error(`❌ Error loading year ${year}:`, error.message);
    return [];
  }
}

async function importCompleteHistory() {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'eur', 'bitcoin-eur-complete-history.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log(`⚠️  Complete history CSV not found: ${csvPath}`);
      return [];
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const data = parseCSV(csvText, 'bitcoin-eur-complete-history.csv');
    
    console.log(`📊 Loaded ${data.length} data points from complete history CSV`);
    return data;
  } catch (error) {
    console.error(`❌ Error loading complete history:`, error.message);
    return [];
  }
}

async function importToSupabase(data) {
  if (data.length === 0) {
    console.log('⚠️  No data to import');
    return;
  }

  console.log(`\n📤 Importing ${data.length} data points to Supabase...`);

  // Batch insert (Supabase has a limit of 1000 rows per insert)
  const batchSize = 1000;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      // Use upsert to avoid duplicates (ON CONFLICT date)
      const { data: result, error } = await supabase
        .from('bitcoin_price_data')
        .upsert(batch, {
          onConflict: 'date',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${batch.length} rows (${imported}/${data.length})`);
      }
    } catch (error) {
      console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors += batch.length;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported} rows`);
  if (errors > 0) {
    console.log(`   Errors: ${errors} rows`);
  }
}

async function main() {
  console.log('🚀 Starting Bitcoin data import to Supabase...\n');

  const allData = [];

  // Add 2009 data (early Bitcoin data)
  console.log('📅 Adding 2009 data (early Bitcoin)...');
  for (const item of earlyBitcoinData2009) {
    const date = new Date(item.date);
    allData.push({
      date: item.date,
      timestamp: Math.floor(date.getTime() / 1000),
      price_eur: item.price_eur,
      price_usd: item.price_usd,
      year: 2009,
      volume: null,
      market_cap: null
    });
  }
  console.log(`✅ Added ${earlyBitcoinData2009.length} data points for 2009`);

  // Try to load complete history first (most comprehensive)
  console.log('\n📊 Loading complete history CSV...');
  const completeHistory = await importCompleteHistory();
  if (completeHistory.length > 0) {
    // Merge with existing data, avoiding duplicates
    const existingDates = new Set(allData.map(d => d.date));
    for (const item of completeHistory) {
      if (!existingDates.has(item.date)) {
        allData.push(item);
      }
    }
  }

  // Load individual year CSV files (2010-2025)
  console.log('\n📊 Loading individual year CSV files...');
  const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  
  for (const year of years) {
    const yearData = await importYearData(year);
    
    // Merge with existing data, avoiding duplicates
    const existingDates = new Set(allData.map(d => d.date));
    for (const item of yearData) {
      if (!existingDates.has(item.date)) {
        allData.push(item);
      }
    }
  }

  // Sort by date
  allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log(`\n📈 Total data points collected: ${allData.length}`);
  console.log(`   Date range: ${allData[0]?.date} to ${allData[allData.length - 1]?.date}`);

  // Show year distribution
  const yearDistribution = {};
  for (const item of allData) {
    const year = item.year;
    yearDistribution[year] = (yearDistribution[year] || 0) + 1;
  }
  console.log('\n📊 Year distribution:');
  Object.keys(yearDistribution).sort().forEach(year => {
    console.log(`   ${year}: ${yearDistribution[year]} data points`);
  });

  // Import to Supabase
  await importToSupabase(allData);

  console.log('\n✨ Done!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

