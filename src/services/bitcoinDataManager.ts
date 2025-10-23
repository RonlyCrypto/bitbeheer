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
  private data: BitcoinDataStructure | null = null;
  private readonly STORAGE_KEY = 'bitcoin_complete_data';
  private readonly UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private readonly DAILY_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private useServerStorage = true; // Toggle between server and localStorage
  private lastDailyUpdate: number = 0;

  constructor() {
    this.loadData();
    this.initializeDailyUpdates();
  }

  // Load data from server or localStorage
  private async loadData(): Promise<void> {
    try {
      if (this.useServerStorage) {
        // Try to load from server first
        const serverData = await this.loadFromServer();
        if (serverData) {
          this.data = serverData;
          console.log('Bitcoin data loaded from server:', {
            daily: this.data?.daily.length || 0,
            hourly: this.data?.hourly.length || 0,
            minute15: this.data?.minute15.length || 0,
            lastUpdated: this.data?.lastUpdated
          });
          return;
        }
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        console.log('Bitcoin data loaded from localStorage:', {
          daily: this.data?.daily.length || 0,
          hourly: this.data?.hourly.length || 0,
          minute15: this.data?.minute15.length || 0,
          lastUpdated: this.data?.lastUpdated
        });
      }
    } catch (error) {
      console.error('Error loading Bitcoin data:', error);
    }
  }

  // Load complete Bitcoin EUR history from CoinGecko CSV
  private async loadCompleteEURHistory(): Promise<BitcoinPriceData[]> {
    try {
      console.log('Loading complete Bitcoin EUR history...');
      
      const response = await fetch('/eur/bitcoin-eur-complete-history.csv');
      if (!response.ok) {
        console.log('Complete EUR history not found, trying Kraken data...');
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
      
      console.log(`Loaded ${data.length} complete EUR history data points`);
      return data;
      
    } catch (error) {
      console.error('Error loading complete EUR history:', error);
      return await this.loadKrakenEURData();
    }
  }

  // Load Kraken EUR historical data (fallback)
  private async loadKrakenEURData(): Promise<BitcoinPriceData[]> {
    try {
      console.log('Loading Kraken EUR historical data...');
      
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
      
      console.log(`Loaded ${data.length} Kraken EUR data points`);
      return data;
      
    } catch (error) {
      console.error('Error loading Kraken EUR data:', error);
      return [];
    }
  }

  // Load data from server (CSV files)
  private async loadFromServer(): Promise<BitcoinDataStructure | null> {
    try {
      console.log('Loading Bitcoin data from CSV files...');
      
      const allData: BitcoinPriceData[] = [];
      const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
      
      for (const year of years) {
        try {
          const response = await fetch(`/bitcoin-price-history-${year}.csv`);
          if (response.ok) {
            const csvText = await response.text();
            const yearData = this.parseCSVData(csvText, year);
            if (yearData.length > 0) {
              allData.push(...yearData);
              console.log(`Loaded ${yearData.length} data points for ${year}`);
            }
          }
        } catch (error) {
          console.warn(`Could not load CSV data for year ${year}:`, error);
        }
      }
      
      // Always load fresh 2025 data from updated bitcoin-price-history-2025.csv
      if (allData.length > 0) {
        console.log('Loading fresh 2025 data from bitcoin-price-history-2025.csv...');
        const fresh2025Data = await this.load2025DataFromLocalCSV();
        if (fresh2025Data && fresh2025Data.length > 0) {
          // Remove old 2025 data and add fresh data
          const filteredData = allData.filter(point => {
            const year = new Date(point.date).getFullYear();
            return year !== 2025;
          });
          allData.length = 0;
          allData.push(...filteredData, ...fresh2025Data);
          console.log(`Updated 2025 data with ${fresh2025Data.length} fresh data points from local CSV`);
        }
      }
      
      // Load complete EUR history (primary source)
      const eurHistoryData = await this.loadCompleteEURHistory();
      if (eurHistoryData.length > 0) {
        // Use EUR history data as primary source
        allData.length = 0;
        allData.push(...eurHistoryData);
        console.log(`Using complete EUR history with ${eurHistoryData.length} data points`);
      } else {
        console.log('No EUR history data found, using existing CSV data');
      }
      
      if (allData.length > 0) {
        // Sort by date
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
        
        console.log(`Loaded total of ${allData.length} daily data points from ${combinedData.dataRange.start} to ${combinedData.dataRange.end}`);
        
        // Debug: Show data distribution by year
        const yearDistribution: { [year: string]: number } = {};
        allData.forEach(point => {
          const year = new Date(point.date).getFullYear().toString();
          yearDistribution[year] = (yearDistribution[year] || 0) + 1;
        });
        console.log('Data distribution by year:', yearDistribution);
        
        return combinedData;
      }
      
      // Fallback to localStorage if no server data
      const localData = localStorage.getItem(this.STORAGE_KEY);
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (parsedData.daily && parsedData.daily.length > 0) {
          console.log('Using localStorage data as fallback');
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Error loading from server:', error);
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
  private async saveData(): Promise<void> {
    if (this.data) {
      try {
        // Save to localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        console.log('Bitcoin data saved to localStorage');
        
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
  private async saveToServer(data?: BitcoinDataStructure): Promise<void> {
    const dataToSave = data || this.data;
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
  getPriceForDate(date: string, interval: 'daily' | 'hourly' | 'minute15' = 'daily'): number | null {
    if (!this.data) return null;

    const targetDate = new Date(date);
    const dataArray = this.data[interval];

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
  getDataRange(interval: 'daily' | 'hourly' | 'minute15' = 'daily'): BitcoinPriceData[] {
    if (!this.data) return [];
    return this.data[interval];
  }

  // Check if data needs update
  needsUpdate(): boolean {
    if (!this.data) return true;
    
    const lastUpdated = new Date(this.data.lastUpdated);
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    
    return diff > this.UPDATE_INTERVAL;
  }

  // Fetch complete Bitcoin history from multiple sources
  async fetchCompleteHistory(): Promise<void> {
    console.log('Starting complete Bitcoin history fetch...');
    
    try {
      // Start with early Bitcoin data (2009-2013)
      const earlyData = await this.fetchEarlyBitcoinData();
      
      // Fetch historical data from CoinGecko (2013-2020)
      const historicalData = await this.fetchHistoricalData();
      
      // Fetch recent data (2020-now)
      const recentData = await this.fetchRecentData();
      
      // Combine all data
      const combinedData = this.combineData(earlyData, historicalData, recentData);
      
      // Generate different time intervals
      this.data = {
        daily: this.generateDailyData(combinedData),
        hourly: this.generateHourlyData(combinedData),
        minute15: this.generate15MinuteData(combinedData),
        lastUpdated: new Date().toISOString(),
        dataRange: {
          start: combinedData[0]?.date || '',
          end: combinedData[combinedData.length - 1]?.date || ''
        }
      };
      
      this.saveData();
      console.log('Complete Bitcoin history fetched and saved:', {
        totalPoints: combinedData.length,
        daily: this.data.daily.length,
        hourly: this.data.hourly.length,
        minute15: this.data.minute15.length
      });
      
    } catch (error) {
      console.error('Error fetching complete Bitcoin history:', error);
    }
  }

  // Fetch early Bitcoin data (2009-2013)
  private async fetchEarlyBitcoinData(): Promise<BitcoinPriceData[]> {
    console.log('Fetching early Bitcoin data (2009-2013)...');
    
    // Early Bitcoin price milestones
    const earlyPrices = [
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
  private async fetchHistoricalData(): Promise<BitcoinPriceData[]> {
    console.log('Fetching historical data from CoinGecko (2013-2020)...');
    
    try {
      // CoinGecko historical data for Bitcoin
      const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=daily');
      
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
  private async fetchRecentData(): Promise<BitcoinPriceData[]> {
    console.log('Fetching recent data (2020-now)...');
    
    try {
      // Multiple API sources for recent data
      const sources = [
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily',
        'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/historical?id=1&timeStart=2020-01-01&timeEnd=2025-01-01'
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
  async updateData(): Promise<void> {
    if (this.needsUpdate()) {
      console.log('Updating Bitcoin data...');
      await this.fetchCompleteHistory();
    }
  }

  // Get current data
  getData(currency: 'EUR' | 'USD' = 'USD'): BitcoinDataStructure | null {
    if (!this.data) return null;
    
    // The data is already loaded with EUR prices from loadCompleteEURHistory
    // So we can return the same data for both currencies
    return this.data;
  }

  // Export data to JSON file
  exportToJSON(): void {
    if (this.data) {
      const dataStr = JSON.stringify(this.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `bitcoin_complete_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Bitcoin data exported to JSON file');
    }
  }

  // Update CSV data for current year
  async updateCurrentYearCSV(): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      const currentDate = new Date();
      const today = currentDate.toISOString().split('T')[0];
      
      // Fetch current Bitcoin price
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      if (response.ok) {
        const data = await response.json();
        const currentPrice = data.bitcoin.usd;
        
        console.log(`Updating ${currentYear} CSV with current price: $${currentPrice}`);
        
        // This would typically update the server-side CSV file
        // For now, we'll update localStorage with the new data
        if (this.data) {
          // Find today's entry and update it
          const todayIndex = this.data.daily.findIndex(entry => entry.date === today);
          if (todayIndex !== -1) {
            this.data.daily[todayIndex].price = currentPrice;
            this.data.lastUpdated = new Date().toISOString();
            await this.saveData();
            console.log(`Updated ${today} price to $${currentPrice}`);
          } else {
            // Add new entry for today
            this.data.daily.push({
              timestamp: currentDate.getTime(),
              date: today,
              price: currentPrice
            });
            this.data.daily.sort((a, b) => a.timestamp - b.timestamp);
            this.data.lastUpdated = new Date().toISOString();
            await this.saveData();
            console.log(`Added new entry for ${today} with price $${currentPrice}`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating current year CSV:', error);
    }
  }

  // Get data info for debugging
  getDataInfo(): { totalDays: number; dateRange: string; lastUpdated: string; needsUpdate: boolean } {
    if (!this.data) {
      return { totalDays: 0, dateRange: 'No data', lastUpdated: 'Never', needsUpdate: true };
    }

    return {
      totalDays: this.data.daily.length,
      dateRange: `${this.data.dataRange.start} to ${this.data.dataRange.end}`,
      lastUpdated: this.data.lastUpdated,
      needsUpdate: this.needsUpdate()
    };
  }

  // Load 2025 data from local bitcoin-price-history-2025.csv
  private async load2025DataFromLocalCSV(): Promise<BitcoinPriceData[]> {
    try {
      console.log('Loading 2025 Bitcoin data from bitcoin-price-history-2025.csv...');
      
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
      
      console.log(`Loaded ${bitcoinData.length} data points for 2025 from local CSV`);
      
      return bitcoinData;
      
    } catch (error) {
      console.error('Error loading 2025 data from local CSV:', error);
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

  // Get fresh 2025 data from local CSV and update
  async update2025DataFromLocalCSV(): Promise<void> {
    try {
      console.log('Updating 2025 data from local CSV...');
      
      const freshData = await this.load2025DataFromLocalCSV();
      
      if (freshData && freshData.length > 0) {
        // Update current data
        if (this.data) {
          // Remove old 2025 data
          const filteredData = this.data.daily.filter(point => {
            const year = new Date(point.date).getFullYear();
            return year !== 2025;
          });
          
          // Add fresh 2025 data
          const updatedData = [...filteredData, ...freshData].sort((a, b) => a.timestamp - b.timestamp);
          
          this.data.daily = updatedData;
          this.data.lastUpdated = new Date().toISOString();
          this.data.dataRange.end = updatedData[updatedData.length - 1].date;
          
          // Save updated data
          await this.saveData();
          
          console.log(`Updated 2025 data with ${freshData.length} fresh data points from local CSV`);
        }
      }
      
    } catch (error) {
      console.error('Error updating 2025 data from local CSV:', error);
    }
  }

  // Force reload all data from CSV files
  async forceReloadAllData(): Promise<void> {
    console.log('Force reloading all Bitcoin data from CSV files...');
    
    // Clear current data
    this.data = null;
    localStorage.removeItem(this.STORAGE_KEY);
    
    // Reload from server
    await this.loadData();
    
    console.log('Force reload completed');
  }

  // Get server data info
  async getServerDataInfo(): Promise<{
    hasServerData: boolean;
    hasLocalData: boolean;
    serverDataSize: number;
    localDataSize: number;
    lastUpdated: string | null;
  }> {
    const serverData = localStorage.getItem('bitcoin_server_data');
    const localData = localStorage.getItem(this.STORAGE_KEY);
    
    return {
      hasServerData: !!serverData,
      hasLocalData: !!localData,
      serverDataSize: serverData ? serverData.length : 0,
      localDataSize: localData ? localData.length : 0,
      lastUpdated: this.data?.lastUpdated || null
    };
  }

  // Toggle between server and localStorage
  setUseServerStorage(useServer: boolean): void {
    this.useServerStorage = useServer;
    console.log(`Switched to ${useServer ? 'server' : 'localStorage'} storage`);
  }

  // Public method to get all Bitcoin data
  async getAllBitcoinData(): Promise<BitcoinPriceData[]> {
    if (!this.data) {
      await this.loadData();
    }
    
    if (!this.data) {
      console.warn('No Bitcoin data available');
      return [];
    }
    
    // Return daily data as the main dataset
    return this.data.daily;
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
  async triggerDailyUpdate(currency: string = 'eur'): Promise<void> {
    console.log(`Manually triggering daily update in ${currency.toUpperCase()}...`);
    await this.updateTodaysPrice(currency);
  }

  // Public method to get current Bitcoin price
  async getCurrentBitcoinPrice(currency: string = 'eur'): Promise<number | null> {
    return await this.fetchCurrentBitcoinPrice(currency);
  }
}

// Export singleton instance
export const bitcoinDataManager = new BitcoinDataManager();
export default bitcoinDataManager;
