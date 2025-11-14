import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Hash, Coins, Euro } from 'lucide-react';
import { BitcoinTransaction } from '../services/bitcoinApiService';

interface TransactionBlockProps {
  transaction: BitcoinTransaction;
  index: number;
  onTransactionClick?: (transaction: BitcoinTransaction) => void;
}

export default function TransactionBlock({ transaction, index, onTransactionClick }: TransactionBlockProps) {
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

  const isProfit = transaction.profit >= 0;

  return (
    <div 
      className={`bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl cursor-pointer ${
        isProfit ? 'border-l-green-500 hover:bg-green-50' : 'border-l-red-500 hover:bg-red-50'
      }`}
      onClick={() => onTransactionClick?.(transaction)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isProfit ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isProfit ? (
              <TrendingUp className={`w-5 h-5 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <TrendingDown className={`w-5 h-5 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
            )}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Transactie #{index + 1}
            </h4>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(transaction.time)}
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isProfit 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isProfit ? 'Winst' : 'Verlies'}
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        {/* Bitcoin Amount */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Coins className="w-4 h-4" />
            <span>Bitcoin Bedrag</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatValue(transaction.value)} BTC
          </p>
        </div>

        {/* Transaction Hash */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-4 h-4" />
            <span>Transactie Hash</span>
          </div>
          <p className="text-sm font-mono text-gray-700 break-all">
            {transaction.hash.slice(0, 16)}...{transaction.hash.slice(-8)}
          </p>
        </div>
      </div>

      {/* Price Information */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Inkoop Prijs */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Euro className="w-4 h-4" />
            <span>Waarde bij Aankoop</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            ${(transaction.price * (transaction.value / 100000000)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {transaction.valueInBTC?.toFixed(8) || (transaction.value / 100000000).toFixed(8)} BTC
          </p>
        </div>

        {/* Huidige Waarde */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Huidige Waarde</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            ${transaction.currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Profit/Loss */}
        <div className={`rounded-lg p-4 ${
          isProfit ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={isProfit ? 'text-green-700' : 'text-red-700'}>
              {isProfit ? 'Winst' : 'Verlies'}
            </span>
          </div>
          <p className={`text-lg font-semibold ${
            isProfit ? 'text-green-700' : 'text-red-700'
          }`}>
            {isProfit ? '+' : ''}${transaction.profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-sm ${
            isProfit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isProfit ? '+' : ''}{transaction.profitPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Performance Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Performance</span>
          <span>{transaction.profitPercent.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isProfit ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(Math.abs(transaction.profitPercent), 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Click Hint */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Klik voor meer details
        </p>
      </div>
    </div>
  );
}
