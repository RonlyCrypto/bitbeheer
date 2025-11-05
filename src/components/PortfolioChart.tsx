import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { BitcoinPriceData, BitcoinTransaction } from '../services/bitcoinApiService';
import { useCurrency } from '../contexts/CurrencyContext';
import { bitcoinPriceDataService } from '../services/bitcoinPriceDataService';
import { supabase } from '../lib/supabase';

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

  // Fetch price data and save to Supabase - use Supabase Edge Function to avoid CORS
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        // Use Supabase Edge Function to avoid CORS issues
        const { supabase } = await import('../lib/supabase');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        // Try to get latest price from Supabase first
        const latestPrice = await bitcoinPriceDataService.getLatestPrice();
        if (latestPrice) {
          // Use latest price from database
          const vsCurrency = currency.toLowerCase();
          const priceKey = currency === 'EUR' ? 'price_eur' : 'price_usd';
          
          // Try to get 24h change from Supabase or set to 0
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const { data: yesterdayData } = await supabase
            .from('bitcoin_price_data')
            .select(priceKey)
            .eq('date', yesterdayStr)
            .single();
          
          const yesterdayPrice = yesterdayData?.[priceKey] || latestPrice.price;
          const change24h = latestPrice.price - yesterdayPrice;
          const changePercent24h = yesterdayPrice > 0 ? (change24h / yesterdayPrice) * 100 : 0;
          
          setPriceData({
            price: latestPrice.price,
            change24h: change24h,
            changePercent24h: changePercent24h,
            marketCap: latestPrice.market_cap || 0,
            volume24h: 0 // Volume not stored in latest price
          });
        } else {
          // Fallback: Call Edge Function to fetch and save price
          try {
            const response = await fetch(`${supabaseUrl}/functions/v1/update-bitcoin-price`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
              }
            });
            
            if (response.ok) {
              const result = await response.json();
              const priceKey = currency.toLowerCase();
              
              setPriceData({
                price: result.data[priceKey],
                change24h: result.data[`${priceKey}_24h_change`] || 0,
                changePercent24h: result.data[`${priceKey}_24h_change`] || 0,
                marketCap: result.data.market_cap || 0,
                volume24h: result.data.volume_24h || 0
              });
            }
          } catch (edgeFunctionError) {
            console.error('Error calling Edge Function:', edgeFunctionError);
            // Set fallback price data
            setPriceData({
              price: currentPrice,
              change24h: 0,
              changePercent24h: 0,
              marketCap: 0,
              volume24h: 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
        // Set fallback price data
        setPriceData({
          price: currentPrice,
          change24h: 0,
          changePercent24h: 0,
          marketCap: 0,
          volume24h: 0
        });
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 60000); // Update elke minuut (reduced frequency)
    return () => clearInterval(interval);
  }, [currency, currentPrice]);

  // Load complete historical price data from Supabase (2009 to present)
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        // Get summary to find available years
        const summary = await bitcoinPriceDataService.getSummary();
        
        if (summary && summary.available_years && summary.available_years.length > 0) {
          // Fetch data for all available years
          const data = await bitcoinPriceDataService.getDataForYears(
            summary.available_years,
            currency
          );
          
          // Convert to chart format (price is already in correct currency)
          const chartData = data.map(point => ({
            time: new Date(point.date).getTime(),
            price: point.price
          }));
          
          setHistoricalPriceData(chartData);
        } else {
          // Fallback: Try to get data from 2009 to current year
          const currentYear = new Date().getFullYear();
          const years = [];
          for (let year = 2009; year <= currentYear; year++) {
            years.push(year);
          }
          
          const data = await bitcoinPriceDataService.getDataForYears(years, currency);
          
          const chartData = data.map(point => ({
            time: new Date(point.date).getTime(),
            price: point.price
          }));
          
          setHistoricalPriceData(chartData);
        }
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

    // Use complete historical price data from Supabase
    const now = Date.now();
    let pricePoints: Array<{ time: number; price: number }> = [];
    
    if (historicalPriceData.length > 0) {
      // Use complete historical data - show all data points
      pricePoints = historicalPriceData
        .filter(point => point.time <= now)
        .sort((a, b) => a.time - b.time);
      
      // For performance, sample data if we have too many points (keep max 500 points for smooth rendering)
      if (pricePoints.length > 500) {
        const step = Math.ceil(pricePoints.length / 500);
        pricePoints = pricePoints.filter((_, index) => index % step === 0);
      }
    } else {
      // Fallback: Generate sample data for last 30 days if no historical data available
      const days30 = 30 * 24 * 60 * 60 * 1000;
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
      if (pricePoints.length === 0) {
        // No price data available, skip drawing transactions
        return;
      }
      
      const maxPrice = Math.max(...pricePoints.map(p => p.price));
      const minPrice = Math.min(...pricePoints.map(p => p.price));
      const priceRange = maxPrice - minPrice;
      
      if (priceRange <= 0) {
        // No valid price range, skip drawing
        return;
      }
      
      // Calculate the time range of the chart
      const chartStartTime = pricePoints.length > 0 ? pricePoints[0].time : now - (365 * 24 * 60 * 60 * 1000);
      const chartEndTime = now;
      const chartTimeRange = chartEndTime - chartStartTime;
      
      if (chartTimeRange <= 0) {
        return;
      }
      
      // Sort transactions by time to show them in order
      const sortedTransactions = [...transactions].sort((a, b) => (a.time || 0) - (b.time || 0));
      
      let visibleTransactions = 0;
      
      sortedTransactions.forEach((tx, index) => {
        // Ensure time is in milliseconds (some APIs return seconds)
        let txTime = tx.time < 10000000000 ? tx.time * 1000 : tx.time;
        
        // Validate timestamp - ensure it's a valid number and date
        if (!txTime || isNaN(txTime) || txTime <= 0) {
          // Skip invalid timestamps
          return;
        }
        
        // Ensure timestamp is within reasonable range (not before 2009 or too far in future)
        const minTimestamp = new Date('2009-01-01').getTime();
        const maxTimestamp = Date.now() + (365 * 24 * 60 * 60 * 1000); // Max 1 year in future
        if (txTime < minTimestamp || txTime > maxTimestamp) {
          // Skip invalid timestamps
          return;
        }
        
        // Debug: Log transaction timing info (only first valid transaction)
        if (index === 0 && visibleTransactions === 0) {
          try {
            console.log('Chart time range:', {
              chartStart: new Date(chartStartTime).toISOString(),
              chartEnd: new Date(chartEndTime).toISOString(),
              txTime: new Date(txTime).toISOString(),
              txInRange: txTime >= chartStartTime && txTime <= chartEndTime
            });
          } catch (e) {
            // Skip logging if date is invalid
          }
        }
        
        // Only show transactions within chart time range
        if (txTime >= chartStartTime && txTime <= chartEndTime) {
          // Calculate position on chart
          const x = ((txTime - chartStartTime) / chartTimeRange) * width;
          
          // Use transaction price if available, otherwise use current price
          const txPrice = tx.price || currentPrice;
          
          // Ensure price is within chart range
          const clampedPrice = Math.max(minPrice, Math.min(maxPrice, txPrice));
          const y = height - ((clampedPrice - minPrice) / priceRange) * height;
          
          // Ensure coordinates are within canvas bounds
          if (x >= 0 && x <= width && y >= 0 && y <= height) {
            visibleTransactions++;
            
            // Teken cirkel (groen voor winst, rood voor verlies)
            const profit = tx.profit !== undefined ? tx.profit : (tx.currentValue || 0) - (txPrice * (tx.value || 0) / 100000000);
            ctx.fillStyle = profit >= 0 ? '#10b981' : '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI); // Larger radius for visibility
            ctx.fill();
            
            // Teken witte border voor betere zichtbaarheid
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Teken nummer (optioneel - alleen als er niet te veel transacties zijn)
            if (sortedTransactions.length <= 20) {
              ctx.fillStyle = 'white';
              ctx.font = 'bold 11px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText((index + 1).toString(), x, y);
            }
          }
        }
      });
      
      // Debug: Log how many transactions were visible
      if (visibleTransactions === 0 && sortedTransactions.length > 0) {
        try {
          const firstTx = sortedTransactions[0];
          const lastTx = sortedTransactions[sortedTransactions.length - 1];
          const firstTxTime = firstTx.time < 10000000000 ? firstTx.time * 1000 : firstTx.time;
          const lastTxTime = lastTx.time < 10000000000 ? lastTx.time * 1000 : lastTx.time;
          
          console.warn('No transactions visible on chart:', {
            totalTransactions: sortedTransactions.length,
            chartStartTime: new Date(chartStartTime).toISOString(),
            chartEndTime: new Date(chartEndTime).toISOString(),
            firstTxTime: firstTxTime && !isNaN(firstTxTime) ? new Date(firstTxTime).toISOString() : 'Invalid',
            lastTxTime: lastTxTime && !isNaN(lastTxTime) ? new Date(lastTxTime).toISOString() : 'Invalid'
          });
        } catch (e) {
          // Skip logging if dates are invalid
        }
      }
    }

    // Teken hover effect
    if (hoveredTransaction) {
      const maxPrice = Math.max(...pricePoints.map(p => p.price));
      const minPrice = Math.min(...pricePoints.map(p => p.price));
      const priceRange = maxPrice - minPrice;
      
      const chartStartTime = pricePoints.length > 0 ? pricePoints[0].time : now - (365 * 24 * 60 * 60 * 1000);
      const chartEndTime = now;
      const chartTimeRange = chartEndTime - chartStartTime;
      
      const txTime = hoveredTransaction.time * 1000;
      
      if (txTime >= chartStartTime && txTime <= chartEndTime && priceRange > 0) {
        const x = ((txTime - chartStartTime) / chartTimeRange) * width;
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

    // Calculate chart time range for hover detection
    const pricePointsForHover = historicalPriceData.length > 0 
      ? historicalPriceData 
      : [{ time: now, price: currentPrice }];
    
    const chartStartTime = pricePointsForHover.length > 0 
      ? Math.min(...pricePointsForHover.map(p => p.time))
      : now - (365 * 24 * 60 * 60 * 1000);
    const chartEndTime = now;
    const chartTimeRange = chartEndTime - chartStartTime;
    
    if (chartTimeRange <= 0 || priceRange <= 0) {
      setHoveredTransaction(null);
      return;
    }
    
    transactions.forEach(tx => {
      // Ensure time is in milliseconds (same logic as drawing)
      const txTime = tx.time < 10000000000 ? tx.time * 1000 : tx.time;
      
      if (txTime >= chartStartTime && txTime <= chartEndTime) {
        const txX = ((txTime - chartStartTime) / chartTimeRange) * canvas.width;
        
        // Use transaction price if available, otherwise use current price
        const txPrice = tx.price || currentPrice;
        const clampedPrice = Math.max(minPrice, Math.min(maxPrice, txPrice));
        const txY = priceRange > 0 
          ? canvas.height - ((clampedPrice - minPrice) / priceRange) * canvas.height
          : canvas.height / 2;
        
        // Increase hover radius for better UX (12px instead of 10px)
        const distance = Math.sqrt((x - txX) ** 2 + (y - txY) ** 2);
        if (distance <= 12) {
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
          <div className="flex items-center gap-4">
            <p className="flex-1">Hover over de groene/rode punten om transactie details te zien. Klik om meer informatie te bekijken.</p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Winstgevend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Verliesgevend</span>
              </div>
              <div className="text-gray-500">
                {transactions.length} transactie{transactions.length !== 1 ? 's' : ''} op chart
              </div>
            </div>
          </div>
        ) : (
          <p>Voeg een wallet toe met transacties om je inkoop punten op de chart te zien.</p>
        )}
      </div>
    </div>
  );
}
