import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, interval, currency } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Create live data directory if it doesn't exist
    const liveDataDir = path.join(process.cwd(), 'public', 'live-data');
    if (!fs.existsSync(liveDataDir)) {
      fs.mkdirSync(liveDataDir, { recursive: true });
    }

    // Create filename based on interval and currency
    const today = new Date().toISOString().split('T')[0];
    const filename = `bitcoin-live-${interval}-${currency.toLowerCase()}-${today}.csv`;
    const filepath = path.join(liveDataDir, filename);

    // Check if file exists and read existing data
    let existingData: any[] = [];
    if (fs.existsSync(filepath)) {
      const existingContent = fs.readFileSync(filepath, 'utf-8');
      const lines = existingContent.split('\n').filter(line => line.trim());
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const [date, price] = lines[i].split(',');
        if (date && price) {
          existingData.push({ date, price: parseFloat(price) });
        }
      }
    }

    // Merge new data with existing data, avoiding duplicates
    const existingDates = new Set(existingData.map(item => item.date));
    const newData = data.filter((item: any) => !existingDates.has(item.date));
    
    const allData = [...existingData, ...newData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Write to CSV
    const csvContent = [
      'Date,Price',
      ...allData.map(item => `${item.date},${item.price}`)
    ].join('\n');

    fs.writeFileSync(filepath, csvContent);

    console.log(`Live data saved: ${newData.length} new entries, ${allData.length} total entries`);

    res.status(200).json({ 
      success: true, 
      newEntries: newData.length,
      totalEntries: allData.length,
      filename 
    });

  } catch (error) {
    console.error('Error saving live data:', error);
    res.status(500).json({ error: 'Failed to save live data' });
  }
}
