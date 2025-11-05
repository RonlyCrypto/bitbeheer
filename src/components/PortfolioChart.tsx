import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { BitcoinPriceData, BitcoinTransaction } from '../services/bitcoinApiService';
import { useCurrency } from '../contexts/CurrencyContext';
import { bitcoinPriceDataService } from '../services/bitcoinPriceDataService';

interface PortfolioChartProps {
  transactions: BitcoinTransaction[];
  currentPrice: number;
  onTransactionClick?: (transaction: BitcoinTransaction) => void;
}

export default function PortfolioChart({ transactions, currentPrice, onTransactionClick }: PortfolioChartProps) {
  const { currency, formatPrice } = useCurrency();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [priceData, setPriceData] = useState<BitcoinPriceData | null>(null);
  const [showTransactions, setShowTransactions] = useState(true);
  const [hoveredTransaction, setHoveredTransaction] = useState<BitcoinTransaction | null>(null);
  const [historicalPriceData, setHistoricalPriceData] = useState<Array<{ time: number; price: number }>>([]);

  // Fetch price data based on selected currency
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const vsCurrency = currency.toLowerCase();
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`);
        const data = await response.json();
        const priceKey = currency.toLowerCase();
        const changeKey = `${currency.toLowerCase()}_24h_change`;
        const marketCapKey = `${currency.toLowerCase()}_market_cap`;
        const volumeKey = `${currency.toLowerCase()}_24h_vol`;
        
        setPriceData({
          price: data.bitcoin[priceKey],
          change24h: data.bitcoin[changeKey] || 0,
          changePercent24h: data.bitcoin[changeKey] || 0,
          marketCap: data.bitcoin[marketCapKey] || 0,
          volume24h: data.bitcoin[volumeKey] || 0
        });
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 30000); // Update elke 30 seconden
    return () => clearInterval(interval);
  }, [currency]);

  // Load historical price data for the last 30 days
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Last 30 days
        
        // Get historical data from Supabase
        const data = await bitcoinPriceDataService.getDataForDateRange(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          currency
        );
        
        // Convert to chart format (price is already in correct currency)
        const chartData = data.map(point => ({
          time: new Date(point.date).getTime(),
          price: point.price
        }));
        
        setHistoricalPriceData(chartData);
      } catch (error) {
        console.error('Error loading historical data:', error);
        // Fallback to empty array if data loading fails
        setHistoricalPriceData([]);
      }
    };
    
    loadHistoricalData();
  }, [currency]);

  // Teken de chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Use historical price data if available, otherwise generate sample data
    const now = Date.now();
    const days30 = 30 * 24 * 60 * 60 * 1000;
    let pricePoints: Array<{ time: number; price: number }> = [];
    
    if (historicalPriceData.length > 0) {
      // Use real historical data
      const startTime = now - days30;
      pricePoints = historicalPriceData
        .filter(point => point.time >= startTime && point.time <= now)
        .sort((a, b) => a.time - b.time);
    } else {
      // Fallback: Generate sample data for last 30 days (hourly points)
      const hours30days = 30 * 24;
      for (let i = 0; i < hours30days; i++) {
        const time = now - (i * 60 * 60 * 1000);
        const basePrice = currentPrice;
        const variation = (Math.random() - 0.5) * 0.05; // 5% variatie
        const price = basePrice * (1 + variation);
        pricePoints.push({ time, price });
      }
      pricePoints.reverse();
    }
    
    // If we have too many points, sample them for performance
    if (pricePoints.length > 100) {
      const step = Math.ceil(pricePoints.length / 100);
      pricePoints = pricePoints.filter((_, index) => index % step === 0);
    }

    // Teken prijs lijn
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();

    pricePoints.forEach((point, index) => {
      const x = (index / (pricePoints.length - 1)) * width;
      const y = height - ((point.price / Math.max(...pricePoints.map(p => p.price))) * height);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Teken transactie punten
    if (showTransactions && transactions.length > 0) {
      const maxPrice = Math.max(...pricePoints.map(p => p.price));
      const minPrice = Math.min(...pricePoints.map(p => p.price));
      const priceRange = maxPrice - minPrice;
      
    transactions.forEach((tx, index) => {
      const txTime = tx.time * 1000;
      const daysAgo = (now - txTime) / (24 * 60 * 60 * 1000);
      
      // Show transactions from last 30 days
      if (daysAgo <= 30 && daysAgo >= 0 && priceRange > 0) {
        const x = ((30 - daysAgo) / 30) * width;
        const y = height - ((tx.price - minPrice) / priceRange) * height;
        
        // Teken cirkel
        ctx.fillStyle = tx.profit >= 0 ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Teken nummer
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), x, y + 3);
      }
    });
    }

    // Teken hover effect
    if (hoveredTransaction) {
      const maxPrice = Math.max(...pricePoints.map(p => p.price));
      const minPrice = Math.min(...pricePoints.map(p => p.price));
      const priceRange = maxPrice - minPrice;
      
      const txTime = hoveredTransaction.time * 1000;
      const daysAgo = (now - txTime) / (24 * 60 * 60 * 1000);
      
      if (daysAgo <= 30 && daysAgo >= 0 && priceRange > 0) {
        const x = ((30 - daysAgo) / 30) * width;
        const y = height - ((hoveredTransaction.price - minPrice) / priceRange) * height;
        
        // Teken highlight cirkel
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

  }, [transactions, currentPrice, showTransactions, hoveredTransaction, historicalPriceData]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check of mouse over transaction point
    const now = Date.now();
    let foundTransaction = null;

    // Calculate price range from historical data or use current price
    const pricePoints = historicalPriceData.length > 0 
      ? historicalPriceData 
      : [{ time: now, price: currentPrice }];
    
    const maxPrice = Math.max(...pricePoints.map(p => p.price), currentPrice);
    const minPrice = Math.min(...pricePoints.map(p => p.price), currentPrice);
    const priceRange = maxPrice - minPrice;

    transactions.forEach(tx => {
      const txTime = tx.time * 1000;
      const daysAgo = (now - txTime) / (24 * 60 * 60 * 1000);
      
      if (daysAgo <= 30 && daysAgo >= 0) {
        const txX = ((30 - daysAgo) / 30) * canvas.width;
        const txY = priceRange > 0 
          ? canvas.height - ((tx.price - minPrice) / priceRange) * canvas.height
          : canvas.height / 2;
        
        const distance = Math.sqrt((x - txX) ** 2 + (y - txY) ** 2);
        if (distance <= 10) {
          foundTransaction = tx;
        }
      }
    });

    setHoveredTransaction(foundTransaction);
  };

  const handleTransactionClick = (transaction: BitcoinTransaction) => {
    if (onTransactionClick) {
      onTransactionClick(transaction);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">Live Bitcoin Chart</h3>
          {priceData && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(priceData.price)}
              </span>
              <div className={`flex items-center gap-1 ${
                priceData.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {priceData.changePercent24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {priceData.changePercent24h >= 0 ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showTransactions 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {showTransactions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {showTransactions ? 'Verberg' : 'Toon'} Transacties
            </span>
          </button>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-64 border border-gray-200 rounded-lg cursor-crosshair"
          onMouseMove={handleMouseMove}
          onClick={() => {
            if (hoveredTransaction) {
              handleTransactionClick(hoveredTransaction);
            }
          }}
        />

        {/* Hover Tooltip */}
        {hoveredTransaction && (
          <div className="absolute bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none z-10"
               style={{
                 left: '50%',
                 top: '10px',
                 transform: 'translateX(-50%)'
               }}>
            <div className="text-sm">
              <div className="font-semibold mb-1">Transactie #{transactions.indexOf(hoveredTransaction) + 1}</div>
              <div>Inkoop: €{hoveredTransaction.price.toLocaleString('nl-NL')}</div>
              <div>Huidige waarde: €{hoveredTransaction.currentValue.toLocaleString('nl-NL')}</div>
              <div className={`${hoveredTransaction.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {hoveredTransaction.profit >= 0 ? '+' : ''}€{hoveredTransaction.profit.toLocaleString('nl-NL')} 
                ({hoveredTransaction.profitPercent >= 0 ? '+' : ''}{hoveredTransaction.profitPercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 text-sm text-gray-600">
        {transactions.length > 0 ? (
          <p>Hover over de groene/rode punten om transactie details te zien. Klik om meer informatie te bekijken.</p>
        ) : (
          <p>Voeg een wallet toe met transacties om je inkoop punten op de chart te zien.</p>
        )}
      </div>
    </div>
  );
}
