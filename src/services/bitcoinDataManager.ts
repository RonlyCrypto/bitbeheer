import { bitcoinPriceDataService } from './bitcoinPriceDataService';
import logger from '../utils/logger';

interface BitcoinPriceData {
  timestamp: number;
  date: string;
  price: number;
  volume?: number;
  marketCap?: number;
}

interface BitcoinDataStructure {
  daily: BitcoinPriceData[];
  hourly: BitcoinPriceData[];
  minute15: BitcoinPriceData[];
  lastUpdated: string;
  dataRange: {
    start: string;
    end: string;
  };
}

class BitcoinDataManager {
  private dataEUR: BitcoinDataStructure | null = null;
  private dataUSD: BitcoinDataStructure | null = null;
  private readonly STORAGE_KEY_EUR = 'bitcoin_complete_data_eur';
  private readonly STORAGE_KEY_USD = 'bitcoin_complete_data_usd';
  private readonly UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private readonly DAILY_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private useServerStorage = true; // Toggle between server and localStorage
  private lastDailyUpdate: number = 0;

  constructor() {
    this.loadData();
    this.initializeDailyUpdates();
  }

  // Load data from server or localStorage (loads both currencies)
  private async loadData(): Promise<void> {
    // Load both EUR and USD data
    await this.loadDataForCurrency('EUR');
    await this.loadDataForCurrency('USD');
  }

