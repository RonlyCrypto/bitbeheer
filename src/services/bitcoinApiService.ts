// Bitcoin API service voor echte wallet data
export interface BitcoinTransaction {
  hash: string;
  time: number;
  value: number; // in satoshis
  price: number; // USD price at time of transaction
  currentValue: number; // Current USD value
  profit: number; // Profit/loss in USD
  profitPercent: number; // Profit/loss percentage
  valueInBTC?: number; // Value in BTC for reference
}

export interface BitcoinWallet {
  address: string;
  balance: number; // in BTC
  totalReceived: number; // in BTC
  totalSent: number; // in BTC
  transactionCount: number;
  firstSeen: number;
  lastSeen: number;
  transactions: BitcoinTransaction[];
}

export interface BitcoinPriceData {
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
}

class BitcoinApiService {
  private baseUrl = 'https://blockstream.info/api';
  private priceUrl = 'https://api.coingecko.com/api/v3';

  // Haal wallet data op van Blockstream API
  async getWalletData(address: string): Promise<BitcoinWallet> {
    try {
      // Haal wallet info op
      const walletResponse = await fetch(`${this.baseUrl}/address/${address}`);
      const walletData = await walletResponse.json();

      // Haal transacties op
      const transactionsResponse = await fetch(`${this.baseUrl}/address/${address}/txs`);
      const transactions = await transactionsResponse.json();

      // Verwerk transacties
      const processedTransactions: BitcoinTransaction[] = [];
      
      // Get current price once
      const currentPrice = await this.getCurrentPrice();
      
      for (const tx of transactions.slice(0, 10)) { // Laatste 10 transacties
        try {
          const txResponse = await fetch(`${this.baseUrl}/tx/${tx.txid}`);
          const txData = await txResponse.json();
          
          // Controleer of dit adres Bitcoin ONTVANGT in deze transactie (vout)
          const relevantOutputs = txData.vout.filter((vout: any) => 
            vout.scriptpubkey_address === address
          );

          // Alleen receive transacties registreren (waar je BTC ontvangt)
          if (relevantOutputs.length > 0) {
            // Bereken totaal ontvangen in deze transactie
            const totalReceived = relevantOutputs.reduce((sum: number, vout: any) => sum + vout.value, 0);
            const valueInBTC = totalReceived / 100000000;
            
            // Gebruik block_time uit status (dit is de correcte timestamp)
            const blockTime = txData.status?.block_time;
            if (!blockTime) {
              console.warn(`No block time for transaction ${tx.txid}`);
              continue;
            }
            
            // Haal de BTC prijs op voor de exacte datum van de transactie
            let priceAtTime = 50000; // Fallback
            
            try {
              const txDate = new Date(blockTime * 1000);
              const dateStr = txDate.toISOString().split('T')[0]; // YYYY-MM-DD formaat
              
              // Probeer eerst CoinGecko (sneller en betrouwbaarder)
              const priceResponse = await fetch(
                `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}&localization=false`
              );
              const priceData = await priceResponse.json();
              
              if (priceData.market_data?.current_price?.usd) {
                priceAtTime = priceData.market_data.current_price.usd;
                console.log(`✓ BTC Price op ${dateStr}: $${priceAtTime}`);
              } else {
                console.warn(`⚠ Geen prijs gevonden voor ${dateStr}, gebruik fallback: $${priceAtTime}`);
              }
            } catch (e) {
              console.error('Error fetching historical price:', e);
              // Fallback blijft $50000
            }
            
            const currentValueUSD = valueInBTC * currentPrice;
            const priceAtTimeUSD = valueInBTC * priceAtTime;
            const profitUSD = currentValueUSD - priceAtTimeUSD;
            const profitPercent = priceAtTime > 0 ? ((currentPrice - priceAtTime) / priceAtTime) * 100 : 0;
            
            processedTransactions.push({
              hash: tx.txid,
              time: blockTime,
              value: totalReceived,
              price: priceAtTime,
              currentValue: currentValueUSD,
              profit: profitUSD,
              profitPercent: profitPercent,
              valueInBTC: valueInBTC
            });
          }
        } catch (error) {
          console.error(`Error processing transaction ${tx.txid}:`, error);
          // Continue to next transaction on error
        }
      }

      return {
        address,
        balance: walletData.chain_stats.funded_txo_sum / 100000000 - walletData.chain_stats.spent_txo_sum / 100000000,
        totalReceived: walletData.chain_stats.funded_txo_sum / 100000000,
        totalSent: walletData.chain_stats.spent_txo_sum / 100000000,
        transactionCount: walletData.chain_stats.tx_count,
        firstSeen: walletData.chain_stats.funded_txo_count > 0 ? Date.now() : 0,
        lastSeen: Date.now(),
        transactions: processedTransactions
      };
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      throw new Error('Kon wallet data niet ophalen');
    }
  }

  // Haal historische Bitcoin prijs op in USD
  private async getHistoricalPrice(timestamp: number): Promise<number> {
    try {
      const date = new Date(timestamp * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Try to get price from Supabase first
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('price_usd, price_eur')
        .eq('date', dateStr)
        .single();
      
      if (!error && data) {
        // Use USD price if available, otherwise EUR
        return data.price_usd || data.price_eur || 50000;
      }
      
      // If not found, try to find closest date
      const { data: closestData } = await supabase
        .from('bitcoin_price_data')
        .select('price_usd, price_eur, date')
        .lte('date', dateStr)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      if (closestData) {
        return closestData.price_usd || closestData.price_eur || 50000;
      }
      
      // Fallback naar CoinGecko
      const coinGeckoResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}`
      );
      const coinGeckoData = await coinGeckoResponse.json();
      return coinGeckoData.market_data?.current_price?.usd || 50000;
    } catch (error) {
      console.error('Error fetching historical price:', error);
      return 50000; // Fallback prijs
    }
  }

  // Haal huidige Bitcoin prijs op in USD
  async getCurrentPrice(): Promise<number> {
    try {
      const response = await fetch(`${this.priceUrl}/simple/price?ids=bitcoin&vs_currencies=usd`);
      const data = await response.json();
      return data.bitcoin.usd;
    } catch (error) {
      console.error('Error fetching current price:', error);
      return 96640; // Fallback prijs
    }
  }

  // Haal live prijs data op voor chart
  async getPriceData(): Promise<BitcoinPriceData> {
    try {
      const response = await fetch(`${this.priceUrl}/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`);
      const data = await response.json();
      
      return {
        price: data.bitcoin.eur,
        change24h: data.bitcoin.eur_24h_change,
        changePercent24h: data.bitcoin.eur_24h_change,
        marketCap: data.bitcoin.eur_market_cap,
        volume24h: data.bitcoin.eur_24h_vol
      };
    } catch (error) {
      console.error('Error fetching price data:', error);
      return {
        price: 96640,
        change24h: 0,
        changePercent24h: 0,
        marketCap: 0,
        volume24h: 0
      };
    }
  }

  // Valideer Bitcoin adres
  validateBitcoinAddress(address: string): boolean {
    // Basis Bitcoin adres validatie
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return bitcoinRegex.test(address);
  }
}

export const bitcoinApiService = new BitcoinApiService();
