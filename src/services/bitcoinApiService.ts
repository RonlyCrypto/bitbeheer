// Bitcoin API service voor echte wallet data
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

export interface BitcoinTransaction {
  hash: string;
  time: number;
  value: number; // in satoshis
  price: number; // USD price at time of transaction
  currentValue: number; // Current USD value
  profit: number; // Profit/loss in USD
  profitPercent: number; // Profit/loss percentage
  valueInBTC?: number; // Value in BTC for reference
  status?: 'pending' | 'confirmed'; // Transaction status
  confirmations?: number; // Number of confirmations
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
  private cachedBlockHeight: number | null = null;
  
  // Cache voor wallet data (5 minuten)
  private walletCache: Map<string, { data: BitcoinWallet; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minuten
  
  // Rate limiting: track laatste request tijd per endpoint
  private lastRequestTime: Map<string, number> = new Map();
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 seconde tussen requests

  // Helper: Rate limiting met delay en retry logic
  private async rateLimitedFetch(url: string, retries: number = 3): Promise<Response> {
    const endpoint = url.split('?')[0]; // Haal endpoint zonder query params
    const lastRequest = this.lastRequestTime.get(endpoint) || 0;
    const timeSinceLastRequest = Date.now() - lastRequest;
    
    // Wacht tot minimum interval is verstreken
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime.set(endpoint, Date.now());
    
    // Retry logic met exponential backoff voor 429 errors
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          // Rate limited - wacht langer
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          const waitTime = Math.min(retryAfter * 1000, Math.pow(2, attempt) * 1000);
          logger.warn(`⚠️ Rate limited (429). Wacht ${waitTime}ms voor retry ${attempt + 1}/${retries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        if (!response.ok && response.status !== 404) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        if (attempt === retries - 1) throw error;
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(`⚠️ Request failed, retry in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  // Haal wallet data op van Blockstream API (met caching en rate limiting)
  async getWalletData(address: string, limit: number = 25): Promise<BitcoinWallet> {
    // Check cache eerst
    const cached = this.walletCache.get(address);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      logger.debug(`✅ Using cached wallet data for ${address.slice(0, 8)}...`);
      return cached.data;
    }

    try {
      // Haal wallet info op met rate limiting
      const walletResponse = await this.rateLimitedFetch(`${this.baseUrl}/address/${address}`);
      const walletData = await walletResponse.json();

      // Haal transacties op van Blockstream (met limiet voor wallets met veel tx's)
      logger.debug(`🔄 Fetching transactions for ${address}...`);
      
      let allTransactions: any[] = [];
      let afterTxid: string | null = null;
      let page = 0;
      const MAX_TRANSACTIONS = 500; // Limiet voor wallets met veel transacties (voorkomt rate limiting)
      const maxPages = 50; // Safety limit (was 100, nu 50 voor betere performance)
      
      // Keep fetching until we have all transactions
      while (page < maxPages) {
        page++;
        const url = afterTxid 
          ? `${this.baseUrl}/address/${address}/txs?after_txid=${afterTxid}`
          : `${this.baseUrl}/address/${address}/txs`;
        
        logger.debug(`📄 Fetching page ${page}...`);
        
        try {
          // Rate limiting: wacht 1.5 seconde tussen paginering requests (verhoogd voor betere rate limiting)
          if (page > 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
          
          // Stop als we de limiet hebben bereikt
          if (allTransactions.length >= MAX_TRANSACTIONS) {
            logger.warn(`⚠️ Transaction limit reached (${MAX_TRANSACTIONS}). Stopping pagination to prevent rate limiting.`);
            break;
          }
          
          const response = await this.rateLimitedFetch(url);
          if (!response.ok) {
            logger.error(`❌ Blockstream API error on page ${page}: ${response.status}`);
            break;
          }
          
          const pageTransactions = await response.json();
          
          if (!Array.isArray(pageTransactions)) {
            logger.warn(`⚠️ Page ${page} returned non-array response:`, pageTransactions);
            break;
          }
          
          if (pageTransactions.length === 0) {
            logger.debug(`📄 Page ${page}: got 0 transactions - end of results`);
            break;
          }
          
          allTransactions = allTransactions.concat(pageTransactions);
          logger.debug(`📄 Page ${page}: got ${pageTransactions.length} transactions (total: ${allTransactions.length})`);
          
          // Stop als we de limiet hebben bereikt na deze pagina
          if (allTransactions.length >= MAX_TRANSACTIONS) {
            logger.warn(`⚠️ Transaction limit reached (${MAX_TRANSACTIONS}). Showing most recent ${MAX_TRANSACTIONS} transactions.`);
            allTransactions = allTransactions.slice(0, MAX_TRANSACTIONS);
            break;
          }
          
          // If we got less than 25, we've reached the end
          if (pageTransactions.length < 25) {
            logger.debug(`📄 Page ${page} returned < 25 transactions, end of results`);
            break;
          }
          
          // Set up next page - use last txid
          const lastTx = pageTransactions[pageTransactions.length - 1];
          if (lastTx?.txid) {
            const nextAfterTxid = lastTx.txid;
            afterTxid = nextAfterTxid;
            logger.debug(`📄 Next page will use after_txid: ${nextAfterTxid.slice(0, 8)}...`);
          } else {
            logger.debug(`📄 No txid found in last transaction, stopping pagination`);
            break;
          }
        } catch (paginationError) {
          logger.error(`❌ Error fetching page ${page}:`, paginationError);
          break;
        }
      }
      
      const transactions = allTransactions;
      
      if (!Array.isArray(transactions) || transactions.length === 0) {
        logger.warn(`⚠️ No transactions found for ${address}`);
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
      
      logger.debug(`📄 Fetched ${transactions.length} transaction hashes from blockchain (will process all of them)`);

      // Verwerk transacties
      const processedTransactions: BitcoinTransaction[] = [];
      let skippedCount = 0;
      let priceErrorCount = 0;
      
      // Get current price once
      const currentPrice = await this.getCurrentPrice();
      
      logger.debug(`🔍 Processing ${transactions.length} transactions from blockchain...`);
      
      // Reset cached block height for this batch
      this.cachedBlockHeight = null;
      
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i]; // Verwerk alleen eerste 'limit' transacties
        try {
          const txResponse = await fetch(`${this.baseUrl}/tx/${tx.txid}`);
          const txData = await txResponse.json();
          
          // Controleer of dit adres Bitcoin ONTVANGT in deze transactie (vout)
          const relevantOutputs = txData.vout.filter((vout: any) => 
            vout.scriptpubkey_address === address
          );
          
          // Controleer of dit adres Bitcoin VERSTUURT in deze transactie (vin)
          // We moeten de vorige outputs (prevout) van de inputs controleren
          let relevantInputs = 0;
          let totalSent = 0;
          
          if (txData.vin && Array.isArray(txData.vin)) {
            for (const vin of txData.vin) {
              if (vin.prevout && vin.prevout.scriptpubkey_address === address) {
                relevantInputs++;
                totalSent += vin.prevout.value || 0;
              }
            }
          }

          // Bereken netto waarde: ontvangen - verstuurd
          const totalReceived = relevantOutputs.length > 0 
            ? relevantOutputs.reduce((sum: number, vout: any) => sum + vout.value, 0)
            : 0;
          
          const netValue = totalReceived - totalSent;
          
          // Registreer transactie als er een netto waarde is (ontvangen of verstuurd)
          if (netValue !== 0) {
            const valueInBTC = Math.abs(netValue) / 100000000;
            const isSend = netValue < 0;
            
            // Gebruik block_time (confirmed) of tx.time (unconfirmed) als fallback
            let blockTime = txData.status?.block_time;
            const isPending = !blockTime || !txData.status?.block_height;
            
            // Haal current block height op voor confirmations (alleen als confirmed, cache voor performance)
            let confirmations = 0;
            if (!isPending && txData.status?.block_height) {
              try {
                // Cache block height voor deze batch (alleen eerste keer ophalen)
                if (!this.cachedBlockHeight) {
                  this.cachedBlockHeight = await this.getCurrentBlockHeight();
                }
                confirmations = this.cachedBlockHeight - txData.status.block_height + 1;
              } catch (error) {
                logger.warn('Could not fetch current block height for confirmations');
              }
            }
            
            // Fallback naar tx.time als block_time niet beschikbaar (unconfirmed/pending)
            if (!blockTime) {
              blockTime = tx.time || txData.time;
              if (!blockTime) {
                logger.warn(`⏭️ Skipping ${tx.txid} - no timestamp at all`);
                skippedCount++;
                continue;
              }
              logger.debug(`ℹ️ Using tx.time for unconfirmed/pending tx ${tx.txid.slice(0, 8)}...`);
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
                  logger.debug(`✓ BTC Price op ${dateStr} (Supabase): $${priceAtTime}`);
                } else {
                  // Prijs niet gevonden in onze database - use current price as fallback
                  logger.debug(`ℹ️ Prijs voor ${dateStr} niet in database, gebruik huidige prijs: $${currentPrice}`);
                  priceAtTime = currentPrice;
                }
              } catch (supabaseError) {
                logger.warn(`⚠️ Supabase price fetch failed for ${dateStr}, using current price: $${currentPrice}`);
                priceAtTime = currentPrice;
              }
            } catch (e) {
              logger.error('Error fetching historical price:', e);
              priceAtTime = currentPrice; // Fallback
            }
            
            // Nu hebben we ALTIJD een prijs
            if (!priceAtTime || priceAtTime <= 0) {
              logger.error(`❌ Critical: Invalid price for ${tx.txid}`);
              continue;
            }
            
            // Voor sends: gebruik negatieve waarde
            const valueInSatoshis = isSend ? -Math.abs(netValue) : Math.abs(netValue);
            const currentValueUSD = valueInBTC * currentPrice;
            const priceAtTimeUSD = valueInBTC * priceAtTime;
            const profitUSD = isSend ? -(currentValueUSD - priceAtTimeUSD) : (currentValueUSD - priceAtTimeUSD);
            const profitPercent = priceAtTime > 0 ? ((currentPrice - priceAtTime) / priceAtTime) * 100 : 0;
            
            processedTransactions.push({
              hash: tx.txid,
              time: blockTime,
              value: valueInSatoshis, // Negatief voor sends, positief voor receives
              price: priceAtTime,
              currentValue: isSend ? -currentValueUSD : currentValueUSD,
              profit: profitUSD,
              profitPercent: profitPercent,
              valueInBTC: valueInBTC,
              status: isPending ? 'pending' : 'confirmed',
              confirmations: confirmations
            });
          } else {
            skippedCount++;
          }
        } catch (error) {
          logger.error(`Error processing transaction ${tx.txid}:`, error);
          skippedCount++;
        }
      }

      logger.debug(`📊 Transaction Summary: Total: ${transactions.length}, Processed: ${processedTransactions.length}, Skipped: ${skippedCount + priceErrorCount}`);
      
      const fundedSatoshis = walletData.chain_stats.funded_txo_sum;
      const spentSatoshis = walletData.chain_stats.spent_txo_sum;
      const balanceSatoshis = fundedSatoshis - spentSatoshis;
      
      logger.debug(`💰 Wallet Stats: Balance: ${(balanceSatoshis / 100000000).toFixed(8)} BTC, TX Count: ${walletData.chain_stats.tx_count}`);

      const result = {
        address,
        balance: balanceSatoshis / 100000000,
        totalReceived: fundedSatoshis / 100000000,
        totalSent: spentSatoshis / 100000000,
        transactionCount: walletData.chain_stats.tx_count,
        firstSeen: walletData.chain_stats.funded_txo_count > 0 ? Date.now() : 0,
        lastSeen: Date.now(),
        transactions: processedTransactions
      };
      
      // Cache het resultaat
      this.walletCache.set(address, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      logger.error('Error fetching wallet data:', error);
      throw new Error('Kon wallet data niet ophalen');
    }
  }

  // Haal volgende batch transacties op (lazy loading)
  async getTransactionsPage(address: string, page: number = 1, pageSize: number = 25): Promise<BitcoinTransaction[]> {
    try {
      const offset = (page - 1) * pageSize;
      
      logger.debug(`🔄 Loading transactions page ${page} (offset: ${offset}, limit: ${pageSize})...`);
      
      // Haal alle tx hashes op in één keer met rate limiting
      const url = `${this.baseUrl}/address/${address}/txs`;
      const allTxResponse = await this.rateLimitedFetch(url);
      const allTxs = await allTxResponse.json();
      
      if (!Array.isArray(allTxs)) {
        logger.warn(`⚠️ No transactions for ${address}`);
        return [];
      }
      
      // Haal transactions voor deze pagina op
      const pageTxs = allTxs.slice(offset, offset + pageSize);
      
      if (pageTxs.length === 0) {
        logger.debug(`✓ No more transactions to load`);
        return [];
      }
      
      logger.debug(`📄 Processing ${pageTxs.length} transactions from page ${page}...`);
      
      const processedTransactions: BitcoinTransaction[] = [];
      let skippedCount = 0;
      let priceErrorCount = 0;
      
      const currentPrice = await this.getCurrentPrice();
      
      for (const tx of pageTxs) {
        try {
          const txResponse = await this.rateLimitedFetch(`${this.baseUrl}/tx/${tx.txid}`);
          const txData = await txResponse.json();
          
          const relevantOutputs = txData.vout.filter((vout: any) => 
            vout.scriptpubkey_address === address
          );
          
          // Controleer of dit adres Bitcoin VERSTUURT in deze transactie (vin)
          let totalSent = 0;
          if (txData.vin && Array.isArray(txData.vin)) {
            for (const vin of txData.vin) {
              if (vin.prevout && vin.prevout.scriptpubkey_address === address) {
                totalSent += vin.prevout.value || 0;
              }
            }
          }

          // Bereken netto waarde: ontvangen - verstuurd
          const totalReceived = relevantOutputs.length > 0 
            ? relevantOutputs.reduce((sum: number, vout: any) => sum + vout.value, 0)
            : 0;
          
          const netValue = totalReceived - totalSent;

          if (netValue !== 0) {
            const valueInBTC = Math.abs(netValue) / 100000000;
            const isSend = netValue < 0;
            const blockTime = txData.status?.block_time;
            const isPending = !blockTime || !txData.status?.block_height;
            
            // Haal current block height op voor confirmations
            let confirmations = 0;
            if (!isPending && txData.status?.block_height) {
              try {
                if (!this.cachedBlockHeight) {
                  this.cachedBlockHeight = await this.getCurrentBlockHeight();
                }
                confirmations = this.cachedBlockHeight - txData.status.block_height + 1;
              } catch (error) {
                logger.warn('Could not fetch current block height for confirmations');
              }
            }
            
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
                  logger.error(`Error fetching price for ${dateStr}:`, cgError);
                }
              }
            } catch (e) {
              logger.error('Error fetching historical price:', e);
            }
            
            if (!priceAtTime) {
              priceErrorCount++;
              continue;
            }
            
            // Voor sends: gebruik negatieve waarde
            const valueInSatoshis = isSend ? -Math.abs(netValue) : Math.abs(netValue);
            const currentValueUSD = valueInBTC * currentPrice;
            const priceAtTimeUSD = valueInBTC * priceAtTime;
            const profitUSD = isSend ? -(currentValueUSD - priceAtTimeUSD) : (currentValueUSD - priceAtTimeUSD);
            const profitPercent = priceAtTime > 0 ? ((currentPrice - priceAtTime) / priceAtTime) * 100 : 0;
            
            processedTransactions.push({
              hash: tx.txid,
              time: blockTime,
              value: valueInSatoshis, // Negatief voor sends, positief voor receives
              price: priceAtTime,
              currentValue: isSend ? -currentValueUSD : currentValueUSD,
              profit: profitUSD,
              profitPercent: profitPercent,
              valueInBTC: valueInBTC,
              status: isPending ? 'pending' : 'confirmed',
              confirmations: confirmations
            });
          } else {
            skippedCount++;
          }
        } catch (error) {
          logger.error(`Error processing transaction ${tx.txid}:`, error);
          skippedCount++;
        }
      }
      
