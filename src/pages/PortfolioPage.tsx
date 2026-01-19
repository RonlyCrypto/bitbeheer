import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Shield,
  Loader2,
  X,
  Settings,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PortfolioChart from '../components/PortfolioChart';
import TransactionBlock from '../components/TransactionBlock';
import TransactionDetailsPopup from '../components/TransactionDetailsPopup';
import CurrencyToggle from '../components/CurrencyToggle';
import CycleAdvisorWidget from '../components/CycleAdvisorWidget';
import BitcoinMilestones from '../components/BitcoinMilestones';
import { bitcoinApiService, BitcoinWallet, BitcoinTransaction } from '../services/bitcoinApiService';
import { walletDataService, WalletSyncProgress } from '../services/walletDataService';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermissions } from '../contexts/PermissionsContext';

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
  const [currentPrice, setCurrentPrice] = useState<number>(96640);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'buy' | 'sell' | 'active'>('all');
  
  // Calculate which buys are fully sold (FIFO)
  const calculateBuySoldStatus = useMemo(() => {
    const sortedTxs = [...allTransactions].sort((a, b) => a.time - b.time);
    const buyStatus: Map<number, { remaining: number; soldTo: any[] }> = new Map();
    
    sortedTxs.forEach((tx, index) => {
      if (tx.value > 0) { // Buy
        const btcAmount = Math.abs(tx.value) / 100000000;
        buyStatus.set(index, { remaining: btcAmount, soldTo: [] });
      } else { // Sell
        const sellAmount = Math.abs(tx.value) / 100000000;
        let remainingToSell = sellAmount;
        
        // Match with buys in FIFO order
        for (let i = 0; i < index && remainingToSell > 0; i++) {
          if (sortedTxs[i].value > 0) { // Only buys
            const buyStatusInfo = buyStatus.get(i);
            if (buyStatusInfo && buyStatusInfo.remaining > 0) {
              const soldAmount = Math.min(buyStatusInfo.remaining, remainingToSell);
              buyStatusInfo.remaining -= soldAmount;
              buyStatusInfo.soldTo.push({
                sellIndex: index,
                sellTx: sortedTxs[index],
                amount: soldAmount
              });
              remainingToSell -= soldAmount;
            }
          }
        }
      }
    });
    
    // Create a map of original transaction indices to sold status
    const soldStatusMap = new Map<number, boolean>();
    sortedTxs.forEach((tx, sortedIndex) => {
      if (tx.value > 0) { // Buy
        const originalIndex = allTransactions.findIndex(t => 
          t.hash === tx.hash && t.time === tx.time
        );
        if (originalIndex !== -1) {
          const status = buyStatus.get(sortedIndex);
          soldStatusMap.set(originalIndex, status ? status.remaining <= 0.00000001 : false);
        }
      }
    });
    
    return soldStatusMap;
  }, [allTransactions]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showEditWallet, setShowEditWallet] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<WalletData | null>(null);
  const [editWalletName, setEditWalletName] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [walletSyncProgress, setWalletSyncProgress] = useState<Map<string, WalletSyncProgress>>(new Map());

  // Get effective user email (considering impersonation)
  const effectiveUserEmail = (isImpersonating && impersonatedUser) 
    ? impersonatedUser 
    : user?.email;

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
  useEffect(() => {
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

  // Haal huidige Bitcoin prijs op
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const price = await bitcoinApiService.getCurrentPrice();
        setCurrentPrice(price);
      } catch (error) {
        console.error('Error fetching current price:', error);
      }
    };

    fetchCurrentPrice();
    const interval = setInterval(fetchCurrentPrice, 60000); // Update elke minuut
    return () => clearInterval(interval);
  }, []);

  // Update transacties wanneer wallets veranderen
  useEffect(() => {
    const updateTransactions = async () => {
      const allTx: BitcoinTransaction[] = [];
      for (const wallet of wallets) {
        if (wallet.realData?.transactions) {
          allTx.push(...wallet.realData.transactions);
        }
      }
      setAllTransactions(removeDuplicateTransactions(allTx));
    };

    updateTransactions();
  }, [wallets]);

  // Smooth update van wallet data tijdens sync - zonder visuele sprongen
  useEffect(() => {
    const hasActiveSync = Array.from(walletSyncProgress.values()).some(p => p.isSyncing);
    
    if (!hasActiveSync) return;

    // Update alleen wanneer sync progress verandert, niet periodiek
    const updateWalletsFromDatabase = async () => {
      if (!effectiveUserEmail) return;

      try {
        const { data: walletsData } = await supabase
          .from('wallets')
          .select('*')
          .eq('email', effectiveUserEmail)
          .order('created_at', { ascending: false });

        if (walletsData && walletsData.length > 0) {
          // Smooth update: merge nieuwe data met bestaande wallets - behoud structuur en volgorde
          setWallets(prevWallets => {
            // Zorg dat wallets altijd in dezelfde volgorde blijven (geen witte vlakken die springen)
            const updatedWallets = walletsData.map((dbWallet: any) => {
              const prevWallet = prevWallets.find(w => w.address === dbWallet.address);
              
              // Als wallet niet bestaat in prev, maak nieuwe aan (behoud structuur)
              if (!prevWallet) {
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
                
                // Format firstSeen date
                let firstSeenDate = new Date().toISOString().split('T')[0];
                if (dbWallet.first_seen) {
                  try {
                    const date = new Date(dbWallet.first_seen);
                    if (!isNaN(date.getTime())) {
                      firstSeenDate = date.toISOString().split('T')[0];
                    }
                  } catch {}
                } else if (dbWallet.created_at) {
                  try {
                    const date = new Date(dbWallet.created_at);
                    if (!isNaN(date.getTime())) {
                      firstSeenDate = date.toISOString().split('T')[0];
                    }
                  } catch {}
                }
                
                return {
                  id: dbWallet.id,
                  name: dbWallet.name || 'Mijn Bitcoin Wallet',
                  address: dbWallet.address,
                  balance: dbWallet.balance || 0,
                  transactions: dbWallet.transaction_count || 0,
                  firstSeen: firstSeenDate,
                  realData,
                  total_investment: dbWallet.total_investment || 0 // Haal total_investment uit database
                };
              }

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

              // Smooth update: behoud bestaande data, update alleen wat nieuw is
              return {
                ...prevWallet,
                balance: realData.balance,
                transactions: dbWallet.transaction_count || 0,
                total_investment: dbWallet.total_investment || 0, // Update total_investment uit database
                realData: {
                  ...prevWallet.realData,
                  ...realData,
                  transactions: realData.transactions // Update transacties
                }
              };
            });
            
            return updatedWallets;
          });
          
          // Update allTransactions smooth
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
          setAllTransactions(removeDuplicateTransactions(allTx));
        }
      } catch (error) {
        console.error('Error updating wallets during sync:', error);
      }
    };

    // Update alleen wanneer sync progress verandert (niet periodiek)
    const syncProgressString = JSON.stringify(Array.from(walletSyncProgress.entries()));
    updateWalletsFromDatabase();
    
    // Debounce updates om visuele sprongen te voorkomen
    const timeoutId = setTimeout(updateWalletsFromDatabase, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [walletSyncProgress, effectiveUserEmail]);

  // Reload wallets wanneer sync compleet is - smooth update zonder sprongen
  useEffect(() => {
    const wasSyncing = Array.from(walletSyncProgress.values()).some(p => p.isSyncing);
    const isNowComplete = !Array.from(walletSyncProgress.values()).some(p => p.isSyncing);
    
    // Als sync net compleet is geworden, update wallets smooth
    if (wasSyncing && isNowComplete) {
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
            // Smooth update zonder visuele sprongen
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
                  total_investment: dbWallet.total_investment || 0, // Update total_investment uit database
                  realData
                };
              })
            );
            
            // Update allTransactions
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
            setAllTransactions(removeDuplicateTransactions(allTx));
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
                setAllTransactions(prev => removeDuplicateTransactions([...prev, ...moreData]));
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
      alert('Kon transacties niet verversen. Probeer het later opnieuw.');
    } finally {
      setLoadingWallets(false);
    }
  };

  const addWallet = async () => {
    if (newWalletAddress && newWalletName) {
      // Valideer Bitcoin adres
      if (!bitcoinApiService.validateBitcoinAddress(newWalletAddress)) {
        alert('Ongeldig Bitcoin adres');
        return;
      }

      setLoading(true);
      try {
        // 1. SNELLE OPSLAG: Save wallet immediately to DB without fetching data
        const { error: insertError } = await supabase
          .from('wallets')
          .insert([{
            email: effectiveUserEmail,
            address: newWalletAddress,
            name: newWalletName,
            type: 'bitcoin',
            balance: 0, // Placeholder, will be updated in background
            transaction_count: 0,
            total_received: 0,
            total_sent: 0,
            first_seen: null,
            last_seen: new Date().toISOString(),
            wallet_data: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        // 2. OPTIMISTIC UI: Add wallet to UI with placeholder data
        const newWallet: WalletData = {
          id: Date.now().toString(),
          name: newWalletName,
          address: newWalletAddress,
          balance: 0,
          transactions: 0,
          firstSeen: new Date().toISOString().split('T')[0],
          realData: undefined // Will be loaded in background
        };

        setWallets([...wallets, newWallet]);
        setNewWalletAddress('');
        setNewWalletName('');
        setShowAddWallet(false);

        // Set initial loading state for this wallet
        setWalletSyncProgress(prev => {
          const newMap = new Map(prev);
          newMap.set(newWalletAddress, {
            totalTransactions: 0,
            loadedTransactions: 0,
            isSyncing: true
          });
          return newMap;
        });

        // 3. BACKGROUND PROCESSING: Start sync met nieuwe service
        setTimeout(async () => {
          try {
            // Gebruik nieuwe walletDataService - start background sync
            const walletDataWithProgress = await walletDataService.getWalletData(
              newWalletAddress,
              effectiveUserEmail!,
              (progress) => {
                // Update progress state
                setWalletSyncProgress(prev => {
                  const newMap = new Map(prev);
                  newMap.set(newWalletAddress, progress);
                  return newMap;
                });

                // Reload wallets wanneer sync updates (elke 10 transacties na eerste batch)
                if (progress.loadedTransactions > 0 && (progress.loadedTransactions === 10 || progress.loadedTransactions % 10 === 0)) {
                  loadWallets();
                }
              }
            );

            // Update UI met data (ook als sync nog bezig is)
            setWallets(prevWallets =>
              prevWallets.map(w =>
                w.address === newWalletAddress
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
            
            console.log('✅ Wallet sync started:', newWalletAddress);
          } catch (error) {
            console.error('⚠️ Background wallet sync failed:', error);
            // Wallet is still added, just without data - user can refresh later
          }
        }, 500); // Small delay to not block UI
      } catch (error) {
        console.error('Error adding wallet:', error);
        alert('Kon wallet niet toevoegen. Probeer opnieuw.');
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
      alert('Er is een fout opgetreden bij het bijwerken van de wallet naam.');
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
      alert('Fout bij het verwijderen van wallet');
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

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* H1 Tag for SEO */}
      <h1 className="sr-only">Bitcoin Portfolio Beheer - Bewaar en Monitor Je Bitcoin Wallets</h1>
      <div className="container mx-auto px-4 py-0 md:py-0 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-green-100 p-1.5 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Totaal BTC</h3>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {showBalances ? totalBalance.toFixed(4) : '••••'}
              </p>
              <p className="text-xs text-gray-600">Bitcoin saldo</p>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Transacties</h3>
              </div>
              <p className="text-xl font-bold text-gray-900">{totalTransactions}</p>
              <p className="text-xs text-gray-600">Totaal aantal</p>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-yellow-100 p-1.5 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Inleg</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-gray-900">
                  {showBalances ? `$${totalInvestment.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '••••'}
                </p>
                {showBalances && profitPercentage !== 0 && (
                  <span className={`text-xs font-medium ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">Totale inleg</p>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <div className="bg-purple-100 p-1.5 rounded-lg flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 truncate">Waarde</h3>
              </div>
              <p className="text-xl font-bold text-gray-900 break-words">
                {showBalances ? `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '••••'}
              </p>
              <p className="text-xs text-gray-600">Huidige waarde</p>
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
                const addedDate = (() => {
                  try {
                              if (!wallet.firstSeen) {
                                const walletWithCreatedAt = wallets.find(w => w.id === wallet.id);
                                if (walletWithCreatedAt && (walletWithCreatedAt as any).created_at) {
                                  const date = new Date((walletWithCreatedAt as any).created_at);
                                  if (!isNaN(date.getTime())) {
                                    return date.toLocaleDateString('nl-NL', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    });
                                  }
                                }
                                return 'Onbekend';
                              }
                              
                              let date: Date;
                              if (typeof wallet.firstSeen === 'string' && wallet.firstSeen.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                date = new Date(wallet.firstSeen + 'T00:00:00');
                              } else {
                                date = new Date(wallet.firstSeen);
                              }
                              
                              if (isNaN(date.getTime())) {
                                return wallet.firstSeen || 'Onbekend';
                              }
                              
                              return date.toLocaleDateString('nl-NL', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                            } catch (e) {
                              return 'Onbekend';
                            }
                })();

                const syncProgress = walletSyncProgress.get(wallet.address);
                const isSyncing = syncProgress?.isSyncing || false;
                const isLoadingInitial = isSyncing && (!wallet.realData || wallet.balance === 0) && wallet.transactions === 0;
                const hasFirstBatch = syncProgress && syncProgress.loadedTransactions >= 10;
                const progressPercent = syncProgress && syncProgress.totalTransactions > 0
                  ? Math.min(100, (syncProgress.loadedTransactions / syncProgress.totalTransactions) * 100)
                  : (isLoadingInitial ? 0 : undefined);
                
                // Toon wallet info als eerste batch (10 transacties) is geladen
                const showWalletInfo = hasFirstBatch || (wallet.realData && wallet.balance > 0);

                return (
                  <div key={wallet.id} className="bg-white rounded-xl p-4 shadow-lg">

                    {/* Compact header with all info in one row */}
                    <div className="flex items-center justify-between gap-4 mb-3">
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
                              {isLoadingInitial && !hasFirstBatch ? (
                                <span className="inline-flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                  <span className="text-gray-400">Laden...</span>
                                </span>
                              ) : (
                                showBalances ? `${wallet.balance.toFixed(4)} BTC` : '•••• BTC'
                              )}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-600">
                              {isLoadingInitial && !hasFirstBatch ? (
                                <span className="text-gray-400">Laden...</span>
                              ) : (
                                <>
                                  {wallet.realData?.transactions?.length || wallet.transactions || 0} transacties
                                  {isSyncing && hasFirstBatch && (
                                    <span className="text-blue-600 ml-1">• Wallet wordt gesynchroniseerd...</span>
                                  )}
                                  {!isSyncing && hasFirstBatch && syncProgress && syncProgress.loadedTransactions > 0 && (
                                    <span className="text-green-600 ml-1">• 100% gesynct</span>
                                  )}
                                </>
                              )}
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

                    {/* Chart Integratie with buttons */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-medium text-orange-800">Chart Integratie</span>
                    </div>
                          <p className="text-xs text-orange-700">
                      Deze wallet wordt automatisch gekoppeld aan de Bitcoin Geschiedenis chart. 
                      Je inkoop punten worden getoond op de grafiek.
                    </p>
                  </div>
                        <div className="flex flex-row gap-2 flex-shrink-0">
                          <button
                            onClick={() => setShowBalances(!showBalances)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg font-medium hover:bg-gray-700 transition-colors whitespace-nowrap"
                          >
                            {showBalances ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {showBalances ? 'Verberg' : 'Toon'}
                          </button>
                          <button
                            onClick={refreshTransactionPrices}
                            disabled={loadingWallets}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {loadingWallets ? <Loader2 className="w-3 h-3 animate-spin" /> : <Loader2 className="w-3 h-3" />}
                            Verversen
                          </button>
                </div>
                      </div>
                    </div>
                  </div>
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
                  return allTransactions.filter(tx => {
                    if (transactionFilter === 'all') return true;
                    if (transactionFilter === 'buy') return tx.value > 0;
                    if (transactionFilter === 'sell') return tx.value < 0;
                    if (transactionFilter === 'active') {
                      if (tx.value > 0) {
                        const txIndex = allTransactions.findIndex(t => 
                          t.hash === tx.hash && t.time === tx.time
                        );
                        return txIndex !== -1 && !calculateBuySoldStatus.get(txIndex);
                      }
                      return false;
                    }
                    return true;
                  });
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
                      const filteredCount = allTransactions.filter(tx => {
                        if (transactionFilter === 'all') return true;
                        if (transactionFilter === 'buy') return tx.value > 0;
                        if (transactionFilter === 'sell') return tx.value < 0;
                        if (transactionFilter === 'active') {
                          if (tx.value > 0) {
                            const txIndex = allTransactions.findIndex(t => 
                              t.hash === tx.hash && t.time === tx.time
                            );
                            return txIndex !== -1 && !calculateBuySoldStatus.get(txIndex);
                          }
                          return false;
                        }
                        return true;
                      }).length;
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
                const filteredTransactions = allTransactions.filter(tx => {
                  if (transactionFilter === 'all') return true;
                  if (transactionFilter === 'buy') return tx.value > 0;
                  if (transactionFilter === 'sell') return tx.value < 0;
                  if (transactionFilter === 'active') {
                    // Only show buys that are not fully sold
                    if (tx.value > 0) {
                      const txIndex = allTransactions.findIndex(t => 
                        t.hash === tx.hash && t.time === tx.time
                      );
                      return txIndex !== -1 && !calculateBuySoldStatus.get(txIndex);
                    }
                    return false;
                  }
                  return true;
                });
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
                              transactionFilter === 'sell' ? 'Verkoop' : 'Actieve trades'
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
                    if (transactionFilter === 'all') return true;
                    if (transactionFilter === 'buy') return tx.value > 0;
                    if (transactionFilter === 'sell') return tx.value < 0;
                      if (transactionFilter === 'active') {
                        if (tx.value > 0) {
                          const txIndex = allTransactions.findIndex(t => 
                            t.hash === tx.hash && t.time === tx.time
                          );
                          return txIndex !== -1 && !calculateBuySoldStatus.get(txIndex);
                        }
                        return false;
                      }
                    return true;
                  })
                    .sort((a, b) => b.time - a.time); // Nieuwste eerst voor weergave
                  
                  return filteredAndSorted
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((transaction, index) => {
                      // Gebruik unieke mapping voor transaction number
                      const key = `${transaction.hash || ''}-${transaction.time || 0}`;
                      const transactionNumber = transactionNumberMap.get(key) || (index + 1);
                      
                      const txIndex = allTransactions.findIndex(t => 
                        t.hash === transaction.hash && t.time === transaction.time
                      );
                      const isFullySold = transaction.value > 0 && txIndex !== -1 
                        ? calculateBuySoldStatus.get(txIndex) === true
                        : false;
                      
                      // Find which sell transactions this buy was sold to
                      const sortedTxs = [...allTransactions].sort((a, b) => a.time - b.time);
                      const sortedIndex = sortedTxs.findIndex(t => 
                        t.hash === transaction.hash && t.time === transaction.time
                      );
                      let soldToTransactions: BitcoinTransaction[] = [];
                      
                      if (isFullySold && sortedIndex !== -1 && transaction.value > 0) {
                        // Calculate which sells matched this buy (FIFO)
                        const buyAmount = Math.abs(transaction.value) / 100000000;
                        let remainingToMatch = buyAmount;
                        
                        for (let i = sortedIndex + 1; i < sortedTxs.length && remainingToMatch > 0; i++) {
                          if (sortedTxs[i].value < 0) { // Sell
                            const sellAmount = Math.abs(sortedTxs[i].value) / 100000000;
                            const matchedAmount = Math.min(sellAmount, remainingToMatch);
                            if (matchedAmount > 0) {
                              const originalSellIndex = allTransactions.findIndex(t => 
                                t.hash === sortedTxs[i].hash && t.time === sortedTxs[i].time
                              );
                              if (originalSellIndex !== -1) {
                                soldToTransactions.push(allTransactions[originalSellIndex]);
                              }
                              remainingToMatch -= matchedAmount;
                            }
                          }
                        }
                      }
                      
                      return (
                    <TransactionBlock
                      key={`${transaction.hash}-${transaction.time}-${transactionNumber}`}
                      transaction={transaction}
                        index={transactionNumber}
                      onTransactionClick={setSelectedTransaction}
                      allTransactions={allTransactions}
                          isFullySold={isFullySold}
                          soldToTransactions={soldToTransactions}
                    />
                      );
                    });
                })()}
              </div>

              {/* Bottom Pagination */}
                  {(() => {
                    const filteredTransactions = allTransactions.filter(tx => {
                      if (transactionFilter === 'all') return true;
                      if (transactionFilter === 'buy') return tx.value > 0;
                      if (transactionFilter === 'sell') return tx.value < 0;
                      if (transactionFilter === 'active') {
                        if (tx.value > 0) {
                          const txIndex = allTransactions.findIndex(t => 
                            t.hash === tx.hash && t.time === tx.time
                          );
                          return txIndex !== -1 && !calculateBuySoldStatus.get(txIndex);
                        }
                        return false;
                      }
                      return true;
                    });
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
          />
          )}
        </div>
      </div>

    </div>
  );
}
