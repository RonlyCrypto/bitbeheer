import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, price } = req.body;

    if (!date || !price) {
      return res.status(400).json({ error: 'Missing required fields: date, price' });
    }

    const csvFileName = 'bitcoin-eur-complete-history.csv';
    const csvPath = path.join(process.cwd(), 'public', 'eur', csvFileName);

    console.log(`Updating EUR CSV file: ${csvPath} with date: ${date}, price: ${price}`);

    // Check if CSV file exists
    let csvData = '';
    let dataLines: string[] = [];
    let header = '"Date";"Price"';

    if (fs.existsSync(csvPath)) {
      csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');
      header = lines[0];
      dataLines = lines.slice(1);
    } else {
      console.log(`Creating new EUR CSV file: ${csvFileName}`);
      // Ensure eur directory exists
      const eurDir = path.join(process.cwd(), 'public', 'eur');
      if (!fs.existsSync(eurDir)) {
        fs.mkdirSync(eurDir, { recursive: true });
      }
    }

    // Find existing entry for this date
    let existingEntryIndex = -1;
    let highestPrice = price;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (line.startsWith(`"${date}"`)) {
        existingEntryIndex = i;
        const parts = line.split(';');
        const existingPrice = parseFloat(parts[1].replace(/"/g, '').replace(',', '.'));
        highestPrice = Math.max(existingPrice, price);
        break;
      }
    }

    const newEntry = `"${date}";"${highestPrice.toFixed(2).replace('.', ',')}"`;
    
    if (existingEntryIndex >= 0) {
      dataLines[existingEntryIndex] = newEntry;
    } else {
      dataLines.push(newEntry);
    }

    // Sort data by date
    dataLines.sort((a, b) => {
      const dateA = a.split(';')[0].replace(/"/g, '');
      const dateB = b.split(';')[0].replace(/"/g, '');
      return dateA.localeCompare(dateB);
    });

    const updatedCSV = [header, ...dataLines].join('\n');

    fs.writeFileSync(csvPath, updatedCSV, 'utf-8');

    console.log(`Successfully updated ${csvFileName} with date: ${date}, price: ${highestPrice}`);

    return res.status(200).json({
      success: true,
      message: `Updated ${csvFileName}`,
      date,
      price: highestPrice,
      action: existingEntryIndex >= 0 ? 'updated' : 'created'
    });

  } catch (error) {
    console.error('Error updating EUR Bitcoin price CSV:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
