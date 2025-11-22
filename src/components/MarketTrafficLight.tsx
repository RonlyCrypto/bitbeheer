import React from 'react';

interface MarketTrafficLightProps {
  position?: 'below_previous_ath' | 'between_aths' | 'above_latest_ath' | 'unknown';
}

export default function MarketTrafficLight({ position = 'unknown' }: MarketTrafficLightProps) {
  const getActiveLight = () => {
    switch (position) {
      case 'below_previous_ath':
        return 'green';
      case 'between_aths':
        return 'orange';
      case 'above_latest_ath':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    switch (position) {
      case 'below_previous_ath':
        return 'VEILIG - Onder vorige ATH';
      case 'between_aths':
        return 'NEUTRAAL - Tussen ATHs';
      case 'above_latest_ath':
        return 'HOOG RISICO - Boven ATH';
      default:
        return 'ONBEKEND';
    }
  };

  const getAdvice = () => {
    switch (position) {
      case 'below_previous_ath':
        return '💡 Beste koopkans - Koop nu via DCA';
      case 'between_aths':
        return '⏸️ Wachten adviseert - Reduceer DCA';
      case 'above_latest_ath':
        return '⛔ Niet kopen - Alleen hodlen';
      default:
        return 'Laden...';
    }
  };

  const activeLight = getActiveLight();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Traffic Light */}
      <div className="w-24 bg-black rounded-3xl p-2 shadow-2xl border-4 border-gray-900">
        {/* Red Light */}
        <div
          className={`w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center shadow-inner transition-all ${
            activeLight === 'red'
              ? 'bg-red-600 shadow-lg shadow-red-500 animate-pulse'
              : 'bg-red-900 opacity-30'
          }`}
        >
          {activeLight === 'red' && <div className="w-16 h-16 bg-red-500 rounded-full shadow-lg shadow-red-400"></div>}
        </div>

        {/* Orange Light */}
        <div
          className={`w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center shadow-inner transition-all ${
            activeLight === 'orange'
              ? 'bg-orange-600 shadow-lg shadow-orange-500 animate-pulse'
              : 'bg-orange-900 opacity-30'
          }`}
        >
          {activeLight === 'orange' && <div className="w-16 h-16 bg-orange-500 rounded-full shadow-lg shadow-orange-400"></div>}
        </div>

        {/* Green Light */}
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-inner transition-all ${
            activeLight === 'green'
              ? 'bg-green-600 shadow-lg shadow-green-500 animate-pulse'
              : 'bg-green-900 opacity-30'
          }`}
        >
          {activeLight === 'green' && <div className="w-16 h-16 bg-green-500 rounded-full shadow-lg shadow-green-400"></div>}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900">{getStatusText()}</h3>
        <p className="text-sm text-gray-600 mt-2">{getAdvice()}</p>
      </div>
    </div>
  );
}

