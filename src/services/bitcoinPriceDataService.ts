// Bitcoin Price Data Service - Uses Supabase as backend
// No console logs in production - all data comes from Supabase

import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

export interface BitcoinPriceDataPoint {
  date: string;
  timestamp: number;
  price: number;
  volume?: number;
  market_cap?: number;
}

export interface BitcoinPriceSummary {
  total_data_points: number;
  date_range: {
    start: string;
    end: string;
  };
  available_years: number[];
}

export class BitcoinPriceDataService {
  private static instance: BitcoinPriceDataService;
  private dataCache: Map<number, BitcoinPriceDataPoint[]> = new Map();
  private summaryCache: BitcoinPriceSummary | null = null;
  private lastSummaryFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): BitcoinPriceDataService {
    if (!BitcoinPriceDataService.instance) {
      BitcoinPriceDataService.instance = new BitcoinPriceDataService();
    }
    return BitcoinPriceDataService.instance;
  }

  /**
   * Get summary of available Bitcoin price data
   */
  async getSummary(): Promise<BitcoinPriceSummary | null> {
    const now = Date.now();
    
    // Return cached summary if still valid
    if (this.summaryCache && (now - this.lastSummaryFetch) < this.CACHE_DURATION) {
      return this.summaryCache;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_bitcoin_price_summary');

      if (error) {
        logger.error('Error fetching Bitcoin price summary:', error);
        return null;
      }

      this.summaryCache = data as BitcoinPriceSummary;
      this.lastSummaryFetch = now;
      return this.summaryCache;
    } catch (error) {
      logger.error('Error in getSummary:', error);
      return null;
    }
  }

  /**
   * Get Bitcoin price data for a specific year
   */
  async getDataByYear(year: number, currency: 'EUR' | 'USD' = 'USD'): Promise<BitcoinPriceDataPoint[]> {
    // Check cache first (use currency in cache key)
    const cacheKey = `${year}_${currency}`;
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey)!;
    }

    try {
      // Query directly from bitcoin_price_data table with currency filter
      const priceColumn = currency === 'EUR' ? 'price_eur' : 'price_usd';
      
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('date, timestamp, price_eur, price_usd, volume, market_cap')
        .eq('year', year)
        .not(priceColumn, 'is', null)
        .order('date', { ascending: true });

      if (error) {
        logger.error(`Error fetching Bitcoin price data for year ${year} (${currency}):`, error);
        return [];
      }

      // Transform data to match our interface
      const priceData: BitcoinPriceDataPoint[] = (data || []).map((item: any) => ({
        date: item.date,
        timestamp: item.timestamp,
        price: parseFloat(item[priceColumn]),
        volume: item.volume ? parseFloat(item.volume) : undefined,
        market_cap: item.market_cap ? parseFloat(item.market_cap) : undefined
      }));

      // Cache the data
      this.dataCache.set(cacheKey, priceData);
      return priceData;
    } catch (error) {
      logger.error(`Error in getDataByYear for year ${year} (${currency}):`, error);
      return [];
    }
  }

  /**
   * Get latest Bitcoin price from database
   */
  async getLatestPrice(): Promise<BitcoinPriceDataPoint | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_latest_bitcoin_price');

      if (error) {
        logger.error('Error fetching latest Bitcoin price:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        date: data.date,
        timestamp: data.timestamp,
        price: parseFloat(data.price),
        volume: data.volume ? parseFloat(data.volume) : undefined,
        market_cap: data.market_cap ? parseFloat(data.market_cap) : undefined
      };
    } catch (error) {
      logger.error('Error in getLatestPrice:', error);
      return null;
    }
  }

  /**
   * Get Bitcoin price data for multiple years
   */
  async getDataForYears(years: number[], currency: 'EUR' | 'USD' = 'USD'): Promise<BitcoinPriceDataPoint[]> {
    const allData: BitcoinPriceDataPoint[] = [];
    
    // Fetch data for all years in parallel
    const promises = years.map(year => this.getDataByYear(year, currency));
    const results = await Promise.all(promises);
    
    // Combine all data
    results.forEach(data => {
      allData.push(...data);
    });
    
    // Sort by date
    allData.sort((a, b) => a.timestamp - b.timestamp);
    
    return allData;
  }

  /**
   * Clear cache (useful after updates)
   */
  clearCache(): void {
    this.dataCache.clear();
    this.summaryCache = null;
    this.lastSummaryFetch = 0;
  }
}

export const bitcoinPriceDataService = BitcoinPriceDataService.getInstance();

