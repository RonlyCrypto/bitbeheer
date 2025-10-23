import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, price, year } = req.body;

    if (!date || !price || !year) {
      return res.status(400).json({ error: 'Missing required fields: date, price, year' });
    }

    const csvFileName = `bitcoin-price-history-${year}.csv`;
    const csvPath = path.join(process.cwd(), 'public', csvFileName);

    console.log(`Updating CSV file: ${csvPath} with date: ${date}, price: ${price}`);

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
      console.log(`Creating new CSV file: ${csvFileName}`);
      
      // If it's a new year, start from January 1st
      const dateObj = new Date(date);
      const yearStart = `${year}-01-01`;
      
      // If the date is not January 1st, add the year start entry first
      if (date !== yearStart) {
        dataLines.push(`"${yearStart}";"0,00"`);
        console.log(`Added year start entry: ${yearStart}`);
      }
    }

    // Find existing entry for this date
    let existingEntryIndex = -1;
    let highestPrice = price;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (line.includes(date)) {
        existingEntryIndex = i;
        // Extract existing price
        const priceMatch = line.match(/"([^"]+)"/);
        if (priceMatch) {
          const existingPrice = parseFloat(priceMatch[1].replace(',', '.'));
          highestPrice = Math.max(existingPrice, price);
          console.log(`Found existing entry for ${date}: ${existingPrice}, new price: ${price}, highest: ${highestPrice}`);
        }
        break;
      }
    }

    // Create new entry
    const newEntry = `"${date}";"${highestPrice.toFixed(2).replace('.', ',')}"`;

    if (existingEntryIndex >= 0) {
      // Update existing entry
      dataLines[existingEntryIndex] = newEntry;
      console.log(`Updated existing entry for ${date} with highest price: ${highestPrice}`);
    } else {
      // Add new entry
      dataLines.push(newEntry);
      console.log(`Added new entry for ${date} with price: ${highestPrice}`);
    }

    // Sort data by date
    dataLines.sort((a, b) => {
      const dateA = a.split(';')[0].replace(/"/g, '');
      const dateB = b.split(';')[0].replace(/"/g, '');
      return dateA.localeCompare(dateB);
    });

    // Reconstruct CSV
    const updatedCSV = [header, ...dataLines].join('\n');

    // Write to file
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
    console.error('Error updating CSV file:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
