import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MarketStatusWidgetProps {
  position?: 'below_previous_ath' | 'between_aths' | 'above_latest_ath' | 'unknown';
  compact?: boolean;
  currentPrice?: number; // Huige Bitcoin prijs in USD
  previousATH?: number; // Vorige ATH in USD
  latestATH?: number; // Huidge ATH in USD
}

export default function MarketStatusWidget({ 
  position = 'unknown', 
  compact = false,
  currentPrice = 42250,
  previousATH = 19700,
  latestATH = 69000
}: MarketStatusWidgetProps) {
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
          badge: 'buy'
        };
      case 'between_aths':
        return {
          color: 'orange',
          title: 'NEUTRAAL',
          subtitle: 'Tussen vorige & huidige ATH',
          advice: 'Wachten',
          icon: AlertCircle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-700',
          textColorBold: 'text-orange-900',
          badge: 'wait'
        };
      case 'above_latest_ath':
        return {
          color: 'red',
          title: 'HOOG RISICO',
          subtitle: 'Boven huidige ATH',
          advice: 'Niet kopen - Hodlen',
          icon: TrendingDown,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-700',
          textColorBold: 'text-red-900',
          badge: 'hold'
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
          badge: 'unknown'
        };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  if (compact) {
    return (
      <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-xl p-4 overflow-visible`}>
        {/* Compact Stoplicht */}
        <div className="flex gap-4 items-start">
          {/* Mini Traffic Light - Realistic style */}
          <div className="flex-shrink-0 relative">
            {/* Gray outer rim */}
            <div className="w-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl p-1 shadow-lg" style={{ minHeight: '72px' }}>
              {/* Black inner casing */}
              <div className="w-full h-full bg-black rounded-2xl p-2 flex flex-col justify-around items-center relative">
                {/* Dark background */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black rounded-2xl opacity-30"></div>
                
                {/* Red Light */}
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

                {/* Orange Light */}
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

                {/* Green Light */}
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

          {/* Status Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-2">
              <Icon className="w-5 h-5 flex-shrink-0" style={{ color: `var(--color-${status.color})` }} />
              <p className={`text-sm font-bold ${status.textColorBold}`}>{status.title}</p>
            </div>
            <p className={`text-xs ${status.textColor} leading-tight mb-2`}>{status.subtitle}</p>
            
            {/* ATH Range Visualization */}
            <div className="mb-2">
              <div className="bg-gray-200 rounded-full h-2 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex items-center">
                  {/* Previous ATH position (20%) */}
                  <div className="absolute left-0 h-full w-1 bg-blue-500" style={{ left: '20%' }}></div>
                  {/* Current position indicator */}
                  <div 
                    className={`absolute w-3 h-3 rounded-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg ${
                      position === 'above_latest_ath' ? 'bg-red-500' :
                      position === 'between_aths' ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ left: position === 'above_latest_ath' ? '85%' : position === 'between_aths' ? '60%' : '30%' }}
                  ></div>
                  {/* Latest ATH position (100%) */}
                  <div className="absolute right-0 h-full w-1 bg-red-500"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-gray-600">
                <span>Vorige ATH</span>
                <span>Huidge ATH</span>
              </div>
              
              {/* Position percentages */}
              <div className={`text-xs font-semibold mt-2 px-2 py-1 rounded text-center ${status.bgColor}`}>
                {position === 'above_latest_ath' && '↗️ +15% boven ATH'}
                {position === 'between_aths' && '➡️ 40% tussen ATHs'}
                {position === 'below_previous_ath' && '↙️ -30% onder vorige ATH'}
              </div>
            </div>
            
            <p className={`text-xs font-semibold ${status.textColor}`}>{status.advice}</p>
          </div>
        </div>
      </div>
    );
  }

  // Full version for main content area (with ATH visualization)
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleCalculate = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Calculate how many BTC you could buy at current price
    const btcBought = amount / currentPrice;
    
    // Calculate value if price goes to previous ATH
    const valueAtPrevATH = btcBought * previousATH;
    const profitAtPrevATH = valueAtPrevATH - amount;
    const profitPercentPrevATH = (profitAtPrevATH / amount) * 100;

    // Calculate value if price goes to latest ATH
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
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
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
            <span className={`transform transition-transform text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
          <p className="text-xs text-gray-600">{status.subtitle}</p>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-current border-opacity-20 p-6">
          <div className="flex gap-6">
            {/* Smaller Traffic Light - Like Sidebar */}
            <div className="flex-shrink-0">
              <div className="w-14 bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl p-1 shadow-lg">
                <div className="w-full bg-black rounded-2xl p-2 flex flex-col justify-around items-center relative" style={{ minHeight: 'auto' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black rounded-2xl opacity-30"></div>
                  
                  {/* Red Light */}
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

                  {/* Orange Light */}
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

                  {/* Green Light */}
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

            {/* ATH Range Visualization - Beside Traffic Light */}
            <div className="flex-1 space-y-4">
              {/* Calculate position percentage */}
              {(() => {
                const range = latestATH - previousATH;
                const position_value = ((currentPrice - previousATH) / range) * 100;
                const clamped = Math.max(0, Math.min(100, position_value));
                
                // Calculate percentage between ATHs
                let percentageText = '';
                if (currentPrice > latestATH) {
                  const abovePercent = ((currentPrice - latestATH) / latestATH) * 100;
                  percentageText = `↗️ +${abovePercent.toFixed(1)}% BOVEN huidge ATH - HOOG RISICO`;
                } else if (currentPrice < previousATH) {
                  const belowPercent = ((previousATH - currentPrice) / previousATH) * 100;
                  percentageText = `↙️ -${belowPercent.toFixed(1)}% ONDER vorige ATH - VEILIG`;
                } else {
                  const betweenPercent = ((currentPrice - previousATH) / range) * 100;
                  percentageText = `➡️ ${betweenPercent.toFixed(0)}% TUSSEN vorige & huidge ATH - NEUTRAAL`;
                }

                return (
                  <div className="space-y-2">
                    <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden shadow-inner">
                      <div className="absolute inset-0 flex items-center">
                        {/* Previous ATH position (0%) */}
                        <div className="absolute left-0 h-full w-1.5 bg-blue-600 rounded-full"></div>
                        {/* Current position indicator */}
                        <div 
                          className={`absolute w-4 h-4 rounded-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg ${
                            currentPrice > latestATH ? 'bg-red-500' :
                            currentPrice < previousATH ? 'bg-green-500' :
                            'bg-orange-500'
                          }`}
                          style={{ left: `${clamped}%` }}
                        ></div>
                        {/* Latest ATH position (100%) */}
                        <div className="absolute right-0 h-full w-1.5 bg-red-600 rounded-full"></div>
                      </div>
                    </div>

                    {/* ATH Prices and Current Price */}
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <div className="text-left">
                        <div className="text-gray-600">💙 Vorige ATH</div>
                        <div className="font-mono">${previousATH.toLocaleString('en-US')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Huige Prijs</div>
                        <div className={`font-mono ${currentPrice > latestATH ? 'text-red-600' : currentPrice < previousATH ? 'text-green-600' : 'text-orange-600'}`}>
                          ${currentPrice.toLocaleString('en-US')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-600">❤️ Huidge ATH</div>
                        <div className="font-mono">${latestATH.toLocaleString('en-US')}</div>
                      </div>
                    </div>

                    {/* Display percentage text */}
                    <div className={`text-xs font-semibold px-3 py-2 rounded text-center ${status.bgColor} border border-current border-opacity-30`}>
                      📊 {percentageText}
                    </div>
                  </div>
                );
              })()}

              {/* Advice */}
              <p className={`text-sm font-semibold text-center ${status.textColor}`}>{status.advice}</p>

              {/* Investment Calculator */}
              <div className={`pt-4 border-t border-gray-200 transition-all duration-300 ${calculatedResult ? 'space-y-3' : 'space-y-2'}`}>
                <h4 className="text-sm font-semibold text-gray-900">💰 Investering Calculator</h4>
                
                <div className="flex gap-4">
                  {/* Left: Input and Button */}
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

                  {/* Right: Results - All inline, always visible */}
                  <div className={`flex-1 grid grid-cols-3 gap-3 transition-all duration-300 ${calculatedResult ? 'items-stretch' : 'items-start'}`}>
                    {/* BTC Amount */}
                    <div className={`bg-blue-50 rounded-lg p-3 border border-blue-200 flex flex-col transition-all duration-300 ${calculatedResult ? 'min-h-28' : 'min-h-12'}`}>
                      <div className="text-xs font-semibold text-blue-700 mb-auto">Met ${investmentAmount || '0'}:</div>
                      {calculatedResult && (
                        <div className="text-sm font-bold text-gray-900 mt-2">₿ {calculatedResult.btcAmount.toFixed(6)}</div>
                      )}
                    </div>

                    {/* At Previous ATH */}
                    <div className={`bg-green-50 rounded-lg p-3 border border-green-200 flex flex-col transition-all duration-300 ${calculatedResult ? 'min-h-28' : 'min-h-12'}`}>
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

                    {/* At Latest ATH */}
                    <div className={`bg-blue-50 rounded-lg p-3 border border-blue-200 flex flex-col transition-all duration-300 ${calculatedResult ? 'min-h-28' : 'min-h-12'}`}>
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
      )}
    </div>
  );
}

