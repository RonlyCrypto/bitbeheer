import React from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { BitcoinTransaction } from '../services/bitcoinApiService';

interface TransactionDetailsPopupProps {
  transaction: BitcoinTransaction;
  onClose: () => void;
}

export default function TransactionDetailsPopup({ transaction, onClose }: TransactionDetailsPopupProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const btcAmount = transaction.value / 100000000;
  const purchaseValue = btcAmount * transaction.price;
  const currentValue = transaction.currentValue;
  const profit = transaction.profit;
  const profitPercent = transaction.profitPercent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${profit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white p-6 flex items-center justify-between`}>
          <div>
            <h2 className="text-2xl font-bold">Transactie Details</h2>
            <p className="text-sm text-gray-100 mt-1">{formatDate(transaction.time)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Transaction Hash */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">TRANSACTIE HASH</label>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-gray-900 break-all flex-1">
                {transaction.hash}
              </code>
              <button
                onClick={() => copyToClipboard(transaction.hash, 'hash')}
                className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                {copiedField === 'hash' ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
              <a
                href={`https://blockstream.info/tx/${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Bitcoin Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="text-xs font-semibold text-blue-700 mb-2 block">BITCOIN BEDRAG</label>
              <p className="text-2xl font-bold text-blue-900">{btcAmount.toFixed(8)} BTC</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <label className="text-xs font-semibold text-orange-700 mb-2 block">INKOOPPRIJS / BTC</label>
              <p className="text-2xl font-bold text-orange-900">${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Purchase Value */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <label className="text-xs font-semibold text-purple-700 mb-2 block">TOTALE AANKOOP WAARDE</label>
            <p className="text-2xl font-bold text-purple-900">${purchaseValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-purple-600 mt-2">
              {btcAmount.toFixed(8)} BTC × ${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Current Value & Profit */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
              <label className="text-xs font-semibold text-gray-700 mb-2 block">HUIDIGE WAARDE</label>
              <p className="text-2xl font-bold text-gray-900">${currentValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className={`rounded-lg p-4 border-2 ${profit >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <label className={`text-xs font-semibold mb-2 block ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {profit >= 0 ? 'WINST' : 'VERLIES'}
              </label>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {profit >= 0 ? '+' : ''}${profit.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
              <p className={`text-sm mt-2 ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="text-xs font-semibold text-gray-700 mb-3 block">PERFORMANCE</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, Math.abs(profitPercent))}%` }}
                  ></div>
                </div>
              </div>
              <span className={`text-sm font-semibold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Age Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="text-xs font-semibold text-gray-700 mb-2 block">TRANSACTIE OUDERDOM</label>
            <p className="text-sm text-gray-900">
              {(() => {
                const now = Date.now();
                const txTime = transaction.time * 1000;
                const diffMs = now - txTime;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                if (diffDays > 0) {
                  return `${diffDays} dag${diffDays !== 1 ? 's' : ''} en ${diffHours} uur geleden`;
                } else if (diffHours > 0) {
                  return `${diffHours} uur en ${diffMins} minuten geleden`;
                } else {
                  return `${diffMins} minuten geleden`;
                }
              })()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}

