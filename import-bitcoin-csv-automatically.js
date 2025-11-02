// Script to automatically trigger CSV import via Edge Function
// This calls the Supabase Edge Function to import CSV files
// Usage: node import-bitcoin-csv-automatically.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials!');
  console.error('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Parse CSV to array of objects
function parseCSV(csvText) {
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
            date: dateStr,
            price: price,
            volume: volumeStr ? parseFloat(volumeStr) : null
          });
        }
      }
    }
  }

  return data;
}

// Import CSV via Edge Function
async function importCSVViaEdgeFunction(csvUrl, filename) {
  try {
    console.log(`📤 Importing ${filename} via Edge Function...`);
    
    const { data, error } = await supabase.functions.invoke('import-bitcoin-csv', {
      body: {
        action: 'import_from_url',
        csvUrl: csvUrl
      }
    });

    if (error) {
      console.error(`  ✗ Error:`, error.message);
      return false;
    }

    if (data && data.success) {
      console.log(`  ✓ Imported ${data.inserted}/${data.total} records`);
      return true;
    } else {
      console.error(`  ✗ Import failed:`, data?.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error calling Edge Function:`, error.message);
    return false;
  }
}

// Main import function
async function importAllCSVFiles() {
  console.log('🚀 Starting automatic Bitcoin CSV import via Edge Function...\n');

  const publicPath = path.join(process.cwd(), 'public');
  const baseUrl = process.env.VITE_PUBLIC_URL || 'https://www.bitbeheer.nl';
  
  const filesToImport = [];

  // Check for EUR complete history (priority 1)
  const eurHistoryPath = path.join(publicPath, 'eur', 'bitcoin-eur-complete-history.csv');
  if (fs.existsSync(eurHistoryPath)) {
    filesToImport.push({
      path: eurHistoryPath,
      url: `${baseUrl}/eur/bitcoin-eur-complete-history.csv`,
      name: 'EUR Complete History',
      priority: 1
    });
  }

  // Check for individual year files
  const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  for (const year of years) {
    const yearFilePath = path.join(publicPath, `bitcoin-price-history-${year}.csv`);
    if (fs.existsSync(yearFilePath)) {
      filesToImport.push({
        path: yearFilePath,
        url: `${baseUrl}/bitcoin-price-history-${year}.csv`,
        name: `Year ${year}`,
        year,
        priority: 2
      });
    }
  }

  if (filesToImport.length === 0) {
    console.log('❌ No CSV files found to import!');
    return;
  }

  // Sort by priority
  filesToImport.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.year && b.year) return a.year - b.year;
    return 0;
  });

  console.log(`Found ${filesToImport.length} CSV file(s) to import:\n`);

  let successCount = 0;
  for (const file of filesToImport) {
    const success = await importCSVViaEdgeFunction(file.url, file.name);
    if (success) successCount++;
    console.log('');
  }

  console.log(`✅ Import complete! ${successCount}/${filesToImport.length} files imported.`);

  // Get summary
  try {
    const { data: summaryData, error: summaryError } = await supabase.functions.invoke('import-bitcoin-csv', {
      body: { action: 'get_summary' }
    });

    if (!summaryError && summaryData && summaryData.summary) {
      const summary = summaryData.summary;
      console.log('\n📊 Database Summary:');
      console.log(`   Total records: ${summary.total_data_points || 0}`);
      console.log(`   Date range: ${summary.date_range?.start || 'N/A'} to ${summary.date_range?.end || 'N/A'}`);
      console.log(`   Available years: ${summary.available_years?.join(', ') || 'N/A'}`);
    }
  } catch (error) {
    console.log('\n⚠️  Could not fetch summary');
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

