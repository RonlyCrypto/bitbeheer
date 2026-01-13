import { useState, useEffect } from 'react';
import { Shield, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ReferralBlocks() {
  const [ledgerLink, setLedgerLink] = useState<string | null>(null);
  const [coinbaseLink, setCoinbaseLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralLinks();
    
    // Listen for updates
    const handleUpdate = () => {
      loadReferralLinks();
    };
    window.addEventListener('referralLinksUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('referralLinksUpdated', handleUpdate);
    };
  }, []);

  const loadReferralLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_links')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Find Ledger and Coinbase links by title (case insensitive)
      const ledger = data?.find(link => 
        link.title.toLowerCase().includes('ledger')
      );
      const coinbase = data?.find(link => 
        link.title.toLowerCase().includes('coinbase')
      );

      setLedgerLink(ledger?.url || null);
      setCoinbaseLink(coinbase?.url || null);
    } catch (error) {
      console.error('Error loading referral links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLedgerClick = () => {
    if (ledgerLink) {
      window.open(ledgerLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCoinbaseClick = () => {
    if (coinbaseLink) {
      window.open(coinbaseLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Grid is al 50/50, maar we maken de blokken groter */}
      {/* Ledger Block - Step 1 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl relative">
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Stap 1
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900 mb-3">Ledger Hardware Wallet</h3>
            <p className="text-blue-800 mb-4 leading-relaxed">
              Een Ledger is een hardware wallet die je Bitcoin offline bewaart. Het is de veiligste manier 
              om je Bitcoin op te slaan omdat het niet verbonden is met het internet. Je privésleutels blijven 
              altijd onder jouw controle en kunnen niet gehackt worden.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Offline opslag van je privésleutels</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Bescherming tegen hackers en malware</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Ondersteuning voor 1000+ cryptocurrencies</span>
              </div>
            </div>
            <button 
              onClick={handleLedgerClick}
              disabled={!ledgerLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Koop een Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Coinbase Block - Step 2 */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-xl relative">
        <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Stap 2
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-orange-600 p-3 rounded-xl">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-orange-900 mb-3">Coinbase Exchange</h3>
            <p className="text-orange-800 mb-4 leading-relaxed">
              Coinbase is een van de meest betrouwbare en gebruiksvriendelijke exchanges voor het kopen van Bitcoin. 
              Perfect voor beginners met een intuïtieve interface en sterke beveiliging.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-orange-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Gereguleerd en verzekerd</span>
              </div>
              <div className="flex items-center gap-2 text-orange-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Eenvoudige DCA instellingen</span>
              </div>
              <div className="flex items-center gap-2 text-orange-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Lage transactiekosten</span>
              </div>
            </div>
            <button 
              onClick={handleCoinbaseClick}
              disabled={!coinbaseLink}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Start met Coinbase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

