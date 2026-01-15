import React, { createContext, useContext, useState, useEffect } from 'react';

interface PageVisibility {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  visibleTo: 'everyone' | 'admin_only';
  category: 'main' | 'user' | 'admin' | 'menu';
}

interface SettingsContextType {
  pageVisibility: PageVisibility[];
  updatePageVisibility: (id: string, updates: Partial<PageVisibility>) => void;
  isPageVisible: (id: string, userType: 'admin' | 'user') => boolean;
  isMenuVisible: (menuId: string, userType: 'admin' | 'user') => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageVisibility, setPageVisibility] = useState<PageVisibility[]>([
    // Main Pages
    { id: 'dashboard', name: 'Dashboard', description: 'Hoofddashboard voor gebruikers', enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'profile', name: 'Profiel', description: 'Gebruikersprofiel beheer', enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'goals', name: 'Doelen', description: 'Financiële doelen stellen en volgen', enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'portfolio', name: 'Portfolio', description: 'Portfolio overzicht en beheer', enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'appointments', name: 'Afspraken', description: 'Afspraken inplannen en beheren', enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'education', name: 'Educatie', description: 'Leren over Bitcoin en investeren', enabled: true, visibleTo: 'everyone', category: 'main' },
    
    // User Tools
    { id: 'bitcoin_calculator', name: 'Bitcoin Calculator', description: 'Bitcoin investering calculator', enabled: true, visibleTo: 'everyone', category: 'user' },
    { id: 'wallet_management', name: 'Wallet Beheer', description: 'Bitcoin wallet toevoegen en beheren', enabled: true, visibleTo: 'everyone', category: 'user' },
    { id: 'price_alerts', name: 'Prijs Waarschuwingen', description: 'Bitcoin prijs notificaties', enabled: true, visibleTo: 'everyone', category: 'user' },
    
    // Admin Tools
    { id: 'admin_dashboard', name: 'Admin Dashboard', description: 'Administratief dashboard', enabled: true, visibleTo: 'admin_only', category: 'admin' },
    { id: 'account_management', name: 'Account Beheer', description: 'Gebruikersaccounts beheren', enabled: true, visibleTo: 'admin_only', category: 'admin' },
    { id: 'email_management', name: 'Email Beheer', description: 'Email templates en bulk verzending', enabled: true, visibleTo: 'admin_only', category: 'admin' },
    
    // Menu Items
    { id: 'bitcoin_history', name: 'Bitcoin Geschiedenis', description: 'Bitcoin prijsdata en DCA simulator', enabled: true, visibleTo: 'everyone', category: 'menu' },
    { id: 'portfolio_menu', name: 'Portfolio Menu', description: 'Portfolio overzicht in hoofdmenu', enabled: true, visibleTo: 'everyone', category: 'menu' },
    { id: 'market_cap_comparer', name: 'Market Cap Vergelijker', description: 'Cryptocurrency vergelijking', enabled: true, visibleTo: 'everyone', category: 'menu' },
    { id: 'educatief_platform', name: 'Educatief Platform', description: 'Leren over Bitcoin en investeren', enabled: true, visibleTo: 'everyone', category: 'menu' },
    
    // Available Pages (from Admin Dashboard)
    { id: 'available_pages', name: 'Beschikbare Pagina\'s', description: 'Beheer beschikbare pagina\'s', enabled: true, visibleTo: 'admin_only', category: 'menu' },
  ]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('bitbeheer_page_visibility');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setPageVisibility(parsed);
      } catch (error) {
        console.error('Error loading page visibility settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bitbeheer_page_visibility', JSON.stringify(pageVisibility));
  }, [pageVisibility]);

  const updatePageVisibility = (id: string, updates: Partial<PageVisibility>) => {
    setPageVisibility(prev => 
      prev.map(page => 
        page.id === id ? { ...page, ...updates } : page
      )
    );
  };

  const isPageVisible = (id: string, userType: 'admin' | 'user' | 'everyone'): boolean => {
    const page = pageVisibility.find(p => p.id === id);
    // Only log in development to reduce console spam
    if (import.meta.env.DEV) {
      console.debug(`🔍 isPageVisible(${id}, ${userType}):`, { page, enabled: page?.enabled, visibleTo: page?.visibleTo });
    }
    if (!page) return false;
    
    if (!page.enabled) return false;
    
    if (page.visibleTo === 'everyone') return true;
    if (page.visibleTo === 'admin_only' && userType === 'admin') return true;
    
    return false;
  };

  const isMenuVisible = (menuId: string, userType: 'admin' | 'user' | 'everyone'): boolean => {
    return isPageVisible(menuId, userType);
  };

  return (
    <SettingsContext.Provider value={{
      pageVisibility,
      updatePageVisibility,
      isPageVisible,
      isMenuVisible
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
