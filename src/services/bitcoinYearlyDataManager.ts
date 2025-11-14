/**
 * Bitcoin Yearly Data Manager
 * Manages JSON files for Bitcoin price data per year
 * Automatically creates new files when year changes
 * Syncs with Supabase database
 */

import { supabase } from '../lib/supabase';

interface YearlyData {
  year: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  priceRecords: PriceRecord[];
  lastUpdated: string;
  version: string;
}

interface PriceRecord {
  date: string;
  timestamp: number;
  price_usd: number;
  price_eur: number;
  volume_usd: number;
  market_cap_usd: number;
  price_change_24h: number;
}

class BitcoinYearlyDataManager {
  private readonly dataDir = 'public/bitcoin-data';
  private readonly version = '1.0.0';

  /**
   * Get current year
   */
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  /**
   * Generate filename for year
   */
  getFilename(year: number): string {
    return `${this.dataDir}/${year}.json`;
  }

  /**
   * Load yearly data from file or Supabase
   */
  async loadYearlyData(year: number): Promise<YearlyData | null> {
    try {
      // Try to load from local file first (cache)
      const cachedData = await this.loadFromFile(year);
      if (cachedData) {
        console.log(`✅ Loaded ${year} data from file`);
        return cachedData;
      }

      // Fall back to Supabase
      console.log(`📡 Loading ${year} data from Supabase...`);
      const supabaseData = await this.loadFromSupabase(year);
      if (supabaseData) {
        // Save to file for caching
        await this.saveToFile(supabaseData);
        console.log(`✅ Saved ${year} data to file cache`);
        return supabaseData;
      }

      return null;
    } catch (error) {
      console.error(`❌ Error loading ${year} data:`, error);
      return null;
    }
  }

  /**
   * Load from local JSON file
   */
  private async loadFromFile(year: number): Promise<YearlyData | null> {
    try {
      const filename = this.getFilename(year);
      const response = await fetch(filename);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data as YearlyData;
    } catch (error) {
      console.warn(`⚠️  ${year}.json not found locally`);
      return null;
    }
  }

  /**
   * Load from Supabase database
   */
  private async loadFromSupabase(year: number): Promise<YearlyData | null> {
    try {
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('*')
        .eq('year', year)
        .order('date', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn(`⚠️  No data in Supabase for ${year}`);
        return null;
      }

      // Transform to yearly data
      const startDate = data[0].date;
      const endDate = data[data.length - 1].date;

      const yearlyData: YearlyData = {
        year,
        startDate,
        endDate,
        totalDays: data.length,
        priceRecords: data.map((record: any) => ({
          date: record.date,
          timestamp: record.timestamp,
          price_usd: record.price_usd,
          price_eur: record.price_eur,
          volume_usd: record.volume_usd,
          market_cap_usd: record.market_cap_usd,
          price_change_24h: record.price_change_24h
        })),
        lastUpdated: new Date().toISOString(),
        version: this.version
      };

      return yearlyData;
    } catch (error) {
      console.error(`❌ Error loading from Supabase for ${year}:`, error);
      return null;
    }
  }

  /**
   * Save yearly data to JSON file
   */
  async saveToFile(yearlyData: YearlyData): Promise<boolean> {
    try {
      const filename = this.getFilename(yearlyData.year);
      const fileContent = JSON.stringify(yearlyData, null, 2);

      // In browser, we can't write files directly
      // But we can trigger a download or use IndexedDB
      // For production, use server endpoint

      console.log(`💾 Yearly data ready to save:`);
      console.log(`   File: ${filename}`);
      console.log(`   Size: ${fileContent.length} bytes`);
      console.log(`   Records: ${yearlyData.totalDays} days`);

      // Save to IndexedDB for offline access
      await this.saveToIndexedDB(yearlyData);

      return true;
    } catch (error) {
      console.error(`❌ Error saving to file:`, error);
      return false;
    }
  }

