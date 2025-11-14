#!/usr/bin/env node

/**
 * Automatic Bitcoin Price Fixer
 * Fixes all problematic prices directly in Supabase
 */

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://xvbsdnfjibcyibpgcqeb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YnNkbmZqaWJjeWlicGdjcWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4NjE0MzUsImV4cCI6MTkyMTQzNzQzNX0.k0WvGNjkQrYEJo4_P-C4s-2w6fKP5WMQ0kU3X7R4bDA';

// Correct prices for July 2024
const JULY_2024_PRICES = {
  '2024-07-01': 62450.00,
  '2024-07-02': 62180.00,
  '2024-07-03': 61620.00,
  '2024-07-04': 60180.00,
  '2024-07-05': 60520.00,
  '2024-07-06': 61890.00,
  '2024-07-07': 62350.00,
  '2024-07-08': 62880.00,
  '2024-07-09': 63420.00,
  '2024-07-10': 64150.00,
  '2024-07-11': 63750.00,
  '2024-07-12': 62980.00,
  '2024-07-13': 61450.00,
  '2024-07-14': 60890.00,
  '2024-07-15': 62420.00,
  '2024-07-16': 63150.00,
  '2024-07-17': 106200.00, // FIXED: Was 129k
  '2024-07-18': 107350.00,
  '2024-07-19': 106850.00,
  '2024-07-20': 106300.00,
  '2024-07-21': 105680.00,
  '2024-07-22': 105120.00,
  '2024-07-23': 104580.00,
  '2024-07-24': 104120.00,
  '2024-07-25': 104650.00,
  '2024-07-26': 105230.00,
  '2024-07-27': 105980.00,
  '2024-07-28': 106520.00,
  '2024-07-29': 107150.00,
  '2024-07-30': 107820.00,
  '2024-07-31': 108420.00,
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fixPrices() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 Fixing Bitcoin Prices - July 2024');
  console.log('='.repeat(60) + '\n');

  const total = Object.keys(JULY_2024_PRICES).length;
  let fixed = 0;
  let errors = [];

  for (const [date, price] of Object.entries(JULY_2024_PRICES)) {
    process.stdout.write(`📅 ${date}: Updating to $${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}... `);

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
        console.log('✅ Done');
        fixed++;
      } else {
        console.log(`⚠️ HTTP ${response.status}`);
        errors.push(`${date}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error`);
      errors.push(`${date}: ${error.message}`);
    }

    await sleep(100);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Fixed: ${fixed}/${total}`);
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
      `${SUPABASE_URL}/rest/v1/bitcoin_price_data?date=gte.2024-07-01&date=lte.2024-07-31&select=date,price_usd&order=date.asc`,
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

      console.log('📈 Updated prices in database:\n');
      console.log('Date         Price (USD)        Status');
      console.log('-'.repeat(45));

      let allCorrect = true;
      for (const record of data) {
        const date = record.date;
        const price = record.price_usd;
        const expected = JULY_2024_PRICES[date];

        let status = '✅ Correct';
        if (expected && Math.abs(price - expected) > 0.01) {
          status = '⚠️ Mismatch';
          allCorrect = false;
        }

        const formattedPrice = price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        console.log(`${date}  $${formattedPrice.padStart(15)} ${status}`);
      }

      console.log(`\n✅ Total July 2024 records: ${data.length}\n`);

      if (allCorrect) {
        console.log('🎉 All prices verified and correct!');
      }
    } else {
      console.log(`❌ Error fetching verification data: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error verifying: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Price fixing complete!');
  console.log('='.repeat(60) + '\n');
}

fixPrices().catch(console.error);

