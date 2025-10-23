import { PriceData } from '../types';

interface ApiResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CoinMarketCapResponse {
  data: {
    quotes: Array<{
      timestamp: string;
      quote: {
        USD: {
          price: number;
          market_cap: number;
          volume_24h: number;
        };
      };
    }>;
  };
}

class DataManager {
  private static instance: DataManager;
  private dataPath = '/data/';
  private maxRetries = 3;
  private retryDelay = 1000;

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // CoinMarketCap API (gratis tier, uitgebreide historische data)
  private async fetchFromCoinMarketCap(coin: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    const symbol = coin; // BTC, ETH
    const fromTimestamp = Math.floor(startDate.getTime() / 1000);
    const toTimestamp = Math.floor(endDate.getTime() / 1000);
    
    // Try multiple CoinMarketCap endpoints with better historical data support
    const endpoints = [
      // Primary endpoint for historical data
      `https://web-api.coinmarketcap.com/v1/cryptocurrency/ohlcv/historical?symbol=${symbol}&time_start=${fromTimestamp}&time_end=${toTimestamp}&interval=daily`,
      // Alternative endpoint
      `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/historical?id=${symbol}&timeStart=${fromTimestamp}&timeEnd=${toTimestamp}`,
      // TradingView style endpoint
      `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${symbol}&range=ALL&convertId=2781`,
      // Direct historical data endpoint
      `https://coinmarketcap.com/currencies/${coin.toLowerCase()}/historical-data/?start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`
    ];
    
    for (const url of endpoints) {
      try {
        console.log(`Trying CoinMarketCap endpoint: ${url}`);
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://coinmarketcap.com/',
            'Origin': 'https://coinmarketcap.com'
          }
        });
        
        if (!response.ok) {
          console.warn(`CoinMarketCap endpoint failed with status: ${response.status}`);
          continue; // Try next endpoint
        }
        
        const data = await response.json();
        console.log('CoinMarketCap response structure:', Object.keys(data));
        
