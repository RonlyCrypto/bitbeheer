import { useState, useEffect } from 'react';
import { RefreshCw, Download, Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { dataManager } from '../services/dataManager';

interface DataStats {
  count: number;
  dateRange: { start: string; end: string } | null;
  lastUpdated: string | null;
}

export default function DataManagement() {
  const [stats, setStats] = useState<{ [key: string]: DataStats }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const btcStats = await dataManager.getDataStats('BTC');
    const ethStats = await dataManager.getDataStats('ETH');
    setStats({ BTC: btcStats, ETH: ethStats });
  };

  const forceUpdate = async (coin: string) => {
    setLoading(prev => ({ ...prev, [coin]: true }));
    try {
      const startDate = new Date('2009-01-03'); // Bitcoin genesis block
      const endDate = new Date();
      
      await dataManager.forceUpdate(coin, startDate, endDate);
      setLastUpdate(new Date().toISOString());
      await loadStats();
    } catch (error) {
      console.error(`Error updating ${coin}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [coin]: false }));
    }
  };

  const exportData = async (coin: string) => {
    try {
      const stats = await dataManager.getDataStats(coin);
      const data = localStorage.getItem(`${coin}_prices`);
      
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${coin.toLowerCase()}_prices_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`Error exporting ${coin} data:`, error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nooit';
    return new Date(dateString).toLocaleString('nl-NL');
  };

  const getDataAge = (lastUpdated: string | null) => {
    if (!lastUpdated) return 'Onbekend';
    const age = Date.now() - new Date(lastUpdated).getTime();
    const hours = Math.floor(age / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} dag${days > 1 ? 'en' : ''} geleden`;
    if (hours > 0) return `${hours} uur geleden`;
    return 'Vandaag';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Database className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
          <p className="text-gray-600 text-sm">Beheer cryptocurrency prijsdata</p>
        </div>
      </div>

      {lastUpdate && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Laatste update: {formatDate(lastUpdate)}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['BTC', 'ETH'].map((coin) => (
          <div key={coin} className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{coin} Data</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => forceUpdate(coin)}
                  disabled={loading[coin]}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loading[coin] ? 'animate-spin' : ''}`} />
                  {loading[coin] ? 'Updaten...' : 'Update'}
                </button>
                <button
                  onClick={() => exportData(coin)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Data punten:</span>
                <span className="font-semibold text-gray-900">
                  {stats[coin]?.count?.toLocaleString('nl-NL') || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Periode:</span>
                <span className="font-semibold text-gray-900">
                  {stats[coin]?.dateRange ? (
                    <>
                      {new Date(stats[coin].dateRange!.start).toLocaleDateString('nl-NL')} - {' '}
                      {new Date(stats[coin].dateRange!.end).toLocaleDateString('nl-NL')}
                    </>
                  ) : (
                    'Geen data'
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Laatste update:</span>
                <span className="font-semibold text-gray-900">
                  {getDataAge(stats[coin]?.lastUpdated)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  {stats[coin]?.count > 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className={stats[coin]?.count > 0 ? 'text-green-700' : 'text-yellow-700'}>
                    {stats[coin]?.count > 0 ? 'Data beschikbaar' : 'Geen data - klik Update'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-900 mb-2">Data Bronnen</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>CoinMarketCap:</strong> Primaire bron voor historische data vanaf 2010</p>
          <p>• <strong>CoinGecko:</strong> Secundaire bron voor aanvullende prijzen</p>
          <p>• <strong>CryptoCompare:</strong> Tertiaire bron voor extra betrouwbaarheid</p>
          <p>• <strong>CoinCap:</strong> Quaternaire bron voor maximale dekking</p>
          <p>• <strong>Lokale opslag:</strong> Data wordt lokaal opgeslagen voor snelle toegang</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-2">Automatische Updates</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Data wordt automatisch bijgewerkt wanneer nieuwe datums worden opgevraagd</p>
          <p>• Alleen ontbrekende data wordt opgehaald (incrementele updates)</p>
          <p>• Updates worden meerdere keren per dag uitgevoerd</p>
          <p>• Gebruik "Force Update" voor volledige hernieuwing van data</p>
        </div>
      </div>
    </div>
  );
}
