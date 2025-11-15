#!/usr/bin/env node

/**
 * Merge Bitcoin data from multiple sources
 * 1. Keep existing CSV files (2010-2025)
 * 2. Fill gap with Yahoo Finance (2014-09-16)
 * 3. Add 2009 early data if available
 */

import fs from 'fs';
import path from 'path';

const CSV_DIR = '/Users/giovanni/AI code/DCA platform/public';

/**
 * Load all existing CSV files
 */
function loadExistingCSVData() {
  console.log('📂 Loading existing CSV data (2010-2025)...\n');

  const allData = [];
  const years = [];

  // Check which CSV files exist
  for (let year = 2010; year <= 2025; year++) {
    const csvPath = path.join(CSV_DIR, `bitcoin-price-history-${year}.csv`);
    
    if (fs.existsSync(csvPath)) {
      console.log(`   ✅ Found: ${year}`);
      years.push(year);

      try {
        const content = fs.readFileSync(csvPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        // Parse CSV - skip header
        lines.slice(1).forEach(line => {
          // Parse date and price from format: "2010-01-01";"Price"
          const match = line.match(/"([^"]+)";"([^"]+)"/);
          if (match) {
            const dateStr = match[1];
            const price = parseFloat(match[2].replace(',', '.'));

            if (dateStr && !isNaN(price)) {
              allData.push({
                date: dateStr,
                price_usd: price,
                year: year,
                source: 'existing_csv'
              });
            }
          }
        });
      } catch (error) {
        console.error(`   ❌ Error reading ${year}:`, error.message);
      }
    }
  }

  console.log(`\n✅ Loaded ${allData.length} records from existing CSV files\n`);
  return { data: allData, years };
}

/**
 * Load Yahoo Finance data for 2014-09-16 (to fill gap before existing data starts)
 */
function loadYahooGapData() {
  console.log('📊 Loading Yahoo Finance gap data (2014-09-16)...\n');

  try {
    const jsonPath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-rebuild-data.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log('   ⚠️  Yahoo data file not found, skipping gap fill\n');
      return [];
    }

    const content = fs.readFileSync(jsonPath, 'utf-8');
    const yahooData = JSON.parse(content);

    // Filter to dates before existing data (before 2010-01-01)
    // and after Yahoo starts (2014-09-17)
    const gapData = yahooData
      .filter(d => d.date >= '2014-09-17' && d.date < '2010-01-01')
      .map(d => ({
        date: d.date,
        price_usd: d.price_usd,
        year: d.year,
        source: 'yahoo_gap'
      }));

    console.log(`✅ Loaded ${gapData.length} Yahoo records for gap (2014-09-17 to 2010)\n`);
    return gapData;
  } catch (error) {
    console.error('❌ Error loading Yahoo gap data:', error.message);
    return [];
  }
}

/**
 * Load Yahoo Finance data for 2024-2025 portion
 */
function loadYahooRecentData() {
  console.log('📊 Loading Yahoo Finance recent data (2024-2025)...\n');

  try {
    const jsonPath = path.join('/Users/giovanni/AI code/DCA platform', 'bitcoin-rebuild-data.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log('   ⚠️  Yahoo data file not found\n');
      return [];
    }

    const content = fs.readFileSync(jsonPath, 'utf-8');
    const yahooData = JSON.parse(content);

    // Get data from 2024-2025
    const recentData = yahooData
      .filter(d => d.date >= '2024-09-17')
      .map(d => ({
        date: d.date,
        price_usd: d.price_usd,
        year: d.year,
        source: 'yahoo_recent'
      }));

    console.log(`✅ Loaded ${recentData.length} Yahoo records for 2024-2025\n`);
    return recentData;
  } catch (error) {
    console.error('❌ Error loading Yahoo recent data:', error.message);
    return [];
  }
}

/**
 * Merge all data and handle duplicates
 */