        // Handle different response formats
        if (data.data && data.data.quotes) {
          const prices = data.data.quotes.map((quote: any) => ({
            date: new Date(quote.timestamp).toISOString().split('T')[0],
            price: quote.quote.USD.close
          }));
          console.log(`CoinMarketCap returned ${prices.length} data points`);
          return prices;
        } else if (data.data && Array.isArray(data.data)) {
          const prices = data.data.map((item: any) => ({
            date: new Date(item.timeOpen).toISOString().split('T')[0],
            price: item.quote.USD.close
          }));
          console.log(`CoinMarketCap returned ${prices.length} data points`);
          return prices;
        } else if (data.data && data.data.points) {
          // TradingView format
          const prices = Object.entries(data.data.points).map(([timestamp, point]: [string, any]) => ({
            date: new Date(parseInt(timestamp)).toISOString().split('T')[0],
            price: point.v[0] // Open price
          }));
          console.log(`CoinMarketCap returned ${prices.length} data points (TradingView format)`);
          return prices;
        }
      } catch (error) {
        console.warn(`CoinMarketCap endpoint failed: ${url}`, error);
        continue; // Try next endpoint
      }
    }
    
    throw new Error('All CoinMarketCap endpoints failed');
  }

  // CoinGecko API (gratis, geen API key nodig)
  private async fetchFromCoinGecko(coin: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    // Map coin symbols to CoinGecko IDs
    const coinIdMap: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'bitcoin': 'bitcoin',
      'ETH': 'ethereum',
      'ethereum': 'ethereum'
    };
    
    const coinId = coinIdMap[coin.toUpperCase()] || coin.toLowerCase();
    const fromTimestamp = Math.floor(startDate.getTime() / 1000);
    const toTimestamp = Math.floor(endDate.getTime() / 1000);

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`;
    
    try {
      console.log(`CoinGecko API: Fetching ${coin} (${coinId}) from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      const priceData = data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toISOString().split('T')[0],
        price: price
      }));
      
      console.log(`CoinGecko API: Successfully fetched ${priceData.length} data points for ${coin}`);
      return priceData;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw error;
    }
  }

  // Alternative API (CryptoCompare - gratis tier)
  private async fetchFromCryptoCompare(coin: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    const fsym = coin;
    const tsym = 'USD';
    const limit = 2000; // Max per request
    const toTimestamp = Math.floor(endDate.getTime() / 1000);
    
    try {
      const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${fsym}&tsym=${tsym}&limit=${limit}&toTs=${toTimestamp}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`CryptoCompare API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.Data.Data.map((item: any) => ({
        date: new Date(item.time * 1000).toISOString().split('T')[0],
        price: item.close
      }));
    } catch (error) {
      console.error('CryptoCompare API error:', error);
      throw error;
    }
  }

  // Fallback API (CoinCap - gratis)
  private async fetchFromCoinCap(coin: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    const coinId = coin === 'BTC' ? 'bitcoin' : 'ethereum';
    
    try {
      // CoinCap heeft een andere API structuur
      const url = `https://api.coincap.io/v2/assets/${coinId}/history?interval=d1&start=${startDate.getTime()}&end=${endDate.getTime()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`CoinCap API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data.map((item: any) => ({
        date: new Date(item.time).toISOString().split('T')[0],
        price: parseFloat(item.priceUsd)
      }));
    } catch (error) {
      console.error('CoinCap API error:', error);
      throw error;
    }
  }

  // Try multiple APIs with fallback
  private async fetchWithFallback(coin: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    const apis = [
      { name: 'CoinMarketCap', fn: () => this.fetchFromCoinMarketCap(coin, startDate, endDate) },
      { name: 'CoinGecko', fn: () => this.fetchFromCoinGecko(coin, startDate, endDate) },
      { name: 'CryptoCompare', fn: () => this.fetchFromCryptoCompare(coin, startDate, endDate) },
      { name: 'CoinCap', fn: () => this.fetchFromCoinCap(coin, startDate, endDate) }
    ];

    for (let i = 0; i < apis.length; i++) {
      try {
        console.log(`Trying ${apis[i].name} API for ${coin}...`);
        const data = await apis[i].fn();
        if (data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} data points from ${apis[i].name}`);
          return data;
        }
      } catch (error) {
        console.warn(`${apis[i].name} API failed:`, error);
        if (i < apis.length - 1) {
          await this.delay(this.retryDelay);
        }
      }
    }

    throw new Error('All APIs failed');
  }

  // Get data with retry logic
  private async fetchWithRetry(coin: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.fetchWithFallback(coin, startDate, endDate);
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    throw new Error(`Failed to fetch data after ${this.maxRetries} attempts`);
  }

  // Load data from local storage
  private async loadLocalData(coin: string): Promise<PriceData[]> {
    try {
      const response = await fetch(`${this.dataPath}${coin.toLowerCase()}_prices.json`);
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.log('No local data found, will fetch from API');
      return [];
    }
  }

  // Save data to local storage
  private async saveLocalData(coin: string, prices: PriceData[]): Promise<void> {
    try {
      const data = {
        coin,
        lastUpdated: new Date().toISOString(),
        prices: prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };

      // In a real app, you'd save to a file system
      // For now, we'll use localStorage as a fallback
      localStorage.setItem(`${coin}_prices`, JSON.stringify(data));
      console.log(`Saved ${prices.length} price points for ${coin}`);
    } catch (error) {
      console.error('Failed to save local data:', error);
    }
  }

  // Merge new data with existing data
  private mergeData(existing: PriceData[], newData: PriceData[]): PriceData[] {
    const existingMap = new Map(existing.map(item => [item.date, item]));
    
    // Add new data, overwriting existing dates
    newData.forEach(item => {
      existingMap.set(item.date, item);
    });

    // Convert back to array and sort
    return Array.from(existingMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get missing date range
  private getMissingDateRange(existing: PriceData[], startDate: Date, endDate: Date): { start: Date; end: Date } | null {
    if (existing.length === 0) {
      return { start: startDate, end: endDate };
    }

    const existingDates = existing.map(item => new Date(item.date).getTime());
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    const minExisting = Math.min(...existingDates);
    const maxExisting = Math.max(...existingDates);

    // Check if we need data before existing range
    if (startTime < minExisting) {
      return { start: startDate, end: new Date(minExisting - 86400000) }; // 1 day before
    }

    // Check if we need data after existing range
    if (endTime > maxExisting) {
      return { start: new Date(maxExisting + 86400000), end: endDate }; // 1 day after
    }

    return null; // No missing data
  }

  // Main method to get price data
  async getPriceData(coin: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    try {
      console.log(`=== getPriceData called for ${coin} ===`);
      console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // Load existing data
      const existingData = await this.loadLocalData(coin);
      console.log(`Existing data for ${coin}: ${existingData.length} points`);
      
      // Check if we need to fetch new data
      const missingRange = this.getMissingDateRange(existingData, startDate, endDate);
      
      if (missingRange) {
        console.log(`Fetching missing data for ${coin} from ${missingRange.start.toISOString()} to ${missingRange.end.toISOString()}`);
        
        try {
          // Fetch new data
          const newData = await this.fetchWithRetry(coin, missingRange.start, missingRange.end);
          console.log(`Fetched ${newData.length} new data points for ${coin}`);
          
          // Merge with existing data
          const mergedData = this.mergeData(existingData, newData);
          
          // Save updated data
          await this.saveLocalData(coin, mergedData);
          
          const filteredData = mergedData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
          });
          
          console.log(`Returning ${filteredData.length} filtered data points for ${coin}`);
          return filteredData;
        } catch (fetchError) {
          console.error(`Failed to fetch new data for ${coin}:`, fetchError);
          
          // If we have existing data, use it
          if (existingData.length > 0) {
            console.log(`Using existing data as fallback for ${coin}`);
            return existingData.filter(item => {
              const itemDate = new Date(item.date);
              return itemDate >= startDate && itemDate <= endDate;
            });
          }
          
          // If no existing data and fetch failed, throw error
          throw fetchError;
        }
      } else {
        console.log(`Using cached data for ${coin}`);
        const filteredData = existingData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        });
        console.log(`Returning ${filteredData.length} cached data points for ${coin}`);
        return filteredData;
      }
    } catch (error) {
      console.error('Error in getPriceData:', error);
      
      // Final fallback: try to load any existing data
      try {
        const existingData = await this.loadLocalData(coin);
        if (existingData.length > 0) {
          console.log('Using existing data as final fallback');
          return existingData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      console.log(`No data available for ${coin}, returning empty array`);
      return [];
    }
  }

  // Get current price
  async getCurrentPrice(coin: string): Promise<number> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 86400000); // Last 24 hours
      
      const data = await this.getPriceData(coin, startDate, endDate);
      if (data.length > 0) {
        return data[data.length - 1].price;
      }
      
      // Fallback to API
      return await this.fetchWithRetry(coin, startDate, endDate).then(data => 
        data.length > 0 ? data[data.length - 1].price : 45000
      );
    } catch (error) {
      console.error('Error getting current price:', error);
      return coin === 'BTC' ? 45000 : 2500;
    }
  }

  // Force update data (for manual refresh)
  async forceUpdate(coin: string, startDate: Date, endDate: Date): Promise<PriceData[]> {
    console.log(`Force updating data for ${coin}`);
    const newData = await this.fetchWithRetry(coin, startDate, endDate);
    const existingData = await this.loadLocalData(coin);
    const mergedData = this.mergeData(existingData, newData);
    await this.saveLocalData(coin, mergedData);
    return mergedData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get data statistics
  async getDataStats(coin: string): Promise<{ count: number; dateRange: { start: string; end: string } | null; lastUpdated: string | null }> {
    const data = await this.loadLocalData(coin);
    if (data.length === 0) {
      return { count: 0, dateRange: null, lastUpdated: null };
    }

    const dates = data.map(item => new Date(item.date).getTime());
    return {
      count: data.length,
      dateRange: {
        start: new Date(Math.min(...dates)).toISOString().split('T')[0],
        end: new Date(Math.max(...dates)).toISOString().split('T')[0]
      },
      lastUpdated: localStorage.getItem(`${coin}_lastUpdated`) || null
    };
  }
}

export const dataManager = DataManager.getInstance();
