import React, { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

interface BitcoinPriceData {
  price: number;
  change24h: number;
  changePercentage24h: number;
}

const LiveBitcoinPrice: React.FC = () => {
  const [priceData, setPriceData] = useState<BitcoinPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const { currency, formatPrice } = useCurrency();

  // Load cached price data from localStorage
  const loadCachedPriceData = (): BitcoinPriceData | null => {
    try {
      const cached = localStorage.getItem('bitcoin_last_price');
      if (cached) {
        const data = JSON.parse(cached);
        // Check if data is not older than 24 hours
        const now = Date.now();
        const dataAge = now - (data.timestamp || 0);
        if (dataAge < 24 * 60 * 60 * 1000) { // 24 hours
          return data;
        }
      }
    } catch (error) {
      console.error('Error loading cached price data:', error);
    }
    return null;
  };

  // Save price data to localStorage
  const savePriceData = (data: BitcoinPriceData) => {
    try {
      const dataWithTimestamp = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem('bitcoin_last_price', JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error('Error saving price data:', error);
    }
  };

  const fetchBitcoinPrice = async () => {
    try {
      setLoading(true);
      setIsOnline(true);

      const vsCurrency = currency.toLowerCase();
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${vsCurrency}&include_24hr_change=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const bitcoin = data.bitcoin;
      
      if (bitcoin && typeof bitcoin[vsCurrency] === 'number') {
        const newPriceData = {
          price: bitcoin[vsCurrency],
          change24h: bitcoin[`${vsCurrency}_24h_change`] || 0,
          changePercentage24h: bitcoin[`${vsCurrency}_24h_change`] || 0
        };
        
        setPriceData(newPriceData);
        savePriceData(newPriceData);
        console.log('Bitcoin price updated successfully:', newPriceData);
      } else {
        throw new Error('Invalid price data received');
      }
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      setIsOnline(false);
      
      // Try to load cached data as fallback
      const cachedData = loadCachedPriceData();
      if (cachedData) {
        setPriceData(cachedData);
        console.log('Using cached Bitcoin price data:', cachedData);
      } else {
        // If no cached data, use a default price
        const defaultData = {
          price: 95000, // Default price
          change24h: 0,
          changePercentage24h: 0
        };
        setPriceData(defaultData);
        console.log('Using default Bitcoin price:', defaultData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load cached data first for immediate display
    const cachedData = loadCachedPriceData();
    if (cachedData) {
      setPriceData(cachedData);
      setLoading(false);
      console.log('Loaded cached Bitcoin price data on startup:', cachedData);
    }
    
    // Then try to fetch fresh data
    fetchBitcoinPrice();
    
    // Update every 30 seconds
    const interval = setInterval(fetchBitcoinPrice, 30000);
    
    return () => clearInterval(interval);
  }, [currency]); // Re-fetch when currency changes


  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeBgColor = (change: number): string => {
    if (change > 0) return 'bg-green-100';
    if (change < 0) return 'bg-red-100';
    return 'bg-gray-100';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    } else if (change < 0) {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
    }
  };

  if (loading && !priceData) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-3">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-orange-600 font-medium text-sm">Laden...</span>
        </div>
      </div>
    );
  }

  if (!priceData) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Bitcoin Icon */}
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/>
            </svg>
          </div>
          
          {/* Price Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 font-medium">BTC</span>
              <span className="text-xs text-gray-500">Live</span>
            </div>
            <div className="text-lg font-bold text-gray-900 truncate">
              {formatPrice(priceData.price)}
            </div>
          </div>
        </div>

        {/* 24h Change */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getChangeBgColor(priceData.changePercentage24h)} flex-shrink-0`}>
          {getChangeIcon(priceData.changePercentage24h)}
          <div className="text-right">
            <div className={`text-xs font-semibold ${getChangeColor(priceData.changePercentage24h)}`}>
              {formatChange(priceData.changePercentage24h)}
            </div>
            <div className="text-xs text-gray-500">
              24u
            </div>
          </div>
        </div>
      </div>
      
      {/* Last Updated - Compact */}
      <div className="mt-2 pt-2 border-t border-orange-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{new Date().toLocaleTimeString('nl-NL')}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></div>
            <span>{isOnline ? 'Live' : 'Cached'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBitcoinPrice;
