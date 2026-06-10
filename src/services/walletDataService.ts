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
  fullySynced?: boolean; // Flag om te checken of wallet volledig gesynct is
}

class WalletDataService {
  private syncProgressCallbacks: Map<string, (progress: WalletSyncProgress) => void> = new Map();
  private activeSyncs: Map<string, AbortController> = new Map();

  // Haal wallet data op - eerst uit database, dan background sync alleen bij eerste keer
  async getWalletData(
    address: string, 
    email: string,
    onProgress?: (progress: WalletSyncProgress) => void
  ): Promise<WalletDataWithProgress> {
    // 1. Haal eerst data uit database
    const dbData = await this.getWalletDataFromDatabase(address, email);
    
    // 2. Check of wallet al volledig gesynct is (heeft transacties in database en fully_synced flag)
    const isFullySynced = dbData && (dbData.fullySynced || (dbData.transactions && dbData.transactions.length > 0 && dbData.transactionCount === dbData.transactions.length));
    
    if (isFullySynced) {
      logger.debug(`✅ Wallet al volledig gesynct voor ${address.slice(0, 8)}... - geen sync nodig`);
      return {
        ...dbData,
        isFromDatabase: true,
        lastSynced: dbData.lastSynced,
        fullySynced: true,
        syncProgress: {
          totalTransactions: dbData.transactionCount || 0,
          loadedTransactions: dbData.transactions?.length || 0,
          isSyncing: false // Niet meer syncen, data is compleet
        }
      };
    }

    // 3. Alleen syncen als er geen data is of data incompleet is (eerste keer)
    if (onProgress) {
      this.syncProgressCallbacks.set(address, onProgress);
    }

    // 4. Start background sync alleen bij eerste keer (niet-blocking)
    this.syncWalletDataInBackground(address, email, dbData);

    // 5. Return database data (ook als verouderd) zodat pagina niet leeg blijft
    if (dbData) {
      logger.debug(`📦 Using cached database data (syncing in background) for ${address.slice(0, 8)}...`);
      return {
        ...dbData,
        isFromDatabase: true,
        lastSynced: dbData.lastSynced,
        syncProgress: {
          totalTransactions: dbData.transactionCount || 0,
          loadedTransactions: dbData.transactions?.length || 0,
          isSyncing: true // Eerste sync actief
        }
      };
    }

    // 6. Als geen database data, return lege wallet (sync zal data ophalen)
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
        isSyncing: true // Eerste sync actief
      }
    };
  }

  // Haal wallet data uit database
  private async getWalletDataFromDatabase(
    address: string, 
    email: string
  ): Promise<BitcoinWallet & { lastSynced?: Date; fullySynced?: boolean } | null> {
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('address', address)
        .eq('email', email)
        .maybeSingle();

      if (error) {
        logger.error('❌ Error fetching wallet from database:', error);
        return null;
      }

      if (!wallet) {
        logger.debug(`📭 No wallet found in database for ${address.slice(0, 8)}... (${email})`);
        return null;
      }

      // Parse wallet_data JSONB
      const walletData = wallet.wallet_data || {};
      const rawTransactions = walletData.transactions || [];
      const isFullySynced = walletData.fully_synced === true || walletData.is_complete === true;

      // Deduplicatie: verwijder duplicaten bij het laden uit database
      const mappedTransactions = rawTransactions.map((tx: any) => ({
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
      })) as BitcoinTransaction[];
      
      const uniqueTransactions = this.removeDuplicateTransactions(mappedTransactions);
      
      if (uniqueTransactions.length !== mappedTransactions.length) {
        const duplicatesRemoved = mappedTransactions.length - uniqueTransactions.length;
        logger.debug(`🧹 Removed ${duplicatesRemoved} duplicate transactions from database for ${wallet.address.slice(0, 8)}...`);
        
        // Update database met gededupliceerde transacties als er duplicaten waren
        if (duplicatesRemoved > 0) {
          await supabase
            .from('wallets')
            .update({
              wallet_data: {
                ...walletData,
                transactions: uniqueTransactions
              },
              updated_at: new Date().toISOString()
            })
            .eq('address', address)
            .eq('email', email);
        }
      }

      logger.debug(`📦 Loaded wallet from database:`, {
        address: wallet.address.slice(0, 8) + '...',
        email: email,
        balance: wallet.balance,
        transactionCount: wallet.transaction_count,
        transactionsInWalletData: rawTransactions.length,
        uniqueTransactions: uniqueTransactions.length,
        hasWalletData: !!wallet.wallet_data,
        fullySynced: isFullySynced
      });

      return {
        address: wallet.address,
        balance: wallet.balance || 0,
        totalReceived: wallet.total_received || 0,
        totalSent: wallet.total_sent || 0,
        transactionCount: wallet.transaction_count || 0,
        firstSeen: wallet.first_seen ? new Date(wallet.first_seen).getTime() : Date.now(),
        lastSeen: wallet.last_seen ? new Date(wallet.last_seen).getTime() : Date.now(),
        transactions: uniqueTransactions, // Gebruik gededupliceerde transacties
        lastSynced: wallet.updated_at ? new Date(wallet.updated_at) : undefined,
        fullySynced: isFullySynced // Flag om te checken of wallet volledig gesynct is
      };
    } catch (error) {
      logger.error('❌ Error fetching wallet data from database:', error);
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
      
      // Check of we al alle transacties hebben in database
      if (existingData && existingData.transactionCount === totalTxCount && existingData.transactions && existingData.transactions.length === totalTxCount) {
        logger.debug(`✅ Wallet al volledig gesynct: ${totalTxCount} transacties in database = ${totalTxCount} op blockchain`);
        // Update progress: sync compleet
        this.updateProgress(address, {
          totalTransactions: totalTxCount,
          loadedTransactions: totalTxCount,
          isSyncing: false
        });
        return; // Stop sync - alles is al binnen
      }
      
      // Update progress met totaal aantal transacties
      this.updateProgress(address, {
        totalTransactions: totalTxCount,
        loadedTransactions: existingData?.transactions?.length || 0,
        isSyncing: true
      });

      // 2. Haal transacties op in batches van 25 met delays tussen batches
      const BATCH_SIZE = 25;
      const DELAY_BETWEEN_BATCHES_MS = 1500; // 1.5s tussen batches — geen individuele tx fetches meer, dus rate limit risico laag
      const MAX_TRANSACTIONS = 500; // Limiet voor wallets met veel tx's
      
      let allTransactions: BitcoinTransaction[] = [];
      let afterTxid: string | null = null;
      let page = 0;
      let batchNumber = 0;

      while (page < 100 && allTransactions.length < MAX_TRANSACTIONS) {
        if (controller.signal.aborted) {
          logger.debug('Sync cancelled');
          return;
        }

        page++;
        batchNumber++;
        
        // Rate limiting: wacht tussen batches (6 seconden zoals gevraagd)
        if (batchNumber > 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
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

          // Process batch van 25 transacties (of minder als er minder zijn)
          const transactionsToProcess = pageTransactions.slice(0, BATCH_SIZE);

          // Process deze batch transacties
          const processedBatch = await this.processTransactionsBatch(
            transactionsToProcess,
            address,
            controller.signal
          );

          // Deduplicatie: voeg alleen nieuwe transacties toe (op basis van hash + time)
          const existingKeys = new Set(allTransactions.map(tx => `${tx.hash}-${tx.time}`));
          const newTransactions = processedBatch.filter(tx => {
            const key = `${tx.hash}-${tx.time}`;
            if (existingKeys.has(key)) {
              logger.debug(`⚠️ Duplicate transaction skipped: ${tx.hash.slice(0, 8)}... (time: ${tx.time})`);
              return false;
            }
            existingKeys.add(key);
            return true;
          });

          allTransactions = allTransactions.concat(newTransactions);

          // Update progress (alleen voor tracking, frontend wacht tot 100%)
          this.updateProgress(address, {
            totalTransactions: totalTxCount,
            loadedTransactions: allTransactions.length,
            isSyncing: true
          });

          // Sla batch op in database (incrementeel) - maar frontend wacht tot 100%
          await this.saveWalletDataToDatabase(
            address,
            email,
            walletData,
            allTransactions,
            false // nog niet klaar
          );
          
          logger.debug(`✅ Batch ${batchNumber} (${newTransactions.length} nieuwe transacties) opgeslagen voor ${address.slice(0, 8)}... - Totaal: ${allTransactions.length}/${totalTxCount}`);

          // Check of we alle transacties hebben - stop wanneer aantal klopt met blockchain
          if (allTransactions.length >= totalTxCount) {
            logger.debug(`✅ Alle transacties opgehaald: ${allTransactions.length} van ${totalTxCount} (blockchain)`);
            break;
          }
          
          // Check of we klaar zijn - stop wanneer geen transacties meer
          if (pageTransactions.length < BATCH_SIZE) {
            logger.debug(`✅ Sync compleet: ${allTransactions.length} transacties opgehaald (geen transacties meer)`);
            break;
          }
          
          // Alleen stoppen bij MAX_TRANSACTIONS als we echt te veel hebben (veiligheid)
          if (allTransactions.length >= MAX_TRANSACTIONS && totalTxCount > MAX_TRANSACTIONS) {
            logger.debug(`⚠️ Max transacties bereikt: ${allTransactions.length} van ${totalTxCount} (max: ${MAX_TRANSACTIONS})`);
            break;
          }

          // Set up next page - gebruik laatste transactie van deze batch
          const lastTx = transactionsToProcess[transactionsToProcess.length - 1];
          if (lastTx?.txid) {
            afterTxid = lastTx.txid;
          } else if (pageTransactions.length > 0) {
            // Fallback: gebruik laatste van volledige pagina
            const fallbackLastTx = pageTransactions[pageTransactions.length - 1];
            if (fallbackLastTx?.txid) {
              afterTxid = fallbackLastTx.txid;
            } else {
              break;
            }
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

      // Update progress: sync compleet - niet meer syncen
      this.updateProgress(address, {
        totalTransactions: allTransactions.length,
        loadedTransactions: allTransactions.length,
        isSyncing: false // Sync compleet, niet meer syncen
      });

      logger.debug(`✅ Background sync completed for ${address.slice(0, 8)}... - wallet is nu volledig gesynct`);
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
  // Gebruikt de data uit het /txs endpoint direct — GEEN individuele tx fetches meer
  private async processTransactionsBatch(
    pageTransactions: any[],
    address: string,
    signal: AbortSignal
  ): Promise<BitcoinTransaction[]> {
    if (signal.aborted) return [];

    // Haal huidige prijs 1x op voor de hele batch
    let currentPrice: number;
    try {
      currentPrice = await bitcoinApiService.getCurrentPrice();
    } catch {
      currentPrice = 50000; // Laatste fallback
    }

    // Verzamel alle unieke datums voor een gebatched Supabase prijsopzoek (1 query i.p.v. 25)
    const datumSet = new Set<string>();
    for (const tx of pageTransactions) {
      const blockTime = tx.status?.block_time || tx.time;
      if (blockTime) datumSet.add(new Date(blockTime * 1000).toISOString().split('T')[0]);
    }

    // 1 Supabase query voor alle datums in de batch
    const prijsMap = new Map<string, number>();
    if (datumSet.size > 0) {
      try {
        const { data: prijsData } = await supabase
          .from('bitcoin_price_data')
          .select('date, price_usd')
          .in('date', Array.from(datumSet));
        if (prijsData) {
          for (const row of prijsData) {
            prijsMap.set(row.date, parseFloat(row.price_usd));
          }
        }
      } catch {
        // Fallback: alle datums krijgen currentPrice
      }
    }

    const processed: BitcoinTransaction[] = [];

    for (const tx of pageTransactions) {
      if (signal.aborted) break;

      try {
        // /txs endpoint geeft al volledige vin/vout/status mee — geen extra fetch nodig
        const relevantOutputs = (tx.vout || []).filter((vout: any) =>
          vout.scriptpubkey_address === address
        );

        let totalSent = 0;
        for (const vin of (tx.vin || [])) {
          if (vin.prevout?.scriptpubkey_address === address) {
            totalSent += vin.prevout.value || 0;
          }
        }

        const totalReceived = relevantOutputs.reduce((sum: number, vout: any) => sum + vout.value, 0);
        const netValue = totalReceived - totalSent;
        if (netValue === 0) continue;

        const blockTime = tx.status?.block_time || tx.time;
        if (!blockTime) continue;

        const isPending = !tx.status?.confirmed;
        const isSend = netValue < 0;
        const valueInBTC = Math.abs(netValue) / 100000000;
        const dateStr = new Date(blockTime * 1000).toISOString().split('T')[0];
        const priceAtTime = prijsMap.get(dateStr) || currentPrice;

        const valueInSatoshis = isSend ? -Math.abs(netValue) : Math.abs(netValue);
        const currentValueUSD = valueInBTC * currentPrice;
        const profitUSD = isSend
          ? -(currentValueUSD - valueInBTC * priceAtTime)
          : currentValueUSD - valueInBTC * priceAtTime;
        const profitPercent = priceAtTime > 0 ? ((currentPrice - priceAtTime) / priceAtTime) * 100 : 0;

        processed.push({
          hash: tx.txid,
          time: blockTime,
          value: valueInSatoshis,
          price: priceAtTime,
          currentValue: isSend ? -currentValueUSD : currentValueUSD,
          profit: profitUSD,
          profitPercent,
          valueInBTC,
          status: isPending ? 'pending' : 'confirmed',
          confirmations: 0
        });
      } catch (error) {
        logger.debug(`Error processing transaction ${tx.txid}:`, error);
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
      // Deduplicatie: verwijder duplicaten op basis van hash + time
      const uniqueTransactions = this.removeDuplicateTransactions(transactions);
      
      if (uniqueTransactions.length !== transactions.length) {
        const duplicatesRemoved = transactions.length - uniqueTransactions.length;
        logger.debug(`🧹 Removed ${duplicatesRemoved} duplicate transactions before saving to database`);
      }

      const fundedSatoshis = walletData.chain_stats?.funded_txo_sum || 0;
      const spentSatoshis = walletData.chain_stats?.spent_txo_sum || 0;
      const balanceSatoshis = fundedSatoshis - spentSatoshis;

      // Bereken total_investment (alleen buy transacties: value > 0)
      const totalInvestment = uniqueTransactions
        .filter(tx => tx.value > 0) // Alleen buy transacties
        .reduce((sum, tx) => {
          const btcAmount = Math.abs(tx.value) / 100000000;
          return sum + (btcAmount * tx.price);
        }, 0);

      const updateData: any = {
        balance: balanceSatoshis / 100000000,
        transaction_count: walletData.chain_stats?.tx_count || 0,
        total_received: fundedSatoshis / 100000000,
        total_sent: spentSatoshis / 100000000,
        total_investment: totalInvestment, // Sla total investment op in database
        last_seen: new Date().toISOString(),
        wallet_data: {
          transactions: uniqueTransactions, // Gebruik gededupliceerde transacties
          synced_at: new Date().toISOString(),
          is_complete: isComplete,
          fully_synced: isComplete // Markeer als volledig gesynct
        },
        updated_at: new Date().toISOString()
      };

      if (uniqueTransactions.length > 0) {
        // Sorteer op tijd (nieuwste eerst) voor last_transaction
        const sortedTxs = [...uniqueTransactions].sort((a, b) => b.time - a.time);
        const lastTx = sortedTxs[0];
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
        logger.debug(`💾 Saved ${uniqueTransactions.length} unique transactions to database for ${address.slice(0, 8)}...`);
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

  // Helper: verwijder duplicaten op basis van hash + time
  private removeDuplicateTransactions(transactions: BitcoinTransaction[]): BitcoinTransaction[] {
    const seen = new Map<string, BitcoinTransaction>();
    
    for (const tx of transactions) {
      const key = `${tx.hash || ''}-${tx.time || 0}`;
      // Behoud de eerste (oudste) transactie als er duplicaten zijn
      if (!seen.has(key)) {
        seen.set(key, tx);
      } else {
        // Als er al een transactie is met deze key, check of deze nieuwer is
        const existing = seen.get(key)!;
        if (tx.time && existing.time && tx.time < existing.time) {
          seen.set(key, tx); // Vervang met oudere transactie
        }
      }
    }
    
    return Array.from(seen.values());
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

