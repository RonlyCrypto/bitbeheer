import fs from 'fs';
import path from 'path';

// Function to fetch current Bitcoin price in EUR
async function fetchCurrentBitcoinPriceEUR() {
  try {
    console.log('Fetching current Bitcoin price in EUR...');
    
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const currentPrice = data.bitcoin?.eur;
    
    if (currentPrice && typeof currentPrice === 'number') {
      console.log(`Current Bitcoin price in EUR: €${currentPrice.toFixed(2)}`);
      return currentPrice;
    } else {
      throw new Error('Invalid price data received');
    }
  } catch (error) {
    console.error('Error fetching current Bitcoin price:', error);
    return null;
  }
}

// Function to update the EUR history CSV with today's price
async function updateDailyEURPrice() {
  try {
    console.log('Updating daily EUR price...');
    
    const currentPrice = await fetchCurrentBitcoinPriceEUR();
    if (!currentPrice) {
      console.log('Could not fetch current price, skipping update');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const csvPath = path.join(process.cwd(), 'public', 'eur', 'bitcoin-eur-complete-history.csv');
    
    let existingData = [];
    let header = '"Date";"Price"';
    
    // Read existing CSV if it exists
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.trim().split('\n');
      header = lines[0];
      
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
    
    // Find existing entry for today
    let existingEntryIndex = -1;
    let highestPrice = currentPrice;
    
    for (let i = 0; i < existingData.length; i++) {
      if (existingData[i].date === today) {
        existingEntryIndex = i;
        highestPrice = Math.max(existingData[i].price, currentPrice);
        break;
      }
    }
    
    // Update or add today's entry
    if (existingEntryIndex >= 0) {
      existingData[existingEntryIndex] = {
        date: today,
        price: highestPrice
      };
      console.log(`Updated existing entry for ${today} with price €${highestPrice.toFixed(2)}`);
    } else {
      existingData.push({
        date: today,
        price: currentPrice
      });
      console.log(`Added new entry for ${today} with price €${currentPrice.toFixed(2)}`);
    }
    
    // Sort data by date
    existingData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Generate CSV content
    const csvRows = existingData.map(item => {
      const price = item.price.toFixed(2).replace('.', ',');
      return `"${item.date}";"${price}"`;
    });
    
    const csvContent = [header, ...csvRows].join('\n');
    
    // Write updated CSV
    fs.writeFileSync(csvPath, csvContent, 'utf-8');
    
    console.log(`✅ Updated bitcoin-eur-complete-history.csv with today's price`);
    console.log(`📊 Total records: ${existingData.length}`);
    console.log(`📅 Latest date: ${existingData[existingData.length - 1].date}`);
    console.log(`💰 Latest price: €${existingData[existingData.length - 1].price.toFixed(2)}`);
    
  } catch (error) {
    console.error('Error updating daily EUR price:', error);
  }
}

// Main execution
async function main() {
  await updateDailyEURPrice();
}

// Run the script
main().catch(console.error);
