import fs from 'fs';
import path from 'path';

// Function to fetch Bitcoin price data from CoinGecko
async function fetchBitcoinHistory(startDate, endDate) {
  const results = [];
  const batchSize = 90; // CoinGecko allows max 90 days per request
  
  // Convert dates to timestamps
  const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
  const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
  
  console.log(`Fetching Bitcoin history from ${startDate} to ${endDate}...`);
  
  // Fetch data in batches
  for (let currentStart = startTimestamp; currentStart < endTimestamp; currentStart += batchSize * 24 * 60 * 60) {
    const currentEnd = Math.min(currentStart + batchSize * 24 * 60 * 60, endTimestamp);
    
    try {
      console.log(`Fetching batch: ${new Date(currentStart * 1000).toISOString().split('T')[0]} to ${new Date(currentEnd * 1000).toISOString().split('T')[0]}`);
      
      const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${currentStart}&to=${currentEnd}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.prices && Array.isArray(data.prices)) {
        data.prices.forEach(([timestamp, price]) => {
          const date = new Date(timestamp);
          const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          results.push({
            date: dateStr,
            price: price,
            timestamp: timestamp
          });
        });
      }
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error fetching batch ${currentStart}-${currentEnd}:`, error);
      // Continue with next batch
    }
  }
  
  // Remove duplicates and sort by date
  const uniqueResults = results.reduce((acc, current) => {
    const existing = acc.find(item => item.date === current.date);
    if (!existing) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  uniqueResults.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  console.log(`Fetched ${uniqueResults.length} unique data points`);
  return uniqueResults;
}

// Function to generate complete Bitcoin history
async function generateCompleteBitcoinHistory() {
  try {
    console.log('Starting Bitcoin EUR history generation...');
    
    // Define date ranges
    const ranges = [
      { start: '2013-04-28', end: '2014-12-31' }, // Early Bitcoin
      { start: '2015-01-01', end: '2016-12-31' }, // 2015-2016
      { start: '2017-01-01', end: '2018-12-31' }, // 2017-2018
      { start: '2019-01-01', end: '2020-12-31' }, // 2019-2020
      { start: '2021-01-01', end: '2022-12-31' }, // 2021-2022
      { start: '2023-01-01', end: '2024-12-31' }, // 2023-2024
      { start: '2025-01-01', end: new Date().toISOString().split('T')[0] } // 2025 to today
    ];
    
    const allData = [];
    
    // Fetch data for each range
    for (const range of ranges) {
      console.log(`\nProcessing range: ${range.start} to ${range.end}`);
      const rangeData = await fetchBitcoinHistory(range.start, range.end);
      allData.push(...rangeData);
      
      // Add delay between ranges
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Remove duplicates and sort
    const uniqueData = allData.reduce((acc, current) => {
      const existing = acc.find(item => item.date === current.date);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    uniqueData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log(`\nTotal unique data points: ${uniqueData.length}`);
    
    // Generate CSV content
    const csvHeader = '"Date";"Price"';
    const csvRows = uniqueData.map(item => {
      const price = item.price.toFixed(2).replace('.', ',');
      return `"${item.date}";"${price}"`;
    });
    
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Write to file
    const outputPath = path.join(process.cwd(), 'public', 'bitcoin-eur-complete-history.csv');
    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    
    console.log(`\n✅ Complete Bitcoin EUR history saved to: ${outputPath}`);
    console.log(`📊 Total records: ${uniqueData.length}`);
    console.log(`📅 Date range: ${uniqueData[0].date} to ${uniqueData[uniqueData.length - 1].date}`);
    
    // Show sample data
    console.log('\n📋 Sample data:');
    console.log('First 5 records:');
    uniqueData.slice(0, 5).forEach(item => {
      console.log(`  ${item.date}: €${item.price.toFixed(2)}`);
    });
    
    console.log('\nLast 5 records:');
    uniqueData.slice(-5).forEach(item => {
      console.log(`  ${item.date}: €${item.price.toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('Error generating Bitcoin history:', error);
  }
}

// Function to update existing CSV with recent data
async function updateRecentData() {
  try {
    console.log('Updating recent Bitcoin EUR data...');
    
    // Get last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const recentData = await fetchBitcoinHistory(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    if (recentData.length > 0) {
      // Read existing CSV
      const csvPath = path.join(process.cwd(), 'public', 'bitcoin-eur-complete-history.csv');
      let existingData = [];
      
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.trim().split('\n');
        
        // Parse existing data (skip header)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim()) {
            const [date, price] = line.split(';');
            const cleanDate = date.replace(/"/g, '');
            const cleanPrice = parseFloat(price.replace(/"/g, '').replace(',', '.'));
            
            existingData.push({
              date: cleanDate,
              price: cleanPrice
            });
          }
        }
      }
      
      // Merge with recent data
      const mergedData = [...existingData];
      
      recentData.forEach(newItem => {
        const existingIndex = mergedData.findIndex(item => item.date === newItem.date);
        if (existingIndex >= 0) {
          // Update existing record
          mergedData[existingIndex] = newItem;
        } else {
          // Add new record
          mergedData.push(newItem);
        }
      });
      
      // Sort by date
      mergedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Write updated CSV
      const csvHeader = '"Date";"Price"';
      const csvRows = mergedData.map(item => {
        const price = item.price.toFixed(2).replace('.', ',');
        return `"${item.date}";"${price}"`;
      });
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      fs.writeFileSync(csvPath, csvContent, 'utf-8');
      
      console.log(`✅ Updated Bitcoin EUR history with ${recentData.length} recent records`);
      console.log(`📊 Total records: ${mergedData.length}`);
      
    } else {
      console.log('No recent data found');
    }
    
  } catch (error) {
    console.error('Error updating recent data:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--update')) {
    await updateRecentData();
  } else {
    await generateCompleteBitcoinHistory();
  }
}

// Run the script
main().catch(console.error);
