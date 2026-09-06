import React from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { BitcoinTransaction } from '../services/bitcoinApiService';
import { BuyFifoSummary, SellFifoSummary } from '../utils/fifoMatching';

interface TransactionDetailsPopupProps {
  transaction: BitcoinTransaction;
  onClose: () => void;
  allTransactions?: BitcoinTransaction[];
  buyFifo?: BuyFifoSummary; // FIFO-matched sold/held breakdown, only set when this is a buy
  sellFifo?: SellFifoSummary; // FIFO-matched cost basis, only set when this is a sell
}

export default function TransactionDetailsPopup({ transaction, onClose, buyFifo, sellFifo }: TransactionDetailsPopupProps) {
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

  // Determine if this is a buy or sell
  const isBuy = transaction.value > 0;
  const isSell = transaction.value < 0;
  const btcAmount = Math.abs(transaction.value) / 100000000;

  const soldBtc = buyFifo?.soldBtc ?? 0;
  const isFullySold = buyFifo?.isFullySold ?? false;
  const isPartiallySold = soldBtc > 1e-8 && !isFullySold;

  const actualProfit = isSell ? (sellFifo?.profit ?? transaction.profit) : transaction.profit;
  const actualProfitPercent = isSell ? (sellFifo?.profitPercent ?? transaction.profitPercent) : transaction.profitPercent;
  const isProfit = actualProfit >= 0;

  const purchaseValue = btcAmount * transaction.price;
  const currentValue = Math.abs(transaction.currentValue);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${isBuy ? (transaction.profit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600') : (isProfit ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600')} text-white p-4 flex items-center justify-between`}>
          <div>
            <h2 className="text-xl font-bold">Transactie Details</h2>
            <p className="text-xs text-gray-100 mt-0.5">{formatDate(transaction.time)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          
          {/* Transaction Hash */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">TRANSACTIE HASH</label>
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
          {isBuy ? (
            <>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                    BITCOIN BEDRAG
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">↓ Ontvangen</span>
                  </label>
                  <p className="text-xl font-bold text-blue-900">{btcAmount.toFixed(8)} BTC</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <label className="text-xs font-semibold text-orange-700 mb-1 block">INKOOPPRIJS / BTC</label>
                  <p className="text-xl font-bold text-orange-900">${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Purchase Value */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <label className="text-xs font-semibold text-purple-700 mb-1 block">TOTALE AANKOOP WAARDE</label>
                <p className="text-xl font-bold text-purple-900">${purchaseValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {btcAmount.toFixed(8)} BTC × ${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <label className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                    BITCOIN BEDRAG
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">↑ Verstuurd</span>
                  </label>
                  <p className="text-xl font-bold text-blue-900">-{btcAmount.toFixed(8)} BTC</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <label className="text-xs font-semibold text-red-700 mb-1 block">VERKOOPPRIJS / BTC</label>
                  <p className="text-xl font-bold text-red-900">${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  {!!sellFifo?.averageBuyPrice && (
                    <p className="text-xs text-red-600 mt-1">
                      Ingekocht bij: ${sellFifo.averageBuyPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })} / BTC
                    </p>
                  )}
                </div>
              </div>

              {/* Sale Value */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <label className="text-xs font-semibold text-purple-700 mb-1 block">TOTALE VERKOOP WAARDE</label>
                <p className="text-xl font-bold text-purple-900">${purchaseValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {btcAmount.toFixed(8)} BTC × ${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          )}

          {/* Tegenpartij adres(sen) */}
          {(() => {
            const counterpartyAddresses = isBuy ? transaction.fromAddresses : transaction.toAddresses;
            if (!counterpartyAddresses || counterpartyAddresses.length === 0) return null;
            return (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  {isBuy ? 'ONTVANGEN VAN' : 'VERSTUURD NAAR'}
                </label>
                <div className="space-y-1">
                  {counterpartyAddresses.map((addr, i) => (
                    <p key={i} className="text-sm font-mono text-gray-900 break-all bg-white rounded px-2 py-1 border border-gray-200">
                      {addr}
                    </p>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Current Value & Profit */}
          {isBuy ? (
            soldBtc > 1e-8 ? (
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">VERKOCHT VOOR</label>
                  <p className="text-xl font-bold text-gray-900">${(buyFifo?.soldValue ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {soldBtc.toFixed(8)} BTC {isFullySold ? '(volledig)' : `van ${(buyFifo?.totalBtc ?? 0).toFixed(8)} BTC`}
                  </p>
                </div>
                <div className={`rounded-lg p-3 border-2 ${(buyFifo?.realizedProfit ?? 0) >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <label className={`text-xs font-semibold mb-1 block ${(buyFifo?.realizedProfit ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    WINST (GEREALISEERD)
                  </label>
                  <p className={`text-xl font-bold ${(buyFifo?.realizedProfit ?? 0) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {(buyFifo?.realizedProfit ?? 0) >= 0 ? '+' : ''}${(buyFifo?.realizedProfit ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-xs mt-1 ${(buyFifo?.realizedProfit ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {(buyFifo?.realizedProfit ?? 0) >= 0 ? '+' : ''}{(buyFifo?.realizedProfitPercent ?? 0).toFixed(2)}%
                  </p>
                  {isPartiallySold && (
                    <p className="text-xs text-gray-500 mt-1">Nog in bezit: {(buyFifo?.remainingBtc ?? 0).toFixed(8)} BTC</p>
                  )}
                </div>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">HUIDIGE WAARDE</label>
                <p className="text-xl font-bold text-gray-900">${currentValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className={`rounded-lg p-3 border-2 ${transaction.profit >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <label className={`text-xs font-semibold mb-1 block ${transaction.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {transaction.profit >= 0 ? 'WINST' : 'VERLIES'}
                </label>
                <p className={`text-xl font-bold ${transaction.profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {transaction.profit >= 0 ? '+' : ''}${transaction.profit.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs mt-1 ${transaction.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {transaction.profit >= 0 ? '+' : ''}{transaction.profitPercent.toFixed(2)}%
                </p>
              </div>
            </div>
            )
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">HUIDIGE WAARDE</label>
                <p className="text-xl font-bold text-gray-900">${currentValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500 mt-0.5">Als je het niet verkocht had</p>
              </div>
              <div className={`rounded-lg p-3 border-2 ${isProfit ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <label className={`text-xs font-semibold mb-1 block ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {isProfit ? 'WINST NEMEN' : 'VERLIES NEMEN'}
                </label>
                <p className={`text-xl font-bold ${isProfit ? 'text-green-900' : 'text-red-900'}`}>
                  {isProfit ? '+' : ''}${actualProfit.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs mt-1 ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  {isProfit ? '+' : ''}{actualProfitPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          )}

          {/* Performance Bar - Only for buys that aren't fully sold (realized profit is shown above instead) */}
          {isBuy && !isFullySold && (() => {
            const profitPercent = transaction.profitPercent;
            const isProfit = profitPercent >= 0;
            const absPercent = Math.abs(profitPercent);
            const barWidth = Math.min(50, absPercent); // Max 50% per side
            
            return (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">PERFORMANCE</label>
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
                  <div className="relative h-4 bg-gray-300 rounded-full overflow-visible">
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

          {/* Age Info */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <label className="text-xs font-semibold text-gray-700 mb-1 block">TRANSACTIE OUDERDOM</label>
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
        <div className="bg-gray-50 px-4 py-3 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}

