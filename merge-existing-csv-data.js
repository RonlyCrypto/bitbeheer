import fs from 'fs';
import path from 'path';

// Function to parse existing CSV files and convert USD to EUR
async function mergeExistingCSVData() {
  try {
    console.log('Merging existing CSV data and converting to EUR...');
    
    const allData = [];
    const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    
    // Load existing CSV files
    for (const year of years) {
      try {
        const csvPath = path.join(process.cwd(), 'public', `bitcoin-price-history-${year}.csv`);
        if (fs.existsSync(csvPath)) {
          const csvContent = fs.readFileSync(csvPath, 'utf-8');
          const lines = csvContent.trim().split('\n');
          
          // Skip header line
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            
            // Parse CSV line: "Date";"Price"
            const columns = line.split(';');
            if (columns.length >= 2) {
              const dateStr = columns[0].replace(/"/g, '');
              const priceStr = columns[1].replace(/"/g, '').replace(',', '.');
              
              const price = parseFloat(priceStr);
              if (!isNaN(price)) {
                // Convert USD to EUR (approximate conversion rate 0.85)
                // This is a rough conversion - in reality you'd want historical exchange rates
                const eurPrice = price * 0.85;
                
                allData.push({
                  timestamp: new Date(dateStr).getTime(),
                  date: dateStr,
                  price: eurPrice
                });
              }
            }
          }
          
          console.log(`Loaded ${year} data from CSV`);
        }
      } catch (error) {
        console.warn(`Could not load CSV data for year ${year}:`, error);
      }
    }
    
    // Load Kraken EUR data for recent dates (more accurate)
    try {
      const krakenPath = path.join(process.cwd(), 'public', 'BTC_EUR Kraken Historical Data.csv');
      if (fs.existsSync(krakenPath)) {
        const csvContent = fs.readFileSync(krakenPath, 'utf-8');
        const lines = csvContent.trim().split('\n');
        
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          
          // Parse CSV line: "Date","Price","Open","High","Low","Vol.","Change %"
          const columns = line.split(',');
          if (columns.length >= 2) {
            const dateStr = columns[0].replace(/"/g, '');
            const priceStr = columns[1].replace(/"/g, '').replace(',', '.');
            
            // Convert date from MM/DD/YYYY to YYYY-MM-DD
            const dateParts = dateStr.split('/');
            if (dateParts.length === 3) {
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              const year = dateParts[2];
              const isoDate = `${year}-${month}-${day}`;
              
              const price = parseFloat(priceStr);
              if (!isNaN(price)) {
                // Remove existing data for this date and add Kraken data
                const existingIndex = allData.findIndex(item => item.date === isoDate);
                if (existingIndex >= 0) {
                  allData[existingIndex] = {
                    timestamp: new Date(isoDate).getTime(),
                    date: isoDate,
                    price: price
                  };
                } else {
                  allData.push({
                    timestamp: new Date(isoDate).getTime(),
                    date: isoDate,
                    price: price
                  });
                }
              }
            }
          }
        }
        
        console.log('Integrated Kraken EUR data');
      }
    } catch (error) {
      console.warn('Could not load Kraken EUR data:', error);
    }
    
    // Remove duplicates and sort by date
    const uniqueData = allData.reduce((acc, current) => {
      const existing = acc.find(item => item.date === current.date);
      if (!existing) {
        acc.push(current);
      } else {
        // Keep the more recent data (Kraken EUR over converted USD)
        const existingIndex = acc.findIndex(item => item.date === current.date);
        acc[existingIndex] = current;
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
    
    // Show data distribution by year
    console.log('\n📈 Data distribution by year:');
    const yearCounts = {};
    uniqueData.forEach(item => {
      const year = item.date.split('-')[0];
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    Object.keys(yearCounts).sort().forEach(year => {
      console.log(`  ${year}: ${yearCounts[year]} records`);
    });
    
  } catch (error) {
    console.error('Error merging CSV data:', error);
  }
}

// Run the script
mergeExistingCSVData().catch(console.error);
