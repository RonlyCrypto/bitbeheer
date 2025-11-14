import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PortfolioChart from '../components/PortfolioChart';
import TransactionBlock from '../components/TransactionBlock';
import CurrencyToggle from '../components/CurrencyToggle';
import { bitcoinApiService, BitcoinWallet, BitcoinTransaction } from '../services/bitcoinApiService';
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
  const [selectedTransaction, setSelectedTransaction] = useState<BitcoinTransaction | null>(null);

  // Get effective user email (considering impersonation)
  const effectiveUserEmail = (isImpersonating && impersonatedUser) 
    ? impersonatedUser 
    : user?.email;

  // Load wallets from Supabase (wallets added in OverviewTab)
  useEffect(() => {
    const loadWallets = async () => {
      if (!effectiveUserEmail) {
        setLoadingWallets(false);
        return;
      }

      try {
        setLoadingWallets(true);
        const { data: walletsData, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('email', effectiveUserEmail)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading wallets:', error);
          setWallets([]);
          setLoadingWallets(false);
          return;
        }

        if (walletsData && walletsData.length > 0) {
          console.log('📦 Loaded wallets from Supabase:', walletsData.length);
          // Convert Supabase wallet data to WalletData format
          const walletsList: WalletData[] = await Promise.all(
            walletsData.map(async (wallet: any) => {
              console.log('🔍 Processing wallet:', { id: wallet.id, address: wallet.address, hasBalance: wallet.balance !== null, hasWalletData: !!wallet.wallet_data });
              // If wallet_data exists with transactions, use it; otherwise fetch fresh data
              let realData: BitcoinWallet | undefined;
              
              // Always try to use stored wallet_data first, then fallback to API
              if (wallet.wallet_data?.transactions && Array.isArray(wallet.wallet_data.transactions) && wallet.wallet_data.transactions.length > 0) {
                // Use stored transaction data
                realData = {
                  address: wallet.address,
                  balance: wallet.balance || 0,
                  totalReceived: wallet.total_received || 0,
                  totalSent: wallet.total_sent || 0,
                  transactionCount: wallet.transaction_count || 0,
                  firstSeen: wallet.first_seen ? new Date(wallet.first_seen).getTime() : Date.now(),
                  lastSeen: wallet.last_seen ? new Date(wallet.last_seen).getTime() : Date.now(),
                  transactions: wallet.wallet_data.transactions || []
                };
              } else if (wallet.balance !== null && wallet.balance !== undefined) {
                // Use database data even if no transactions
                realData = {
                  address: wallet.address,
                  balance: wallet.balance || 0,
                  totalReceived: wallet.total_received || 0,
                  totalSent: wallet.total_sent || 0,
                  transactionCount: wallet.transaction_count || 0,
                  firstSeen: wallet.first_seen ? new Date(wallet.first_seen).getTime() : Date.now(),
                  lastSeen: wallet.last_seen ? new Date(wallet.last_seen).getTime() : Date.now(),
                  transactions: []
                };
              } else {
                // Only fetch from API if we don't have balance data
                try {
                  realData = await bitcoinApiService.getWalletData(wallet.address);
                } catch (error) {
                  console.error('Error fetching wallet data from API:', error);
                  // Fallback: use basic data from database
                  realData = {
                    address: wallet.address,
                    balance: 0,
                    totalReceived: 0,
                    totalSent: 0,
                    transactionCount: 0,
                    firstSeen: Date.now(),
                    lastSeen: Date.now(),
                    transactions: []
                  };
                }
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
                balance: wallet.balance || 0,
                transactions: wallet.transaction_count || 0,
                firstSeen: firstSeenDate,
                realData
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
      setAllTransactions(allTx);
    };

    updateTransactions();
  }, [wallets]);

  const addWallet = async () => {
    if (newWalletAddress && newWalletName) {
      // Valideer Bitcoin adres
      if (!bitcoinApiService.validateBitcoinAddress(newWalletAddress)) {
        alert('Ongeldig Bitcoin adres');
        return;
      }

      setLoading(true);
      try {
        // Haal echte wallet data op
        const realData = await bitcoinApiService.getWalletData(newWalletAddress);
        
        const newWallet: WalletData = {
          id: Date.now().toString(),
          name: newWalletName,
          address: newWalletAddress,
          balance: realData.balance,
          transactions: realData.transactionCount,
          firstSeen: new Date(realData.firstSeen).toISOString().split('T')[0],
          realData: realData
        };
        
        setWallets([...wallets, newWallet]);
        setNewWalletAddress('');
        setNewWalletName('');
        setShowAddWallet(false);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        alert('Kon wallet data niet ophalen. Controleer het adres en probeer opnieuw.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0">
      {/* Currency Toggle - Only on Portfolio page */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end">
          <CurrencyToggle />
        </div>
      </div>
      {/* H1 Tag for SEO */}
      <h1 className="sr-only">Bitcoin Portfolio Beheer - Bewaar en Monitor Je Bitcoin Wallets</h1>
      <div className="container mx-auto px-4 py-6 md:py-12 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bitcoin Portfolio Beheer
            </h1>
            <p className="text-xl text-gray-600">
              Koppel je Bitcoin wallets en bekijk je inkoop geschiedenis op de chart
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Wallet className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Wallets</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{wallets.length}</p>
              <p className="text-sm text-gray-600">Gekoppelde wallets</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Totaal BTC</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances ? totalBalance.toFixed(4) : '••••'}
              </p>
              <p className="text-sm text-gray-600">Bitcoin saldo</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Transacties</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              <p className="text-sm text-gray-600">Totaal aantal</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3 min-w-0">
                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                  <ExternalLink className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">Waarde</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 break-words">
                {showBalances ? `€${totalValue.toLocaleString('nl-NL')}` : '••••'}
              </p>
              <p className="text-sm text-gray-600">Huidige waarde</p>
            </div>
          </div>

          {/* Controls - Only show if no wallets or wallets exist */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Only show "Wallet Toevoegen" button if no wallets exist */}
            {wallets.length === 0 && !loadingWallets && (
              <button
                onClick={() => setShowAddWallet(!showAddWallet)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Wallet Toevoegen
              </button>
            )}

            {/* Only show "Verberg Saldi" button if wallets exist */}
            {wallets.length > 0 && (
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {showBalances ? 'Verberg Saldo' : 'Toon Saldo'}
              </button>
            )}
          </div>

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
              {wallets.map((wallet) => (
                <div key={wallet.id} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Wallet className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{wallet.name}</h3>
                        <p className="text-sm text-gray-600">
                          Toegevoegd op {(() => {
                            try {
                              // firstSeen should be a date string in format YYYY-MM-DD
                              if (!wallet.firstSeen) {
                                // Try to use created_at from database if available
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
                              
                              // If firstSeen is already a valid date string (YYYY-MM-DD), use it directly
                              let date: Date;
                              if (typeof wallet.firstSeen === 'string' && wallet.firstSeen.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                // Already in YYYY-MM-DD format
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
                              console.error('Error formatting date:', e, wallet.firstSeen);
                              return 'Onbekend';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(wallet)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Wallet verwijderen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 mb-1">Bitcoin Adres</p>
                      <div className="flex items-center gap-2 min-w-0">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono truncate">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                        </code>
                        <button
                          onClick={() => copyAddress(wallet.address)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                          title="Kopieer adres"
                        >
                          {copiedAddress === wallet.address ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 mb-1">Saldo</p>
                      <p className="text-lg font-semibold text-gray-900 truncate">
                        {showBalances ? `${wallet.balance.toFixed(4)} BTC` : '•••• BTC'}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-gray-600 mb-1">Transacties</p>
                      <p className="text-lg font-semibold text-gray-900 truncate">{wallet.transactions}</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Chart Integratie</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Deze wallet wordt automatisch gekoppeld aan de Bitcoin Geschiedenis chart. 
                      Je inkoop punten worden getoond op de grafiek.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live Chart Section - Show chart when wallets exist */}
          {wallets.length > 0 && (
            <div className="mt-12">
              <PortfolioChart 
                transactions={allTransactions}
                currentPrice={currentPrice}
                onTransactionClick={setSelectedTransaction}
              />
            </div>
          )}

          {/* Transactions Section */}
          {allTransactions.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Transactie Geschiedenis</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {allTransactions.length} transacties
                  </span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    totalProfit >= 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {totalProfit >= 0 ? '+' : ''}€{totalProfit.toLocaleString('nl-NL')} totaal
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {allTransactions
                  .sort((a, b) => b.time - a.time) // Nieuwste eerst
                  .map((transaction, index) => (
                    <TransactionBlock
                      key={`${transaction.hash}-${index}`}
                      transaction={transaction}
                      index={index}
                      onTransactionClick={setSelectedTransaction}
                    />
                  ))}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Transactie Details</h3>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hash</label>
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {selectedTransaction.hash}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedTransaction.time * 1000).toLocaleString('nl-NL')}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bitcoin Bedrag</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {(selectedTransaction.value / 100000000).toFixed(8)} BTC
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inkoop Prijs</label>
                      <p className="text-lg font-semibold text-gray-900">
                        €{selectedTransaction.price.toLocaleString('nl-NL')}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Huidige Waarde</label>
                      <p className="text-lg font-semibold text-gray-900">
                        €{selectedTransaction.currentValue.toLocaleString('nl-NL')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Winst/Verlies</label>
                      <p className={`text-lg font-semibold ${
                        selectedTransaction.profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedTransaction.profit >= 0 ? '+' : ''}€{selectedTransaction.profit.toLocaleString('nl-NL')}
                        ({selectedTransaction.profitPercent >= 0 ? '+' : ''}{selectedTransaction.profitPercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
