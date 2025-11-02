// API endpoint for Bitcoin price data
// GET /api/bitcoin-price-data - Get Bitcoin price history data
// Returns data without verbose logging to keep frontend console clean

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { year, format = 'json' } = req.query;

    // If specific year requested, return that year's data
    if (year) {
      const yearData = await loadYearData(year);
      if (!yearData || yearData.length === 0) {
        return res.status(404).json({ error: `No data found for year ${year}` });
      }
      return res.status(200).json({
        success: true,
        year: parseInt(year),
        data: yearData,
        count: yearData.length
      });
    }

    // Return summary data (for overview)
    const summary = await getDataSummary();
    return res.status(200).json({
      success: true,
      summary: summary,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    // Only log errors on server, not expose to frontend
    console.error('Error in bitcoin-price-data API:', error);
    return res.status(500).json({ 
      error: 'Failed to load Bitcoin price data',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Load data for a specific year
async function loadYearData(year) {
  try {
    // Try to load from public CSV files
    const csvPath = path.join(process.cwd(), 'public', `bitcoin-price-history-${year}.csv`);
    
    if (fs.existsSync(csvPath)) {
      const csvText = fs.readFileSync(csvPath, 'utf-8');
      return parseCSV(csvText);
    }

    // Try EUR complete history
    const eurPath = path.join(process.cwd(), 'public', 'eur', 'bitcoin-eur-complete-history.csv');
    if (fs.existsSync(eurPath)) {
      const csvText = fs.readFileSync(eurPath, 'utf-8');
      const allData = parseCSV(csvText);
      // Filter by year
      return allData.filter(item => {
        const itemYear = new Date(item.date).getFullYear();
        return itemYear === parseInt(year);
      });
    }

    return [];
  } catch (error) {
    console.error(`Error loading year ${year} data:`, error);
    return [];
  }
}

// Parse CSV to JSON
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const data = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle different CSV formats
    let columns;
    if (line.includes(';')) {
      columns = line.split(';');
    } else {
      columns = line.split(',');
    }

    if (columns.length >= 2) {
      const dateStr = columns[0].replace(/"/g, '').trim();
      const priceStr = columns[1].replace(/"/g, '').replace(',', '.').trim();
      const volumeStr = columns[2] ? columns[2].replace(/"/g, '').trim() : null;

      const price = parseFloat(priceStr);
      if (!isNaN(price)) {
        data.push({
          timestamp: new Date(dateStr).getTime(),
          date: dateStr,
          price: price,
          volume: volumeStr ? parseFloat(volumeStr) : undefined
        });
      }
    }
  }

  return data;
}

// Get summary of available data
async function getDataSummary() {
  const summary = {
    availableYears: [],
    totalDataPoints: 0,
    dataRange: {
      start: null,
      end: null
    }
  };

  try {
    // Check EUR complete history first (most comprehensive)
    const eurPath = path.join(process.cwd(), 'public', 'eur', 'bitcoin-eur-complete-history.csv');
    if (fs.existsSync(eurPath)) {
      const csvText = fs.readFileSync(eurPath, 'utf-8');
      const data = parseCSV(csvText);
      
      if (data.length > 0) {
        const years = new Set();
        data.forEach(item => {
          const year = new Date(item.date).getFullYear();
          years.add(year);
        });
        
        summary.availableYears = Array.from(years).sort();
        summary.totalDataPoints = data.length;
        summary.dataRange.start = data[0].date;
        summary.dataRange.end = data[data.length - 1].date;
        
        return summary;
      }
    }

    // Fallback: check individual year files
    const publicPath = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicPath);
    const yearFiles = files.filter(f => f.startsWith('bitcoin-price-history-') && f.endsWith('.csv'));
    
    let totalPoints = 0;
    const years = [];
    
    for (const file of yearFiles) {
      const yearMatch = file.match(/bitcoin-price-history-(\d{4})\.csv/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        years.push(year);
        
        const csvPath = path.join(publicPath, file);
        const csvText = fs.readFileSync(csvPath, 'utf-8');
        const yearData = parseCSV(csvText);
        totalPoints += yearData.length;
      }
    }
    
    summary.availableYears = years.sort();
    summary.totalDataPoints = totalPoints;
    
    return summary;
  } catch (error) {
    console.error('Error getting data summary:', error);
    return summary;
  }
}

