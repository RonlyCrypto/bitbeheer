import React from 'react';
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
          advice: 'Wachten adviseert',
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
      <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-xl p-3`}>
        {/* Compact Stoplicht */}
        <div className="flex gap-3">
          {/* Mini Traffic Light */}
          <div className="w-12 h-16 bg-black rounded-2xl p-1 flex flex-col justify-center gap-1">
            {/* Red */}
            <div
              className={`w-full h-3 rounded-full transition-all ${
                position === 'above_latest_ath'
                  ? 'bg-red-500 shadow-lg shadow-red-400'
                  : 'bg-red-900 opacity-40'
              }`}
            ></div>
            {/* Orange */}
            <div
              className={`w-full h-3 rounded-full transition-all ${
                position === 'between_aths'
                  ? 'bg-orange-500 shadow-lg shadow-orange-400'
                  : 'bg-orange-900 opacity-40'
              }`}
            ></div>
            {/* Green */}
            <div
              className={`w-full h-3 rounded-full transition-all ${
                position === 'below_previous_ath'
                  ? 'bg-green-500 shadow-lg shadow-green-400'
                  : 'bg-green-900 opacity-40'
              }`}
            ></div>
          </div>

          {/* Status Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: `var(--color-${status.color})` }} />
              <p className={`text-xs font-bold ${status.textColorBold}`}>{status.title}</p>
            </div>
            <p className={`text-xs ${status.textColor} leading-tight`}>{status.subtitle}</p>
            <p className={`text-xs font-semibold mt-1 ${status.textColor}`}>{status.advice}</p>
          </div>
        </div>
      </div>
    );
  }

  // Full version for main content area (kept for compatibility)
  return (
    <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-xl p-8`}>
      <div className="flex flex-col items-center gap-4">
        {/* Large Traffic Light */}
        <div className="w-24 bg-black rounded-3xl p-2 shadow-2xl border-4 border-gray-900">
          {/* Red Light */}
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center shadow-inner transition-all ${
              position === 'above_latest_ath'
                ? 'bg-red-600 shadow-lg shadow-red-500 animate-pulse'
                : 'bg-red-900 opacity-30'
            }`}
          >
            {position === 'above_latest_ath' && (
              <div className="w-16 h-16 bg-red-500 rounded-full shadow-lg shadow-red-400"></div>
            )}
          </div>

          {/* Orange Light */}
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center shadow-inner transition-all ${
              position === 'between_aths'
                ? 'bg-orange-600 shadow-lg shadow-orange-500 animate-pulse'
                : 'bg-orange-900 opacity-30'
            }`}
          >
            {position === 'between_aths' && (
              <div className="w-16 h-16 bg-orange-500 rounded-full shadow-lg shadow-orange-400"></div>
            )}
          </div>

          {/* Green Light */}
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-inner transition-all ${
              position === 'below_previous_ath'
                ? 'bg-green-600 shadow-lg shadow-green-500 animate-pulse'
                : 'bg-green-900 opacity-30'
            }`}
          >
            {position === 'below_previous_ath' && (
              <div className="w-16 h-16 bg-green-500 rounded-full shadow-lg shadow-green-400"></div>
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center">
          <h3 className={`text-lg font-bold ${status.textColorBold}`}>{status.title}</h3>
          <p className={`text-sm ${status.textColor} mt-1`}>{status.subtitle}</p>
          <p className={`text-xs font-semibold mt-2 ${status.textColor}`}>{status.advice}</p>
        </div>
      </div>
    </div>
  );
}

