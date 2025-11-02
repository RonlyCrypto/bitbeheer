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
  Loader2
} from 'lucide-react';
import PortfolioChart from '../components/PortfolioChart';
import TransactionBlock from '../components/TransactionBlock';
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

  // Load wallets from Supabase
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

        if (error) throw error;

        if (walletsData && walletsData.length > 0) {
          // Convert Supabase wallet data to WalletData format
          const walletsList: WalletData[] = await Promise.all(
            walletsData.map(async (wallet: any) => {
              // If wallet_data exists, use it; otherwise fetch fresh data
              let realData: BitcoinWallet | undefined;
              
              if (wallet.wallet_data?.transactions) {
                // Use stored transaction data if available
                realData = {
                  address: wallet.address,
                  balance: wallet.balance || 0,
                  totalReceived: wallet.total_received || 0,
                  totalSent: wallet.total_sent || 0,
                  transactionCount: wallet.transaction_count || 0,
                  firstSeen: wallet.first_seen ? new Date(wallet.first_seen).getTime() : 0,
                  lastSeen: wallet.last_seen ? new Date(wallet.last_seen).getTime() : Date.now(),
                  transactions: wallet.wallet_data.transactions || []
                };
              } else {
                // Fetch fresh data from API
                try {
                  realData = await bitcoinApiService.getWalletData(wallet.address);
                } catch (error) {
                  console.error('Error fetching wallet data:', error);
                }
              }

              return {
                id: wallet.id,
                name: wallet.name || 'Mijn Bitcoin Wallet',
                address: wallet.address,
                balance: wallet.balance || 0,
                transactions: wallet.transaction_count || 0,
                firstSeen: wallet.first_seen ? new Date(wallet.first_seen).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                realData
              };
            })
          );

          setWallets(walletsList);
        } else {
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

    // Listen for wallet updates
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
    if (!newWalletAddress.trim() || !newWalletName.trim()) {
      alert('Voer een wallet naam en adres in');
      return;
    }

    if (!effectiveUserEmail) {
      alert('Je moet ingelogd zijn om wallets toe te voegen');
      return;
    }

    // Validate Bitcoin address
    if (!bitcoinApiService.validateBitcoinAddress(newWalletAddress.trim())) {
      alert('Ongeldig Bitcoin adres. Controleer het adres en probeer opnieuw.');
      return;
    }

    setLoading(true);
    try {
      // Check existing wallet
      const { data: existing } = await supabase
        .from('wallets')
        .select('id')
        .eq('email', effectiveUserEmail)
        .limit(1);

      if (existing && existing.length > 0) {
        alert('Je kunt maar één wallet koppelen aan je account.');
        setLoading(false);
        return;
      }

      // Fetch wallet data from Bitcoin API
      const walletApiData = await bitcoinApiService.getWalletData(newWalletAddress.trim());
      
      // Get current Bitcoin price
      const currentBtcPrice = await bitcoinApiService.getCurrentPrice();
      setCurrentPrice(currentBtcPrice);

      // Get last transaction
      const lastTx = walletApiData.transactions && walletApiData.transactions.length > 0
        ? walletApiData.transactions[0]
        : null;

      // Insert wallet with portfolio data into Supabase
      const { data: newWallet, error: insertErr } = await supabase
        .from('wallets')
        .insert([{
          email: effectiveUserEmail,
          address: newWalletAddress.trim(),
          name: newWalletName.trim(),
          type: 'bitcoin',
          balance: walletApiData.balance,
          transaction_count: walletApiData.transactionCount,
          total_received: walletApiData.totalReceived,
          total_sent: walletApiData.totalSent,
          first_seen: walletApiData.firstSeen ? new Date(walletApiData.firstSeen) : null,
          last_seen: walletApiData.lastSeen ? new Date(walletApiData.lastSeen) : new Date(),
          last_transaction_hash: lastTx?.hash || null,
          last_transaction_time: lastTx?.time ? new Date(lastTx.time * 1000) : null,
          wallet_data: walletApiData.transactions ? { transactions: walletApiData.transactions } : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Trigger wallet update event to refresh OverviewTab
      window.dispatchEvent(new CustomEvent('walletUpdated'));

      // Reload wallets
      const walletsList: WalletData[] = [{
        id: newWallet.id,
        name: newWallet.name || 'Mijn Bitcoin Wallet',
        address: newWallet.address,
        balance: newWallet.balance || 0,
        transactions: newWallet.transaction_count || 0,
        firstSeen: newWallet.first_seen ? new Date(newWallet.first_seen).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        realData: walletApiData
      }];
      
      setWallets(walletsList);
      setNewWalletAddress('');
      setNewWalletName('');
      setShowAddWallet(false);
      
      alert('Wallet succesvol toegevoegd!');
    } catch (error: any) {
      console.error('Error adding wallet:', error);
      const errorMessage = error?.message || 'Fout bij het toevoegen van wallet';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeWallet = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze wallet wilt verwijderen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id)
        .eq('email', effectiveUserEmail);

      if (error) throw error;

      // Trigger wallet update event
      window.dispatchEvent(new CustomEvent('walletUpdated'));
      
      // Update local state
      setWallets(wallets.filter(wallet => wallet.id !== id));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bitcoin Portfolio
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
              <p className="text-3xl font-bold text-gray-900">{wallets.length}</p>
              <p className="text-sm text-gray-600">Gekoppelde wallets</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Totaal BTC</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
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
              <p className="text-3xl font-bold text-gray-900">{totalTransactions}</p>
              <p className="text-sm text-gray-600">Totaal aantal</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ExternalLink className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Waarde</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {showBalances ? `€${totalValue.toLocaleString('nl-NL')}` : '••••'}
              </p>
              <p className="text-sm text-gray-600">Huidige waarde</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setShowAddWallet(!showAddWallet)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Wallet Toevoegen
            </button>

            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showBalances ? 'Verberg Saldi' : 'Toon Saldi'}
            </button>
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
          {loadingWallets ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
              <p className="text-gray-600">Wallets laden...</p>
            </div>
          ) : wallets.length === 0 ? (
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
                        <p className="text-sm text-gray-600">Toegevoegd op {wallet.firstSeen}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeWallet(wallet.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bitcoin Adres</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                        </code>
                        <button
                          onClick={() => copyAddress(wallet.address)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          {copiedAddress === wallet.address ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Saldo</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {showBalances ? `${wallet.balance.toFixed(4)} BTC` : '•••• BTC'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Transacties</p>
                      <p className="text-lg font-semibold text-gray-900">{wallet.transactions}</p>
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

          {/* Live Chart Section */}
          {wallets.length > 0 && allTransactions.length > 0 && (
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
