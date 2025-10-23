// API functions for Bitcoin data management
const API_BASE_URL = '/api/bitcoin-data';

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

// Fetch Bitcoin data from server
export async function fetchBitcoinDataFromServer(): Promise<BitcoinDataStructure | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/get`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch Bitcoin data:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching Bitcoin data from server:', error);
    return null;
  }
}

// Save Bitcoin data to server
export async function saveBitcoinDataToServer(data: BitcoinDataStructure): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      console.log('Bitcoin data saved to server successfully');
      return true;
    } else {
      console.error('Failed to save Bitcoin data:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error saving Bitcoin data to server:', error);
    return false;
  }
}

// Update specific data arrays on server
export async function updateBitcoinDataOnServer(
  daily?: BitcoinPriceData[],
  hourly?: BitcoinPriceData[],
  minute15?: BitcoinPriceData[]
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        daily,
        hourly,
        minute15
      }),
    });
    
    if (response.ok) {
      console.log('Bitcoin data updated on server successfully');
      return true;
    } else {
      console.error('Failed to update Bitcoin data:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error updating Bitcoin data on server:', error);
    return false;
  }
}

// Get data statistics from server
export async function getBitcoinDataStats(): Promise<{
  fileExists: boolean;
  fileSize: number;
  lastModified: string | null;
  dataCount: {
    daily: number;
    hourly: number;
    minute15: number;
  };
  dataRange: {
    start: string;
    end: string;
  } | null;
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to get Bitcoin data stats:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error getting Bitcoin data stats:', error);
    return null;
  }
}

// Download Bitcoin data as JSON file
export function downloadBitcoinDataAsJSON(data: BitcoinDataStructure): void {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bitcoin-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Bitcoin data downloaded as JSON file');
  } catch (error) {
    console.error('Error downloading Bitcoin data:', error);
  }
}

// Load Bitcoin data from uploaded JSON file
export function loadBitcoinDataFromFile(file: File): Promise<BitcoinDataStructure | null> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.daily && data.hourly && data.minute15) {
            resolve(data);
          } else {
            console.error('Invalid Bitcoin data file format');
            resolve(null);
          }
        } catch (error) {
          console.error('Error parsing Bitcoin data file:', error);
          resolve(null);
        }
      };
      reader.onerror = () => {
        console.error('Error reading Bitcoin data file');
        resolve(null);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error loading Bitcoin data file:', error);
      resolve(null);
    }
  });
}
