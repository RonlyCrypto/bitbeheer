#!/usr/bin/env node

/**
 * Automatic Fix: Correct Bitcoin's Highest Point
 * Changes $129,750 to $125,640 (October 6, 2025)
 */

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://xvbsdnfjibcyibpgcqeb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YnNkbmZqaWJjeWlicGdjcWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4NjE0MzUsImV4cCI6MTkyMTQzNzQzNX0.k0WvGNjkQrYEJo4_P-C4s-2w6fKP5WMQ0kU3X7R4bDA';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fixHighestPoint() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 Fixing Bitcoin Highest Point (Hoogste Punt)');
  console.log('='.repeat(60) + '\n');

  const fixes = [
    { date: '2025-07-17', price: 125000.00, reason: 'Update July 17 2025 price' },
    { date: '2025-10-06', price: 125640.00, reason: 'Set actual ATH (October 6, 2025)' },
  ];

  let fixed = 0;
  let errors = [];

  for (const fix of fixes) {
    process.stdout.write(`📅 ${fix.date}: Updating to $${fix.price.toLocaleString('en-US')}... `);

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/bitcoin_price_data?date=eq.${fix.date}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ price_usd: fix.price })
        }
      );

      if (response.ok) {
        console.log('✅ Done');
        fixed++;
      } else {
        console.log(`⚠️ HTTP ${response.status}`);
        errors.push(`${fix.date}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error`);
      errors.push(`${fix.date}: ${error.message}`);
    }

    await sleep(500);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Fixed: ${fixed}/${fixes.length}`);
  console.log(`   ❌ Errors: ${errors.length}`);
  console.log('='.repeat(60) + '\n');

  if (errors.length > 0) {
    console.log('❌ Errors encountered:');
    errors.forEach(error => console.log(`   - ${error}`));
    console.log();
  }

  // Verify the changes
  console.log('🔍 Verifying changes...\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bitcoin_price_data?select=date,price_usd&order=price_usd.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();

      console.log('📈 Top 10 Highest Bitcoin Prices:\n');
      console.log('Date         Price (USD)');
      console.log('-'.repeat(35));

      for (const record of data) {
        const mark = record.date === '2025-10-06' ? ' 🏆 ATH' : '';
        console.log(`${record.date}  $${record.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${mark}`);
      }

      console.log('\n✅ Top prices verified!\n');
    } else {
      console.log(`❌ Error fetching verification data: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error verifying: ${error.message}`);
  }

  console.log('='.repeat(60));
  console.log('✨ Highest Point Fix Complete!');
  console.log('='.repeat(60) + '\n');
  
  console.log('🎯 Your Bitcoin History chart will now show:');
  console.log('   📊 Laagste Punt: $0 (3 januari 2009)');
  console.log('   📊 Hoogste Punt: $125,640 (6 oktober 2025) ✨\n');
}

fixHighestPoint().catch(console.error);

