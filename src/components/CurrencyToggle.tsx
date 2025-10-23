import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencyToggle: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">Valuta:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setCurrency('EUR')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            currency === 'EUR'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          € EUR
        </button>
        <button
          onClick={() => setCurrency('USD')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            currency === 'USD'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          $ USD
        </button>
      </div>
    </div>
  );
};

export default CurrencyToggle;
