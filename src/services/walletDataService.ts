// Wallet Data Service - Database-first approach met background sync
import { supabase } from '../lib/supabase';
import { bitcoinApiService, BitcoinWallet, BitcoinTransaction } from './bitcoinApiService';
import logger from '../utils/logger';

export interface WalletSyncProgress {
  totalTransactions: number;
  loadedTransactions: number;
  isSyncing: boolean;
  error?: string;
}

export interface WalletDataWithProgress extends BitcoinWallet {
  syncProgress?: WalletSyncProgress;
  isFromDatabase?: boolean;
  lastSynced?: Date;
}

class WalletDataService {
  private syncProgressCallbacks: Map<string, (progress: WalletSyncProgress) => void> = new Map();
  private activeSyncs: Map<string, AbortController> = new Map();

  // Haal wallet data op - eerst uit database, dan background sync indien nodig
  async getWalletData(
    address: string, 
    email: string,
    onProgress?: (progress: WalletSyncProgress) => void
  ): Promise<WalletDataWithProgress> {
    // 1. Haal eerst data uit database
    const dbData = await this.getWalletDataFromDatabase(address, email);
    
    if (dbData && this.isDataFresh(dbData.lastSynced)) {
      logger.debug(`✅ Using fresh database data for ${address.slice(0, 8)}...`);
      return {
        ...dbData,
        isFromDatabase: true,
        lastSynced: dbData.lastSynced
      };
    }

    // 2. Als data verouderd is of niet bestaat, start background sync
    if (onProgress) {
      this.syncProgressCallbacks.set(address, onProgress);
    }

    // 3. Start background sync (niet-blocking)
    this.syncWalletDataInBackground(address, email, dbData);

    // 4. Return database data (ook als verouderd) zodat pagina niet leeg blijft
    if (dbData) {
      logger.debug(`📦 Using cached database data (syncing in background) for ${address.slice(0, 8)}...`);
      return {
        ...dbData,
        isFromDatabase: true,
        lastSynced: dbData.lastSynced,
        syncProgress: {
          totalTransactions: dbData.transactionCount || 0,
          loadedTransactions: dbData.transactions?.length || 0,
          isSyncing: true
        }
      };
    }

    // 5. Als geen database data, return lege wallet (sync zal data ophalen)
    return {
      address,
      balance: 0,
      totalReceived: 0,
      totalSent: 0,
      transactionCount: 0,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      transactions: [],
      isFromDatabase: false,
      syncProgress: {
        totalTransactions: 0,
        loadedTransactions: 0,
        isSyncing: true
      }
    };
  }

