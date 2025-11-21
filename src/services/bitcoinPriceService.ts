// Bitcoin Price Service
import { supabase } from '../lib/supabase';

export interface BitcoinPrice {
  price: number;
  change24h: number;
  changePercent24h: number;
  lastUpdated: string;
}

export class BitcoinPriceService {
  private static instance: BitcoinPriceService;
  private priceCache: BitcoinPrice | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  static getInstance(): BitcoinPriceService {
    if (!BitcoinPriceService.instance) {
      BitcoinPriceService.instance = new BitcoinPriceService();
    }
    return BitcoinPriceService.instance;
  }

  async getCurrentPrice(): Promise<BitcoinPrice> {
    const now = Date.now();
    
    // Return cached price if still valid
    if (this.priceCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.priceCache;
    }

    try {
      // Get today's price from Supabase
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('price_eur, price_usd')
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching from Supabase:', error);
        throw error;
      }

      if (data) {
        const price: BitcoinPrice = {
          price: data.price_eur,
          change24h: 0, // Could calculate from yesterday's price if needed
          changePercent24h: 0,
          lastUpdated: new Date().toISOString()
        };
        
        this.priceCache = price;
        this.lastFetch = now;
        return price;
      }

      // If no data for today, try to get the latest price
      const { data: latestData, error: latestError } = await supabase
        .from('bitcoin_price_data')
        .select('price_eur, date')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) {
        throw latestError;
      }

      if (latestData) {
        console.log(`ℹ️ Using latest price from ${latestData.date}`);
        const price: BitcoinPrice = {
          price: latestData.price_eur,
          change24h: 0,
          changePercent24h: 0,
          lastUpdated: new Date().toISOString()
        };
        
        this.priceCache = price;
        this.lastFetch = now;
        return price;
      }

      throw new Error('No price data available in Supabase');
    } catch (error) {
      console.error('❌ Error fetching Bitcoin price:', error);
      
      // Return cached price if available
      if (this.priceCache) {
        console.log('ℹ️ Returning cached price as fallback');
        return this.priceCache;
      }
      
      // Return empty state instead of mock price - let component handle error
      throw new Error('Unable to fetch Bitcoin price from any source');
      // Note: Component using this service should handle the error gracefully
    }
  }

  // Calculate how much Bitcoin can be bought with a given amount
  calculateBitcoinAmount(euroAmount: number, price: number): number {
    return euroAmount / price;
  }

  // Calculate how much a Bitcoin amount is worth in euros
  calculateEuroValue(bitcoinAmount: number, price: number): number {
    return bitcoinAmount * price;
  }

  // Calculate monthly investment needed to reach Bitcoin goal
  calculateMonthlyInvestment(
    targetBitcoin: number,
    currentBitcoin: number,
    monthsToGoal: number,
    price: number
  ): number {
    const remainingBitcoin = targetBitcoin - currentBitcoin;
    const monthlyBitcoin = remainingBitcoin / monthsToGoal;
    return monthlyBitcoin * price;
  }

  // Calculate months needed to reach goal with monthly investment
  calculateMonthsToGoal(
    targetBitcoin: number,
    currentBitcoin: number,
    monthlyEuroInvestment: number,
    price: number
  ): number {
    const remainingBitcoin = targetBitcoin - currentBitcoin;
    const monthlyBitcoin = monthlyEuroInvestment / price;
    return Math.ceil(remainingBitcoin / monthlyBitcoin);
  }
}

export const bitcoinPriceService = BitcoinPriceService.getInstance();
