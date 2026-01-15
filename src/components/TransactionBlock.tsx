import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Hash, Coins, DollarSign, CheckCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { BitcoinTransaction } from '../services/bitcoinApiService';

interface TransactionBlockProps {
  transaction: BitcoinTransaction;
  index: number;
  onTransactionClick?: (transaction: BitcoinTransaction) => void;
  allTransactions?: BitcoinTransaction[]; // Alle transacties voor balance tracking
}

export default function TransactionBlock({ transaction, index, onTransactionClick, allTransactions = [] }: TransactionBlockProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  
  // Determine if this is a buy or sell
  const isBuy = transaction.value > 0;
  const isSell = transaction.value < 0;
  
  // Calculate running balance after this transaction
  const calculateBalanceAfter = () => {
    if (!allTransactions || allTransactions.length === 0) return 0;
    
    // Sort transactions by time
    const sortedTxs = [...allTransactions].sort((a, b) => a.time - b.time);
    
    // Find index of current transaction
    const currentIndex = sortedTxs.findIndex(tx => tx.hash === transaction.hash && tx.time === transaction.time);
    if (currentIndex === -1) return 0;
    
    // Calculate balance up to and including this transaction
    let balance = 0;
    for (let i = 0; i <= currentIndex; i++) {
      balance += sortedTxs[i].value / 100000000; // Convert satoshis to BTC
    }
    
    return balance;
  };
  
  // Calculate profit for sell based on FIFO (first buy price)
  const calculateSellProfit = () => {
    if (!isSell || !allTransactions || allTransactions.length === 0) {
      return { profit: transaction.profit, profitPercent: transaction.profitPercent, buyPrice: null };
    }
    
    // Sort transactions by time
    const sortedTxs = [...allTransactions].sort((a, b) => a.time - b.time);
    const currentIndex = sortedTxs.findIndex(tx => tx.hash === transaction.hash && tx.time === transaction.time);
    
    if (currentIndex === -1) {
      return { profit: transaction.profit, profitPercent: transaction.profitPercent, buyPrice: null };
    }
    
    // Find previous buys (FIFO)
    const sellAmount = Math.abs(transaction.value) / 100000000;
    let remainingToMatch = sellAmount;
    let totalBuyCost = 0;
    let averageBuyPrice = 0;
    
    for (let i = 0; i < currentIndex; i++) {
      if (sortedTxs[i].value > 0) { // Only buys
        const buyAmount = sortedTxs[i].value / 100000000;
        const buyPrice = sortedTxs[i].price;
        
        if (remainingToMatch > 0) {
          const matchedAmount = Math.min(buyAmount, remainingToMatch);
          totalBuyCost += matchedAmount * buyPrice;
          remainingToMatch -= matchedAmount;
        }
      }
    }
    
    if (totalBuyCost > 0 && sellAmount > 0) {
      averageBuyPrice = totalBuyCost / sellAmount;
      const sellValue = sellAmount * transaction.price;
      const profit = sellValue - totalBuyCost;
      const profitPercent = averageBuyPrice > 0 ? ((transaction.price - averageBuyPrice) / averageBuyPrice) * 100 : 0;
      
      return { profit, profitPercent, buyPrice: averageBuyPrice };
    }
    
    return { profit: transaction.profit, profitPercent: transaction.profitPercent, buyPrice: null };
  };
  
  const balanceAfter = calculateBalanceAfter();
  const sellProfitInfo = calculateSellProfit();
  const actualProfit = isSell ? sellProfitInfo.profit : transaction.profit;
  const actualProfitPercent = isSell ? sellProfitInfo.profitPercent : transaction.profitPercent;
  const isProfit = actualProfit >= 0;

  const copyHash = () => {
    navigator.clipboard.writeText(transaction.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const openBlockchain = () => {
    window.open(`https://www.blockchain.com/en/btc/tx/${transaction.hash}`, '_blank');
  };

  const formatDate = (timestamp: number | string | Date) => {
    try {
      // Debug logging
      if (!timestamp) {
        console.warn('formatDate: No timestamp provided', { timestamp, transactionTime: transaction.time });
        return 'Invalid Date';
      }

      let date: Date;
      
      // Handle different timestamp formats
      if (typeof timestamp === 'number') {
        // Check if it's a valid Unix timestamp
        // Unix timestamps are typically between 1e9 and 2e9 (for dates 2001-2033)
        // If larger, assume it's already in milliseconds
        if (timestamp > 1e11) {
          // Already in milliseconds
          date = new Date(timestamp);
        } else {
          // In seconds, convert to milliseconds
          date = new Date(timestamp * 1000);
        }
      } else if (typeof timestamp === 'string') {
        // Try parsing as ISO string or other formats
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        console.warn('formatDate: Unknown timestamp type', { type: typeof timestamp, timestamp });
        return 'Invalid Date';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('formatDate: Invalid date after parsing', { timestamp, date: date.toString() });
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e, timestamp);
      return 'Invalid Date';
    }
  };

  const formatValue = (value: number) => {
    return (value / 100000000).toFixed(8); // Convert satoshis to BTC
  };


  return (
    <div 
      className={`bg-white rounded-xl p-4 shadow-lg border-l-4 transition-all duration-300 relative ${
        isProfit ? 'border-l-green-500' : 'border-l-red-500'
      }`}
    >
      {/* Rood lintje voor verkoop transacties */}
      {isSell && (
        <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-2 text-sm font-bold rounded-bl-lg rounded-tr-xl shadow-lg z-10 uppercase tracking-wide">
          Verkoop
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className={`p-1.5 rounded-lg ${
            isProfit ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isProfit ? (
              <TrendingUp className={`w-4 h-4 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <TrendingDown className={`w-4 h-4 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
            )}
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              Transactie #{index + 1}
            </h4>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(transaction.time)}
            </p>
            {(() => {
              // Calculate age of transaction
              try {
                if (!transaction.time || typeof transaction.time !== 'number') {
                  return <p className="text-xs text-gray-500 mt-1">Age: Unknown</p>;
                }
                
                const txDate = new Date(transaction.time * 1000);
                if (isNaN(txDate.getTime())) {
                  return <p className="text-xs text-gray-500 mt-1">Age: Invalid</p>;
                }
                
                const now = new Date();
                const ageMs = now.getTime() - txDate.getTime();
                const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
                const ageYears = Math.floor(ageDays / 365);
                const ageMonths = Math.floor((ageDays % 365) / 30);
                
                let ageStr = '';
                if (ageYears > 0) {
                  ageStr = `${ageYears}y${ageMonths > 0 ? ` ${ageMonths}m` : ''}`;
                } else if (ageMonths > 0) {
                  ageStr = `${ageMonths}m ${ageDays % 30}d`;
                } else {
                  ageStr = `${ageDays}d`;
                }
                
                return (
                  <p className="text-xs text-gray-500 mt-1">
                    Age: {ageStr}
                  </p>
                );
              } catch (e) {
                console.error('Error calculating age:', e);
                return <p className="text-xs text-gray-500 mt-1">Age: Error</p>;
              }
            })()}
          </div>
        </div>

        {!isSell && (
        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          isProfit 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isProfit ? 'Winst' : 'Verlies'}
        </div>
        )}
        {isSell && (
          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            isProfit 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isProfit ? 'Winst nemen' : 'Verlies nemen'}
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        {/* Bitcoin Amount */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Coins className="w-3 h-3" />
            <span>Bitcoin Bedrag</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatValue(transaction.value)} BTC
          </p>
        </div>

        {/* Transaction Hash */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Hash className="w-3 h-3" />
            <span>Transactie Hash</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono text-gray-700 break-all flex-1">
              {transaction.hash.slice(0, 16)}...{transaction.hash.slice(-8)}
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyHash();
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Kopieren"
              >
                {copiedHash ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openBlockchain();
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open op blockchain.com"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Details - First Row */}
      {isBuy ? (
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        {/* Inkoopprijs per Bitcoin */}
          <div 
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200"
        >
          <div className="flex items-center gap-1.5 text-xs text-blue-700 mb-1">
            <DollarSign className="w-3 h-3" />
            <span className="font-semibold">Inkoopprijs / BTC</span>
          </div>
          <p className="text-lg font-bold text-blue-900">
            ${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-blue-600 mt-0.5">
              BTC prijs op blockchain op moment van transactie
          </p>
          </div>

        {/* Waarde bij Aankoop */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center gap-1.5 text-xs text-orange-700 mb-1">
            <DollarSign className="w-3 h-3" />
            <span className="font-semibold">Totale Aankoop Waarde</span>
          </div>
          <p className="text-lg font-bold text-orange-900">
              ${((transaction.value / 100000000) * transaction.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-orange-600 mt-0.5">
            {(transaction.value / 100000000).toFixed(8)} BTC @ ${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* Verkoopprijs per Bitcoin */}
          <div 
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200"
          >
            <div className="flex items-center gap-1.5 text-xs text-red-700 mb-1">
              <DollarSign className="w-3 h-3" />
              <span className="font-semibold">Verkoopprijs / BTC</span>
            </div>
            <p className="text-lg font-bold text-red-900">
              ${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-red-600 mt-0.5">
              BTC prijs op blockchain op moment van transactie
            </p>
            {sellProfitInfo.buyPrice && (
              <p className="text-[10px] text-red-500 mt-1">
                Ingekocht bij: ${sellProfitInfo.buyPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} / BTC
              </p>
            )}
          </div>

          {/* Totale Verkoop Waarde */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center gap-1.5 text-xs text-orange-700 mb-1">
              <DollarSign className="w-3 h-3" />
              <span className="font-semibold">Totale Verkoop Waarde</span>
            </div>
            <p className="text-lg font-bold text-orange-900">
              ${((Math.abs(transaction.value) / 100000000) * transaction.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-orange-600 mt-0.5">
              {(Math.abs(transaction.value) / 100000000).toFixed(8)} BTC @ ${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}

      {/* Performance Details - Second Row */}
      {isBuy ? (
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        {/* Huidige Waarde */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>Huidige Waarde</span>
          </div>
          <p className="text-base font-semibold text-gray-900">
            ${transaction.currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Vandaag
          </p>
        </div>

        {/* Profit/Loss */}
        <div className={`rounded-lg p-3 border-2 ${
          isProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-1.5 text-xs mb-1">
            {isProfit ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={isProfit ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
              {isProfit ? 'Winst' : 'Verlies'}
            </span>
          </div>
          <p className={`text-base font-bold ${
            isProfit ? 'text-green-700' : 'text-red-700'
          }`}>
            {isProfit ? '+' : ''}${transaction.profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-xs font-semibold ${
            isProfit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isProfit ? '+' : ''}{transaction.profitPercent.toFixed(2)}%
          </p>
        </div>

        {/* Buy Status Indicator */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="font-semibold">Status</span>
          </div>
          <p className="text-base font-semibold text-gray-900">
            Gekocht
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {transaction.valueInBTC?.toFixed(4) || (transaction.value / 100000000).toFixed(4)} BTC
          </p>
        </div>
      </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          {/* Huidige Waarde (wat het nu waard zou zijn) */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Huidige Waarde</span>
            </div>
            <p className="text-base font-semibold text-gray-900">
              ${Math.abs(transaction.currentValue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Als je het niet verkocht had
            </p>
          </div>

          {/* Winst nemen / Verlies nemen */}
          <div className={`rounded-lg p-3 border-2 ${
            isProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-1.5 text-xs mb-1">
              {isProfit ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={isProfit ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                {isProfit ? 'Winst nemen' : 'Verlies nemen'}
              </span>
            </div>
            <p className={`text-base font-bold ${
              isProfit ? 'text-green-700' : 'text-red-700'
            }`}>
              {isProfit ? '+' : ''}${actualProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className={`text-xs font-semibold ${
              isProfit ? 'text-green-600' : 'text-red-600'
            }`}>
              {isProfit ? '+' : ''}{actualProfitPercent.toFixed(2)}%
            </p>
          </div>

          {/* Sell Status Indicator */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <CheckCircle className="w-3 h-3 text-red-600" />
              <span className="font-semibold">Status</span>
            </div>
            <p className="text-base font-semibold text-gray-900">
              Verkocht
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Wallet na verkoop: {balanceAfter.toFixed(4)} BTC
            </p>
          </div>
        </div>
      )}

      {/* Performance Bar - Only for buys */}
      {isBuy && (() => {
        const profitPercent = transaction.profitPercent;
        const isProfit = profitPercent >= 0;
        const absPercent = Math.abs(profitPercent);
        const barWidth = Math.min(50, absPercent); // Max 50% per side
        
        return (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-700 mb-1.5">Performance</div>
            <div className="relative">
              {/* Percentage label - centered above bar */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-20">
                <span 
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isProfit ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {isProfit ? '+' : ''}{profitPercent.toFixed(2)}%
                </span>
              </div>
              
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 z-10 transform -translate-x-1/2"></div>
              
              {/* Progress bar container */}
              <div className="relative h-3 bg-gray-200 rounded-full overflow-visible">
                {!isProfit ? (
                  // Loss: from center to left, orange to red
                  <div
                    className="absolute right-1/2 h-full transition-all duration-500"
                    style={{ 
                      width: `${barWidth}%`,
                      background: 'linear-gradient(to left, #ef4444, #f97316)',
                      borderRadius: '9999px 0 0 9999px'
                    }}
                  ></div>
                ) : (
                  // Profit: from center to right, orange to green
                  <div
                    className="absolute left-1/2 h-full transition-all duration-500"
                    style={{ 
                      width: `${barWidth}%`,
                      background: 'linear-gradient(to right, #f97316, #22c55e)',
                      borderRadius: '0 9999px 9999px 0'
                    }}
                  ></div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Click Hint - Only this section is clickable */}
      <div 
        className="mt-3 text-center cursor-pointer"
        onClick={() => onTransactionClick?.(transaction)}
      >
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
          Klik voor meer details
        </button>
      </div>
    </div>
  );
}
