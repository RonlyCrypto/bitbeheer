import React, { useState } from 'react';
import { Settings, Eye, EyeOff, Save, RefreshCw, Shield, Users, BarChart3, Target, Calendar, BookOpen, Wallet } from 'lucide-react';

interface PageVisibility {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  visibleTo: 'everyone' | 'admin_only';
  category: 'main' | 'user' | 'admin' | 'menu';
}

export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [pageVisibility, setPageVisibility] = useState<PageVisibility[]>([
    // Main Pages
    { id: 'dashboard', name: 'Dashboard', description: 'Hoofddashboard voor gebruikers', icon: <BarChart3 className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'profile', name: 'Profiel', description: 'Gebruikersprofiel beheer', icon: <Users className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'goals', name: 'Doelen', description: 'Financiële doelen stellen en volgen', icon: <Target className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'portfolio', name: 'Portfolio', description: 'Portfolio overzicht en beheer', icon: <Wallet className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'appointments', name: 'Afspraken', description: 'Afspraken inplannen en beheren', icon: <Calendar className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'main' },
    { id: 'education', name: 'Educatie', description: 'Leren over Bitcoin en investeren', icon: <BookOpen className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'main' },
    
    // User Tools
    { id: 'bitcoin_calculator', name: 'Bitcoin Calculator', description: 'Bitcoin investering calculator', icon: <BarChart3 className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'user' },
    { id: 'wallet_management', name: 'Wallet Beheer', description: 'Bitcoin wallet toevoegen en beheren', icon: <Wallet className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'user' },
    { id: 'price_alerts', name: 'Prijs Waarschuwingen', description: 'Bitcoin prijs notificaties', icon: <Eye className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'user' },
    
    // Admin Tools
    { id: 'admin_dashboard', name: 'Admin Dashboard', description: 'Administratief dashboard', icon: <Shield className="w-5 h-5" />, enabled: true, visibleTo: 'admin_only', category: 'admin' },
    { id: 'account_management', name: 'Account Beheer', description: 'Gebruikersaccounts beheren', icon: <Users className="w-5 h-5" />, enabled: true, visibleTo: 'admin_only', category: 'admin' },
    { id: 'email_management', name: 'Email Beheer', description: 'Email templates en bulk verzending', icon: <Settings className="w-5 h-5" />, enabled: true, visibleTo: 'admin_only', category: 'admin' },
    
    // Menu Items
    { id: 'bitcoin_history', name: 'Bitcoin Geschiedenis', description: 'Bitcoin prijsdata en DCA simulator', icon: <BarChart3 className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'menu' },
    { id: 'portfolio_menu', name: 'Portfolio Menu', description: 'Portfolio overzicht in hoofdmenu', icon: <Wallet className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'menu' },
    { id: 'market_cap_comparer', name: 'Market Cap Vergelijker', description: 'Cryptocurrency vergelijking', icon: <BarChart3 className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'menu' },
    { id: 'educatief_platform', name: 'Educatief Platform', description: 'Leren over Bitcoin en investeren', icon: <BookOpen className="w-5 h-5" />, enabled: true, visibleTo: 'everyone', category: 'menu' },
  ]);

  const handleToggle = (id: string) => {
    setPageVisibility(prev => 
      prev.map(page => 
        page.id === id ? { ...page, enabled: !page.enabled } : page
      )
    );
  };

  const handleVisibilityToggle = (id: string) => {
    setPageVisibility(prev => 
      prev.map(page => 
        page.id === id ? { 
          ...page, 
          visibleTo: page.visibleTo === 'everyone' ? 'admin_only' : 'everyone' 
        } : page
      )
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would save the settings to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', pageVisibility);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPageVisibility(prev => 
      prev.map(page => ({ 
        ...page, 
        enabled: true,
        visibleTo: page.category === 'admin' ? 'admin_only' : 'everyone'
      }))
    );
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'main': return 'Hoofdpagina\'s';
      case 'user': return 'Gebruiker Tools';
      case 'admin': return 'Admin Tools';
      case 'menu': return 'Menu Items';
      default: return 'Overig';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'main': return 'Basis functionaliteiten voor alle gebruikers';
      case 'user': return 'Geavanceerde tools voor gebruikers';
      case 'admin': return 'Administratieve functionaliteiten';
      case 'menu': return 'Hoofdmenu items en navigatie';
      default: return 'Overige functionaliteiten';
    }
  };

  const categories = ['main', 'user', 'admin', 'menu'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instellingen</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Beheer welke pagina's en tools zichtbaar zijn voor klanten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map(category => {
          const categoryPages = pageVisibility.filter(page => page.category === category);
          return (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getCategoryTitle(category)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getCategoryDescription(category)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryPages.map(page => (
                  <div
                    key={page.id}
                    className={`p-4 rounded-lg border transition-all ${
                      page.enabled
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          page.enabled
                            ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-400'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                        }`}>
                          {page.icon}
                        </div>
                        <div>
                          <h4 className={`font-medium ${
                            page.enabled
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {page.name}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            page.enabled
                              ? 'text-gray-600 dark:text-gray-300'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {page.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              page.visibleTo === 'everyone'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            }`}>
                              {page.visibleTo === 'everyone' ? 'Iedereen' : 'Alleen Admin'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVisibilityToggle(page.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            page.visibleTo === 'everyone'
                              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-400 dark:hover:bg-blue-700'
                              : 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-800 dark:text-orange-400 dark:hover:bg-orange-700'
                          }`}
                          title={page.visibleTo === 'everyone' ? 'Zichtbaar voor iedereen' : 'Alleen zichtbaar voor admin'}
                        >
                          {page.visibleTo === 'everyone' ? <Users className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleToggle(page.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            page.enabled
                              ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-800 dark:text-green-400 dark:hover:bg-green-700'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-500 dark:hover:bg-gray-500'
                          }`}
                        >
                          {page.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Samenvatting
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-900 dark:text-blue-100">Totaal functionaliteiten:</span>
            <span className="ml-2 text-blue-700 dark:text-blue-300">{pageVisibility.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900 dark:text-blue-100">Ingeschakeld:</span>
            <span className="ml-2 text-green-600 dark:text-green-400">
              {pageVisibility.filter(p => p.enabled).length}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900 dark:text-blue-100">Uitgeschakeld:</span>
            <span className="ml-2 text-red-600 dark:text-red-400">
              {pageVisibility.filter(p => !p.enabled).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
