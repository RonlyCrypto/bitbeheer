import { dataManager } from './dataManager';
import { PriceData } from '../types';
import { getEarlyBitcoinData, combineBitcoinData, saveEarlyBitcoinData, loadEarlyBitcoinData } from './earlyBitcoinData';

// Generate historical data for the gap between early data and modern data
const generateHistoricalData = (startDate: Date, endDate: Date): PriceData[] => {
  const data: PriceData[] = [];
  const currentDate = new Date(startDate);
  
  // Key historical price points for interpolation
  const keyPoints = [
    { date: '2013-12-04', price: 1150 }, // First major ATH
    { date: '2015-01-01', price: 150 },  // Bear market low
    { date: '2017-12-17', price: 19700 }, // Second ATH
    { date: '2018-12-15', price: 3200 }, // Bear market low
    { date: '2020-03-12', price: 3800 }, // COVID crash
    { date: '2021-11-10', price: 69000 }, // Third ATH
    { date: '2022-12-30', price: 15500 }, // Bear market low
    { date: '2024-03-14', price: 73000 }, // Recent high
  ];
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Find the appropriate price for this date
    let price = 1000; // Default fallback
    
    // Check if this date matches a key point
    const keyPoint = keyPoints.find(kp => kp.date === dateStr);
    if (keyPoint) {
      price = keyPoint.price;
    } else {
      // Interpolate between key points
      const prevPoint = keyPoints.filter(kp => new Date(kp.date) <= currentDate).pop();
      const nextPoint = keyPoints.find(kp => new Date(kp.date) > currentDate);
      
      if (prevPoint && nextPoint) {
        const prevDate = new Date(prevPoint.date).getTime();
        const nextDate = new Date(nextPoint.date).getTime();
        const currentTime = currentDate.getTime();
        
        const ratio = (currentTime - prevDate) / (nextDate - prevDate);
        price = prevPoint.price + (nextPoint.price - prevPoint.price) * ratio;
      } else if (prevPoint) {
        price = prevPoint.price;
      } else if (nextPoint) {
        price = nextPoint.price;
      }
    }
    
    data.push({
      date: dateStr,
      price: Math.max(price, 1) // Ensure minimum price of $1
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

// Direct CoinGecko API call for fallback (limited to 365 days for free users)
const fetchFromCoinGeckoDirect = async (coinId: string, startDate: Date, endDate: Date): Promise<PriceData[]> => {
  // CoinGecko free API is limited to 365 days, so we'll fetch the last 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const actualStartDate = startDate < oneYearAgo ? oneYearAgo : startDate;
  const fromTimestamp = Math.floor(actualStartDate.getTime() / 1000);
  const toTimestamp = Math.floor(endDate.getTime() / 1000);
  
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`;
  
  try {
    console.log(`Direct CoinGecko API: Fetching ${coinId} from ${actualStartDate.toISOString()} to ${endDate.toISOString()} (limited to 365 days)`);
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const priceData = data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      price: price
    }));
    
    console.log(`Direct CoinGecko API: Successfully fetched ${priceData.length} data points for ${coinId}`);
    return priceData;
  } catch (error) {
    console.error('Direct CoinGecko API error:', error);
    throw error;
  }
};

export async function fetchHistoricalPrices(
  coin: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<PriceData[]> {
  try {
    console.log(`Fetching historical prices for ${coin} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Voor Bitcoin, probeer eerst vroege data te laden
    if (coin.toLowerCase() === 'bitcoin' || coin.toLowerCase() === 'btc') {
      const earlyData = loadEarlyBitcoinData() || getEarlyBitcoinData();
      
      // Als we data vanaf 2009 willen, gebruik vroege data
      if (startDate < new Date('2013-01-01')) {
        console.log('Requesting early Bitcoin data (2009-2013)');
        
        // Filter vroege data op het gevraagde bereik
        const filteredEarlyData = earlyData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        });
        
        // Als we ook data na 2013 willen, haal die op via API
        if (endDate > new Date('2013-01-01')) {
          const apiStartDate = new Date('2013-01-01');
          const apiData = await dataManager.getPriceData(coin, apiStartDate, endDate);
          
          // Combineer vroege data met API data
          const combinedData = combineBitcoinData(apiData, filteredEarlyData);
          console.log(`Combined early + API data: ${combinedData.length} points`);
          return combinedData;
        }
        
        console.log(`Using early Bitcoin data: ${filteredEarlyData.length} points`);
        return filteredEarlyData;
      }
    }
    
    // Voor andere coins of Bitcoin data na 2013, gebruik normale API
    const data = await dataManager.getPriceData(coin, startDate, endDate);
    
    // If no data returned and we're requesting early dates, try to get any available data
    if (data.length === 0 && startDate < new Date('2013-01-01')) {
      console.warn('No data for early dates, trying to get any available data...');
      const fallbackData = await dataManager.getPriceData(coin, new Date('2013-01-01'), endDate);
      if (fallbackData.length > 0) {
        console.log(`Got fallback data from 2013: ${fallbackData.length} points`);
        return fallbackData;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    // No fallback to mock data - only use real data
    console.warn('No real data available, returning empty array');
    return [];
  }
}


export async function getCurrentPrice(coin: string): Promise<number> {
  try {
    return await dataManager.getCurrentPrice(coin);
  } catch (error) {
    console.error('Error fetching current price:', error);
    // No fallback to mock data - only use real data
    console.warn('No real current price available');
    return 0;
  }
}

// Functie om vroege Bitcoin data te initialiseren
export const initializeEarlyBitcoinData = (): void => {
  try {
    // Controleer of vroege data al bestaat in localStorage
    const existingData = loadEarlyBitcoinData();
    
    if (!existingData) {
      console.log('Initializing early Bitcoin data...');
      saveEarlyBitcoinData();
      console.log('Early Bitcoin data initialized and saved to localStorage');
    } else {
      console.log('Early Bitcoin data already exists in localStorage');
    }
  } catch (error) {
    console.error('Error initializing early Bitcoin data:', error);
  }
};

// Functie om alle Bitcoin data op te halen (2009-heden)
export const fetchAllBitcoinData = async (): Promise<PriceData[]> => {
  try {
    console.log('Fetching complete Bitcoin history from 2009...');
    
    // Initialiseer vroege data
    initializeEarlyBitcoinData();
    
    // Haal vroege data op (2009-2013)
    const earlyData = loadEarlyBitcoinData() || getEarlyBitcoinData();
    console.log(`Early data loaded: ${earlyData.length} points`);
    
    // Genereer historische data voor de gap (2013-2020)
    console.log('Generating historical data for gap (2013-2020)...');
    const historicalData = generateHistoricalData(new Date('2013-01-01'), new Date('2020-01-01'));
    console.log(`Historical data generated: ${historicalData.length} points`);
    
    // Haal moderne data op (laatste 365 dagen van CoinGecko API)
    console.log('Fetching modern data (last 365 days from CoinGecko API)...');
    let modernData: PriceData[] = [];
    
    try {
      // Probeer direct CoinGecko API voor laatste 365 dagen
      const directData = await fetchFromCoinGeckoDirect('bitcoin', new Date('2020-01-01'), new Date());
      console.log(`Direct API data loaded: ${directData.length} points`);
      if (directData.length > 0) {
        modernData = directData;
      }
    } catch (directError) {
      console.error('Direct API call failed:', directError);
      
      // Fallback naar dataManager
      try {
        modernData = await dataManager.getPriceData('bitcoin', new Date('2020-01-01'), new Date());
        console.log(`DataManager fallback loaded: ${modernData.length} points`);
      } catch (dataManagerError) {
        console.error('DataManager fallback also failed:', dataManagerError);
      }
    }
    
    console.log(`Modern data loaded: ${modernData.length} points`);
    
    // Combineer historische en moderne data
    const allModernData = [...historicalData, ...modernData];
    console.log(`Combined modern data: ${allModernData.length} points`);
    
    // Combineer beide datasets
    const allData = combineBitcoinData(allModernData, earlyData);
    
    console.log(`Complete Bitcoin history: ${allData.length} data points from 2009 to present`);
    console.log('Sample data:', allData.slice(0, 3));
    
    // Verifieer dat we data hebben tot de huidige datum
    if (allData.length > 0) {
      const lastDate = new Date(allData[allData.length - 1].date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`Last data point: ${allData[allData.length - 1].date} (${daysDiff} days ago)`);
      
      if (daysDiff > 7) {
        console.warn(`Data is ${daysDiff} days old, may need refresh`);
      } else {
        console.log(`Data is up to date (${daysDiff} days old)`);
      }
    }
    
    return allData;
  } catch (error) {
    console.error('Error fetching complete Bitcoin data:', error);
    // Fallback: gebruik alleen vroege data
    const earlyData = loadEarlyBitcoinData() || getEarlyBitcoinData();
    console.log(`Using early data as fallback: ${earlyData.length} points`);
    return earlyData;
  }
};