  // Load complete Bitcoin EUR history from CoinGecko CSV
  private async loadCompleteEURHistory(): Promise<BitcoinPriceData[]> {
    try {
      // Loading EUR history from Supabase (no console logs)
      
      const response = await fetch('/eur/bitcoin-eur-complete-history.csv');
      if (!response.ok) {
        // EUR history not found, trying Kraken data
        return await this.loadKrakenEURData();
      }
      
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const data: BitcoinPriceData[] = [];
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Parse CSV line: "Date";"Price"
        const columns = line.split(';');
        if (columns.length >= 2) {
          const dateStr = columns[0].replace(/"/g, '');
          const priceStr = columns[1].replace(/"/g, '').replace(',', '.');
          
          const price = parseFloat(priceStr);
          if (!isNaN(price)) {
            data.push({
              timestamp: new Date(dateStr).getTime(),
              date: dateStr,
              price: price
            });
          }
        }
      }
      
      // Sort by date
      data.sort((a, b) => a.timestamp - b.timestamp);
      
      // EUR history loaded silently
      return data;
      
    } catch (error) {
      // Error loading EUR history (silent)
      return await this.loadKrakenEURData();
    }
  }

  // Load Kraken EUR historical data (fallback)
  private async loadKrakenEURData(): Promise<BitcoinPriceData[]> {
    try {
      // Loading Kraken EUR data (fallback)
      
      const response = await fetch('/eur/BTC_EUR_Kraken_Historical_Data.csv');
      if (!response.ok) {
        throw new Error(`Failed to load Kraken data: ${response.status}`);
      }
      
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const data: BitcoinPriceData[] = [];
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Parse CSV line: "Date","Price","Open","High","Low","Vol.","Change %"
        const columns = line.split(',');
        if (columns.length >= 2) {
          const dateStr = columns[0].replace(/"/g, '');
          const priceStr = columns[1].replace(/"/g, '').replace(',', '.');
          
          // Convert date from MM/DD/YYYY to YYYY-MM-DD
          const dateParts = dateStr.split('/');
          if (dateParts.length === 3) {
            const month = dateParts[0].padStart(2, '0');
            const day = dateParts[1].padStart(2, '0');
            const year = dateParts[2];
            const isoDate = `${year}-${month}-${day}`;
            
            const price = parseFloat(priceStr);
            if (!isNaN(price)) {
              data.push({
                timestamp: new Date(isoDate).getTime(),
                date: isoDate,
                price: price
              });
            }
          }
        }
      }
      
      // Sort by date
      data.sort((a, b) => a.timestamp - b.timestamp);
      
      // Kraken data loaded silently
      return data;
      
    } catch (error) {
      // Error loading Kraken data (silent)
      return [];
    }
  }

  // Load data from Supabase (backend) for specific currency
  private async loadFromServer(currency: 'EUR' | 'USD' = 'USD'): Promise<BitcoinDataStructure | null> {
    try {
      // Load data from Supabase using the new service
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: currentYear - 2009 + 1 }, (_, i) => 2009 + i);
      
      // Get all data for all years from Supabase with currency
      const allData = await bitcoinPriceDataService.getDataForYears(years, currency);
      
      if (allData.length > 0) {
        // Sort by date (should already be sorted, but just in case)
        allData.sort((a, b) => a.timestamp - b.timestamp);
        
        const combinedData: BitcoinDataStructure = {
          daily: allData,
          hourly: this.generateHourlyData(allData),
          minute15: this.generate15MinuteData(allData),
          lastUpdated: new Date().toISOString(),
          dataRange: {
            start: allData[0].date,
            end: allData[allData.length - 1].date
          }
        };
        
        // Data loaded silently from Supabase (no console logs)
        return combinedData;
      }
      
      // Fallback to localStorage if no Supabase data
      const storageKey = currency === 'EUR' ? this.STORAGE_KEY_EUR : this.STORAGE_KEY_USD;
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (parsedData.daily && parsedData.daily.length > 0) {
          // Using localStorage data as fallback (silent)
          return parsedData;
        }
      }
    } catch (error) {
      logger.error(`Error loading Bitcoin data from Supabase (${currency}):`, error);
      // Fallback to localStorage on error
      const storageKey = currency === 'EUR' ? this.STORAGE_KEY_EUR : this.STORAGE_KEY_USD;
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          if (parsedData.daily && parsedData.daily.length > 0) {
            return parsedData;
          }
        } catch (parseError) {
          // Ignore parse errors
        }
      }
    }
    return null;
  }

  // Parse CSV data into BitcoinPriceData format
  private parseCSVData(csvText: string, year: number): BitcoinPriceData[] {
    const lines = csvText.split('\n');
    const data: BitcoinPriceData[] = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line: "Date";"Price"
      const parts = line.split(';');
      if (parts.length >= 2) {
        const dateStr = parts[0].replace(/"/g, ''); // Remove quotes
        const priceStr = parts[1].replace(/"/g, '').replace(',', '.'); // Remove quotes and convert comma to dot
        
        const date = new Date(dateStr);
        const price = parseFloat(priceStr);
        
        if (!isNaN(price) && !isNaN(date.getTime())) {
          data.push({
            timestamp: date.getTime(),
            date: date.toISOString().split('T')[0],
            price: price
          });
        }
      }
    }
    
    return data;
  }

  // Save data to server and localStorage
  private async saveData(currency: 'EUR' | 'USD' = 'USD'): Promise<void> {
    const data = currency === 'EUR' ? this.dataEUR : this.dataUSD;
    if (data) {
      try {
        // Save to localStorage
        const storageKey = currency === 'EUR' ? this.STORAGE_KEY_EUR : this.STORAGE_KEY_USD;
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        // Save to server if enabled
        if (this.useServerStorage) {
          await this.saveToServer();
        }
      } catch (error) {
        console.error('Error saving Bitcoin data:', error);
      }
    }
  }

  // Save data to server
  private async saveToServer(data?: BitcoinDataStructure, currency: 'EUR' | 'USD' = 'USD'): Promise<void> {
    const dataToSave = data || (currency === 'EUR' ? this.dataEUR : this.dataUSD);
    if (!dataToSave) return;
    
    try {
      // For now, we'll use a simple approach - save to localStorage with a special key
      // In a real app, this would be a proper API call to update the JSON file
      localStorage.setItem('bitcoin_server_data', JSON.stringify(dataToSave));
      console.log('Bitcoin data saved to server (via localStorage for now)');
      
      // In a real implementation, you would make an API call here:
      // const response = await fetch('/api/bitcoin-data/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dataToSave),
      // });
    } catch (error) {
      console.error('Error saving Bitcoin data to server:', error);
    }
  }

  // Get price for specific date/time
  getPriceForDate(date: string, interval: 'daily' | 'hourly' | 'minute15' = 'daily', currency: 'EUR' | 'USD' = 'USD'): number | null {
    const data = currency === 'EUR' ? this.dataEUR : this.dataUSD;
    if (!data) return null;

    const targetDate = new Date(date);
    const dataArray = data[interval];

    // Find closest data point
    let closest = null;
    let minDiff = Infinity;

    for (const point of dataArray) {
      const pointDate = new Date(point.date);
      const diff = Math.abs(targetDate.getTime() - pointDate.getTime());
      
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }

    return closest ? closest.price : null;
  }

  // Get data range
  getDataRange(interval: 'daily' | 'hourly' | 'minute15' = 'daily', currency: 'EUR' | 'USD' = 'USD'): BitcoinPriceData[] {
    const data = currency === 'EUR' ? this.dataEUR : this.dataUSD;
    if (!data) return [];
    return data[interval];
  }

  // Fetch complete Bitcoin history from multiple sources (for specific currency)
  async fetchCompleteHistory(currency: 'EUR' | 'USD' = 'USD'): Promise<void> {
    console.log(`Starting complete Bitcoin history fetch for ${currency}...`);
    
    try {
      // Load from Supabase first (preferred method)
      const serverData = await this.loadFromServer(currency);
      if (serverData) {
        if (currency === 'EUR') {
          this.dataEUR = serverData;
        } else {
          this.dataUSD = serverData;
        }
        this.saveData(currency);
        console.log(`Bitcoin history loaded from Supabase for ${currency}:`, {
          daily: serverData.daily.length,
          hourly: serverData.hourly.length,
          minute15: serverData.minute15.length
        });
        return;
      }

      // Fallback: fetch from CoinGecko if no Supabase data
      // Start with early Bitcoin data (2009-2013)
      const earlyData = await this.fetchEarlyBitcoinData(currency);
      
      // Fetch historical data from CoinGecko (2013-2020)
      const historicalData = await this.fetchHistoricalData(currency);
      
      // Fetch recent data (2020-now)
      const recentData = await this.fetchRecentData(currency);
      
      // Combine all data
      const combinedData = this.combineData(earlyData, historicalData, recentData);
      
      // Generate different time intervals
      const dataStructure: BitcoinDataStructure = {
        daily: this.generateDailyData(combinedData),
        hourly: this.generateHourlyData(combinedData),
        minute15: this.generate15MinuteData(combinedData),
        lastUpdated: new Date().toISOString(),
        dataRange: {
          start: combinedData[0]?.date || '',
          end: combinedData[combinedData.length - 1]?.date || ''
        }
      };
      
      if (currency === 'EUR') {
        this.dataEUR = dataStructure;
      } else {
        this.dataUSD = dataStructure;
      }
      
      this.saveData(currency);
      console.log(`Complete Bitcoin history fetched and saved for ${currency}:`, {
        totalPoints: combinedData.length,
        daily: dataStructure.daily.length,
        hourly: dataStructure.hourly.length,
        minute15: dataStructure.minute15.length
      });
      
    } catch (error) {
      console.error(`Error fetching complete Bitcoin history for ${currency}:`, error);
    }
  }

  // Fetch early Bitcoin data (2009-2013)
  private async fetchEarlyBitcoinData(currency: 'EUR' | 'USD' = 'USD'): Promise<BitcoinPriceData[]> {
    console.log(`Fetching early Bitcoin data (2009-2013) for ${currency}...`);
    
    // Early Bitcoin price milestones (in USD)
    const earlyPricesUSD = [
      { date: '2009-01-09', price: 0.0008 }, // First Bitcoin transaction
      { date: '2009-10-05', price: 0.0008 }, // First exchange rate
      { date: '2010-05-22', price: 0.0025 }, // Bitcoin Pizza Day
      { date: '2010-07-17', price: 0.05 },   // First major exchange
      { date: '2010-11-06', price: 0.5 },    // First $1 milestone
      { date: '2011-02-09', price: 1.0 },    // First $1
      { date: '2011-06-08', price: 31.91 },  // First major peak
      { date: '2011-11-19', price: 2.14 },   // First major crash
      { date: '2012-01-01', price: 5.27 },   // Start of 2012
      { date: '2012-12-31', price: 13.44 },  // End of 2012
      { date: '2013-01-01', price: 13.44 },  // Start of 2013
      { date: '2013-04-10', price: 266.0 },  // First major bubble
      { date: '2013-04-12', price: 50.0 },   // First major crash
      { date: '2013-11-30', price: 1124.0 }, // Second major peak
      { date: '2013-12-31', price: 757.0 }   // End of 2013
    ];
    
    // Convert to EUR if needed (approximate rate 0.85 for that period)
    const conversionRate = 0.85;
    const earlyPrices = currency === 'EUR' 
      ? earlyPricesUSD.map(p => ({ date: p.date, price: p.price * conversionRate }))
      : earlyPricesUSD;

    // Generate daily data points between milestones
    const dailyData: BitcoinPriceData[] = [];
    
    for (let i = 0; i < earlyPrices.length - 1; i++) {
      const start = new Date(earlyPrices[i].date);
      const end = new Date(earlyPrices[i + 1].date);
      const startPrice = earlyPrices[i].price;
      const endPrice = earlyPrices[i + 1].price;
      
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const priceStep = (endPrice - startPrice) / days;
      
      for (let day = 0; day < days; day++) {
        const currentDate = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
        const price = startPrice + (priceStep * day);
        
        dailyData.push({
          timestamp: currentDate.getTime(),
          date: currentDate.toISOString().split('T')[0],
          price: Math.max(0.0001, price) // Ensure positive price
        });
      }
    }
    
    return dailyData;
  }

  // Fetch historical data from CoinGecko (2013-2020)
  private async fetchHistoricalData(currency: 'EUR' | 'USD' = 'USD'): Promise<BitcoinPriceData[]> {
    console.log(`Fetching historical data from CoinGecko (2013-2020) for ${currency}...`);
    
    try {
      const vsCurrency = currency.toLowerCase();
      // CoinGecko historical data for Bitcoin
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${vsCurrency}&days=max&interval=daily`);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      const prices = data.prices || [];
      
      return prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        date: new Date(timestamp).toISOString().split('T')[0],
        price: price
      }));
      
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  // Fetch recent data (2020-now)
  private async fetchRecentData(currency: 'EUR' | 'USD' = 'USD'): Promise<BitcoinPriceData[]> {
    console.log(`Fetching recent data (2020-now) for ${currency}...`);
    
    try {
      const vsCurrency = currency.toLowerCase();
      // Multiple API sources for recent data
      const sources = [
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${vsCurrency}&days=365&interval=daily`,
        `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/historical?id=1&timeStart=2020-01-01&timeEnd=2025-01-01`
      ];
      
      for (const source of sources) {
        try {
          const response = await fetch(source);
          if (response.ok) {
            const data = await response.json();
            const prices = data.prices || data.data?.quotes || [];
            
            return prices.map(([timestamp, price]: [number, number]) => ({
              timestamp,
              date: new Date(timestamp).toISOString().split('T')[0],
              price: price
            }));
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${source}:`, error);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent data:', error);
      return [];
    }
  }

  // Combine data from different sources
  private combineData(early: BitcoinPriceData[], historical: BitcoinPriceData[], recent: BitcoinPriceData[]): BitcoinPriceData[] {
    console.log('Combining data from all sources...');
    
    const combined = [...early, ...historical, ...recent];
    
    // Remove duplicates and sort by date
    const unique = combined.reduce((acc, current) => {
      const existing = acc.find(item => item.date === current.date);
      if (!existing) {
        acc.push(current);
      } else if (Math.abs(existing.price - current.price) > 0.01) {
        // If prices differ significantly, use the more recent one
        if (current.timestamp > existing.timestamp) {
          acc[acc.indexOf(existing)] = current;
        }
      }
      return acc;
    }, [] as BitcoinPriceData[]);
    
    return unique.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Generate daily data
  private generateDailyData(data: BitcoinPriceData[]): BitcoinPriceData[] {
    return data.filter((_, index) => index % 1 === 0); // Every data point is daily
  }

  // Generate hourly data
  private generateHourlyData(data: BitcoinPriceData[]): BitcoinPriceData[] {
    const hourly: BitcoinPriceData[] = [];
    
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];
      
      // Add current daily point
      hourly.push(current);
      
      // Generate hourly points between current and next
      const currentDate = new Date(current.date);
      const nextDate = new Date(next.date);
      const hours = Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60));
      
      if (hours > 1) {
        const priceStep = (next.price - current.price) / hours;
        
        for (let hour = 1; hour < hours; hour++) {
          const hourDate = new Date(currentDate.getTime() + hour * 60 * 60 * 1000);
          const price = current.price + (priceStep * hour);
          
          hourly.push({
            timestamp: hourDate.getTime(),
            date: hourDate.toISOString().split('T')[0],
            price: Math.max(0.0001, price)
          });
        }
      }
    }
    
    return hourly;
  }

  // Generate 15-minute data
  private generate15MinuteData(data: BitcoinPriceData[]): BitcoinPriceData[] {
    const minute15: BitcoinPriceData[] = [];
    
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];
      
      // Add current point
      minute15.push(current);
      
      // Generate 15-minute points between current and next
      const currentDate = new Date(current.date);
      const nextDate = new Date(next.date);
      const minutes = Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 60));
      
      if (minutes > 15) {
        const priceStep = (next.price - current.price) / (minutes / 15);
        
        for (let minute = 15; minute < minutes; minute += 15) {
          const minuteDate = new Date(currentDate.getTime() + minute * 60 * 1000);
          const price = current.price + (priceStep * (minute / 15));
          
          minute15.push({
            timestamp: minuteDate.getTime(),
            date: minuteDate.toISOString().split('T')[0],
            price: Math.max(0.0001, price)
          });
        }
      }
    }
    
    return minute15;
  }

  // Update data periodically
  async updateData(currency: 'EUR' | 'USD' = 'USD'): Promise<void> {
    if (this.needsUpdate(currency)) {
      console.log(`Updating Bitcoin data for ${currency}...`);
      await this.fetchCompleteHistory(currency);
    }
  }

  // Get current data
  getData(currency: 'EUR' | 'USD' = 'USD'): BitcoinDataStructure | null {
    if (currency === 'EUR') {
      return this.dataEUR;
    }
    return this.dataUSD;
  }

  // Load data for specific currency
  async loadDataForCurrency(currency: 'EUR' | 'USD' = 'USD'): Promise<void> {
    try {
      if (this.useServerStorage) {
        // Try to load from server first
        const serverData = await this.loadFromServer(currency);
        if (serverData) {
          if (currency === 'EUR') {
            this.dataEUR = serverData;
          } else {
            this.dataUSD = serverData;
          }
          return;
        }
      }
      
      // Fallback to localStorage
      const storageKey = currency === 'EUR' ? this.STORAGE_KEY_EUR : this.STORAGE_KEY_USD;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (currency === 'EUR') {
          this.dataEUR = parsed;
        } else {
          this.dataUSD = parsed;
        }
      }
    } catch (error) {
      logger.error(`Error loading data for ${currency}:`, error);
    }
  }

  // Export data to JSON file
  exportToJSON(currency: 'EUR' | 'USD' = 'USD'): void {
    const data = currency === 'EUR' ? this.dataEUR : this.dataUSD;
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `bitcoin_complete_data_${currency}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Bitcoin data exported to JSON file for ${currency}`);
    }
  }

  // Update CSV data for current year (for both currencies)
  async updateCurrentYearCSV(): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      const currentDate = new Date();
      const today = currentDate.toISOString().split('T')[0];
      
      // Fetch current Bitcoin prices for both currencies
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur');
      if (response.ok) {
        const data = await response.json();
        const currentPriceUSD = data.bitcoin.usd;
        const currentPriceEUR = data.bitcoin.eur;
        
        // Update USD data
        if (this.dataUSD) {
          const todayIndex = this.dataUSD.daily.findIndex(entry => entry.date === today);
          if (todayIndex !== -1) {
            this.dataUSD.daily[todayIndex].price = currentPriceUSD;
            this.dataUSD.lastUpdated = new Date().toISOString();
            await this.saveData('USD');
          } else {
            this.dataUSD.daily.push({
              timestamp: currentDate.getTime(),
              date: today,
              price: currentPriceUSD
            });
            this.dataUSD.daily.sort((a, b) => a.timestamp - b.timestamp);
            this.dataUSD.lastUpdated = new Date().toISOString();
            await this.saveData('USD');
          }
        }
        
        // Update EUR data
        if (this.dataEUR) {
          const todayIndex = this.dataEUR.daily.findIndex(entry => entry.date === today);
          if (todayIndex !== -1) {
            this.dataEUR.daily[todayIndex].price = currentPriceEUR;
            this.dataEUR.lastUpdated = new Date().toISOString();
            await this.saveData('EUR');
          } else {
            this.dataEUR.daily.push({
              timestamp: currentDate.getTime(),
              date: today,
              price: currentPriceEUR
            });
            this.dataEUR.daily.sort((a, b) => a.timestamp - b.timestamp);
            this.dataEUR.lastUpdated = new Date().toISOString();
            await this.saveData('EUR');
          }
        }
      }
    } catch (error) {
      console.error('Error updating current year CSV:', error);
    }
  }

  // Get data info for debugging
  getDataInfo(currency: 'EUR' | 'USD' = 'USD'): { totalDays: number; dateRange: string; lastUpdated: string; needsUpdate: boolean } {
    const data = currency === 'EUR' ? this.dataEUR : this.dataUSD;
    if (!data) {
      return { totalDays: 0, dateRange: 'No data', lastUpdated: 'Never', needsUpdate: true };
    }

    return {
      totalDays: data.daily.length,
      dateRange: `${data.dataRange.start} to ${data.dataRange.end}`,
      lastUpdated: data.lastUpdated,
      needsUpdate: this.needsUpdate(currency)
    };
  }

  // Check if data needs update
  private needsUpdate(currency: 'EUR' | 'USD' = 'USD'): boolean {
    const data = currency === 'EUR' ? this.dataEUR : this.dataUSD;
    if (!data) return true;
    
    const lastUpdated = new Date(data.lastUpdated);
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    
    return diff > this.UPDATE_INTERVAL;
  }

  // Load 2025 data from local bitcoin-price-history-2025.csv
  private async load2025DataFromLocalCSV(): Promise<BitcoinPriceData[]> {
    try {
      // Loading 2025 Bitcoin data from Supabase
      
      // Fetch the local CSV file
      const response = await fetch('/bitcoin-price-history-2025.csv');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch local CSV: ${response.status}`);
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n');
      
      // Skip header line
      const dataLines = lines.slice(1);
      
      const bitcoinData: BitcoinPriceData[] = [];
      
      for (const line of dataLines) {
        if (!line.trim()) continue;
        
        // Parse our CSV format: date,price
        const parts = line.split(',');
        
        if (parts.length >= 2) {
          const dateStr = parts[0]; // 2025-01-01
          const price = parseFloat(parts[1]); // price
          
          const date = new Date(dateStr);
          const timestamp = date.getTime();
          
          bitcoinData.push({
            timestamp: timestamp,
            date: dateStr,
            price: price
          });
        }
      }
      
      // 2025 data loaded silently
      
      return bitcoinData;
      
    } catch (error) {
      // Error loading 2025 data (silent)
      return [];
    }
  }

  // Save 2025 data to CSV file
  private async save2025DataToCSV(data: BitcoinPriceData[]): Promise<void> {
    try {
      console.log('Saving 2025 data to CSV file...');
      
      // Convert to CSV format
      const csvLines = ['"Date";"Price"'];
      
      data.forEach(point => {
        const dateStr = new Date(point.timestamp).toISOString().replace('T', ' ').replace('Z', '');
        const priceStr = point.price.toFixed(2).replace('.', ',');
        csvLines.push(`"${dateStr}";"${priceStr}"`);
      });
      
      const csvContent = csvLines.join('\n');
      
      // Save to localStorage for now (in a real app, this would be saved to server)
      localStorage.setItem('bitcoin_2025_csv', csvContent);
      
      console.log('2025 CSV content saved to localStorage');
      console.log('Sample 2025 data:', data.slice(0, 5).map(d => ({ date: d.date, price: d.price })));
      
    } catch (error) {
      console.error('Error saving 2025 data to CSV:', error);
    }
  }

  // Get fresh 2025 data from local CSV and update (for both currencies)
  async update2025DataFromLocalCSV(): Promise<void> {
    try {
      console.log('Updating 2025 data from local CSV...');
      
      // This function should update from Supabase, not CSV
      // Reload from Supabase for both currencies
      await this.loadDataForCurrency('EUR');
      await this.loadDataForCurrency('USD');
      
      console.log('2025 data updated from Supabase');
    } catch (error) {
      console.error('Error updating 2025 data:', error);
    }
  }

  // Force reload all data from CSV files (both currencies)
  async forceReloadAllData(): Promise<void> {
    console.log('Force reloading all Bitcoin data from Supabase...');
    
    // Clear current data
    this.dataEUR = null;
    this.dataUSD = null;
    localStorage.removeItem(this.STORAGE_KEY_EUR);
    localStorage.removeItem(this.STORAGE_KEY_USD);
    
    // Reload from server for both currencies
    await this.loadDataForCurrency('EUR');
    await this.loadDataForCurrency('USD');
    
    console.log('Force reload completed');
  }

  // Get server data info
  async getServerDataInfo(currency: 'EUR' | 'USD' = 'USD'): Promise<{
    hasServerData: boolean;
    hasLocalData: boolean;
    serverDataSize: number;
    localDataSize: number;
    lastUpdated: string | null;
  }> {
    const storageKey = currency === 'EUR' ? this.STORAGE_KEY_EUR : this.STORAGE_KEY_USD;
    const localData = localStorage.getItem(storageKey);
    const data = currency === 'EUR' ? this.dataEUR : this.dataUSD;
    
    return {
      hasServerData: false, // Server data is loaded directly, not stored separately
      hasLocalData: !!localData,
      serverDataSize: 0,
      localDataSize: localData ? localData.length : 0,
      lastUpdated: data?.lastUpdated || null
    };
  }

  // Toggle between server and localStorage
  setUseServerStorage(useServer: boolean): void {
    this.useServerStorage = useServer;
    console.log(`Switched to ${useServer ? 'server' : 'localStorage'} storage`);
  }

  // Public method to get all Bitcoin data
  async getAllBitcoinData(currency: 'EUR' | 'USD' = 'USD'): Promise<BitcoinPriceData[]> {
    const data = currency === 'EUR' ? this.dataEUR : this.dataUSD;
    if (!data) {
      await this.loadDataForCurrency(currency);
      const reloadedData = currency === 'EUR' ? this.dataEUR : this.dataUSD;
      if (!reloadedData) {
        console.warn(`No Bitcoin data available for ${currency}`);
        return [];
      }
      return reloadedData.daily;
    }
    
    // Return daily data as the main dataset
    return data.daily;
  }

  // Fetch current Bitcoin price from CoinGecko with fallback
  private async fetchCurrentBitcoinPrice(currency: string = 'eur'): Promise<number | null> {
    try {
      console.log(`Fetching current Bitcoin price from CoinGecko in ${currency.toUpperCase()}...`);
      
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}&include_24hr_change=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const currentPrice = data.bitcoin?.[currency];
      
      if (currentPrice && typeof currentPrice === 'number') {
        console.log(`Current Bitcoin price fetched in ${currency.toUpperCase()}:`, currentPrice);
        return currentPrice;
      } else {
        throw new Error('Invalid price data received');
      }
    } catch (error) {
      console.error('Error fetching current Bitcoin price:', error);
      
      // Try to get cached price from localStorage
      try {
        const cached = localStorage.getItem('bitcoin_last_price');
        if (cached) {
          const data = JSON.parse(cached);
          if (data.price && typeof data.price === 'number') {
            console.log('Using cached Bitcoin price:', data.price);
            return data.price;
          }
        }
      } catch (cacheError) {
        console.error('Error loading cached price:', cacheError);
      }
      
      // Return null if no fallback available
      return null;
    }
  }

  // Update today's price in CSV with highest daily value
  private async updateTodaysPrice(currency: string = 'eur'): Promise<void> {
    try {
      const currentPrice = await this.fetchCurrentBitcoinPrice(currency);
      if (!currentPrice) {
        console.log('Could not fetch current price, skipping daily update');
        return;
      }

      // Get current date and determine if we should use today or tomorrow
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Use today's date for the CSV entry
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log(`Updating today's EUR price (${today}) in bitcoin-eur-complete-history.csv with value: €${currentPrice}`);

      // Call server-side API to update EUR CSV
      const response = await fetch('/api/updateEURBitcoinPrice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          price: currentPrice
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('EUR CSV update result:', result);
      
      // Update last daily update timestamp
      this.lastDailyUpdate = Date.now();
      localStorage.setItem('bitcoin_last_daily_update', this.lastDailyUpdate.toString());

    } catch (error) {
      console.error('Error updating today\'s price:', error);
    }
  }

  // Check if daily update is needed
  private needsDailyUpdate(): boolean {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastDailyUpdate;
    return timeSinceLastUpdate >= this.DAILY_UPDATE_INTERVAL;
  }

  // Initialize daily update system
  private initializeDailyUpdates(): void {
    // Load last daily update timestamp
    const stored = localStorage.getItem('bitcoin_last_daily_update');
    if (stored) {
      this.lastDailyUpdate = parseInt(stored, 10);
    }

    // Check if daily update is needed
    if (this.needsDailyUpdate()) {
      console.log('Daily update needed, updating today\'s price...');
      this.updateTodaysPrice();
    }

    // Set up daily update interval
    setInterval(() => {
      if (this.needsDailyUpdate()) {
        console.log('Daily update interval triggered, updating today\'s price...');
        this.updateTodaysPrice();
      }
    }, this.DAILY_UPDATE_INTERVAL);
  }


  // Public method to manually trigger daily update
  async triggerDailyUpdate(currency: 'EUR' | 'USD' = 'USD'): Promise<void> {
    console.log(`Manually triggering daily update in ${currency}...`);
    await this.updateCurrentYearCSV();
  }

  // Public method to get current Bitcoin price
  async getCurrentBitcoinPrice(currency: string = 'eur'): Promise<number | null> {
    return await this.fetchCurrentBitcoinPrice(currency);
  }
}

// Export singleton instance
export const bitcoinDataManager = new BitcoinDataManager();
export default bitcoinDataManager;
