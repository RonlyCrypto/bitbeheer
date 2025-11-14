#!/usr/bin/env node

/**
 * Generate Complete SQL Sync Script
 * Syncs ALL Yahoo Finance 2025 data (Jan 1 - Nov 14)
 * to Supabase bitcoin_price_data table
 */

import fs from 'fs';

function generateSyncSQL() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 Generating Complete SQL Sync Script');
  console.log('='.repeat(80) + '\n');

  // Load Yahoo Finance CSV
  const csvContent = fs.readFileSync('yahoo-finance-2025-data.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📊 Loading CSV data...`);
  console.log(`   Found ${lines.length - 1} records (excluding header)\n`);

  // Generate SQL
  let sqlUpdates = [];
  let recordCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const [date, price] = lines[i].split(',');
    if (date && price) {
      const cleanDate = date.trim();
      const cleanPrice = parseFloat(price.trim());
      sqlUpdates.push(`UPDATE bitcoin_price_data SET price_usd = ${cleanPrice} WHERE date = '${cleanDate}';`);
      recordCount++;
    }
  }

  console.log(`✅ Generated ${recordCount} UPDATE statements\n`);

  // Build complete SQL file
  const fullSQL = `-- ============================================================
-- COMPLETE SYNC: Yahoo Finance 2025 Data to Supabase
-- Syncs ALL Bitcoin prices from Jan 1 to Nov 14, 2025
-- Total Records: ${recordCount}
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- DISABLE TRIGGERS TEMPORARILY (for faster updates)
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- UPDATE ALL 2025 PRICES
${sqlUpdates.join('\n')}

-- RE-ENABLE TRIGGERS
ALTER TABLE bitcoin_price_data ENABLE TRIGGER ALL;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check total records updated
SELECT COUNT(*) as total_2025_records FROM bitcoin_price_data WHERE date >= '2025-01-01' AND date <= '2025-11-14';

-- Show statistics
SELECT 
  'Total 2025 Records' as metric,
  COUNT(*) as count,
  MIN(date) as oldest,
  MAX(date) as newest,
  MIN(price_usd) as lowest_price,
  MAX(price_usd) as highest_price,
  ROUND(AVG(price_usd)::numeric, 2) as avg_price
FROM bitcoin_price_data
WHERE date >= '2025-01-01' AND date <= '2025-11-14';

-- Show key dates
SELECT date, price_usd FROM bitcoin_price_data 
WHERE date IN ('2025-01-01', '2025-07-01', '2025-07-26', '2025-10-06', '2025-11-14')
ORDER BY date;
`;

  // Save to file
  const filename = 'complete-sync-all-2025.sql';
  fs.writeFileSync(filename, fullSQL);
  
  console.log(`✅ SQL file generated: ${filename}\n`);
  console.log('='.repeat(80));
  console.log('📋 SYNC INSTRUCTIONS');
  console.log('='.repeat(80) + '\n');

  console.log('1. Open Supabase: https://app.supabase.com');
  console.log('2. SQL Editor → New Query');
  console.log(`3. Open: ${filename}`);
  console.log('4. Copy ALL content');
  console.log('5. Paste in Supabase SQL Editor');
  console.log('6. Click RUN');
  console.log('7. Refresh browser\n');

  console.log('='.repeat(80));
  console.log('📊 SYNC STATISTICS');
  console.log('='.repeat(80) + '\n');

  // Parse dates for statistics
  const dates = [];
  const prices = [];
  
  for (let i = 1; i < lines.length; i++) {
    const [date, price] = lines[i].split(',');
    if (date && price) {
      dates.push(date.trim());
      prices.push(parseFloat(price.trim()));
    }
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minDate = dates[prices.indexOf(minPrice)];
  const maxDate = dates[prices.indexOf(maxPrice)];

  console.log(`📈 Total Records:     ${recordCount}`);
  console.log(`📅 Date Range:        ${dates[0]} to ${dates[dates.length - 1]}`);
  console.log(`📉 Lowest Price:      $${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} on ${minDate}`);
  console.log(`📈 Highest Price:     $${maxPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} on ${maxDate}`);
  console.log(`📊 Average Price:     $${avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`);

  console.log('='.repeat(80));
  console.log('✅ KEY PRICES TO VERIFY AFTER SYNC');
  console.log('='.repeat(80) + '\n');

  const checkDates = ['2025-01-01', '2025-07-01', '2025-07-17', '2025-07-26', '2025-10-06', '2025-11-14'];
  
  for (const checkDate of checkDates) {
    const idx = dates.indexOf(checkDate);
    if (idx >= 0) {
      const price = prices[idx];
      const description = 
        checkDate === '2025-10-06' ? '🏆 ATH (All-Time High)' :
        checkDate === '2025-07-26' ? '✓ Key Checkpoint' :
        checkDate === '2025-07-17' ? '✓ Was $129k, should be $119k' :
        '✓ Reference';
      console.log(`${checkDate}   $${price.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(14)}   ${description}`);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');

  console.log('🎉 READY TO SYNC!\n');
  console.log('File: ' + filename + '\n');
}

generateSyncSQL();