  // Haal wallet data uit database
  private async getWalletDataFromDatabase(
    address: string, 
    email: string
  ): Promise<BitcoinWallet & { lastSynced?: Date } | null> {
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('address', address)
        .eq('email', email)
        .maybeSingle();

      if (error || !wallet) {
        return null;
      }

      // Parse wallet_data JSONB
      const walletData = wallet.wallet_data || {};
      const transactions = walletData.transactions || [];

      return {
        address: wallet.address,
        balance: wallet.balance || 0,
        totalReceived: wallet.total_received || 0,
        totalSent: wallet.total_sent || 0,
        transactionCount: wallet.transaction_count || 0,
        firstSeen: wallet.first_seen ? new Date(wallet.first_seen).getTime() : Date.now(),
        lastSeen: wallet.last_seen ? new Date(wallet.last_seen).getTime() : Date.now(),
        transactions: transactions.map((tx: any) => ({
          hash: tx.hash,
          time: tx.time,
          value: tx.value,
          price: tx.price,
          currentValue: tx.currentValue,
          profit: tx.profit,
          profitPercent: tx.profitPercent,
          valueInBTC: tx.valueInBTC,
          status: tx.status,
          confirmations: tx.confirmations
        })) as BitcoinTransaction[],
        lastSynced: wallet.updated_at ? new Date(wallet.updated_at) : undefined
      };
    } catch (error) {
      logger.error('Error fetching wallet data from database:', error);
      return null;
    }
  }

  // Check of data vers is (< 1 uur oud)
  private isDataFresh(lastSynced?: Date): boolean {
    if (!lastSynced) return false;
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return lastSynced.getTime() > oneHourAgo;
  }

  // Background sync van wallet data (per 25 transacties)
  private async syncWalletDataInBackground(
    address: string,
    email: string,
    existingData?: BitcoinWallet | null
  ): Promise<void> {
    // Cancel vorige sync als die nog actief is
    const existingController = this.activeSyncs.get(address);
    if (existingController) {
      existingController.abort();
    }

    const controller = new AbortController();
    this.activeSyncs.set(address, controller);

    try {
      // Update progress: start sync
      this.updateProgress(address, {
        totalTransactions: 0,
        loadedTransactions: 0,
        isSyncing: true
      });

      // 1. Haal wallet info op (balance, stats) met rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting delay
      const walletResponse = await fetch(`https://blockstream.info/api/address/${address}`, {
        signal: controller.signal
      });
      if (!walletResponse.ok) {
        if (walletResponse.status === 429) {
          // Rate limited - wacht langer
          await new Promise(resolve => setTimeout(resolve, 10000));
          throw new Error('Rate limited, please try again later');
        }
        throw new Error(`API error: ${walletResponse.status}`);
      }
      const walletData = await walletResponse.json();

      const totalTxCount = walletData.chain_stats?.tx_count || 0;
      
      // Update progress met totaal aantal transacties
      this.updateProgress(address, {
        totalTransactions: totalTxCount,
        loadedTransactions: 0,
        isSyncing: true
      });

      // 2. Haal eerst 10 transacties op voor snelle wallet info
      const INITIAL_BATCH_SIZE = 10; // Eerste batch: snel wallet info tonen
      const BATCH_SIZE = 10; // Rest per 10 in achtergrond
      const MAX_TRANSACTIONS = 500; // Limiet voor wallets met veel tx's
      
      let allTransactions: BitcoinTransaction[] = [];
      let afterTxid: string | null = null;
      let page = 0;
      let isFirstBatch = true;

      while (page < 100 && allTransactions.length < MAX_TRANSACTIONS) {
        if (controller.signal.aborted) {
          logger.debug('Sync cancelled');
          return;
        }

        page++;
        
        // Rate limiting: wacht 1 seconde tussen requests (sneller voor eerste batch)
        if (page > 1) {
          await new Promise(resolve => setTimeout(resolve, isFirstBatch ? 1000 : 1500));
        }

        const url = afterTxid 
          ? `https://blockstream.info/api/address/${address}/txs?after_txid=${afterTxid}`
          : `https://blockstream.info/api/address/${address}/txs`;

        try {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) {
            if (response.status === 429) {
              // Rate limited - wacht langer en log (niet als error)
              logger.debug(`⚠️ Rate limited (429) for ${address.slice(0, 8)}... - waiting 10s`);
              await new Promise(resolve => setTimeout(resolve, 10000));
              page--; // Retry deze pagina
              continue;
            }
            // Log andere errors maar niet als kritiek
            if (response.status !== 404) {
              logger.debug(`API error ${response.status} for ${address.slice(0, 8)}...`);
            }
            break;
          }

          const pageTransactions = await response.json();
          
          if (!Array.isArray(pageTransactions) || pageTransactions.length === 0) {
            break;
          }

          // Voor eerste batch: neem alleen eerste 10 transacties
          const transactionsToProcess = isFirstBatch 
            ? pageTransactions.slice(0, INITIAL_BATCH_SIZE)
            : pageTransactions;

          // Process deze batch transacties
          const processedBatch = await this.processTransactionsBatch(
            transactionsToProcess,
            address,
            controller.signal
          );

          allTransactions = allTransactions.concat(processedBatch);

          // Update progress
          this.updateProgress(address, {
            totalTransactions: totalTxCount,
            loadedTransactions: allTransactions.length,
            isSyncing: true
          });

          // Na eerste batch: sla direct op en trigger UI update
          if (isFirstBatch) {
            // Sla eerste batch direct op zodat wallet info zichtbaar wordt
            // Alle data (datum, tx, prijzen) wordt opgeslagen in Supabase
            await this.saveWalletDataToDatabase(
              address,
              email,
              walletData,
              allTransactions,
              false // nog niet klaar, maar eerste batch is wel compleet
            );
            
            logger.debug(`✅ Eerste batch (10 transacties) opgeslagen voor ${address.slice(0, 8)}...`);
            
            // Trigger callback om UI te updaten met eerste batch
            this.updateProgress(address, {
              totalTransactions: totalTxCount,
              loadedTransactions: allTransactions.length,
              isSyncing: true
            });
            
            isFirstBatch = false;
            // Set up next page vanaf transactie 11 (als er meer zijn)
            if (pageTransactions.length > INITIAL_BATCH_SIZE) {
              const lastTx = pageTransactions[INITIAL_BATCH_SIZE - 1];
              if (lastTx?.txid) {
                afterTxid = lastTx.txid;
              }
            } else if (pageTransactions.length > 0) {
              // Als er minder dan 10 zijn, gebruik laatste
              const lastTx = pageTransactions[pageTransactions.length - 1];
              if (lastTx?.txid) {
                afterTxid = lastTx.txid;
              }
            }
            // Continue met volgende batches
            continue;
          }

          // Sla batch op in database (incrementeel) voor volgende batches
          await this.saveWalletDataToDatabase(
            address,
            email,
            walletData,
            allTransactions,
            false // nog niet klaar
          );

          // Check of we klaar zijn
          if (pageTransactions.length < BATCH_SIZE || allTransactions.length >= MAX_TRANSACTIONS) {
            break;
          }

          // Set up next page
          const lastTx = pageTransactions[pageTransactions.length - 1];
          if (lastTx?.txid) {
            afterTxid = lastTx.txid;
          } else {
            break;
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            logger.debug('Sync aborted');
            return;
          }
          logger.error(`Error fetching page ${page}:`, error);
          break;
        }
      }

      // 3. Final save naar database
      await this.saveWalletDataToDatabase(
        address,
        email,
        walletData,
        allTransactions,
        true // klaar
      );

      // Update progress: sync compleet
      this.updateProgress(address, {
        totalTransactions: allTransactions.length,
        loadedTransactions: allTransactions.length,
        isSyncing: false
      });

      logger.debug(`✅ Background sync completed for ${address.slice(0, 8)}...`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.debug('Sync aborted');
        return;
      }
      logger.error('Error in background sync:', error);
      this.updateProgress(address, {
        totalTransactions: 0,
        loadedTransactions: 0,
        isSyncing: false,
        error: error.message || 'Sync failed'
      });
    } finally {
      this.activeSyncs.delete(address);
    }
  }

  // Process een batch transacties (25 stuks)
  private async processTransactionsBatch(
    pageTransactions: any[],
    address: string,
    signal: AbortSignal
  ): Promise<BitcoinTransaction[]> {
    const processed: BitcoinTransaction[] = [];
    const currentPrice = await bitcoinApiService.getCurrentPrice();

    for (const tx of pageTransactions) {
      if (signal.aborted) break;

      try {
        // Haal transactie details op
        const txResponse = await fetch(`https://blockstream.info/api/tx/${tx.txid}`, {
          signal
        });
        if (!txResponse.ok) continue;
        const txData = await txResponse.json();

        // Process transactie (vergelijkbaar met bitcoinApiService)
        const relevantOutputs = txData.vout?.filter((vout: any) => 
          vout.scriptpubkey_address === address
        ) || [];

        let totalSent = 0;
        if (txData.vin && Array.isArray(txData.vin)) {
          for (const vin of txData.vin) {
            if (vin.prevout?.scriptpubkey_address === address) {
              totalSent += vin.prevout.value || 0;
            }
          }
        }

        const totalReceived = relevantOutputs.length > 0 
          ? relevantOutputs.reduce((sum: number, vout: any) => sum + vout.value, 0)
          : 0;

        const netValue = totalReceived - totalSent;
        if (netValue === 0) continue;

        const valueInBTC = Math.abs(netValue) / 100000000;
        const isSend = netValue < 0;
        let blockTime = txData.status?.block_time;
        const isPending = !blockTime || !txData.status?.block_height;

        // Fallback naar tx.time als block_time niet beschikbaar (unconfirmed/pending)
        if (!blockTime) {
          blockTime = tx.time || txData.time;
          if (!blockTime) {
            logger.debug(`⏭️ Skipping ${tx.txid} - no timestamp at all`);
            continue;
          }
          logger.debug(`ℹ️ Using tx.time for unconfirmed/pending tx ${tx.txid.slice(0, 8)}...`);
        }

        // Haal historische prijs op
        const txDate = new Date(blockTime * 1000);
        const dateStr = txDate.toISOString().split('T')[0];
        
        let priceAtTime: number;
        try {
          const { data: priceData } = await supabase
            .from('bitcoin_price_data')
            .select('price_usd')
            .eq('date', dateStr)
            .maybeSingle();
          
          priceAtTime = priceData?.price_usd || currentPrice;
        } catch {
          priceAtTime = currentPrice;
        }

        const valueInSatoshis = isSend ? -Math.abs(netValue) : Math.abs(netValue);
        const currentValueUSD = valueInBTC * currentPrice;
        const priceAtTimeUSD = valueInBTC * priceAtTime;
        const profitUSD = isSend ? -(currentValueUSD - priceAtTimeUSD) : (currentValueUSD - priceAtTimeUSD);
        const profitPercent = priceAtTime > 0 ? ((currentPrice - priceAtTime) / priceAtTime) * 100 : 0;

        processed.push({
          hash: tx.txid,
          time: blockTime,
          value: valueInSatoshis,
          price: priceAtTime,
          currentValue: isSend ? -currentValueUSD : currentValueUSD,
          profit: profitUSD,
          profitPercent: profitPercent,
          valueInBTC: valueInBTC,
          status: isPending ? 'pending' : 'confirmed',
          confirmations: 0
        });
      } catch (error) {
        logger.debug(`Error processing transaction ${tx.txid}:`, error);
        continue;
      }
    }

    return processed;
  }

  // Sla wallet data op in database
  private async saveWalletDataToDatabase(
    address: string,
    email: string,
    walletData: any,
    transactions: BitcoinTransaction[],
    isComplete: boolean
  ): Promise<void> {
    try {
      const fundedSatoshis = walletData.chain_stats?.funded_txo_sum || 0;
      const spentSatoshis = walletData.chain_stats?.spent_txo_sum || 0;
      const balanceSatoshis = fundedSatoshis - spentSatoshis;

      const updateData: any = {
        balance: balanceSatoshis / 100000000,
        transaction_count: walletData.chain_stats?.tx_count || 0,
        total_received: fundedSatoshis / 100000000,
        total_sent: spentSatoshis / 100000000,
        last_seen: new Date().toISOString(),
        wallet_data: {
          transactions: transactions,
          synced_at: new Date().toISOString(),
          is_complete: isComplete
        },
        updated_at: new Date().toISOString()
      };

      if (transactions.length > 0) {
        const lastTx = transactions[0];
        updateData.last_transaction_hash = lastTx.hash;
        updateData.last_transaction_time = new Date(lastTx.time * 1000).toISOString();
      }

      const { error } = await supabase
        .from('wallets')
        .update(updateData)
        .eq('address', address)
        .eq('email', email);

      if (error) {
        logger.error('Error saving wallet data to database:', error);
      } else {
        logger.debug(`💾 Saved ${transactions.length} transactions to database for ${address.slice(0, 8)}...`);
      }
    } catch (error) {
      logger.error('Error in saveWalletDataToDatabase:', error);
    }
  }

  // Update progress callback
  private updateProgress(address: string, progress: WalletSyncProgress): void {
    const callback = this.syncProgressCallbacks.get(address);
    if (callback) {
      callback(progress);
    }
  }

  // Cancel sync
  cancelSync(address: string): void {
    const controller = this.activeSyncs.get(address);
    if (controller) {
      controller.abort();
      this.activeSyncs.delete(address);
      this.syncProgressCallbacks.delete(address);
    }
  }
}

export const walletDataService = new WalletDataService();

