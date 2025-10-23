// Test script voor CSV update functionaliteit
const fs = require('fs');
const path = require('path');

// Simuleer een API call naar de updateBitcoinPrice endpoint
async function testCSVUpdate() {
  try {
    console.log('Testing CSV update functionality...');
    
    const testData = {
      date: '2025-01-17', // Vandaag
      price: 95000.50,
      year: 2025
    };

    const response = await fetch('http://localhost:3000/api/updateBitcoinPrice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('CSV update result:', result);

    // Check if CSV file was created/updated
    const csvPath = path.join(process.cwd(), 'public', `bitcoin-price-history-${testData.year}.csv`);
    
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      console.log('CSV file content:');
      console.log(csvContent);
    } else {
      console.log('CSV file was not created');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testCSVUpdate();
