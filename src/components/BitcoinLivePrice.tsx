import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface BitcoinPrice {
  price: number;
  change24h: number;
  changePercent24h: number;
}

const BitcoinLivePrice: React.FC = () => {
  const [price, setPrice] = useState<BitcoinPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBitcoinPrice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true');
      const data = await response.json();
      
      if (data.bitcoin) {
        setPrice({
          price: data.bitcoin.eur,
          change24h: data.bitcoin.eur_24h_change,
          changePercent24h: data.bitcoin.eur_24h_change
        });
      }
    } catch (err) {
      setError('Kon prijs niet laden');
      console.error('Error fetching Bitcoin price:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();
    
    // Update elke 30 seconden
    const interval = setInterval(fetchBitcoinPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  if (loading && !price) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
        <span className="text-sm text-gray-600">Laden...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg">
        <span className="text-sm text-red-600">Prijs niet beschikbaar</span>
      </div>
    );
  }

  if (!price) return null;

  const isPositive = price.changePercent24h >= 0;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        )}
        <span className="text-sm font-semibold text-gray-900">BTC</span>
      </div>
      
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900">
          {formatPrice(price.price)}
        </span>
        <span className={`text-xs font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatChange(price.changePercent24h)}
        </span>
      </div>
      
      <button
        onClick={fetchBitcoinPrice}
        className="p-1 hover:bg-orange-200 rounded transition-colors"
        title="Vernieuwen"
      >
        <RefreshCw className={`w-3 h-3 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default BitcoinLivePrice;
