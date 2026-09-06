/**
 * Bitcoin Price Tracker Service
 * Automatically fetches and stores Bitcoin prices from CoinGecko
 * Updates daily prices for historical data
 * Tracks hourly prices for live charts
 */

import { supabase } from '../lib/supabase';

interface PriceData {
  price_usd: number;
  price_eur: number;
  volume_24h: number;
  market_cap: number;
  price_change_24h: number;
}

class BitcoinPriceTracker {
  private readonly coinGeckoUrl = 'https://api.coingecko.com/api/v3';
  private updateIntervalId: NodeJS.Timeout | null = null;
  private dailyUpdateIntervalId: NodeJS.Timeout | null = null;

  /**
   * Fetch current Bitcoin price from CoinGecko
   */
  async fetchCurrentPrice(): Promise<PriceData | null> {
    try {
      const response = await fetch(
        `${this.coinGeckoUrl}/simple/price?ids=bitcoin&vs_currencies=usd,eur&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );
      const data = await response.json();
      
      if (!data.bitcoin) {
        console.error('❌ No Bitcoin data from CoinGecko');
        return null;
      }

      return {
        price_usd: data.bitcoin.usd,
        price_eur: data.bitcoin.eur,
        volume_24h: data.bitcoin.usd_24h_vol,
        market_cap: data.bitcoin.usd_market_cap,
        price_change_24h: data.bitcoin.usd_24h_change
      };
    } catch (error) {
      console.error('❌ Error fetching current price:', error);
      return null;
    }
  }

  /**
   * Fetch historical daily price for a specific date
   */
  async fetchHistoricalPrice(date: string): Promise<PriceData | null> {
    try {
      const response = await fetch(
        `${this.coinGeckoUrl}/coins/bitcoin/history?date=${date}&localization=false`
      );
      const data = await response.json();

      if (!data.market_data) {
        console.warn(`⚠️  No historical data for ${date}`);
        return null;
      }

      return {
        price_usd: data.market_data.current_price.usd,
        price_eur: data.market_data.current_price.eur || 0,
        volume_24h: data.market_data.total_volume.usd || 0,
        market_cap: data.market_data.market_cap.usd || 0,
        price_change_24h: 0 // Not available in history endpoint
      };
    } catch (error) {
      console.error(`❌ Error fetching historical price for ${date}:`, error);
      return null;
    }
  }

  /**
   * Save hourly price to database (for live charts)
   */
  async saveHourlyPrice(priceData: PriceData): Promise<boolean> {
    try {
      // Writes go through an Edge Function (service role) — the browser only has
      // read access to bitcoin_price_history via RLS.
      const { error } = await supabase.functions.invoke('save-bitcoin-price', {
        body: { type: 'hourly', priceData }
      });

      if (error) {
        console.error('❌ Error saving hourly price:', error);
        return false;
      }

      console.log(`✅ Hourly price saved: $${priceData.price_usd}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving hourly price:', error);
      return false;
    }
  }

  /**
   * Update or create daily price record
   */
  async saveDailyPrice(date: string, priceData: PriceData): Promise<boolean> {
    try {
      // Writes go through an Edge Function (service role) — the browser only has
      // read access to bitcoin_price_data via RLS.
      const { error } = await supabase.functions.invoke('save-bitcoin-price', {
        body: { type: 'daily', date, priceData }
      });

      if (error) {
        console.error(`❌ Error saving daily price for ${date}:`, error);
        return false;
      }

      console.log(`✅ Daily price saved for ${date}: $${priceData.price_usd}`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving daily price for ${date}:`, error);
      return false;
    }
  }

  /**
   * Get price for a specific date from database
   */
  async getPriceForDate(date: string): Promise<PriceData | null> {
    try {
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('price_usd, price_eur, volume_usd, market_cap_usd, price_change_24h')
        .eq('date', date)
        .single();

      if (error || !data) {
        console.warn(`⚠️  No price in database for ${date}`);
        return null;
      }

      return {
        price_usd: data.price_usd,
        price_eur: data.price_eur,
        volume_24h: data.volume_usd,
        market_cap: data.market_cap_usd,
        price_change_24h: data.price_change_24h
      };
    } catch (error) {
      console.error(`❌ Error getting price for ${date}:`, error);
      return null;
    }
  }

  /**
   * Start automatic hourly price tracking (for live charts)
   */
  startHourlyTracking(): void {
    if (this.updateIntervalId) {
      console.warn('⚠️  Hourly tracking already running');
      return;
    }

    // Save price immediately
    this.trackHourlyPrice();

    // Then every hour
    this.updateIntervalId = setInterval(
      () => this.trackHourlyPrice(),
      60 * 60 * 1000 // 1 hour
    );

    console.log('✅ Hourly price tracking started');
  }

  /**
   * Stop automatic hourly price tracking
   */
  stopHourlyTracking(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
      console.log('⏸️  Hourly price tracking stopped');
    }
  }

  /**
   * Start automatic daily price updates
   */
  startDailyUpdates(): void {
    if (this.dailyUpdateIntervalId) {
      console.warn('⚠️  Daily updates already running');
      return;
    }

    // Run at 2 AM UTC every day
    this.scheduleDailyUpdate();
    this.dailyUpdateIntervalId = setInterval(
      () => this.scheduleDailyUpdate(),
      24 * 60 * 60 * 1000 // 24 hours
    );

    console.log('✅ Daily price updates started');
  }

  /**
   * Stop automatic daily updates
   */
  stopDailyUpdates(): void {
    if (this.dailyUpdateIntervalId) {
      clearInterval(this.dailyUpdateIntervalId);
      this.dailyUpdateIntervalId = null;
      console.log('⏸️  Daily price updates stopped');
    }
  }

  /**
   * Private method: Track hourly price
   */
  private async trackHourlyPrice(): Promise<void> {
    try {
      const priceData = await this.fetchCurrentPrice();
      if (priceData) {
        await this.saveHourlyPrice(priceData);
      }
    } catch (error) {
      console.error('❌ Error in hourly tracking:', error);
    }
  }

  /**
   * Private method: Schedule daily updates
   */
  private async scheduleDailyUpdate(): Promise<void> {
    try {
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      // Check if we already have this date
      const existing = await this.getPriceForDate(dateStr);
      if (existing) {
        console.log(`✅ Price already exists for ${dateStr}`);
        return;
      }

      // Fetch and save
      const priceData = await this.fetchHistoricalPrice(dateStr);
      if (priceData) {
        await this.saveDailyPrice(dateStr, priceData);
      }
    } catch (error) {
      console.error('❌ Error in daily update:', error);
    }
  }

  /**
   * Update missing daily prices (fill gaps in history)
   */
  async fillMissingPrices(startDate: string, endDate: string): Promise<void> {
    try {
      console.log(`📊 Filling missing prices from ${startDate} to ${endDate}`);

      const start = new Date(startDate);
      const end = new Date(endDate);
      let current = new Date(start);

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];

        // Check if price exists
        const existing = await this.getPriceForDate(dateStr);
        if (!existing) {
          console.log(`Fetching price for ${dateStr}...`);
          const priceData = await this.fetchHistoricalPrice(dateStr);
          if (priceData) {
            await this.saveDailyPrice(dateStr, priceData);
          }
          // Rate limiting - wait a bit between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        current.setDate(current.getDate() + 1);
      }

      console.log('✅ Missing prices filled');
    } catch (error) {
      console.error('❌ Error filling missing prices:', error);
    }
  }

  /**
   * Get latest prices for use in application
   */
  async getLatestPrices(): Promise<PriceData | null> {
    return this.fetchCurrentPrice();
  }
}

// Export singleton instance
export const bitcoinPriceTracker = new BitcoinPriceTracker();

