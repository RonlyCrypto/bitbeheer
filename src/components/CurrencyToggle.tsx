import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Euro, DollarSign } from 'lucide-react';

const CurrencyToggle: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-xl backdrop-blur-sm">
      <button
        onClick={() => setCurrency('EUR')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          currency === 'EUR'
            ? 'bg-white text-orange-600 shadow-sm'
            : 'text-white hover:bg-white hover:bg-opacity-20'
        }`}
        title="Switch to EUR"
      >
        <Euro className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">EUR</span>
      </button>
      <button
        onClick={() => setCurrency('USD')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          currency === 'USD'
            ? 'bg-white text-orange-600 shadow-sm'
            : 'text-white hover:bg-white hover:bg-opacity-20'
        }`}
        title="Switch to USD"
      >
        <DollarSign className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">USD</span>
      </button>
    </div>
  );
};

export default CurrencyToggle;