      logger.debug(`✅ Processed ${processedTransactions.length} transactions from page ${page}`);
      
      return processedTransactions;
    } catch (error) {
      logger.error('Error loading transactions page:', error);
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
        logger.warn(`⚠️ No price found in Supabase for ${dateStr}`);
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
          logger.debug(`✓ Using closest price from ${closestData.date}: $${closestPrice}`);
          return closestPrice;
        }
      }
      
      // Fallback naar CoinGecko
      logger.debug(`Fetching from CoinGecko for ${dateStr}...`);
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
      logger.error('❌ Error fetching historical price:', error);
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
        .select('price_usd, date')
        .eq('date', today)
        .maybeSingle();

      if (!error && data?.price_usd) {
        logger.debug(`✓ Current price from Supabase: $${data.price_usd}`);
        return data.price_usd;
      }

      // If no data for today, get the latest price from DB
      const { data: latestData, error: latestError } = await supabase
        .from('bitcoin_price_data')
        .select('price_usd, date')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Check if DB data is stale (older than 1 day) — if so, fetch live from CoinGecko
      if (!latestError && latestData?.price_usd && latestData?.date) {
        const daysDiff = Math.floor(
          (new Date(today).getTime() - new Date(latestData.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff <= 1) {
          logger.debug(`ℹ️ Using latest price from Supabase (${latestData.date}): $${latestData.price_usd}`);
          return latestData.price_usd;
        }
        logger.debug(`⚠️ Supabase price is ${daysDiff} days old, fetching live price from CoinGecko...`);
      }

      // Fallback: fetch live price from CoinGecko simple API
      const liveResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        { signal: AbortSignal.timeout(5000) }
      );
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        const livePrice = liveData?.bitcoin?.usd;
        if (livePrice) {
          logger.debug(`✅ Live price from CoinGecko: $${livePrice}`);
          return livePrice;
        }
      }

      // Last resort: return latest DB price even if stale
      if (!latestError && latestData?.price_usd) {
        logger.debug(`⚠️ Using stale price from Supabase: $${latestData.price_usd}`);
        return latestData.price_usd;
      }

      throw new Error('No price data available');
    } catch (error) {
      logger.error('❌ Error fetching current price:', error);
      throw error;
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
        logger.debug(`ℹ️ Using latest price from Supabase`);
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
      logger.error('❌ Error fetching price data:', error);
      throw error; // Throw error instead of returning mock data
    }
  }

  // Haal huidige block height op (voor confirmations)
  private async getCurrentBlockHeight(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/blocks/tip/height`);
      if (response.ok) {
        const height = await response.json();
        return height;
      }
    } catch (error) {
      logger.error('Error fetching current block height:', error);
    }
    return 0; // Fallback
  }

  // Check voor nieuwe transacties (alleen nieuwe tx hashes ophalen)
  async checkForNewTransactions(address: string, lastKnownTxHash: string | null): Promise<{ hasNew: boolean; newTxHash?: string }> {
    try {
      // Haal alleen de eerste pagina op (nieuwste transacties)
      const response = await fetch(`${this.baseUrl}/address/${address}/txs`);
      if (!response.ok) {
        return { hasNew: false };
      }
      
      const transactions = await response.json();
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return { hasNew: false };
      }
      
      // Check of de nieuwste transactie anders is dan de laatste bekende
      const newestTxHash = transactions[0].txid;
      if (lastKnownTxHash && newestTxHash === lastKnownTxHash) {
        return { hasNew: false };
      }
      
      return { hasNew: true, newTxHash: newestTxHash };
    } catch (error) {
      logger.error('Error checking for new transactions:', error);
      return { hasNew: false };
    }
  }
  
  // Clear cache voor een specifiek adres (bijv. na nieuwe transactie)
  clearWalletCache(address: string) {
    this.walletCache.delete(address);
    logger.debug(`🗑️ Cleared cache for wallet ${address.slice(0, 8)}...`);
  }

  // Valideer Bitcoin adres
  validateBitcoinAddress(address: string): boolean {
    // Basis Bitcoin adres validatie
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return bitcoinRegex.test(address);
  }

  // Get ATH (All Time High) prices for different cycles
  async getATHData(): Promise<{ previousATH: number; latestATH: number }> {
    try {
      // Get all time high prices from database
      const { data, error } = await supabase
        .from('bitcoin_price_data')
        .select('price_usd')
        .order('price_usd', { ascending: false })
        .limit(100);

      if (error || !data) {
        logger.warn('⚠️ Error fetching ATH data, using defaults');
        return { previousATH: 69000, latestATH: 124753 };
      }

      // Get all time high (highest price ever)
      const allTimeHigh = Math.max(...data.map(d => d.price_usd || 0));

      // Get previous ATH - second highest price or Cycle 3 ATH
      // Cycle 3 ATH was $69,000
      const cycle3ATH = 69000;
      const previousATH = cycle3ATH;
      const latestATH = allTimeHigh;

      logger.debug(`📊 ATH Data - Previous: $${previousATH}, Latest: $${latestATH}`);

      return { previousATH, latestATH };
    } catch (error) {
      logger.error('❌ Error in getATHData:', error);
      return { previousATH: 69000, latestATH: 124753 };
    }
  }
}

export const bitcoinApiService = new BitcoinApiService();