function mergeData(existingCSV, yahooGap, yahooRecent) {
  console.log('🔄 Merging data from all sources...\n');

  // Combine all
  const combined = [...existingCSV, ...yahooGap, ...yahooRecent];

  // Remove duplicates - keep existing CSV first, then Yahoo
  const seen = new Map();
  const merged = [];

  combined.forEach(record => {
    if (!seen.has(record.date)) {
      seen.set(record.date, record.source);
      merged.push(record);
    }
  });

  // Sort by date
  merged.sort((a, b) => new Date(a.date) - new Date(b.date));

  console.log(`📊 Merged data stats:`);
  console.log(`   Total unique records: ${merged.length}`);
  console.log(`   Date range: ${merged[0]?.date} to ${merged[merged.length - 1]?.date}`);
  console.log(`   From existing CSV: ${combined.filter(d => d.source === 'existing_csv').length}`);
  console.log(`   From Yahoo gap: ${combined.filter(d => d.source === 'yahoo_gap').length}`);
  console.log(`   From Yahoo recent: ${combined.filter(d => d.source === 'yahoo_recent').length}\n`);

  return merged;
}

/**
 * Generate SQL INSERT statements
 */
function generateSQL(priceData) {
  let sql = `-- ============================================================
-- MERGED Bitcoin history: 2010-2025
-- Existing CSV (2010-2025) + Yahoo gap (2014-09-16) + Yahoo recent (2024-11-15)
-- Total Records: ${priceData.length}
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- DISABLE TRIGGERS
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- CLEAR old data
DELETE FROM bitcoin_price_data WHERE date >= '2010-01-01';

`;

  // Generate INSERT statements
  priceData.forEach(data => {
    const { date, price_usd, year } = data;
    const priceVal = price_usd ? price_usd.toFixed(2) : 'NULL';

    sql += `INSERT INTO bitcoin_price_data (date, timestamp, price_usd, year, created_at, updated_at)
VALUES ('${date}', EXTRACT(EPOCH FROM '${date}'::timestamp)::bigint, ${priceVal}, ${year}, NOW(), NOW())
ON CONFLICT (date) DO UPDATE SET 
  price_usd = ${priceVal},
  year = ${year},
  updated_at = NOW();
`;
  });

  sql += `
-- RE-ENABLE TRIGGERS
ALTER TABLE bitcoin_price_data ENABLE TRIGGER ALL;

-- VERIFY
SELECT COUNT(*) as total_records FROM bitcoin_price_data WHERE date >= '2010-01-01';
SELECT MIN(date) as oldest, MAX(date) as newest FROM bitcoin_price_data WHERE date >= '2010-01-01';
SELECT DISTINCT year FROM bitcoin_price_data WHERE date >= '2010-01-01' ORDER BY year;

-- Show sample records
SELECT date, price_usd, year FROM bitcoin_price_data 
WHERE date IN ('2010-01-01', '2015-01-01', '2020-01-01', '2024-01-01', '2025-11-15')
ORDER BY date;
`;

  return sql;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Bitcoin Data Merger\n');
    console.log('=====================================\n');

    // Load data
    const { data: existingCSV } = loadExistingCSVData();
    const yahooGap = loadYahooGapData();
    const yahooRecent = loadYahooRecentData();

    // Merge
    const merged = mergeData(existingCSV, yahooGap, yahooRecent);

    if (merged.length === 0) {
      console.error('❌ No data to merge');
      process.exit(1);
    }

    // Generate SQL
    const sql = generateSQL(merged);

    // Save SQL
    const sqlPath = path.join('/Users/giovanni/AI code/DCA platform', 'merged-bitcoin-data.sql');
    fs.writeFileSync(sqlPath, sql);
    console.log(`✅ SQL generated: ${sqlPath}`);

    // Save JSON
    const jsonPath = path.join('/Users/giovanni/AI code/DCA platform', 'merged-bitcoin-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2));
    console.log(`✅ JSON saved: ${jsonPath}`);

    // Save CSV
    const csvHeader = 'date,price_usd,year\n';
    const csvData = merged.map(d => `${d.date},${d.price_usd.toFixed(2)},${d.year}`).join('\n');
    const csvPath = path.join('/Users/giovanni/AI code/DCA platform', 'merged-bitcoin-data.csv');
    fs.writeFileSync(csvPath, csvHeader + csvData);
    console.log(`✅ CSV saved: ${csvPath}`);

    console.log('\n🚀 Next steps:');
    console.log(`   1. Copy content from: ${path.basename(sqlPath)}`);
    console.log(`   2. Paste into Supabase SQL Editor`);
    console.log(`   3. Click RUN`);
    console.log(`   4. Hard refresh browser (Cmd+Shift+R)`);
    console.log(`   5. Chart now shows complete 2010-2025 history! 📊`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

