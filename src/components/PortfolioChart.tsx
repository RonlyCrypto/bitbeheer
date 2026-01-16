import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Eye, EyeOff } from 'lucide-react';
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
  const sortedTransactions = [...transactions].sort((a, b) => a.time - b.time);
  
  const purchaseDetails = showTransactions ? transactions.map((tx, index) => {
    if (!tx.time || !tx.price || isNaN(tx.time) || isNaN(tx.price)) {
      return null;
    }
    const isBuy = tx.value > 0;
    const btcAmount = Math.abs(tx.value) / 100000000;
    
    // Vind chronologische index voor nummering (oudste = #1)
    const chronologicalIndex = sortedTransactions.findIndex(t => 
      t.hash === tx.hash && t.time === tx.time
    );
    const transactionNumber = chronologicalIndex !== -1 ? chronologicalIndex + 1 : index + 1;
    
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
    </div>
  );
}
