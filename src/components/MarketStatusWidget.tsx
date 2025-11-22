import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MarketStatusWidgetProps {
  position?: 'below_previous_ath' | 'between_aths' | 'above_latest_ath' | 'unknown';
  compact?: boolean;
}

export default function MarketStatusWidget({ position = 'unknown', compact = false }: MarketStatusWidgetProps) {
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
  
  return (
    <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-xl overflow-hidden`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-opacity-75 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-semibold ${status.textColorBold}`}>
              {status.title}
            </h3>
            <span className={`transform transition-transform text-sm ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
          <p className={`text-xs ${status.textColor}`}>{status.subtitle}</p>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-current border-opacity-20 p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            {/* Smaller Traffic Light - Like Sidebar */}
            <div className="w-14 bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl p-1 shadow-lg" style={{ height: '72px', minHeight: '72px' }}>
              <div className="w-full h-full bg-black rounded-2xl p-2 flex flex-col justify-around items-center relative">
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

          {/* ATH Range Visualization */}
          <div className="space-y-2">
            <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 flex items-center">
                {/* Previous ATH position (20%) */}
                <div className="absolute left-0 h-full w-1.5 bg-blue-600 rounded-full" style={{ left: '20%' }}></div>
                {/* Current position indicator */}
                <div 
                  className={`absolute w-4 h-4 rounded-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg ${
                    position === 'above_latest_ath' ? 'bg-red-500' :
                    position === 'between_aths' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ left: position === 'above_latest_ath' ? '85%' : position === 'between_aths' ? '60%' : '30%' }}
                ></div>
                {/* Latest ATH position (100%) */}
                <div className="absolute right-0 h-full w-1.5 bg-red-600 rounded-full"></div>
              </div>
            </div>
            
            {/* ATH Prices and Current Price */}
            <div className="flex justify-between text-xs font-semibold text-gray-700">
              <div className="text-left">
                <div className="text-gray-600">💙 Vorige ATH</div>
                <div className="font-mono">€19.700</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Huige Prijs</div>
                <div className={`font-mono ${position === 'above_latest_ath' ? 'text-red-600' : position === 'between_aths' ? 'text-orange-600' : 'text-green-600'}`}>
                  €42.250
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-600">❤️ Huidge ATH</div>
                <div className="font-mono">€69.000</div>
              </div>
            </div>
            
            {/* Position percentages */}
            <div className={`text-xs font-semibold mt-3 px-3 py-2 rounded text-center ${status.bgColor} border border-current border-opacity-30`}>
              {position === 'above_latest_ath' && '↗️ +15% BOVEN huidge ATH - HOOG RISICO'}
              {position === 'between_aths' && '➡️ 40% TUSSEN vorige & huidge ATH - NEUTRAAL'}
              {position === 'below_previous_ath' && '↙️ -30% ONDER vorige ATH - VEILIG'}
            </div>
          </div>

          {/* Advice */}
          <p className={`text-sm font-semibold text-center ${status.textColor}`}>{status.advice}</p>
        </div>
      )}
    </div>
  );
}

