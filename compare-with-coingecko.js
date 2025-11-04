/**
 * Script to compare our Bitcoin price data with CoinGecko API
 * This helps identify incorrect data points in our database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchCoinGeckoData(startDate, endDate) {
  try {
    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = Math.floor(new Date(endDate).getTime() / 1000);
    
    // CoinGecko API for historical data
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${start}&to=${end}`;
    
    console.log(`📡 Fetching CoinGecko data from ${startDate} to ${endDate}...`);
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.prices) {
      // Convert to our format
      return data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toISOString().split('T')[0],
        timestamp: Math.floor(timestamp / 1000),
        price: price,
        source: 'coingecko'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return [];
  }
}

async function fetchOurData(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('bitcoin_price_data')
      .select('date, timestamp, price_usd')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching our data:', error);
      return [];
    }
    
    return data.map(d => ({
      date: d.date,
      timestamp: d.timestamp,
      price: d.price_usd,
      source: 'ours'
    }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

function compareData(ourData, coingeckoData) {
  const differences = [];
  const threshold = 0.01; // 1% difference threshold
  
  // Create a map of CoinGecko data by date
  const coingeckoMap = new Map();
  coingeckoData.forEach(d => {
    coingeckoMap.set(d.date, d.price);
  });
  
  // Compare our data with CoinGecko
  ourData.forEach(ourPoint => {
    const coingeckoPrice = coingeckoMap.get(ourPoint.date);
    
    if (coingeckoPrice) {
      const diff = Math.abs(ourPoint.price - coingeckoPrice);
      const diffPercent = (diff / coingeckoPrice) * 100;
      
      if (diffPercent > threshold) {
        differences.push({
          date: ourPoint.date,
          ourPrice: ourPoint.price,
          coingeckoPrice: coingeckoPrice,
          difference: diff,
          differencePercent: diffPercent.toFixed(2),
          isHighPrice: ourPoint.price > 130000 || coingeckoPrice > 130000
        });
      }
    }
  });
  
  return differences;
}

async function main() {
  console.log('🔍 Starting Bitcoin data comparison with CoinGecko...\n');
  
  // Compare recent data (last 2 years)
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  console.log(`📅 Comparing data from ${startDate} to ${endDate}\n`);
  
  const [ourData, coingeckoData] = await Promise.all([
    fetchOurData(startDate, endDate),
    fetchCoinGeckoData(startDate, endDate)
  ]);
  
  console.log(`✅ Our data points: ${ourData.length}`);
  console.log(`✅ CoinGecko data points: ${coingeckoData.length}\n`);
  
  const differences = compareData(ourData, coingeckoData);
  
  if (differences.length === 0) {
    console.log('✅ No significant differences found! Our data matches CoinGecko.');
  } else {
    console.log(`⚠️  Found ${differences.length} significant differences (>1%):\n`);
    
    // Sort by difference percentage (largest first)
    differences.sort((a, b) => parseFloat(b.differencePercent) - parseFloat(a.differencePercent));
    
    // Show top 20 differences
    const topDifferences = differences.slice(0, 20);
    
    console.log('Top differences:');
    console.log('Date\t\tOur Price\tCoinGecko\tDifference\tDiff %\tHigh Price?');
    console.log('─'.repeat(80));
    
    topDifferences.forEach(diff => {
      const highPriceFlag = diff.isHighPrice ? '⚠️' : '';
      console.log(
        `${diff.date}\t$${diff.ourPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}\t` +
        `$${diff.coingeckoPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}\t` +
        `$${diff.difference.toLocaleString('en-US', { maximumFractionDigits: 2 })}\t` +
        `${diff.differencePercent}%\t${highPriceFlag}`
      );
    });
    
    // Check for high prices (>$130k)
    const highPrices = differences.filter(d => d.isHighPrice);
    if (highPrices.length > 0) {
      console.log(`\n🚨 Found ${highPrices.length} data points with prices > $130k (likely incorrect):`);
      highPrices.forEach(hp => {
        console.log(`  ${hp.date}: Our price = $${hp.ourPrice.toLocaleString('en-US')}, CoinGecko = $${hp.coingeckoPrice.toLocaleString('en-US')}`);
      });
    }
    
    // Save full report to file
    const report = {
      comparisonDate: new Date().toISOString(),
      dateRange: { start: startDate, end: endDate },
      ourDataPoints: ourData.length,
      coingeckoDataPoints: coingeckoData.length,
      differencesFound: differences.length,
      topDifferences: differences.slice(0, 50),
      highPriceIssues: highPrices
    };
    
    fs.writeFileSync(
      'bitcoin-data-comparison-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Full report saved to: bitcoin-data-comparison-report.json');
  }
  
  // Summary statistics
  if (ourData.length > 0 && coingeckoData.length > 0) {
    const ourMaxPrice = Math.max(...ourData.map(d => d.price));
    const coingeckoMaxPrice = Math.max(...coingeckoData.map(d => d.price));
    
    console.log('\n📊 Summary Statistics:');
    console.log(`   Our max price: $${ourMaxPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
    console.log(`   CoinGecko max price: $${coingeckoMaxPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
    
    if (ourMaxPrice > 130000) {
      console.log(`   ⚠️  Our max price is suspiciously high (>$130k)`);
    }
  }
}

main().catch(console.error);

