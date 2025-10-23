import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'bitcoin-data.json');

export interface BitcoinPriceData {
  timestamp: number;
  date: string;
  price: number;
  volume?: number;
  marketCap?: number;
}

export interface BitcoinDataStructure {
  daily: BitcoinPriceData[];
  hourly: BitcoinPriceData[];
  minute15: BitcoinPriceData[];
  lastUpdated: string;
  dataRange: {
    start: string;
    end: string;
  };
}

// Read data from JSON file
export function readBitcoinData(): BitcoinDataStructure | null {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error reading Bitcoin data file:', error);
  }
  return null;
}

// Write data to JSON file
export function writeBitcoinData(data: BitcoinDataStructure): boolean {
  try {
    // Ensure directory exists
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write data to file
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    console.log('Bitcoin data written to file successfully');
    return true;
  } catch (error) {
    console.error('Error writing Bitcoin data file:', error);
    return false;
  }
}

// Update specific data arrays
export function updateBitcoinData(
  daily?: BitcoinPriceData[],
  hourly?: BitcoinPriceData[],
  minute15?: BitcoinPriceData[]
): boolean {
  try {
    const existingData = readBitcoinData() || {
      daily: [],
      hourly: [],
      minute15: [],
      lastUpdated: new Date().toISOString(),
      dataRange: { start: '', end: '' }
    };

    if (daily) {
      existingData.daily = daily;
    }
    if (hourly) {
      existingData.hourly = hourly;
    }
    if (minute15) {
      existingData.minute15 = minute15;
    }

    existingData.lastUpdated = new Date().toISOString();
    
    // Update data range if we have data
    if (daily && daily.length > 0) {
      existingData.dataRange.start = daily[0].date;
      existingData.dataRange.end = daily[daily.length - 1].date;
    }

    return writeBitcoinData(existingData);
  } catch (error) {
    console.error('Error updating Bitcoin data:', error);
    return false;
  }
}

// Get data statistics
export function getDataStats(): {
  fileExists: boolean;
  fileSize: number;
  lastModified: Date | null;
  dataCount: {
    daily: number;
    hourly: number;
    minute15: number;
  };
  dataRange: {
    start: string;
    end: string;
  } | null;
} {
  try {
    const stats = {
      fileExists: fs.existsSync(DATA_FILE_PATH),
      fileSize: 0,
      lastModified: null as Date | null,
      dataCount: {
        daily: 0,
        hourly: 0,
        minute15: 0
      },
      dataRange: null as { start: string; end: string } | null
    };

    if (stats.fileExists) {
      const fileStats = fs.statSync(DATA_FILE_PATH);
      stats.fileSize = fileStats.size;
      stats.lastModified = fileStats.mtime;

      const data = readBitcoinData();
      if (data) {
        stats.dataCount.daily = data.daily.length;
        stats.dataCount.hourly = data.hourly.length;
        stats.dataCount.minute15 = data.minute15.length;
        stats.dataRange = data.dataRange;
      }
    }

    return stats;
  } catch (error) {
    console.error('Error getting data stats:', error);
    return {
      fileExists: false,
      fileSize: 0,
      lastModified: null,
      dataCount: { daily: 0, hourly: 0, minute15: 0 },
      dataRange: null
    };
  }
}
