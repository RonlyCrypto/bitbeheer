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
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletName, setNewWalletName] = useState('');
  const [showBalances, setShowBalances] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(96640);
  const [allTransactions, setAllTransactions] = useState<BitcoinTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<BitcoinTransaction | null>(null);

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

  const removeWallet = (id: string) => {
    setWallets(wallets.filter(wallet => wallet.id !== id));
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
