#!/usr/bin/env node

/**
 * Sync Yahoo Finance 2025 Data to Supabase Database
 * Automatically updates all 318 Bitcoin prices
 */

import fetch from 'node-fetch';
import fs from 'fs';

const SUPABASE_URL = 'https://xvbsdnfjibcyibpgcqeb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YnNkbmZqaWJjeWlicGdjcWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4NjE0MzUsImV4cCI6MTkyMTQzNzQzNX0.k0WvGNjkQrYEJo4_P-C4s-2w6fKP5WMQ0kU3X7R4bDA';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load Yahoo Finance data from CSV
function loadYahooData() {
  const csvContent = fs.readFileSync('yahoo-finance-2025-data.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const data = {};

  for (let i = 1; i < lines.length; i++) {
    const [date, price] = lines[i].split(',');
    if (date && price) {
      data[date] = parseFloat(price);
    }
  }

  return data;
}

async function syncToDatabase() {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 Syncing Yahoo Finance 2025 Data to Supabase');
  console.log('='.repeat(80) + '\n');

  // Load Yahoo data
  console.log('📂 Loading Yahoo Finance CSV data...');
  const yahooData = loadYahooData();
  const dates = Object.keys(yahooData).sort();

  console.log(`✅ Loaded ${dates.length} records\n`);

  console.log('📊 Syncing to Supabase...\n');

  let updated = 0;
  let errors = [];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const price = yahooData[date];

    process.stdout.write(`[${i + 1}/${dates.length}] ${date}: $${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}... `);

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/bitcoin_price_data?date=eq.${date}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ price_usd: price })
        }
      );

      if (response.ok) {
        console.log('✅');
        updated++;
      } else {
        console.log(`❌ HTTP ${response.status}`);
        errors.push(`${date}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error`);
      errors.push(`${date}: ${error.message}`);
    }

    // Respectful rate limiting
    await sleep(100);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Updated: ${updated}/${dates.length}`);
  console.log(`❌ Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n⚠️ Errors encountered:');
    errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 VERIFICATION');
  console.log('='.repeat(80) + '\n');

  // Verify a few samples
  console.log('Verifying sample dates from database...\n');

  const sampleDates = ['2025-07-01', '2025-07-17', '2025-07-26', '2025-10-06'];

  for (const date of sampleDates) {
    const expectedPrice = yahooData[date];
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/bitcoin_price_data?date=eq.${date}&select=price_usd`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const actualPrice = data[0].price_usd;
          const match = Math.abs(actualPrice - expectedPrice) < 0.01;
          const mark = match ? '✅' : '❌';
          console.log(`${mark} ${date}: Expected $${expectedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}, Got $${actualPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ ${date}: Could not verify`);
    }

    await sleep(500);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ SYNC COMPLETE!');
  console.log('='.repeat(80));

  if (updated === dates.length) {
    console.log('\n🎉 ALL DATA SYNCED SUCCESSFULLY!');
    console.log('   📅 318 Bitcoin prices updated');
    console.log('   📊 Database now matches Yahoo Finance');
    console.log('   🔄 Refresh your browser to see the updates');
  } else {
    console.log('\n⚠️ Some records were not synced. Please retry or check logs.');
  }

  console.log('\n');
}

syncToDatabase().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

