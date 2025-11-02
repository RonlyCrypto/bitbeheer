// Script to import Bitcoin CSV data to Supabase
// Run this script to populate the bitcoin_price_data table
// Usage: node import-bitcoin-csv-to-supabase.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!');
  console.error('Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse CSV to JSON
function parseCSV(csvText, filename) {
  const lines = csvText.trim().split('\n');
  const data = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    let columns;
    if (line.includes(';')) {
      columns = line.split(';');
    } else {
      columns = line.split(',');
    }

    if (columns.length >= 2) {
      const dateStr = columns[0].replace(/"/g, '').trim();
      const priceStr = columns[1].replace(/"/g, '').replace(',', '.').trim();
      const volumeStr = columns[2] ? columns[2].replace(/"/g, '').trim() : null;

      const price = parseFloat(priceStr);
      if (!isNaN(price) && dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          data.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD format
            timestamp: date.getTime(),
            price_eur: price,
            volume: volumeStr ? parseFloat(volumeStr) : null,
            market_cap: null,
            year: date.getFullYear()
          });
        }
      }
    }
  }

  return data;
}

// Import single CSV file
async function importCSVFile(filePath) {
  try {
    console.log(`Reading ${filePath}...`);
    const csvText = fs.readFileSync(filePath, 'utf-8');
    const data = parseCSV(csvText, path.basename(filePath));

    if (data.length === 0) {
      console.log(`  ⚠️  No data found in ${filePath}`);
      return 0;
    }

    console.log(`  ✓ Parsed ${data.length} records`);

    // Insert in batches of 1000
    let inserted = 0;
    for (let i = 0; i < data.length; i += 1000) {
      const batch = data.slice(i, i + 1000);
      const { error } = await supabase
        .from('bitcoin_price_data')
        .upsert(batch, { onConflict: 'date' });

      if (error) {
        console.error(`  ✗ Error inserting batch ${Math.floor(i / 1000) + 1}:`, error.message);
      } else {
        inserted += batch.length;
        console.log(`  ✓ Inserted batch ${Math.floor(i / 1000) + 1} (${inserted}/${data.length})`);
      }
    }

    return inserted;
  } catch (error) {
    console.error(`  ✗ Error importing ${filePath}:`, error.message);
    return 0;
  }
}

// Main import function
async function importAllCSVFiles() {
  console.log('🚀 Starting Bitcoin CSV import to Supabase...\n');

  const publicPath = path.join(process.cwd(), 'public');
  const eurPath = path.join(publicPath, 'eur');

  const filesToImport = [];

  // Check for EUR complete history (best source)
  const eurHistoryPath = path.join(eurPath, 'bitcoin-eur-complete-history.csv');
  if (fs.existsSync(eurHistoryPath)) {
    filesToImport.push({ path: eurHistoryPath, priority: 1, name: 'EUR Complete History' });
  }

  // Check for individual year files
  const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  for (const year of years) {
    const yearFilePath = path.join(publicPath, `bitcoin-price-history-${year}.csv`);
    if (fs.existsSync(yearFilePath)) {
      filesToImport.push({ path: yearFilePath, priority: 2, name: `Year ${year}`, year });
    }
  }

  if (filesToImport.length === 0) {
    console.log('❌ No CSV files found to import!');
    console.log('   Looking in:', publicPath);
    console.log('   And:', eurPath);
    return;
  }

  // Sort by priority (EUR history first, then by year)
  filesToImport.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.year && b.year) return a.year - b.year;
    return 0;
  });

  console.log(`Found ${filesToImport.length} CSV file(s) to import:\n`);

  let totalImported = 0;
  for (const file of filesToImport) {
    console.log(`📄 ${file.name}:`);
    const imported = await importCSVFile(file.path);
    totalImported += imported;
    console.log('');
  }

  console.log(`✅ Import complete! ${totalImported} records imported to Supabase.`);

  // Get summary
  const { data: summary, error: summaryError } = await supabase
    .rpc('get_bitcoin_price_summary');

  if (!summaryError && summary) {
    console.log('\n📊 Database Summary:');
    console.log(`   Total records: ${summary.total_data_points || 0}`);
    console.log(`   Date range: ${summary.date_range?.start || 'N/A'} to ${summary.date_range?.end || 'N/A'}`);
    console.log(`   Available years: ${summary.available_years?.join(', ') || 'N/A'}`);
  }
}

// Run import
importAllCSVFiles()
  .then(() => {
    console.log('\n🎉 Import process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

