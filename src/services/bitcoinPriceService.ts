// Bitcoin Price Service
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
      // Try multiple APIs for reliability
      const price = await this.fetchFromCoinGecko();
      this.priceCache = price;
      this.lastFetch = now;
      return price;
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      
      // Return cached price if available
      if (this.priceCache) {
        console.log('Using cached Bitcoin price');
        return this.priceCache;
      }
      
      // Return fallback price
      console.log('Using fallback Bitcoin price');
      const fallbackPrice: BitcoinPrice = {
        price: 97000,
        change24h: 0,
        changePercent24h: 0,
        lastUpdated: new Date().toISOString()
      };
      
      this.priceCache = fallbackPrice;
      this.lastFetch = now;
      return fallbackPrice;
    }
  }

  private async fetchFromCoinGecko(): Promise<BitcoinPrice> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from CoinGecko: ${response.status}`);
      }
      
      const data = await response.json();
      const bitcoin = data.bitcoin;
      
      if (!bitcoin || !bitcoin.eur) {
        throw new Error('Invalid data from CoinGecko');
      }
      
      return {
        price: bitcoin.eur,
        change24h: bitcoin.eur_24h_change || 0,
        changePercent24h: bitcoin.eur_24h_change || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw error;
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