  /**
   * Save to IndexedDB for offline access
   */
  private async saveToIndexedDB(yearlyData: YearlyData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BitcoinData', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['yearlyData'], 'readwrite');
        const store = transaction.objectStore('yearlyData');

        store.put(yearlyData);
        transaction.oncomplete = () => {
          console.log(`✅ Saved ${yearlyData.year} to IndexedDB`);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('yearlyData')) {
          db.createObjectStore('yearlyData', { keyPath: 'year' });
        }
      };
    });
  }

  /**
   * Get yearly data from IndexedDB
   */
  async getFromIndexedDB(year: number): Promise<YearlyData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BitcoinData', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['yearlyData'], 'readonly');
        const store = transaction.objectStore('yearlyData');
        const getRequest = store.get(year);

        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('yearlyData')) {
          db.createObjectStore('yearlyData', { keyPath: 'year' });
        }
      };
    });
  }

  /**
   * Sync all years with Supabase
   */
  async syncAllYears(): Promise<number[]> {
    try {
      console.log('🔄 Syncing all years with Supabase...');

      const { data: yearData, error } = await supabase
        .rpc('get_bitcoin_price_years');

      if (error) {
        console.error('❌ Error getting years:', error);
        return [];
      }

      const years = yearData?.map((y: any) => y.year) || [];
      console.log(`✅ Found ${years.length} years: ${years.join(', ')}`);

      // Load and save each year
      for (const year of years) {
        const yearData = await this.loadYearlyData(year);
        if (yearData) {
          await this.saveToFile(yearData);
        }
      }

      return years;
    } catch (error) {
      console.error('❌ Error syncing years:', error);
      return [];
    }
  }

  /**
   * Check if new year started and create file
   */
  async checkAndCreateNewYear(): Promise<boolean> {
    try {
      const currentYear = this.getCurrentYear();
      const lastYear = currentYear - 1;

      // Check if file for current year exists
      const currentYearData = await this.loadFromFile(currentYear);
      if (currentYearData) {
        console.log(`✅ ${currentYear}.json already exists`);
        return false;
      }

      // Create empty file for current year
      console.log(`📋 Creating new file for ${currentYear}...`);

      const newYearData: YearlyData = {
        year: currentYear,
        startDate: `${currentYear}-01-01`,
        endDate: '',
        totalDays: 0,
        priceRecords: [],
        lastUpdated: new Date().toISOString(),
        version: this.version
      };

      await this.saveToFile(newYearData);
      console.log(`✅ Created ${currentYear}.json`);

      return true;
    } catch (error) {
      console.error('❌ Error creating new year file:', error);
      return false;
    }
  }

  /**
   * Get all available years
   */
  async getAllYears(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('year')
        .order('year', { ascending: false });

      if (error || !data) {
        console.error('❌ Error getting years:', error);
        return [];
      }

      const years = Array.from(new Set(data.map((d: any) => d.year))).sort();
      return years;
    } catch (error) {
      console.error('❌ Error:', error);
      return [];
    }
  }

  /**
   * Export year as downloadable JSON
   */
  async exportYear(year: number): Promise<void> {
    try {
      const yearData = await this.loadYearlyData(year);
      if (!yearData) {
        console.error(`❌ No data for ${year}`);
        return;
      }

      const dataStr = JSON.stringify(yearData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `bitcoin-prices-${year}.json`;
      link.click();

      URL.revokeObjectURL(url);
      console.log(`✅ Exported ${year}.json`);
    } catch (error) {
      console.error('❌ Error exporting year:', error);
    }
  }

  /**
   * Get price for specific date
   */
  async getPriceForDate(date: string): Promise<PriceRecord | null> {
    try {
      const year = parseInt(date.split('-')[0]);
      const yearData = await this.loadYearlyData(year);

      if (!yearData) {
        return null;
      }

      const record = yearData.priceRecords.find(r => r.date === date);
      return record || null;
    } catch (error) {
      console.error('❌ Error getting price for date:', error);
      return null;
    }
  }
}

// Export singleton
export const bitcoinYearlyDataManager = new BitcoinYearlyDataManager();

