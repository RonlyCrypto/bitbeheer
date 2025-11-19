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

  // Haal wallet data op van Blockstream API (met lazy loading)
  async getWalletData(address: string, limit: number = 25): Promise<BitcoinWallet> {
    try {
      // Haal wallet info op
      const walletResponse = await fetch(`${this.baseUrl}/address/${address}`);
      const walletData = await walletResponse.json();

      // Haal transacties op van Blockstream (max 25 per page)
      console.log(`🔄 Fetching transactions (limit: ${limit}) for ${address}...`);
      
      const url = `${this.baseUrl}/address/${address}/txs`;
      const response = await fetch(url);
      const transactions = await response.json();
      
      if (!Array.isArray(transactions)) {
        console.warn(`⚠️ Unexpected response format for ${address}`);
        return {
          address,
          balance: 0,
          totalReceived: 0,
          totalSent: 0,
          transactionCount: 0,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          transactions: []
        };
      }
      
      console.log(`📄 Fetched ${transactions.length} transaction hashes from blockchain (will process first ${limit})`);

      // Verwerk transacties
      const processedTransactions: BitcoinTransaction[] = [];
      let skippedCount = 0;
      let priceErrorCount = 0;
      
      // Get current price once
      const currentPrice = await this.getCurrentPrice();
      
      console.log(`🔍 Processing first ${Math.min(limit, transactions.length)} transactions from blockchain...`);
      
      for (let i = 0; i < Math.min(limit, transactions.length); i++) {
        const tx = transactions[i]; // Verwerk alleen eerste 'limit' transacties
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
              console.warn(`⏭️ Skipping ${tx.txid} - no block time`);
              skippedCount++;
              continue;
            }
            
            // Haal de BTC prijs op voor de exacte datum van de transactie
            let priceAtTime: number | null = null;
            
            try {
              const txDate = new Date(blockTime * 1000);
              const dateStr = txDate.toISOString().split('T')[0]; // YYYY-MM-DD formaat
              
              // Probeer eerst onze eigen database (Supabase)
              try {
                const { supabase } = await import('../lib/supabase');
                const { data: priceData } = await supabase
                  .from('bitcoin_price_data')
                  .select('price_usd')
                  .eq('date', dateStr)
                  .single();
                
                if (priceData?.price_usd) {
                  priceAtTime = priceData.price_usd;
                  console.log(`✓ BTC Price op ${dateStr} (Supabase): $${priceAtTime}`);
                }
              } catch (supabaseError) {
                console.warn(`⚠️ Supabase price fetch failed for ${dateStr}:`, supabaseError);
              }
              
              // Fallback naar CoinGecko als niet in Supabase
              if (!priceAtTime) {
                try {
                  const priceResponse = await fetch(
                    `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}&localization=false`
                  );
                  const cgData = await priceResponse.json();
                  
                  if (cgData.market_data?.current_price?.usd) {
                    priceAtTime = cgData.market_data.current_price.usd;
                    console.log(`✓ BTC Price op ${dateStr} (CoinGecko): $${priceAtTime}`);
                  } else {
                    console.warn(`⚠️ CoinGecko no data for ${dateStr}`);
                  }
                } catch (cgError) {
                  console.error(`✗ CoinGecko fetch error for ${dateStr}:`, cgError);
                }
              }
            } catch (e) {
              console.error('Error fetching historical price:', e);
            }
            
            // Skip transaction if price couldn't be determined
            if (!priceAtTime) {
              console.warn(`⏭️ Skipping ${tx.txid} - price not available for ${new Date(blockTime * 1000).toISOString()}`);
              priceErrorCount++;
              continue;
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
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(`Error processing transaction ${tx.txid}:`, error);
          skippedCount++;
        }
      }

      console.log(`📊 Transaction Summary:`);
      console.log(`   Total from blockchain: ${transactions.length}`);
      console.log(`   Successfully processed: ${processedTransactions.length}`);
      console.log(`   Skipped (no receive output): ${skippedCount}`);
      console.log(`   Skipped (price error): ${priceErrorCount}`);

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

  // Haal volgende batch transacties op (lazy loading)
  async getTransactionsPage(address: string, page: number = 1, pageSize: number = 25): Promise<BitcoinTransaction[]> {
    try {
      const offset = (page - 1) * pageSize;
      
      console.log(`🔄 Loading transactions page ${page} (offset: ${offset}, limit: ${pageSize})...`);
      
      // Haal alle tx hashes op in één keer
      const url = `${this.baseUrl}/address/${address}/txs`;
      const allTxResponse = await fetch(url);
      const allTxs = await allTxResponse.json();
      
      if (!Array.isArray(allTxs)) {
        console.warn(`⚠️ No transactions for ${address}`);
        return [];
      }
      
      // Haal transactions voor deze pagina op
      const pageTxs = allTxs.slice(offset, offset + pageSize);
      
      if (pageTxs.length === 0) {
        console.log(`✓ No more transactions to load`);
        return [];
      }
      
      console.log(`📄 Processing ${pageTxs.length} transactions from page ${page}...`);
      
      const processedTransactions: BitcoinTransaction[] = [];
      let skippedCount = 0;
      let priceErrorCount = 0;
      
      const currentPrice = await this.getCurrentPrice();
      
      for (const tx of pageTxs) {
        try {
          const txResponse = await fetch(`${this.baseUrl}/tx/${tx.txid}`);
          const txData = await txResponse.json();
          
          const relevantOutputs = txData.vout.filter((vout: any) => 
            vout.scriptpubkey_address === address
          );

          if (relevantOutputs.length > 0) {
            const totalReceived = relevantOutputs.reduce((sum: number, vout: any) => sum + vout.value, 0);
            const valueInBTC = totalReceived / 100000000;
            const blockTime = txData.status?.block_time;
            
            if (!blockTime) {
              skippedCount++;
              continue;
            }
            
            let priceAtTime: number | null = null;
            
            try {
              const txDate = new Date(blockTime * 1000);
              const dateStr = txDate.toISOString().split('T')[0];
              
              try {
                const { supabase } = await import('../lib/supabase');
                const { data: priceData } = await supabase
                  .from('bitcoin_price_data')
                  .select('price_usd')
                  .eq('date', dateStr)
                  .single();
                
                if (priceData?.price_usd) {
                  priceAtTime = priceData.price_usd;
                }
              } catch (supabaseError) {
                // Fallback to CoinGecko
                try {
                  const priceResponse = await fetch(
                    `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}&localization=false`
                  );
                  const cgData = await priceResponse.json();
                  
                  if (cgData.market_data?.current_price?.usd) {
                    priceAtTime = cgData.market_data.current_price.usd;
                  }
                } catch (cgError) {
                  console.error(`Error fetching price for ${dateStr}:`, cgError);
                }
              }
            } catch (e) {
              console.error('Error fetching historical price:', e);
            }
            
            if (!priceAtTime) {
              priceErrorCount++;
              continue;
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
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(`Error processing transaction ${tx.txid}:`, error);
          skippedCount++;
        }
      }
      
      console.log(`✅ Processed ${processedTransactions.length} transactions from page ${page}`);
      
      return processedTransactions;
    } catch (error) {
      console.error('Error loading transactions page:', error);
      throw error;
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
        if (data.price_usd) return data.price_usd;
        if (data.price_eur) return data.price_eur;
        // No price found in database
        console.warn(`⚠️ No price found in Supabase for ${dateStr}`);
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
        const closestPrice = closestData.price_usd || closestData.price_eur;
        if (closestPrice) {
          console.log(`✓ Using closest price from ${closestData.date}: $${closestPrice}`);
          return closestPrice;
        }
      }
      
      // Fallback naar CoinGecko
      console.log(`Fetching from CoinGecko for ${dateStr}...`);
      const coinGeckoResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}`
      );
      const coinGeckoData = await coinGeckoResponse.json();
      const coingeckoPrice = coinGeckoData.market_data?.current_price?.usd;
      
      if (!coingeckoPrice) {
        throw new Error(`No price data available for ${dateStr}`);
      }
      
      return coingeckoPrice;
    } catch (error) {
      console.error('❌ Error fetching historical price:', error);
      throw error; // Throw error instead of returning mock price
    }
  }

  // Haal huidige Bitcoin prijs op in USD
  async getCurrentPrice(): Promise<number> {
    try {
      const response = await fetch(`${this.priceUrl}/simple/price?ids=bitcoin&vs_currencies=usd`);
      const data = await response.json();
      if (data.bitcoin?.usd) {
        return data.bitcoin.usd;
      }
      throw new Error('Invalid price data from CoinGecko');
    } catch (error) {
      console.error('❌ Error fetching current price:', error);
      throw error; // Throw instead of returning mock price
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
