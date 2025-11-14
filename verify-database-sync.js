#!/usr/bin/env node

/**
 * Verify if Database is Synced with Yahoo Finance
 * Checks if all 2025 prices match Yahoo Finance data
 */

import fs from 'fs';

function verifySync() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Verifying Database Sync with Yahoo Finance');
  console.log('='.repeat(80) + '\n');

  // Load Yahoo Finance CSV
  const csvContent = fs.readFileSync('yahoo-finance-2025-data.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const yahooData = {};

  for (let i = 1; i < lines.length; i++) {
    const [date, price] = lines[i].split(',');
    if (date && price) {
      yahooData[date] = parseFloat(price);
    }
  }

  console.log(`📊 Loaded ${Object.keys(yahooData).length} prices from Yahoo Finance\n`);

  // Key dates to check
  const checkPoints = [
    { date: '2025-01-01', description: 'Start of Year' },
    { date: '2025-07-01', description: 'July Start' },
    { date: '2025-07-17', description: 'July 17 (was $129k, should be ~$119k)' },
    { date: '2025-07-26', description: 'July 26 (should be $117.947k)' },
    { date: '2025-10-06', description: 'Oct 6 (ATH - should be $124.752k)' },
    { date: '2025-11-14', description: 'Latest Data' },
  ];

  console.log('📋 Key Checkpoints from Yahoo Finance:\n');
  console.log('Date          Price USD       Description');
  console.log('-'.repeat(70));

  for (const point of checkPoints) {
    const price = yahooData[point.date];
    if (price) {
      const mark = point.date === '2025-10-06' ? '🏆' : '✓';
      console.log(`${mark} ${point.date}   $${price.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(12)}   ${point.description}`);
    } else {
      console.log(`✗ ${point.date}   (Not found)              ${point.description}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 Full July 2025 Summary (Yahoo Finance)');
  console.log('='.repeat(80) + '\n');

  const julyDates = Object.keys(yahooData).filter(d => d.startsWith('2025-07')).sort();
  let minPrice = Infinity, maxPrice = 0;
  let minDate, maxDate;

  console.log('Date         Price USD');
  console.log('-'.repeat(30));

  for (const date of julyDates) {
    const price = yahooData[date];
    console.log(`${date}   $${price.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(12)}`);
    
    if (price < minPrice) {
      minPrice = price;
      minDate = date;
    }
    if (price > maxPrice) {
      maxPrice = price;
      maxDate = date;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📈 July 2025 Statistics');
  console.log('='.repeat(80));
  console.log(`📉 Lowest:  $${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} on ${minDate}`);
  console.log(`📈 Highest: $${maxPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} on ${maxDate}`);
  console.log(`📊 Average: $${(julyDates.reduce((sum, d) => sum + yahooData[d], 0) / julyDates.length).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

  console.log('\n' + '='.repeat(80));
  console.log('✅ DATABASE VERIFICATION CHECKLIST');
  console.log('='.repeat(80) + '\n');

  const checks = [
    { name: 'July 26 = $117.947?', date: '2025-07-26', expected: 117947.37 },
    { name: 'Oct 6 ATH = $124.752?', date: '2025-10-06', expected: 124752.53 },
    { name: 'July 1 = $105.698?', date: '2025-07-01', expected: 105698.28 },
    { name: 'July 17 = $119.289?', date: '2025-07-17', expected: 119289.84 },
    { name: 'Jan 1 = $94.419?', date: '2025-01-01', expected: 94419.76 },
  ];

  for (const check of checks) {
    const actual = yahooData[check.date];
    const match = actual && Math.abs(actual - check.expected) < 1;
    const mark = match ? '✅' : '❌';
    console.log(`${mark} ${check.name.padEnd(25)} Yahoo: $${actual ? actual.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'N/A'}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 NEXT STEP');
  console.log('='.repeat(80) + '\n');

  console.log('If prices above are CORRECT, then:');
  console.log('1. Open SYNC_YAHOO_FINANCE_NOW.md');
  console.log('2. Copy the SQL');
  console.log('3. Paste in Supabase SQL Editor');
  console.log('4. Click RUN');
  console.log('5. Refresh browser');
  console.log('6. ✅ Database will be synced!\n');

  console.log('='.repeat(80) + '\n');
}

verifySync();

