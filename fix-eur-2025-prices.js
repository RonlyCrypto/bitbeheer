import fs from 'fs';
import path from 'path';

// Function to fix 2025 prices in EUR CSV using Kraken data
async function fixEUR2025Prices() {
  try {
    console.log('Fixing 2025 prices in EUR CSV using Kraken data...');
    
    // Read Kraken EUR data
    const krakenPath = path.join(process.cwd(), 'public', 'BTC_EUR Kraken Historical Data.csv');
    const krakenContent = fs.readFileSync(krakenPath, 'utf-8');
    const krakenLines = krakenContent.trim().split('\n');
    
    const krakenData = {};
    
    // Parse Kraken data (skip header)
    for (let i = 1; i < krakenLines.length; i++) {
      const line = krakenLines[i];
      if (!line.trim()) continue;
      
      // Parse CSV line: "Date","Price","Open","High","Low","Vol.","Change %"
      // Handle CSV with commas in numbers by using regex to split properly
      const match = line.match(/^"([^"]+)","([^"]+)"/);
      if (match) {
        const dateStr = match[1];
        const priceStr = match[2].replace(/,/g, '');
        
        // Convert date from MM/DD/YYYY to YYYY-MM-DD
        const dateParts = dateStr.split('/');
        if (dateParts.length === 3) {
          const month = dateParts[0].padStart(2, '0');
          const day = dateParts[1].padStart(2, '0');
          const year = dateParts[2];
          const isoDate = `${year}-${month}-${day}`;
          
          const price = parseFloat(priceStr);
          if (!isNaN(price)) {
            krakenData[isoDate] = price;
            console.log(`Kraken data: ${isoDate} = €${price.toFixed(2)}`);
          }
        }
      }
    }
    
    console.log(`Loaded ${Object.keys(krakenData).length} Kraken EUR data points`);
    
    // Read existing EUR CSV
    const eurPath = path.join(process.cwd(), 'public', 'bitcoin-eur-complete-history.csv');
    const eurContent = fs.readFileSync(eurPath, 'utf-8');
    const eurLines = eurContent.trim().split('\n');
    
    const header = eurLines[0];
    const dataLines = eurLines.slice(1);
    
    // Process each line and fix 2025 prices
    const fixedLines = dataLines.map(line => {
      if (!line.trim()) return line;
      
      const [date, price] = line.split(';');
      const cleanDate = date.replace(/"/g, '');
      const cleanPrice = parseFloat(price.replace(/"/g, '').replace(',', '.'));
      
      // Check if this is a 2025 date and we have Kraken data for it
      if (cleanDate.startsWith('2025') && krakenData[cleanDate]) {
        const krakenPrice = krakenData[cleanDate];
        const newPrice = krakenPrice.toFixed(2).replace('.', ',');
        console.log(`Fixing ${cleanDate}: €${cleanPrice.toFixed(2)} → €${krakenPrice.toFixed(2)}`);
        return `"${cleanDate}";"${newPrice}"`;
      }
      
      return line;
    });
    
    // Write fixed CSV to eur directory
    const eurDir = path.join(process.cwd(), 'public', 'eur');
    if (!fs.existsSync(eurDir)) {
      fs.mkdirSync(eurDir, { recursive: true });
    }
    
    const fixedCSVPath = path.join(eurDir, 'bitcoin-eur-complete-history.csv');
    const fixedContent = [header, ...fixedLines].join('\n');
    fs.writeFileSync(fixedCSVPath, fixedContent, 'utf-8');
    
    // Also move Kraken data to eur directory
    const krakenEURPath = path.join(eurDir, 'BTC_EUR_Kraken_Historical_Data.csv');
    fs.copyFileSync(krakenPath, krakenEURPath);
    
    console.log(`\n✅ Fixed EUR CSV saved to: ${fixedCSVPath}`);
    console.log(`📊 Kraken data copied to: ${krakenEURPath}`);
    
    // Show sample of fixed data
    console.log('\n📋 Sample of fixed 2025 data:');
    const sampleLines = fixedLines.filter(line => line.includes('2025')).slice(-10);
    sampleLines.forEach(line => {
      const [date, price] = line.split(';');
      const cleanDate = date.replace(/"/g, '');
      const cleanPrice = price.replace(/"/g, '').replace(',', '.');
      console.log(`  ${cleanDate}: €${parseFloat(cleanPrice).toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('Error fixing EUR 2025 prices:', error);
  }
}

// Run the script
fixEUR2025Prices().catch(console.error);
