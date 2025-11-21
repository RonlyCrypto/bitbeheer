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

      // Haal ALLE transacties op van Blockstream (paginate through all results)
      console.log(`🔄 Fetching ALL transactions for ${address}...`);
      
      let allTransactions = [];
      let afterTxid: string | null = null;
      let page = 0;
      let maxPages = 100; // Safety limit
      
      // Keep fetching until we have all transactions
      while (page < maxPages) {
        page++;
        const url = afterTxid 
          ? `${this.baseUrl}/address/${address}/txs?after_txid=${afterTxid}`
          : `${this.baseUrl}/address/${address}/txs`;
        
        console.log(`📄 Fetching page ${page}...`);
        
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.error(`❌ Blockstream API error on page ${page}: ${response.status}`);
            break;
          }
          
          const pageTransactions = await response.json();
          
          if (!Array.isArray(pageTransactions)) {
            console.warn(`⚠️ Page ${page} returned non-array response:`, pageTransactions);
            break;
          }
          
          if (pageTransactions.length === 0) {
            console.log(`📄 Page ${page}: got 0 transactions - end of results`);
            break;
          }
          
          allTransactions = allTransactions.concat(pageTransactions);
          console.log(`📄 Page ${page}: got ${pageTransactions.length} transactions (total: ${allTransactions.length})`);
          
          // If we got less than 25, we've reached the end
          if (pageTransactions.length < 25) {
            console.log(`📄 Page ${page} returned < 25 transactions, end of results`);
            break;
          }
          
          // Set up next page - use last txid
          afterTxid = pageTransactions[pageTransactions.length - 1].txid;
          console.log(`📄 Next page will use after_txid: ${afterTxid.slice(0, 8)}...`);
        } catch (paginationError) {
          console.error(`❌ Error fetching page ${page}:`, paginationError);
          break;
        }
      }
      
      const transactions = allTransactions;
      
      if (!Array.isArray(transactions) || transactions.length === 0) {
        console.warn(`⚠️ No transactions found for ${address}`);
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
      
      console.log(`📄 Fetched ${transactions.length} transaction hashes from blockchain (will process all of them)`);

      // Verwerk transacties
      const processedTransactions: BitcoinTransaction[] = [];
      let skippedCount = 0;
      let priceErrorCount = 0;
      
      // Get current price once
      const currentPrice = await this.getCurrentPrice();
      
      console.log(`🔍 Processing ALL ${transactions.length} transactions from blockchain...`);
      
      for (let i = 0; i < transactions.length; i++) {
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
            
            // Gebruik block_time (confirmed) of tx.time (unconfirmed) als fallback
            let blockTime = txData.status?.block_time;
            
            // Fallback naar tx.time als block_time niet beschikbaar (unconfirmed)
            if (!blockTime) {
              blockTime = tx.time || txData.time;
              if (!blockTime) {
                console.warn(`⏭️ Skipping ${tx.txid} - no timestamp at all`);
                skippedCount++;
                continue;
              }
              console.log(`ℹ️ Using tx.time for unconfirmed tx ${tx.txid.slice(0, 8)}...`);
            }
            
            // Haal de BTC prijs op voor de exacte datum van de transactie (ALLEEN uit Supabase)
            let priceAtTime: number | null = null;
            
            try {
              const txDate = new Date(blockTime * 1000);
              const dateStr = txDate.toISOString().split('T')[0]; // YYYY-MM-DD formaat
              
              // Haal prijs uit onze eigen Supabase database
              try {
                const { supabase } = await import('../lib/supabase');
                const { data: priceData, error: supabaseErr } = await supabase
                  .from('bitcoin_price_data')
                  .select('price_usd')
                  .eq('date', dateStr)
                  .maybeSingle();
                
                if (priceData?.price_usd) {
                  priceAtTime = priceData.price_usd;
                  console.log(`✓ BTC Price op ${dateStr} (Supabase): $${priceAtTime}`);
                } else {
                  // Prijs niet gevonden in onze database - use current price as fallback
                  console.log(`ℹ️ Prijs voor ${dateStr} niet in database, gebruik huidige prijs: $${currentPrice}`);
                  priceAtTime = currentPrice;
                }
              } catch (supabaseError) {
                console.warn(`⚠️ Supabase price fetch failed for ${dateStr}, using current price: $${currentPrice}`);
                priceAtTime = currentPrice;
              }
            } catch (e) {
              console.error('Error fetching historical price:', e);
              priceAtTime = currentPrice; // Fallback
            }
            
            // Nu hebben we ALTIJD een prijs
            if (!priceAtTime || priceAtTime <= 0) {
              console.error(`❌ Critical: Invalid price for ${tx.txid}`);
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
      console.log(`   Skipped (no timestamp): ${priceErrorCount}`);
      
      const fundedSatoshis = walletData.chain_stats.funded_txo_sum;
      const spentSatoshis = walletData.chain_stats.spent_txo_sum;
      const balanceSatoshis = fundedSatoshis - spentSatoshis;
      
      console.log(`💰 Wallet Stats:`);
      console.log(`   Total Received: ${(fundedSatoshis / 100000000).toFixed(8)} BTC`);
      console.log(`   Total Sent: ${(spentSatoshis / 100000000).toFixed(8)} BTC`);
      console.log(`   Current Balance: ${(balanceSatoshis / 100000000).toFixed(8)} BTC`);
      console.log(`   TX Count: ${walletData.chain_stats.tx_count}`);

      return {
        address,
        balance: balanceSatoshis / 100000000,
        totalReceived: fundedSatoshis / 100000000,
        totalSent: spentSatoshis / 100000000,
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
      // Get today's price from Supabase
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('price_usd')
        .eq('date', today)
        .maybeSingle();

      if (!error && data?.price_usd) {
        console.log(`✓ Current price from Supabase: $${data.price_usd}`);
        return data.price_usd;
      }

      // If no data for today, get the latest price
      const { data: latestData, error: latestError } = await supabase
        .from('bitcoin_price_data')
        .select('price_usd')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestError && latestData?.price_usd) {
        console.log(`ℹ️ Using latest price from Supabase: $${latestData.price_usd}`);
        return latestData.price_usd;
      }

      throw new Error('No price data available');
    } catch (error) {
      console.error('❌ Error fetching current price:', error);
      throw error; // Throw instead of returning mock price
    }
  }

  // Haal live prijs data op voor chart
  async getPriceData(): Promise<BitcoinPriceData> {
    try {
      // Get today's price from Supabase
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('price_eur, price_usd')
        .eq('date', today)
        .maybeSingle();

      if (!error && data?.price_eur) {
        return {
          price: data.price_eur,
          change24h: 0, // Could calculate from yesterday if needed
          changePercent24h: 0,
          marketCap: 0,
          volume24h: 0
        };
      }

      // If no data for today, get the latest price
      const { data: latestData, error: latestError } = await supabase
        .from('bitcoin_price_data')
        .select('price_eur')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestError && latestData?.price_eur) {
        console.log(`ℹ️ Using latest price from Supabase`);
        return {
          price: latestData.price_eur,
          change24h: 0,
          changePercent24h: 0,
          marketCap: 0,
          volume24h: 0
        };
      }

      throw new Error('No price data available in Supabase');
    } catch (error) {
      console.error('❌ Error fetching price data:', error);
      throw error; // Throw error instead of returning mock data
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
