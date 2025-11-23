import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, X } from 'lucide-react';

interface MarketStatusWidgetProps {
  position?: 'below_previous_ath' | 'between_aths' | 'above_latest_ath' | 'unknown';
  compact?: boolean;
  currentPrice?: number;
  previousATH?: number;
  latestATH?: number;
}

export default function MarketStatusWidget({ 
  position = 'unknown', 
  compact = false,
  currentPrice = 42250,
  previousATH = 19700,
  latestATH = 69000
}: MarketStatusWidgetProps) {
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [calculatedResult, setCalculatedResult] = useState<{
    btcAmount: number;
    valueAtPreviousATH: number;
    valueAtLatestATH: number;
    profitAtPreviousATH: number;
    profitPercentAtPreviousATH: number;
    profitAtLatestATH: number;
    profitPercentAtLatestATH: number;
  } | null>(null);

  const getStatusInfo = () => {
    switch (position) {
      case 'below_previous_ath':
        return {
          color: 'green',
          title: 'VEILIG',
          subtitle: 'Onder vorige ATH',
          advice: 'Beste koopkans',
          icon: TrendingUp,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          textColor: 'text-green-700',
          textColorBold: 'text-green-900',
        };
      case 'between_aths':
        return {
          color: 'orange',
          title: 'NEUTRAAL',
          subtitle: 'Tussen vorige & huidge ATH',
          advice: 'Wachten',
          icon: AlertCircle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-700',
          textColorBold: 'text-orange-900',
        };
      case 'above_latest_ath':
        return {
          color: 'red',
          title: 'HOOG RISICO',
          subtitle: 'Boven huidge ATH',
          advice: 'Niet kopen - Hodlen',
          icon: TrendingDown,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-700',
          textColorBold: 'text-red-900',
        };
      default:
        return {
          color: 'gray',
          title: 'ONBEKEND',
          subtitle: 'Laden...',
          advice: 'Gegevens laden',
          icon: AlertCircle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          textColorBold: 'text-gray-900',
        };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  const handleCalculate = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const btcBought = amount / currentPrice;
    const valueAtPrevATH = btcBought * previousATH;
    const profitAtPrevATH = valueAtPrevATH - amount;
    const profitPercentPrevATH = (profitAtPrevATH / amount) * 100;

    const valueAtLatATH = btcBought * latestATH;
    const profitAtLatATH = valueAtLatATH - amount;
    const profitPercentLatATH = (profitAtLatATH / amount) * 100;

    setCalculatedResult({
      btcAmount: btcBought,
      valueAtPreviousATH: valueAtPrevATH,
      valueAtLatestATH: valueAtLatATH,
      profitAtPreviousATH: profitAtPrevATH,
      profitPercentAtPreviousATH: profitPercentPrevATH,
      profitAtLatestATH: profitAtLatATH,
      profitPercentAtLatestATH: profitPercentLatATH
    });
  };

  if (compact) {
    const onOpenFullView = () => {
      window.dispatchEvent(new CustomEvent('openMarketStatusPage', { detail: { position, currentPrice, previousATH, latestATH } }));
    };

    return (
      <button
        onClick={onOpenFullView}
        className={`w-full text-left ${status.bgColor} border-2 ${status.borderColor} rounded-xl p-4 overflow-visible hover:shadow-lg transition-all cursor-pointer`}
      >
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 relative">
            <div className="w-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl p-1 shadow-lg" style={{ minHeight: '72px' }}>
              <div className="w-full h-full bg-black rounded-2xl p-2 flex flex-col justify-around items-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black rounded-2xl opacity-30"></div>
                
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    {position === 'above_latest_ath' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500 animate-pulse"></div>
                    )}
                    {position !== 'above_latest_ath' && (
                      <div className="w-7 h-7 rounded-full bg-red-900 opacity-30"></div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    {position === 'between_aths' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500 animate-pulse"></div>
                    )}
                    {position !== 'between_aths' && (
                      <div className="w-7 h-7 rounded-full bg-orange-900 opacity-30"></div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    {position === 'below_previous_ath' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500 animate-pulse"></div>
                    )}
                    {position !== 'below_previous_ath' && (
                      <div className="w-7 h-7 rounded-full bg-green-900 opacity-30"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-2">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className={`text-sm font-bold ${status.textColorBold}`}>{status.title}</p>
            </div>
            <p className={`text-xs ${status.textColor} leading-tight mb-2`}>{status.subtitle}</p>
            <p className={`text-xs font-semibold ${status.textColor}`}>{status.advice}</p>
          </div>
        </div>
      </button>
    );
  }

  // Full version
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="w-full p-4 text-left border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">📊 Markt Positie Analyse</h3>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              position === 'above_latest_ath' ? 'bg-red-100 text-red-700' :
              position === 'between_aths' ? 'bg-orange-100 text-orange-700' :
              position === 'below_previous_ath' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {status.title}
            </span>
          </div>
          <p className="text-xs text-gray-600">{status.subtitle}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="w-14 bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl p-1 shadow-lg">
              <div className="w-full bg-black rounded-2xl p-2 flex flex-col justify-around items-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black rounded-2xl opacity-30"></div>
                
                <div className="relative z-10 flex items-center justify-center py-1">
                  <div className="w-9 h-9 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    {position === 'above_latest_ath' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500 animate-pulse"></div>
                    )}
                    {position !== 'above_latest_ath' && (
                      <div className="w-7 h-7 rounded-full bg-red-900 opacity-30"></div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-center py-1">
                  <div className="w-9 h-9 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    {position === 'between_aths' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500 animate-pulse"></div>
                    )}
                    {position !== 'between_aths' && (
                      <div className="w-7 h-7 rounded-full bg-orange-900 opacity-30"></div>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-center py-1">
                  <div className="w-9 h-9 rounded-full border-2 border-gray-600 flex items-center justify-center">
                    {position === 'below_previous_ath' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500 animate-pulse"></div>
                    )}
                    {position !== 'below_previous_ath' && (
                      <div className="w-7 h-7 rounded-full bg-green-900 opacity-30"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 flex items-center">
                <div className="absolute left-0 h-full w-1.5 bg-blue-600 rounded-full"></div>
                <div className="absolute right-0 h-full w-1.5 bg-red-600 rounded-full"></div>
              </div>
            </div>

            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <div className="text-left">
                <div className="text-gray-600">💙 Vorige ATH</div>
                <div className="font-mono">${previousATH.toLocaleString('en-US')}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Huige Prijs</div>
                <div className="font-mono">${currentPrice.toLocaleString('en-US')}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-600">❤️ Huidge ATH</div>
                <div className="font-mono">${latestATH.toLocaleString('en-US')}</div>
              </div>
            </div>

            <p className={`text-sm font-semibold text-center ${status.textColor}`}>{status.advice}</p>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">💰 Investering Calculator</h4>
              
              <div className="flex gap-4">
                <div className="w-32 space-y-2">
                  <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 bg-white focus-within:ring-2 focus-within:ring-blue-400">
                    <span className="text-gray-500 font-semibold text-sm">$</span>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => {
                        setInvestmentAmount(e.target.value);
                        setCalculatedResult(null);
                      }}
                      placeholder="Bedrag"
                      className="flex-1 ml-1 outline-none text-xs font-mono"
                    />
                  </div>
                  <button
                    onClick={handleCalculate}
                    disabled={!investmentAmount}
                    className="w-full px-3 py-1 bg-blue-500 text-white rounded-lg font-semibold text-xs hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Bereken
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-3 items-stretch">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex flex-col">
                    <div className="text-xs font-semibold text-blue-700 mb-auto">Met ${investmentAmount || '0'}:</div>
                    {calculatedResult && (
                      <div className="text-sm font-bold text-gray-900 mt-2">₿ {calculatedResult.btcAmount.toFixed(6)}</div>
                    )}
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 flex flex-col">
                    <div className="text-xs font-semibold text-green-700 mb-auto">📈 Vorige ATH</div>
                    {calculatedResult && (
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Waarde:</span>
                          <span className="font-bold text-gray-900">${calculatedResult.valueAtPreviousATH.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Winst:</span>
                          <span className={`font-bold ${calculatedResult.profitAtPreviousATH >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${calculatedResult.profitAtPreviousATH.toLocaleString('en-US', {maximumFractionDigits: 0})} ({calculatedResult.profitPercentAtPreviousATH.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex flex-col">
                    <div className="text-xs font-semibold text-blue-700 mb-auto">🚀 Huidge ATH</div>
                    {calculatedResult && (
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Waarde:</span>
                          <span className="font-bold text-gray-900">${calculatedResult.valueAtLatestATH.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Winst:</span>
                          <span className={`font-bold ${calculatedResult.profitAtLatestATH >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${calculatedResult.profitAtLatestATH.toLocaleString('en-US', {maximumFractionDigits: 0})} ({calculatedResult.profitPercentAtLatestATH.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

