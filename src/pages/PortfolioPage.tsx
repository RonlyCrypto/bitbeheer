import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Shield,
  Loader2,
  X,
  Settings,
  Edit,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PortfolioChart from '../components/PortfolioChart';
import TransactionBlock from '../components/TransactionBlock';
import TransactionDetailsPopup from '../components/TransactionDetailsPopup';
import TransactionOverrideModal from '../components/TransactionOverrideModal';
import CurrencyToggle from '../components/CurrencyToggle';
import CycleAdvisorWidget from '../components/CycleAdvisorWidget';
import BitcoinMilestones from '../components/BitcoinMilestones';
import { bitcoinApiService, BitcoinWallet, BitcoinTransaction } from '../services/bitcoinApiService';
import { walletDataService, WalletSyncProgress } from '../services/walletDataService';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { computeFifoMatches, txKey } from '../utils/fifoMatching';
import { getOverridesForWallet, saveTransactionOverride, TransactionOverride } from '../services/transactionOverrideService';

interface WalletData {
  id: string;
  name: string;
  address: string;
  balance: number;
  transactions: number;
  firstSeen: string;
  realData?: BitcoinWallet;
  total_investment?: number; // Total investment uit database
}

export default function PortfolioPage() {
  const { user } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser } = usePermissions();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletName, setNewWalletName] = useState('');
  const [showBalances, setShowBalances] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(() => {
    try { const c = JSON.parse(localStorage.getItem('btc_market_cache') || 'null'); return c?.price || 96640; } catch { return 96640; }
  });
  const [allTransactions, setAllTransactions] = useState<BitcoinTransaction[]>([]);

  // Helper function to remove duplicate transactions based on hash + time
  const removeDuplicateTransactions = (transactions: BitcoinTransaction[]): BitcoinTransaction[] => {
    const seen = new Set<string>();
    return transactions.filter(tx => {
      const key = `${tx.hash || ''}-${tx.time || 0}`;
      if (seen.has(key)) {
        return false; // Duplicate, skip
      }
      seen.add(key);
      return true; // Unique, keep
    });
  };
  const [selectedTransaction, setSelectedTransaction] = useState<BitcoinTransaction | null>(null);
  const [editingOverrideTx, setEditingOverrideTx] = useState<BitcoinTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'buy' | 'sell' | 'active' | 'sold'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  // Single shared FIFO cost-basis match (which buy lots each sell drew from, and
  // how much of each buy is sold vs. still held) — see src/utils/fifoMatching.ts.
  const fifoMatches = useMemo(() => computeFifoMatches(allTransactions), [allTransactions]);

  // Single predicate for the transaction filter tabs, backed by the shared FIFO
  // match above instead of each caller recomputing sold-status independently.
  const matchesTransactionFilter = (tx: BitcoinTransaction, filter: typeof transactionFilter): boolean => {
    if (filter === 'all') return true;
    if (filter === 'buy') return tx.value > 0;
    if (filter === 'sell') return tx.value < 0;
    if (filter === 'active') return tx.value > 0 && !(fifoMatches.buys.get(txKey(tx))?.isFullySold);
    if (filter === 'sold') return tx.value > 0 && !!(fifoMatches.buys.get(txKey(tx))?.isFullySold);
    return true;
  };
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showEditWallet, setShowEditWallet] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<WalletData | null>(null);
  const [editWalletName, setEditWalletName] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const wasSyncingRef = useRef(false);
  const [walletSyncProgress, setWalletSyncProgress] = useState<Map<string, WalletSyncProgress>>(new Map());
  const [walletChartIntegration, setWalletChartIntegration] = useState<Map<string, boolean>>(new Map());
  const [walletRefreshing, setWalletRefreshing] = useState<Map<string, boolean>>(new Map());

  // Get effective user email (considering impersonation)
  const effectiveUserEmail = (isImpersonating && impersonatedUser)
    ? impersonatedUser
    : user?.email;

  // Manual per-transaction overrides (exchange label / price / note), see
  // src/services/transactionOverrideService.ts. Kept in a ref so the merge
  // helper below can be called from stale closures (background sync, "load
  // more") without becoming a dependency of every effect that touches it.
  const overridesMapRef = useRef<Map<string, TransactionOverride>>(new Map());

  const applyTransactionOverrides = (transactions: BitcoinTransaction[]): BitcoinTransaction[] => {
    if (overridesMapRef.current.size === 0) return transactions;
    return transactions.map(tx => {
      const override = overridesMapRef.current.get(txKey(tx));
      if (!override) return tx;

      const valueInBTC = Math.abs(tx.value) / 100000000;
      const isSend = tx.value < 0;
      const price = override.priceOverride ?? tx.price;
      const currentValueUSD = valueInBTC * currentPrice;
      const profit = isSend
        ? -(currentValueUSD - valueInBTC * price)
        : currentValueUSD - valueInBTC * price;
      const profitPercent = price > 0 ? ((currentPrice - price) / price) * 100 : 0;

      return {
        ...tx,
        price,
        currentValue: isSend ? -currentValueUSD : currentValueUSD,
        profit,
        profitPercent,
        priceOverridden: override.priceOverride != null,
        exchangeLabel: override.exchangeLabel,
        note: override.note,
      };
    });
  };

  // Load overrides whenever the wallet list changes, then re-apply them to
  // whatever transactions are already loaded.
  useEffect(() => {
    const loadOverrides = async () => {
      if (!effectiveUserEmail || wallets.length === 0) {
        overridesMapRef.current = new Map();
        return;
      }
      const map = new Map<string, TransactionOverride>();
      for (const wallet of wallets) {
        if (!wallet.address) continue;
        const walletOverrides = await getOverridesForWallet(effectiveUserEmail, wallet.address);
        walletOverrides.forEach((value, key) => map.set(key, value));
      }
      overridesMapRef.current = map;
      setAllTransactions(prev => applyTransactionOverrides(prev));
    };
    loadOverrides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserEmail, wallets.map(w => w.address).join(',')]);

  const handleSaveOverride = async (data: { exchangeLabel?: string; priceOverride?: number; note?: string }) => {
    if (!editingOverrideTx || !effectiveUserEmail) return;
    const wallet = wallets.find(w =>
      w.realData?.transactions?.some(t => t.hash === editingOverrideTx.hash && t.time === editingOverrideTx.time)
    );
    if (!wallet?.address) return;

    const ok = await saveTransactionOverride(effectiveUserEmail, wallet.address, editingOverrideTx.hash, editingOverrideTx.time, data);
    if (ok) {
      overridesMapRef.current.set(txKey(editingOverrideTx), data);
      setAllTransactions(prev => applyTransactionOverrides(prev));
      showToast('Transactie bijgewerkt', 'success');
    } else {
      showToast('Opslaan mislukt, probeer het opnieuw', 'error');
    }
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Load wallets from Supabase (wallets added in OverviewTab)
  // Defined outside useEffect so it can also be called from addWallet
  const loadWallets = async () => {
      if (!effectiveUserEmail) {
        console.log('⚠️ No email provided for wallet loading');
        setLoadingWallets(false);
        return;
      }

      try {
        setLoadingWallets(true);
        console.log(`🔄 Loading wallets for email: ${effectiveUserEmail}`);
        
        const { data: walletsData, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('email', effectiveUserEmail)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error loading wallets:', error);
          setWallets([]);
          setLoadingWallets(false);
          return;
        }

        if (walletsData && walletsData.length > 0) {
          console.log(`📦 Loaded ${walletsData.length} wallet(s) from Supabase`, walletsData);
          // Convert Supabase wallet data to WalletData format
          const walletsList: WalletData[] = await Promise.all(
            walletsData.map(async (wallet: any) => {
              console.log('🔍 Processing wallet:', { id: wallet.id, address: wallet.address, hasBalance: wallet.balance !== null, hasWalletData: !!wallet.wallet_data });
              
              // Gebruik nieuwe walletDataService - haalt eerst uit database, start background sync
              let realData: BitcoinWallet | undefined;
              
              try {
                const walletDataWithProgress = await walletDataService.getWalletData(
                  wallet.address,
                  effectiveUserEmail!,
                  (progress) => {
                    // Update progress state
                    setWalletSyncProgress(prev => {
                      const newMap = new Map(prev);
                      newMap.set(wallet.address, progress);
                      return newMap;
                    });
                  }
                );

                realData = walletDataWithProgress;
              } catch (error) {
                console.error('Error fetching wallet data:', error);
                // Fallback: use basic data from database
                realData = {
                  address: wallet.address,
                  balance: wallet.balance || 0,
                  totalReceived: wallet.total_received || 0,
                  totalSent: wallet.total_sent || 0,
                  transactionCount: wallet.transaction_count || 0,
                  firstSeen: wallet.first_seen ? new Date(wallet.first_seen).getTime() : Date.now(),
                  lastSeen: wallet.last_seen ? new Date(wallet.last_seen).getTime() : Date.now(),
                  transactions: wallet.wallet_data?.transactions || []
                };
              }

              // Format firstSeen date safely
              let firstSeenDate = new Date().toISOString().split('T')[0];
              if (wallet.first_seen) {
                try {
                  const date = new Date(wallet.first_seen);
                  if (!isNaN(date.getTime())) {
                    firstSeenDate = date.toISOString().split('T')[0];
                  } else if (wallet.created_at) {
                    const fallbackDate = new Date(wallet.created_at);
                    if (!isNaN(fallbackDate.getTime())) {
                      firstSeenDate = fallbackDate.toISOString().split('T')[0];
                    }
                  }
                } catch (e) {
                  // Use created_at as fallback
                  if (wallet.created_at) {
                    try {
                      const fallbackDate = new Date(wallet.created_at);
                      if (!isNaN(fallbackDate.getTime())) {
                        firstSeenDate = fallbackDate.toISOString().split('T')[0];
                      }
                    } catch {}
                  }
                }
              } else if (wallet.created_at) {
                try {
                  const date = new Date(wallet.created_at);
                  if (!isNaN(date.getTime())) {
                    firstSeenDate = date.toISOString().split('T')[0];
                  }
                } catch {}
              }

              return {
                id: wallet.id,
                name: wallet.name || 'Mijn Bitcoin Wallet',
                address: wallet.address,
                balance: realData?.balance || wallet.balance || 0,
                transactions: wallet.transaction_count || 0,
                firstSeen: firstSeenDate,
                realData,
                total_investment: wallet.total_investment || 0 // Haal total_investment uit database
              };
            })
          );

          console.log('✅ Processed wallets:', walletsList.length);
          setWallets(walletsList);
        } else {
          console.log('⚠️ No wallets found in database');
          setWallets([]);
        }
      } catch (error) {
        console.error('Error loading wallets:', error);
        setWallets([]);
      } finally {
        setLoadingWallets(false);
      }
  };

  useEffect(() => {
    loadWallets();

    // Listen for wallet updates from OverviewTab
    const handleWalletUpdate = () => {
      loadWallets();
    };
    window.addEventListener('walletUpdated', handleWalletUpdate);

    return () => {
      window.removeEventListener('walletUpdated', handleWalletUpdate);
    };
  }, [effectiveUserEmail]);

  // Haal huidige Bitcoin prijs op — zelfde cache als FrontPage
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin', { signal: AbortSignal.timeout(8000) });
        const [data] = await res.json();
        setCurrentPrice(data.current_price);
        const athDate = data.ath_date ? new Date(data.ath_date).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' }) : null;
        localStorage.setItem('btc_market_cache', JSON.stringify({ price: data.current_price, change24h: data.price_change_percentage_24h, ath: data.ath, athDate, cachedAt: Date.now() }));
      } catch (error) {
        console.error('Error fetching current price:', error);
        try { const p = await bitcoinApiService.getCurrentPrice(); setCurrentPrice(p); } catch {}
      }
    };

    fetchCurrentPrice();
    const interval = setInterval(fetchCurrentPrice, 60000); // Update elke minuut
    return () => clearInterval(interval);
  }, []);

  // Initialize chart integration state from localStorage for all wallets
  useEffect(() => {
    const newMap = new Map<string, boolean>();
    wallets.forEach(wallet => {
      // Null check voor wallet.id
      if (!wallet.id) return;
      
      const key = `chartIntegration_${wallet.id}`;
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        newMap.set(wallet.id, saved === 'true');
      } else {
        newMap.set(wallet.id, true); // Default: visible
      }
    });
    setWalletChartIntegration(prev => {
      // Merge with existing state, only update wallets that aren't in state yet
      const merged = new Map(prev);
      newMap.forEach((value, key) => {
        if (!merged.has(key)) {
          merged.set(key, value);
        }
      });
      return merged;
    });
  }, [wallets]);

  // Update transacties wanneer wallets veranderen
  useEffect(() => {
    const updateTransactions = async () => {
      const allTx: BitcoinTransaction[] = [];
      for (const wallet of wallets) {
        if (wallet.realData?.transactions) {
          console.log(`📦 Wallet ${wallet.name}: ${wallet.realData.transactions.length} transacties`);
          allTx.push(...wallet.realData.transactions);
        }
      }
      const unique = removeDuplicateTransactions(allTx);
      console.log(`📊 Totaal unieke transacties: ${unique.length} van ${allTx.length} totaal`);
      setAllTransactions(applyTransactionOverrides(unique));
    };

    updateTransactions();
  }, [wallets]);

  // Update alleen progress tijdens sync - GEEN data updates tot 100% geladen
  // Frontend toont alleen progress getal, maar transacties lijst blijft ongewijzigd tot sync compleet is
  useEffect(() => {
    const hasActiveSync = Array.from(walletSyncProgress.values()).some(p => p.isSyncing);
    
    // Als er geen actieve sync is, hoef je niets te doen
    // Progress wordt al bijgewerkt via de callback in getWalletData
    if (!hasActiveSync) return;
    
    // Tijdens sync: alleen progress indicator updaten, GEEN transacties/amounts updaten
    // Dit voorkomt dat de UI "springt" tijdens het laden
    // De transacties worden pas getoond wanneer sync 100% compleet is (zie useEffect hieronder)
  }, [walletSyncProgress]);

  // Automatische detectie van nieuwe transacties - check elke 30 seconden
  useEffect(() => {
    if (!effectiveUserEmail || wallets.length === 0) return;
    
    const checkForNewTransactions = async () => {
      try {
        for (const wallet of wallets) {
          if (!wallet.realData?.transactions || wallet.realData.transactions.length === 0) continue;
          
          const lastTransaction = wallet.realData.transactions[0];
          const lastKnownTxHash = lastTransaction?.hash || null;
          
          if (!lastKnownTxHash) continue;
          
          // Check for new transactions via Blockstream API
          const { hasNew, newTxHash } = await bitcoinApiService.checkForNewTransactions(
            wallet.address,
            lastKnownTxHash
          );
          
          if (hasNew) {
            console.log(`🔄 Nieuwe transactie gedetecteerd voor ${wallet.name}! Wallet wordt ververst...`, { newTxHash });
            
            // Clear cache en haal fresh data op
            bitcoinApiService.clearWalletCache(wallet.address);
            
            // Gebruik walletDataService om nieuwe transacties op te halen en op te slaan
            const walletDataWithProgress = await walletDataService.getWalletData(
              wallet.address,
              effectiveUserEmail!,
              (progress) => {
                setWalletSyncProgress(prev => {
                  const newMap = new Map(prev);
                  newMap.set(wallet.address, progress);
                  return newMap;
                });
              }
            );
            
            // Update wallet in state
            setWallets(prevWallets => prevWallets.map(w => 
              w.address === wallet.address 
                ? { ...w, realData: walletDataWithProgress }
                : w
            ));
            
            console.log(`✅ Wallet ${wallet.name} bijgewerkt met nieuwe transacties`);
          }
        }
      } catch (error) {
        console.error('Error checking for new transactions:', error);
      }
    };
    
    // Check direct en dan elke 30 seconden
    checkForNewTransactions();
    const intervalId = setInterval(checkForNewTransactions, 30000);
    
    return () => clearInterval(intervalId);
  }, [wallets, effectiveUserEmail]);

  // Reload wallets wanneer sync 100% compleet is
  useEffect(() => {
    const isSyncing = Array.from(walletSyncProgress.values()).some(p => p.isSyncing);
    const justCompleted = wasSyncingRef.current && !isSyncing;
    wasSyncingRef.current = isSyncing;

    if (justCompleted) {
      // Wacht even zodat database update compleet is
      setTimeout(async () => {
        if (!effectiveUserEmail) return;
        
        try {
          const { data: walletsData } = await supabase
            .from('wallets')
            .select('*')
            .eq('email', effectiveUserEmail)
            .order('created_at', { ascending: false });

          if (walletsData && walletsData.length > 0) {
            // Update wallets met volledige data (alleen bij 100% compleet)
            setWallets(prevWallets => 
              prevWallets.map(prevWallet => {
                const dbWallet = walletsData.find((w: any) => w.address === prevWallet.address);
                if (!dbWallet) return prevWallet;

                const walletData = dbWallet.wallet_data || {};
                const transactions = walletData.transactions || [];

                const realData: BitcoinWallet = {
                  address: dbWallet.address,
                  balance: dbWallet.balance || 0,
                  totalReceived: dbWallet.total_received || 0,
                  totalSent: dbWallet.total_sent || 0,
                  transactionCount: dbWallet.transaction_count || 0,
                  firstSeen: dbWallet.first_seen ? new Date(dbWallet.first_seen).getTime() : Date.now(),
                  lastSeen: dbWallet.last_seen ? new Date(dbWallet.last_seen).getTime() : Date.now(),
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
                  })) as BitcoinTransaction[]
                };

                return {
                  ...prevWallet,
                  balance: realData.balance,
                  transactions: dbWallet.transaction_count || 0,
                  total_investment: dbWallet.total_investment || 0,
                  realData // Update met volledige transacties (alleen bij 100%)
                };
              })
            );
            
            // Update allTransactions met ALLE transacties (alleen bij 100% compleet)
            const allTx: BitcoinTransaction[] = [];
            walletsData.forEach((w: any) => {
              const walletData = w.wallet_data || {};
              const transactions = walletData.transactions || [];
              allTx.push(...transactions.map((tx: any) => ({
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
              })) as BitcoinTransaction[]);
            });
            setAllTransactions(applyTransactionOverrides(removeDuplicateTransactions(allTx)));

            console.log(`✅ Sync compleet: ${allTx.length} transacties geladen en getoond`);
          }
        } catch (error) {
          console.error('Error reloading wallets after sync:', error);
        }
      }, 1000);
    }
  }, [walletSyncProgress, effectiveUserEmail]);

  // Lazy load next batch of transactions
  const loadMoreTransactions = async () => {
    const nextPage = currentPage + 1;
    const maxPages = Math.ceil(allTransactions.length / itemsPerPage);
    
    // Check if we need to load more data
    if (nextPage > maxPages) {
      console.log('🔄 Loading next batch of transactions...');
      setIsLoadingMore(true);
      
      try {
        for (const wallet of wallets) {
          if (wallet.realData?.address) {
            try {
              const moreData = await bitcoinApiService.getTransactionsPage(wallet.realData.address, nextPage, itemsPerPage);
              
              if (moreData.length > 0) {
                setAllTransactions(prev => applyTransactionOverrides(removeDuplicateTransactions([...prev, ...moreData])));
                console.log(`✅ Loaded ${moreData.length} more transactions`);
              } else {
                console.log('✓ No more transactions to load');
              }
            } catch (error) {
              console.error('Error loading more transactions:', error);
            }
          }
        }
      } finally {
        setIsLoadingMore(false);
      }
    }
    
    setCurrentPage(nextPage);
  };

  // Refresh transaction prices from blockchain
  const refreshTransactionPrices = async () => {
    setLoadingWallets(true);
    try {
      const updatedWallets: WalletData[] = [];
      
      for (const wallet of wallets) {
        try {
          // Fetch fresh data from blockchain (get current amount of transactions)
          const freshData = await bitcoinApiService.getWalletData(wallet.address, allTransactions.length);
          
          // Update Supabase with fresh wallet data
          await supabase
            .from('wallets')
            .update({
              wallet_data: { transactions: freshData.transactions },
              updated_at: new Date().toISOString()
            })
            .eq('id', wallet.id);
          
          // Update local state with fresh data
          updatedWallets.push({
            ...wallet,
            realData: freshData
          });
          
          console.log(`✅ Refreshed transactions for ${wallet.name}`);
        } catch (error) {
          console.error(`Error refreshing wallet ${wallet.address}:`, error);
          updatedWallets.push(wallet);
        }
      }
      
      setWallets(updatedWallets);
      console.log('✅ All transactions refreshed with latest prices from blockchain');
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      showToast('Kon transacties niet verversen. Probeer het later opnieuw.');
    } finally {
      setLoadingWallets(false);
    }
  };

  const addWallet = async () => {
    if (newWalletAddress && newWalletName) {
      // Valideer Bitcoin adres — trim whitespace eerst
      const trimmedAddress = newWalletAddress.trim();
      if (!bitcoinApiService.validateBitcoinAddress(trimmedAddress)) {
        showToast(`Ongeldig Bitcoin adres. Verwacht: begint met 1, 3 of bc1.`);
        return;
      }

      setLoading(true);
      try {
        // Gebruik altijd de ingelogde user, niet effectiveUserEmail (voor RLS)
        const insertEmail = user?.email;
        const insertUserId = user?.id;
        if (!insertEmail) {
          showToast('Niet ingelogd. Log opnieuw in en probeer het opnieuw.');
          return;
        }

        // 1. Verwijder eventuele stale rij
        await supabase
          .from('wallets')
          .delete()
          .eq('email', insertEmail)
          .eq('address', trimmedAddress);

        // 2. Vers invoegen — zelfde minimale velden als UserDashboard (werkt met RLS)
        const { error: insertError } = await supabase
          .from('wallets')
          .insert([{
            email: insertEmail,
            ...(insertUserId ? { user_id: insertUserId } : {}),
            address: trimmedAddress,
            name: newWalletName.trim(),
            type: 'bitcoin',
            created_at: new Date().toISOString(),
          }]);

        if (insertError) {
          console.error('Insert error details:', JSON.stringify(insertError));
          showToast(`Kon wallet niet toevoegen: ${insertError.message}`);
          return;
        }

        const walletAddressToUse = trimmedAddress;

        // 2. OPTIMISTIC UI: Add wallet to UI with placeholder data
        const newWallet: WalletData = {
          id: Date.now().toString(),
          name: newWalletName.trim(),
          address: walletAddressToUse,
          balance: 0,
          transactions: 0,
          firstSeen: new Date().toISOString().split('T')[0],
          realData: undefined
        };

        setWallets([...wallets, newWallet]);
        setNewWalletAddress('');
        setNewWalletName('');
        setShowAddWallet(false);

        // Set initial loading state for this wallet
        setWalletSyncProgress(prev => {
          const newMap = new Map(prev);
          newMap.set(walletAddressToUse, {
            totalTransactions: 0,
            loadedTransactions: 0,
            isSyncing: true
          });
          return newMap;
        });

        // 3. BACKGROUND PROCESSING: Start sync
        setTimeout(async () => {
          try {
            const walletDataWithProgress = await walletDataService.getWalletData(
              walletAddressToUse,
              effectiveUserEmail!,
              (progress) => {
                setWalletSyncProgress(prev => {
                  const newMap = new Map(prev);
                  newMap.set(walletAddressToUse, progress);
                  return newMap;
                });
                if (progress.loadedTransactions > 0 && progress.loadedTransactions % 25 === 0) {
                  loadWallets();
                }
              }
            );

            setWallets(prevWallets =>
              prevWallets.map(w =>
                w.address === walletAddressToUse
                  ? {
                      ...w,
                      balance: walletDataWithProgress.balance,
                      transactions: walletDataWithProgress.transactionCount,
                      firstSeen: new Date(walletDataWithProgress.firstSeen).toISOString().split('T')[0],
                      realData: walletDataWithProgress
                    }
                  : w
              )
            );
            console.log('✅ Wallet sync started:', walletAddressToUse);
          } catch (error) {
            console.error('⚠️ Background wallet sync failed:', error);
          }
        }, 500);
      } catch (error) {
        console.error('Error adding wallet:', error);
        showToast('Kon wallet niet toevoegen. Probeer opnieuw.');
      } finally {
        setLoading(false);
      }
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<WalletData | null>(null);

  const handleDeleteClick = (wallet: WalletData) => {
    setWalletToDelete(wallet);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleEditClick = (wallet: WalletData) => {
    setWalletToEdit(wallet);
    setEditWalletName(wallet.name);
    setShowEditWallet(true);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!walletToEdit || !editWalletName.trim() || !effectiveUserEmail) return;

    try {
      const { error } = await supabase
        .from('wallets')
        .update({ name: editWalletName.trim() })
        .eq('id', walletToEdit.id)
        .eq('email', effectiveUserEmail);

      if (error) throw error;

      setWallets(wallets.map(w => 
        w.id === walletToEdit.id ? { ...w, name: editWalletName.trim() } : w
      ));

      setShowEditWallet(false);
      setWalletToEdit(null);
      setEditWalletName('');
    } catch (error) {
      console.error('Error updating wallet name:', error);
      showToast('Fout bij het bijwerken van de wallet naam.');
    }
  };

  const removeWallet = async () => {
    if (!walletToDelete || !effectiveUserEmail) return;

    try {
      // Get wallet data before deletion for history
      const walletBeforeDelete = wallets.find(w => w.id === walletToDelete.id);
      
      // Insert into wallet_history before deleting
      const { error: historyError } = await supabase
        .from('wallet_history')
        .insert([{
          user_email: effectiveUserEmail,
          wallet_id: walletToDelete.id,
          wallet_address: walletToDelete.address,
          wallet_name: walletToDelete.name,
          action: 'removed',
          wallet_balance: walletToDelete.balance,
          transaction_count: walletToDelete.transactions,
          removed_at: new Date().toISOString(),
          wallet_data_snapshot: walletBeforeDelete?.realData ? {
            balance: walletBeforeDelete.balance,
            transactions: walletBeforeDelete.realData.transactions || [],
            transactionCount: walletBeforeDelete.transactions
          } : null
        }]);

      if (historyError) {
        console.error('Error saving wallet history:', historyError);
        // Continue with deletion even if history fails
      }

      // Delete wallet from database
      const { error: deleteError } = await supabase
        .from('wallets')
        .delete()
        .eq('id', walletToDelete.id)
        .eq('email', effectiveUserEmail);

      if (deleteError) throw deleteError;

      // Update local state
      setWallets(wallets.filter(wallet => wallet.id !== walletToDelete.id));
      
      // Trigger wallet update event to refresh OverviewTab
      window.dispatchEvent(new CustomEvent('walletUpdated'));
      
      // Close confirmation popup
      setShowDeleteConfirm(false);
      setWalletToDelete(null);
    } catch (error) {
      console.error('Error removing wallet:', error);
      showToast('Fout bij het verwijderen van wallet.');
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalTransactions = wallets.reduce((sum, wallet) => sum + wallet.transactions, 0);
  const totalValue = totalBalance * currentPrice;
  const totalProfit = allTransactions.reduce((sum, tx) => sum + tx.profit, 0);
  
  // Bereken totaal aantal transacties op blockchain (van alle wallets)
  const totalTransactionsOnBlockchain = wallets.reduce((sum, wallet) => {
    return sum + ((wallet.realData?.transactionCount) || (wallet as any).transaction_count || wallet.transactions || 0);
  }, 0);
  
  // Aantal geladen transacties - gebruik allTransactions.length (werkelijke aantal geladen)
  const loadedTransactions = allTransactions.length;
  
  // Check of er actieve sync is
  const hasActiveSync = Array.from(walletSyncProgress.values()).some(p => p.isSyncing);
  
  // Haal total investment op uit database (per wallet opgeslagen)
  // Fallback naar berekening als database waarde niet beschikbaar is
  const totalInvestmentFromDb = wallets.reduce((sum, wallet) => {
    // Check of wallet total_investment heeft in database
    const walletInvestment = (wallet as any).total_investment || 0;
    return sum + walletInvestment;
  }, 0);
  
  // Fallback: bereken uit transacties als database waarde 0 is
  const totalInvestmentCalculated = allTransactions
    .filter(tx => tx.value > 0) // Only buy transactions
    .reduce((sum, tx) => {
      const btcAmount = Math.abs(tx.value) / 100000000;
      return sum + (btcAmount * tx.price);
    }, 0);
  
  // Gebruik database waarde als beschikbaar, anders berekende waarde
  const totalInvestment = totalInvestmentFromDb > 0 ? totalInvestmentFromDb : totalInvestmentCalculated;
  
  // Calculate profit percentage
  const profitPercentage = totalInvestment > 0
    ? ((totalValue - totalInvestment) / totalInvestment) * 100
    : 0;

  // Totaal verkocht (alle sells), voor de Inleg-kaart
  const totalSoldBtc = Array.from(fifoMatches.sells.values()).reduce((sum, s) => sum + s.soldBtc, 0);
  const totalSoldValue = Array.from(fifoMatches.sells.values()).reduce((sum, s) => sum + s.proceeds, 0);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* H1 Tag for SEO */}
      <h1 className="sr-only">Bitcoin Portfolio Beheer - Bewaar en Monitor Je Bitcoin Wallets</h1>

      {/* Toast notificatie */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
          toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {toast.type === 'error'
            ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
            : <Check className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="container mx-auto px-4 py-0 md:py-0 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {/* BTC Saldo */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-100 p-2 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">BTC Saldo</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none">
                {showBalances ? totalBalance.toFixed(4) : '••••'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Bitcoin saldo
                {showBalances && (
                  <span className="ml-1 font-semibold text-gray-600">
                    · ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                )}
              </p>
            </div>

            {/* Transacties */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <Shield className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transacties</span>
                {hasActiveSync && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none">
                {totalTransactionsOnBlockchain > 0 ? totalTransactionsOnBlockchain : loadedTransactions > 0 ? loadedTransactions : totalTransactions}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                {hasActiveSync ? (
                  <><Loader2 className="w-3 h-3 animate-spin" />Syncing...</>
                ) : 'Totaal aantal'}
              </p>
            </div>

            {/* Inleg & Verkocht */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-yellow-100 p-2 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inleg &amp; Verkocht</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {showBalances ? `$${totalInvestment.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '••••'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Inleg</p>
                  {showBalances && profitPercentage !== 0 && (
                    <p className={`text-[10px] font-semibold mt-0.5 ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                    </p>
                  )}
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {showBalances ? `$${totalSoldValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '••••'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Verkocht{totalSoldBtc > 0 ? ` · ${totalSoldBtc.toFixed(4)} BTC` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cycle Advisor Widget */}
          {wallets.length > 0 && currentPrice > 0 && (
            <div className="mb-8">
              <CycleAdvisorWidget 
                currentPrice={currentPrice}
                investmentAmount={500}
              />
            </div>
          )}

            {/* Only show "Wallet Toevoegen" button if no wallets exist */}
            {wallets.length === 0 && !loadingWallets && (
            <div className="mb-8">
              <button
                onClick={() => setShowAddWallet(!showAddWallet)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Wallet Toevoegen
              </button>
            </div>
          )}

          {/* Bitcoin Milestones */}
          <BitcoinMilestones 
            wallets={wallets} 
            onRefresh={refreshTransactionPrices}
          />

          {/* Add Wallet Form */}
          {showAddWallet && (
            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nieuwe Wallet Toevoegen</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Naam
                  </label>
                  <input
                    type="text"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    placeholder="Bijv. Mijn Hardware Wallet"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitcoin Adres
                  </label>
                  <input
                    type="text"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={addWallet}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Laden...
                    </>
                  ) : (
                    'Wallet Toevoegen'
                  )}
                </button>
                <button
                  onClick={() => setShowAddWallet(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Wallets List */}
          {wallets.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen Wallets Gekoppeld</h3>
              <p className="text-gray-600 mb-6">
                Voeg je eerste Bitcoin wallet toe om je portfolio te bekijken
              </p>
              <button
                onClick={() => setShowAddWallet(true)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                Eerste Wallet Toevoegen
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {wallets.map((wallet) => {
                // Bereken addedDate BOVEN de return
                let addedDate = 'Onbekend';
                try {
                              if (!wallet.firstSeen) {
                                const walletWithCreatedAt = wallets.find(w => w.id === wallet.id);
                                if (walletWithCreatedAt && (walletWithCreatedAt as any).created_at) {
                                  const date = new Date((walletWithCreatedAt as any).created_at);
                                  if (!isNaN(date.getTime())) {
                        addedDate = date.toLocaleDateString('nl-NL', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    });
                                  }
                                }
                  } else {
                              let date: Date;
                              if (typeof wallet.firstSeen === 'string' && wallet.firstSeen.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                date = new Date(wallet.firstSeen + 'T00:00:00');
                              } else {
                                date = new Date(wallet.firstSeen);
                              }
                              
                    if (!isNaN(date.getTime())) {
                      addedDate = date.toLocaleDateString('nl-NL', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                    } else {
                      addedDate = wallet.firstSeen || 'Onbekend';
                    }
                  }
                            } catch (e) {
                  addedDate = 'Onbekend';
                }

                const syncProgress = walletSyncProgress.get(wallet.address);
                const isSyncing = syncProgress?.isSyncing || false;
                const isLoadingInitial = isSyncing && (!wallet.realData || wallet.balance === 0) && wallet.transactions === 0;
                const hasFirstBatch = syncProgress && syncProgress.loadedTransactions >= 10;
                const progressPercent = syncProgress && syncProgress.totalTransactions > 0
                  ? Math.min(100, (syncProgress.loadedTransactions / syncProgress.totalTransactions) * 100)
                  : (isLoadingInitial ? 0 : undefined);
                
                // Toon wallet info altijd (voorkom div veranderingen tijdens laden)
                // Data wordt op achtergrond geladen en geüpdatet zonder visuele sprongen
                const showWalletInfo = true;

                // Chart Integratie logica
                const walletChartIntegrationKey = wallet.id ? `chartIntegration_${wallet.id}` : '';
                const saved = wallet.id ? localStorage.getItem(walletChartIntegrationKey) : null;
                const defaultVisible = saved !== null ? saved === 'true' : true;
                const isChartIntegrationVisible = wallet.id ? (walletChartIntegration.get(wallet.id) ?? defaultVisible) : false;
                const isRefreshing = wallet.id ? (walletRefreshing.get(wallet.id) ?? false) : false;

                const handleWalletRefresh = async () => {
                  if (!wallet.id) return;
                  setWalletRefreshing(prev => {
                    const newMap = new Map(prev);
                    newMap.set(wallet.id, true);
                    return newMap;
                  });
                  await refreshTransactionPrices();
                  setWalletRefreshing(prev => {
                    const newMap = new Map(prev);
                    newMap.set(wallet.id, false);
                    return newMap;
                  });
                };

                const handleWalletToggle = (show: boolean) => {
                  if (!wallet.id) return;
                  setWalletChartIntegration(prev => {
                    const newMap = new Map(prev);
                    newMap.set(wallet.id, show);
                    return newMap;
                  });
                  localStorage.setItem(walletChartIntegrationKey, show.toString());
                };

                const isFullySynced = !isSyncing && syncProgress && syncProgress.totalTransactions > 0 && syncProgress.loadedTransactions >= syncProgress.totalTransactions;
                const justSynced = isFullySynced && syncProgress && syncProgress.loadedTransactions > 0;

                return (
                  <>
                    <div key={wallet.id} className="bg-white rounded-xl p-4 shadow-lg">
                      {/* Wallet Info Header */}
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="bg-orange-100 p-1.5 rounded-lg flex-shrink-0">
                            <Wallet className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{wallet.name}</h3>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">Toegevoegd op {addedDate}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                                {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
                              </code>
                              <button
                                onClick={() => copyAddress(wallet.address)}
                                className="p-0.5 text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                                title="Kopieer adres"
                              >
                                {copiedAddress === wallet.address ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs font-semibold text-gray-900">
                                {showBalances ? `${(wallet.balance || 0).toFixed(4)} BTC` : '•••• BTC'}
                              </span>
                            </div>
                    </div>
                    </div>
                        {/* Settings dropdown */}
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === wallet.id ? null : wallet.id)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Instellingen"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          {openMenuId === wallet.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenMenuId(null)}
                              ></div>
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <button
                                  onClick={() => handleEditClick(wallet)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Bewerken
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(wallet)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Verwijderen
                                </button>
                              </div>
                            </>
                          )}
                    </div>
                  </div>

                      {/* Sync Progress Block */}
                      {(isSyncing || justSynced) && (
                        <div className={`mt-3 rounded-lg p-3 ${isSyncing ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
                          {isSyncing ? (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                  <span className="text-sm font-medium text-orange-800">
                                    Transacties laden uit blockchain...
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-orange-700">
                                  {syncProgress?.loadedTransactions ?? 0}
                                  {syncProgress?.totalTransactions ? ` / ${syncProgress.totalTransactions}` : ''}
                                </span>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full bg-orange-200 rounded-full h-2">
                                <div
                                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercent ?? 0}%` }}
                                />
                              </div>
                              <p className="text-xs text-orange-600 mt-1.5">
                                Elke batch wordt direct opgeslagen in je account. Je kunt de pagina veilig verlaten.
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="bg-green-100 rounded-full p-1">
                                <Check className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-green-800">
                                  Alle {syncProgress?.loadedTransactions} transacties geladen en opgeslagen
                                </span>
                                <p className="text-xs text-green-600">Opgeslagen in je account — volgende keer direct beschikbaar</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Chart Integratie Block - onder wallet info */}
                      {wallet.id && (
                        isChartIntegrationVisible ? (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-orange-100 p-1.5 rounded-lg flex-shrink-0">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Chart Integratie</h4>
                                    <p className="text-xs text-gray-600">
                                      Deze wallet wordt automatisch gekoppeld aan de Bitcoin Geschiedenis chart. Je inkoop punten worden getoond op de grafiek.
                    </p>
                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={handleWalletRefresh}
                                      disabled={isRefreshing}
                                      className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                      {isRefreshing ? (
                                        <>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          Verversen...
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="w-3 h-3" />
                                          Verversen
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleWalletToggle(false)}
                                      className="px-3 py-1.5 bg-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-1.5"
                                    >
                                      <EyeOff className="w-3 h-3" />
                                      Verberg
                                    </button>
                </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <button
                              onClick={() => handleWalletToggle(true)}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3 h-3" />
                              Toon Chart Integratie
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </>
                );
            })}
            </div>
          )}

          {/* Live Chart Section - Show chart when wallets exist */}
          {wallets.length > 0 && (
            <div className="mt-12">
              <PortfolioChart 
                transactions={(() => {
                  // Filter transacties op basis van transactionFilter voor de chart
                  const filtered = allTransactions.filter(tx => matchesTransactionFilter(tx, transactionFilter));
                  
                  // Debug: log aantal transacties
                  console.log(`📊 Chart transacties: ${filtered.length} van ${allTransactions.length} totaal`);
                  console.log(`📊 Filter: ${transactionFilter}, All transactions: ${allTransactions.length}`);
                  if (filtered.length !== allTransactions.length && transactionFilter === 'all') {
                    console.warn(`⚠️ Waarschuwing: Filter zou alle transacties moeten tonen, maar toont ${filtered.length} van ${allTransactions.length}`);
                  }
                  
                  return filtered;
                })()}
                currentPrice={currentPrice}
                onTransactionClick={setSelectedTransaction}
              />
            </div>
          )}

          {/* Transactions Section */}
          {allTransactions.length > 0 && (
            <div className="mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Transactie Geschiedenis</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-gray-600">
                    {(() => {
                      const filteredCount = allTransactions.filter(tx => matchesTransactionFilter(tx, transactionFilter)).length;
                      return `${filteredCount} transacties`;
                    })()}
                  </span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    totalProfit >= 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US')} totaal
                  </div>
                </div>
              </div>

              {(() => {
                const filteredTransactions = allTransactions.filter(tx => matchesTransactionFilter(tx, transactionFilter));
                const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
                const showPerPage = filteredTransactions.length > 25;
                
                return (
              <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {/* Left side: Filter and Per page */}
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Filter - Show as buttons on larger screens, dropdown on smaller */}
                        <div className="hidden lg:flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">Filter transacties:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTransactionFilter('all');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        transactionFilter === 'all'
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Alle
                    </button>
                    <button
                      onClick={() => {
                        setTransactionFilter('buy');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        transactionFilter === 'buy'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Koop
                    </button>
                    <button
                      onClick={() => {
                        setTransactionFilter('sell');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        transactionFilter === 'sell'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Verkoop
                    </button>
                    <button
                      onClick={() => {
                        setTransactionFilter('active');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        transactionFilter === 'active'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Actieve trades
                    </button>
                    <button
                      onClick={() => {
                        setTransactionFilter('sold');
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        transactionFilter === 'sold'
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Verkocht
                    </button>
                  </div>
                </div>
                        
                        {/* Filter dropdown for smaller screens or when space is limited */}
                        <div className="lg:hidden relative" ref={filterDropdownRef}>
                          <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
                          >
                            Filter: {
                              transactionFilter === 'all' ? 'Alle' :
                              transactionFilter === 'buy' ? 'Koop' :
                              transactionFilter === 'sell' ? 'Verkoop' :
                              transactionFilter === 'sold' ? 'Verkocht' : 'Actieve trades'
                            }
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showFilterDropdown && (
                            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                              <button
                                onClick={() => {
                                  setTransactionFilter('all');
                                  setCurrentPage(1);
                                  setShowFilterDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                                  transactionFilter === 'all' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'
                                }`}
                              >
                                Alle
                              </button>
                              <button
                                onClick={() => {
                                  setTransactionFilter('buy');
                                  setCurrentPage(1);
                                  setShowFilterDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                                  transactionFilter === 'buy' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                                }`}
                              >
                                Koop
                              </button>
                              <button
                                onClick={() => {
                                  setTransactionFilter('sell');
                                  setCurrentPage(1);
                                  setShowFilterDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                                  transactionFilter === 'sell' ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-700'
                                }`}
                              >
                                Verkoop
                              </button>
                              <button
                                onClick={() => {
                                  setTransactionFilter('active');
                                  setCurrentPage(1);
                                  setShowFilterDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                                  transactionFilter === 'active' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                }`}
                              >
                                Actieve trades
                              </button>
                              <button
                                onClick={() => {
                                  setTransactionFilter('sold');
                                  setCurrentPage(1);
                                  setShowFilterDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                                  transactionFilter === 'sold' ? 'bg-gray-100 text-gray-700 font-medium' : 'text-gray-700'
                                }`}
                              >
                                Verkocht
                              </button>
                            </div>
                          )}
              </div>

                        {/* Per pagina selector - only show if more than 25 transactions */}
                        {showPerPage && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Per pagina:</span>
                    <div className="flex gap-2">
                      {[25, 50, 100].map(num => (
                        <button
                          key={num}
                          onClick={() => {
                            setItemsPerPage(num);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            itemsPerPage === num
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                        )}
                </div>

                      {/* Right side: Pagination */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                          Pagina {currentPage} van {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    ← Vorige
                  </button>
                  <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage >= totalPages || totalPages <= 1}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                          Volgende →
                  </button>
                </div>
              </div>
                  </div>
                );
              })()}

              <div className="grid gap-6">
                {(() => {
                  // Sorteer alle transacties chronologisch (oudste eerst) voor nummering
                  const sortedAllTxs = [...allTransactions].sort((a, b) => {
                    // Sorteer eerst op tijd, dan op hash voor unieke volgorde
                    if (a.time !== b.time) {
                      return a.time - b.time;
                    }
                    return (a.hash || '').localeCompare(b.hash || '');
                  });
                  
                  // Maak unieke mapping van hash+time naar transaction number
                  const transactionNumberMap = new Map<string, number>();
                  sortedAllTxs.forEach((tx, index) => {
                    const key = `${tx.hash || ''}-${tx.time || 0}`;
                    if (!transactionNumberMap.has(key)) {
                      transactionNumberMap.set(key, index + 1);
                    }
                  });
                  
                  // Filter en sorteer voor weergave (nieuwste eerst)
                  const filteredAndSorted = allTransactions
                  .filter(tx => {
                    return matchesTransactionFilter(tx, transactionFilter);
                  })
                    .sort((a, b) => b.time - a.time); // Nieuwste eerst voor weergave
                  
                  return filteredAndSorted
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((transaction, index) => {
                      // Gebruik unieke mapping voor transaction number
                      const key = `${transaction.hash || ''}-${transaction.time || 0}`;
                      const transactionNumber = transactionNumberMap.get(key) || (index + 1);
                      
                      const isBuyTx = transaction.value > 0;
                      const buyFifo = isBuyTx ? fifoMatches.buys.get(txKey(transaction)) : undefined;
                      const sellFifo = !isBuyTx ? fifoMatches.sells.get(txKey(transaction)) : undefined;

                      return (
                    <TransactionBlock
                      key={`${transaction.hash}-${transaction.time}-${transactionNumber}`}
                      transaction={transaction}
                        index={transactionNumber}
                      onTransactionClick={setSelectedTransaction}
                      allTransactions={allTransactions}
                          buyFifo={buyFifo}
                          sellFifo={sellFifo}
                          onEditOverride={setEditingOverrideTx}
                    />
                      );
                    });
                })()}
              </div>

              {/* Bottom Pagination */}
                  {(() => {
                    const filteredTransactions = allTransactions.filter(tx => matchesTransactionFilter(tx, transactionFilter));
                const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
                
                return (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mt-6 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {filteredTransactions.length > 0 ? (
                      `${(currentPage - 1) * itemsPerPage + 1} tot ${Math.min(currentPage * itemsPerPage, filteredTransactions.length)} van ${filteredTransactions.length} transacties`
                    ) : (
                      'Geen transacties'
                      )}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    ← Vorige
                  </button>
                  <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages || totalPages <= 1}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                        Volgende →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Wallet Edit Modal */}
          {showEditWallet && walletToEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Wallet Bewerken</h3>
                  <button
                    onClick={() => {
                      setShowEditWallet(false);
                      setWalletToEdit(null);
                      setEditWalletName('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Naam
                  </label>
                  <input
                    type="text"
                    value={editWalletName}
                    onChange={(e) => setEditWalletName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Bijv. Mijn Bitcoin Wallet"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Opslaan
                  </button>
                  <button
                    onClick={() => {
                      setShowEditWallet(false);
                      setWalletToEdit(null);
                      setEditWalletName('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Delete Confirmation Modal */}
          {showDeleteConfirm && walletToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Wallet Verwijderen</h3>
                    <p className="text-gray-600">Weet je zeker dat je deze wallet wilt verwijderen?</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setWalletToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Sluiten"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900 mb-1">{walletToDelete.name}</p>
                      <p className="text-sm text-red-700 font-mono mb-2">
                        {walletToDelete.address.slice(0, 12)}...{walletToDelete.address.slice(-12)}
                      </p>
                      <p className="text-sm text-red-700">
                        Saldo: <span className="font-semibold">{walletToDelete.balance.toFixed(4)} BTC</span>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Deze actie kan niet ongedaan gemaakt worden. De wallet wordt permanent verwijderd uit je account, maar blijft beschikbaar in de blockchain.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={removeWallet}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Ja, ik weet het zeker
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setWalletToDelete(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Transaction Modal */}
          {selectedTransaction && (
          <TransactionDetailsPopup
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            allTransactions={allTransactions}
            buyFifo={fifoMatches.buys.get(txKey(selectedTransaction))}
            sellFifo={fifoMatches.sells.get(txKey(selectedTransaction))}
          />
          )}

          {editingOverrideTx && (
            <TransactionOverrideModal
              transaction={editingOverrideTx}
              onClose={() => setEditingOverrideTx(null)}
              onSave={handleSaveOverride}
            />
          )}
        </div>
      </div>

    </div>
  );
}
