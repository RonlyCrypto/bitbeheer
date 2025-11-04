import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'EUR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Check localStorage first
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency === 'EUR' || savedCurrency === 'USD') {
      return savedCurrency;
    }
    // Default to EUR
    return 'EUR';
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('currency', currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getCurrencySymbol = (): string => {
    return currency === 'EUR' ? '€' : '$';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};
