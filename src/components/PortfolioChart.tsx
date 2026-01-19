import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { BitcoinPriceData, BitcoinTransaction } from '../services/bitcoinApiService';
import { useCurrency } from '../contexts/CurrencyContext';
import { bitcoinPriceDataService } from '../services/bitcoinPriceDataService';
import { supabase } from '../lib/supabase';
import PriceChart from './PriceChart';
import { PriceData } from '../types';

interface PortfolioChartProps {
  transactions: BitcoinTransaction[];
  currentPrice: number;
  onTransactionClick?: (transaction: BitcoinTransaction) => void;
}

type TimeRange = '1m' | '6m' | '1y' | 'all';

export default function PortfolioChart({ transactions, currentPrice, onTransactionClick }: PortfolioChartProps) {
  const { currency, formatPrice } = useCurrency();
  const [priceData, setPriceData] = useState<BitcoinPriceData | null>(null);
  const [showTransactions, setShowTransactions] = useState(true);
  const [chartData, setChartData] = useState<PriceData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWalletBalanceChart, setShowWalletBalanceChart] = useState(false);

  // Fetch price data function
  const fetchPriceData = async () => {
    try {
      const latestPrice = await bitcoinPriceDataService.getLatestPrice();
      if (latestPrice) {
        const vsCurrency = currency.toLowerCase();
        const priceKey = currency === 'EUR' ? 'price_eur' : 'price_usd';
        
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
          volume24h: 0
        });
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
    }
  };

  // Fetch price data on mount and interval
  useEffect(() => {
    fetchPriceData();
    const interval = setInterval(fetchPriceData, 60000);
    return () => clearInterval(interval);
  }, [currency]);

  // Load historical price data function
  const loadHistoricalData = async () => {
    try {
      const summary = await bitcoinPriceDataService.getSummary();
      
      if (summary && summary.available_years && summary.available_years.length > 0) {
        const data = await bitcoinPriceDataService.getDataForYears(
          summary.available_years,
          currency
        );
        
        setChartData(data);
      } else {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 2009; year <= currentYear; year++) {
          years.push(year);
        }
        
        const data = await bitcoinPriceDataService.getDataForYears(years, currency);
        setChartData(data);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
      setChartData([]);
    }
  };

  // Load historical price data on mount
  useEffect(() => {
    loadHistoricalData();
  }, [currency]);

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchPriceData(),
        loadHistoricalData()
      ]);
    } catch (error) {
      console.error('Error refreshing chart data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Convert transactions to purchase points for the chart
  // Sorteer eerst chronologisch zodat de nummering klopt
  const sortedTransactionsForPoints = [...transactions].sort((a, b) => a.time - b.time);
  
  // Remove duplicates based on hash (als hash beschikbaar is) of date+price combinatie
  const uniqueTransactions = sortedTransactionsForPoints.filter((tx, index, self) => {
    if (!tx.time || !tx.price || isNaN(tx.time) || isNaN(tx.price)) {
      return false; // Filter invalid transactions
    }
    
    // Als hash beschikbaar is, gebruik hash voor duplicate check
    if (tx.hash) {
      return index === self.findIndex(t => t.hash === tx.hash);
    }
    
    // Anders gebruik date + price + time combinatie
    const txDate = new Date(tx.time * 1000).toISOString().split('T')[0];
    return index === self.findIndex(t => {
      const tDate = new Date(t.time * 1000).toISOString().split('T')[0];
      return tDate === txDate && t.price === tx.price && t.time === tx.time;
    });
  });
  
  const purchasePoints = showTransactions ? uniqueTransactions.map(tx => {
    return {
      date: new Date(tx.time * 1000).toISOString().split('T')[0],
      price: tx.price,
      hash: tx.hash, // Voeg hash toe voor matching met purchaseDetails
      time: tx.time
    };
  }) : [];

  // Track which buys are fully sold (FIFO)
  const calculateSoldStatus = () => {
    const sortedTxs = [...transactions].sort((a, b) => a.time - b.time);
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
    
    return buyStatus;
  };

  const buySoldStatus = calculateSoldStatus();

  // Create purchase details with buy/sell information
  // Eerst sorteren op tijd voor chronologische nummering
  const sortedTransactions = [...transactions].sort((a, b) => {
    // Sorteer eerst op tijd, dan op hash voor unieke volgorde
    if (a.time !== b.time) {
      return a.time - b.time;
    }
    return (a.hash || '').localeCompare(b.hash || '');
  });
  
  // Maak unieke mapping van hash+time naar transaction number
  const transactionNumberMap = new Map<string, number>();
  sortedTransactions.forEach((tx, index) => {
    const key = `${tx.hash || ''}-${tx.time || 0}`;
    if (!transactionNumberMap.has(key)) {
      transactionNumberMap.set(key, index + 1);
    }
  });
  
  const purchaseDetails = showTransactions ? transactions.map((tx, index) => {
    if (!tx.time || !tx.price || isNaN(tx.time) || isNaN(tx.price)) {
      return null;
    }
    const isBuy = tx.value > 0;
    const btcAmount = Math.abs(tx.value) / 100000000;
    
    // Gebruik unieke mapping voor transaction number
    const key = `${tx.hash || ''}-${tx.time || 0}`;
    const transactionNumber = transactionNumberMap.get(key) || (index + 1);
    
    // For sells, calculate buy price using FIFO from previous transactions
    let buyPrice = null;
    let soldBuyIndices: number[] = [];
    if (!isBuy && transactions.length > 0) {
      const sortedTxs = [...transactions].sort((a, b) => a.time - b.time);
      const currentIndex = sortedTxs.findIndex(t => t.hash === tx.hash && t.time === tx.time);
      
      if (currentIndex > 0) {
        const sellAmount = btcAmount;
        let remainingToMatch = sellAmount;
        let totalBuyCost = 0;
        
        for (let i = 0; i < currentIndex; i++) {
          if (sortedTxs[i].value > 0) { // Only buys
            const buyAmount = Math.abs(sortedTxs[i].value) / 100000000;
            const buyPricePerBtc = sortedTxs[i].price;
            
            if (remainingToMatch > 0) {
              const matchedAmount = Math.min(buyAmount, remainingToMatch);
              totalBuyCost += matchedAmount * buyPricePerBtc;
              remainingToMatch -= matchedAmount;
              
              // Track which buy this sell is linked to
              const originalBuyIndex = transactions.findIndex(t => 
                t.hash === sortedTxs[i].hash && t.time === sortedTxs[i].time
              );
              if (originalBuyIndex !== -1) {
                soldBuyIndices.push(originalBuyIndex);
              }
            }
          }
        }
        
        if (totalBuyCost > 0 && sellAmount > 0) {
          buyPrice = totalBuyCost / sellAmount;
        }
      }
    }
    
    // Check if this buy is fully sold
    const sortedTxs = [...transactions].sort((a, b) => a.time - b.time);
    const sortedIndex = sortedTxs.findIndex(t => t.hash === tx.hash && t.time === tx.time);
    const isFullySold = isBuy && sortedIndex !== -1 && buySoldStatus.has(sortedIndex) 
      ? buySoldStatus.get(sortedIndex)!.remaining <= 0.00000001
      : false;
    const soldToInfo = isBuy && sortedIndex !== -1 && buySoldStatus.has(sortedIndex)
      ? buySoldStatus.get(sortedIndex)!.soldTo
      : [];
    
    return {
      date: new Date(tx.time * 1000).toISOString().split('T')[0],
      amount: isBuy ? btcAmount * tx.price : -(btcAmount * tx.price), // EUR value
      price: tx.price,
      btcAcquired: isBuy ? btcAmount : -btcAmount,
      monthNumber: transactionNumber,
      currentValue: tx.currentValue || 0,
      isBuy: isBuy,
      profit: tx.profit || 0,
      profitPercent: tx.profitPercent || 0,
      buyPrice: buyPrice,
      isFullySold: isFullySold,
      soldTo: soldToInfo,
      soldBuyIndices: soldBuyIndices,
      transactionIndex: index,
      transaction: tx
    };
  }).filter(Boolean) as any[] : [];

  if (showTransactions && transactions.length > 0) {
    console.log(`📊 Purchase Points Summary:`, {
      totalTransactions: transactions.length,
      validPurchasePoints: purchasePoints.length,
      sampleTransactions: transactions.slice(0, 3).map(t => ({
        time: t.time,
        price: t.price,
        date: new Date(t.time * 1000).toISOString().split('T')[0]
      }))
    });
  }

  // Filter chart data based on time range
  const getFilteredChartData = () => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(timeRange) {
      case '1m':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case '6m':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      case 'all':
        cutoffDate = new Date('2009-01-01');
        break;
    }

    return chartData.filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= cutoffDate && pointDate <= now;
    });
  };

  const filteredData = getFilteredChartData();

  // Get the latest price from chart data
  const latestChartPrice = filteredData.length > 0 ? filteredData[filteredData.length - 1].price : null;
  
  // Calculate 24h change from chart data
  const calculate24hChange = () => {
    if (!filteredData || filteredData.length < 2) return null;
    
    const latest = filteredData[filteredData.length - 1];
    const latestDate = new Date(latest.date);
    
    // Find price from 24 hours ago
    const yesterdayDate = new Date(latestDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    // Find closest data point to 24 hours ago
    let yesterdayPrice = null;
    for (let i = filteredData.length - 1; i >= 0; i--) {
      const pointDate = new Date(filteredData[i].date);
      if (pointDate <= yesterdayDate) {
        yesterdayPrice = filteredData[i].price;
        break;
      }
    }
    
    // If no data point found, use the first available point
    if (yesterdayPrice === null && filteredData.length > 0) {
      yesterdayPrice = filteredData[0].price;
    }
    
    if (yesterdayPrice && latestChartPrice) {
      const change = latestChartPrice - yesterdayPrice;
      const changePercent = yesterdayPrice > 0 ? (change / yesterdayPrice) * 100 : 0;
      return { change, changePercent };
    }
    
    return null;
  };

  const change24h = calculate24hChange();

  // Calculate wallet balance over time - aligned with price chart timeline
  const calculateWalletBalanceData = () => {
    if (!transactions || transactions.length === 0 || filteredData.length === 0) return [];
    
    // Sort transactions chronologically (oldest first)
    const sortedTxs = [...transactions].sort((a, b) => a.time - b.time);
    
    // Start balance at 0 (lege wallet)
    let currentBalance = 0;
    
    // Create a map of dates to balance (only on transaction dates)
    const balanceByDate = new Map<string, number>();
    
    // Process each transaction in chronological order
    sortedTxs.forEach(tx => {
      const btcAmount = Math.abs(tx.value) / 100000000;
      const date = new Date(tx.time * 1000).toISOString().split('T')[0];
      
      if (tx.value > 0) {
        // BUY: voeg BTC toe (ga omhoog in de plus)
        currentBalance += btcAmount;
      } else if (tx.value < 0) {
        // SELL: trek BTC af (ga omlaag)
        currentBalance -= btcAmount;
        // Zorg dat balance niet negatief wordt (kan niet verkopen wat je niet hebt)
        if (currentBalance < 0) {
          currentBalance = 0;
        }
      }
      
      // Sla balance op voor deze datum
      balanceByDate.set(date, currentBalance);
    });
    
    // Create balance data for each date in the price chart
    // Balance blijft hetzelfde tot er een nieuwe transactie is
    const balanceData: { date: string; balance: number }[] = [];
    let lastKnownBalance = 0;
    
    filteredData.forEach(pricePoint => {
      const date = pricePoint.date;
      
      // Als er een transactie was op deze datum, gebruik die balance
      if (balanceByDate.has(date)) {
        lastKnownBalance = balanceByDate.get(date)!;
      }
      
      // Balance blijft hetzelfde tot volgende transactie
      balanceData.push({ date, balance: lastKnownBalance });
    });
    
    return balanceData;
  };

  const walletBalanceData = calculateWalletBalanceData();

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">📊 Live Bitcoin Chart</h3>
          {latestChartPrice && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(latestChartPrice)}
              </span>
              {change24h && (
                <div className={`flex items-center gap-1 ${
                  change24h.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change24h.changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {change24h.changePercent >= 0 ? '+' : ''}{change24h.changePercent.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Buttons */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTimeRange('1m')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeRange === '1m' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              1M
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeRange === '6m' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeRange === '1y' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              1Y
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeRange === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Alles
            </button>
          </div>

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

          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ververs chart data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        {filteredData.length > 0 ? (
          <PriceChart
            data={filteredData}
            height={450}
            color="#f97316"
            showGrid={true}
            purchasePoints={purchasePoints}
            purchaseDetails={purchaseDetails}
            onTransactionClick={onTransactionClick}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Laden van grafiekgegevens...</p>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 text-sm text-gray-600">
        {transactions.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-blue-600 font-medium">💡 Hover over de punten op de chart voor transactie details.</p>
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
                <span className="text-gray-700"><strong>Groen</strong> = Winstgevend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md"></div>
                <span className="text-gray-700"><strong>Rood</strong> = Verliesgevend</span>
              </div>
              <div className="text-gray-500 ml-auto">
                ✅ <strong>{transactions.length}</strong> transactie{transactions.length !== 1 ? 's' : ''} zichtbaar op chart
              </div>
            </div>
          </div>
        ) : (
          <p className="text-orange-600">Voeg een wallet toe met transacties om je inkoop punten op de chart te zien.</p>
        )}
      </div>

      {/* Wallet Balance Chart - Inklapbaar */}
      {transactions.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <button
            onClick={() => setShowWalletBalanceChart(!showWalletBalanceChart)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">💰 Wallet Balance Chart</span>
              <span className="text-xs text-gray-500">
                {walletBalanceData.length > 0 && (() => {
                  const balance = walletBalanceData[walletBalanceData.length - 1].balance;
                  const formatted = Math.abs(balance) < 0.01 
                    ? balance.toFixed(6) 
                    : Math.abs(balance) < 1 
                    ? balance.toFixed(4) 
                    : balance.toFixed(2);
                  return `Huidig: ${formatted} BTC`;
                })()}
              </span>
            </div>
            {showWalletBalanceChart ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showWalletBalanceChart && (
            <div className="mt-4">
              <WalletBalanceChart
                balanceData={walletBalanceData}
                priceData={filteredData}
                height={200}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Wallet Balance Chart Component
function WalletBalanceChart({ 
  balanceData, 
  priceData, 
  height = 200 
}: { 
  balanceData: { date: string; balance: number }[];
  priceData: PriceData[];
  height?: number;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!canvasRef.current || balanceData.length === 0 || priceData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use same dimensions as PriceChart
    const padding = { top: 30, right: 50, bottom: 50, left: 70 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use same date range as price chart
    if (priceData.length === 0) return;
    
    const minDate = new Date(priceData[0].date);
    const maxDate = new Date(priceData[priceData.length - 1].date);
    const dateRange = maxDate.getTime() - minDate.getTime();

    // Find balance range - always include 0
    const balances = balanceData.map(d => d.balance);
    const minBalance = Math.min(0, ...balances);
    const maxBalance = Math.max(0, ...balances, ...balances);
    const balanceRange = Math.max(maxBalance - minBalance, 0.1) || 0.1;

    // Draw grid (same style as PriceChart)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();
    }

    // Draw zero line
    const zeroY = padding.top + chartHeight - ((0 - minBalance) / balanceRange) * chartHeight;
    if (zeroY >= padding.top && zeroY <= padding.top + chartHeight) {
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(canvas.width - padding.right, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw balance line
    if (balanceData.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      balanceData.forEach((point, index) => {
        const date = new Date(point.date);
        const x = padding.left + ((date.getTime() - minDate.getTime()) / dateRange) * chartWidth;
        const y = padding.top + chartHeight - ((point.balance - minBalance) / balanceRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points only at transaction dates (where balance changes)
      const balanceMap = new Map(balanceData.map(d => [d.date, d.balance]));
      const prevBalances = new Map<string, number>();
      balanceData.forEach((point, index) => {
        if (index > 0) {
          prevBalances.set(point.date, balanceData[index - 1].balance);
        }
      });

      balanceData.forEach((point, index) => {
        const prevBalance = index > 0 ? balanceData[index - 1].balance : 0;
        // Only draw point if balance changed
        if (Math.abs(point.balance - prevBalance) > 0.00000001) {
          const date = new Date(point.date);
          const x = padding.left + ((date.getTime() - minDate.getTime()) / dateRange) * chartWidth;
          const y = padding.top + chartHeight - ((point.balance - minBalance) / balanceRange) * chartHeight;

          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = '#3b82f6';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    }

    // Draw Y-axis labels (BTC balance) - smaller, better formatted
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 5; i++) {
      const value = minBalance + (balanceRange / 5) * (5 - i);
      const y = padding.top + (chartHeight / 5) * i;
      
      // Format number nicely - less decimals for larger numbers
      let formattedValue: string;
      if (Math.abs(value) < 0.01) {
        formattedValue = value.toFixed(6);
      } else if (Math.abs(value) < 1) {
        formattedValue = value.toFixed(4);
      } else if (Math.abs(value) < 100) {
        formattedValue = value.toFixed(2);
      } else {
        formattedValue = value.toFixed(0);
      }
      
      ctx.fillText(formattedValue, padding.left - 12, y);
    }

    // Draw X-axis labels (dates) - same format as PriceChart
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Show same number of labels as PriceChart (approximately)
    const numLabels = Math.min(8, priceData.length);
    const step = Math.max(1, Math.floor(priceData.length / numLabels));
    
    for (let i = 0; i < priceData.length; i += step) {
      const pricePoint = priceData[i];
      const date = new Date(pricePoint.date);
      const x = padding.left + ((date.getTime() - minDate.getTime()) / dateRange) * chartWidth;
      
      // Format date same as PriceChart
      const month = date.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });
      const year = date.getFullYear();
      const yearStr = year.toString().slice(-2);
      
      ctx.fillText(`${month} ${yearStr}`, x, canvas.height - padding.bottom + 12);
    }

    // Y-axis label - smaller
    ctx.save();
    ctx.translate(18, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#374151';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('BTC Balance', 0, 0);
    ctx.restore();
  }, [balanceData, priceData, height]);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full"
        style={{ maxWidth: '100%', height: `${height}px` }}
      />
    </div>
  );
}
