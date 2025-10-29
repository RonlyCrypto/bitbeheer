import { useState, useEffect } from 'react';
import { Bitcoin, TrendingUp, BarChart3, Shield, Wallet, LogOut, User, ArrowLeft, Settings, Sun, Moon, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useSettings } from '../contexts/SettingsContext';
import { impersonationUtils } from '../utils/impersonation';
import BitcoinLivePrice from './BitcoinLivePrice';
import LoginRegister from './LoginRegister';

export default function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { user, signOut } = useSupabaseAuth();
  const { theme, toggleTheme } = useTheme();
  const { isImpersonating, impersonatedUser, canAccessAdmin } = usePermissions();
  const { isMenuVisible } = useSettings(); // Get settings for menu visibility
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Debug logging
  console.log('🏠 Header - isAuthenticated:', isAuthenticated);
  console.log('🏠 Header - user:', user);
  console.log('🏠 Header - user email:', user?.email);
  console.log('🏠 Header - user metadata:', user?.user_metadata);
  console.log('🏠 Header - isImpersonating:', isImpersonating);
  console.log('🏠 Header - impersonatedUser:', impersonatedUser);
  console.log('🏠 Header - canAccessAdmin:', canAccessAdmin);
  console.log('🏠 Header - Should show impersonation banner:', isImpersonating && impersonatedUser);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettingsDropdown) {
        const target = event.target as Element;
        if (!target.closest('.settings-dropdown')) {
          setShowSettingsDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsDropdown]);

  const handleStopImpersonation = () => {
    localStorage.removeItem('impersonation');
    setIsImpersonating(false);
    setImpersonatedUser(null);
    // Redirect to admin dashboard
    window.location.href = '/admin';
  };
  
  return (
    <>
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <Bitcoin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">BitBeheer</h1>
              <p className="text-orange-100 text-sm">Persoonlijke begeleiding bij het investeren in Bitcoin.</p>
            </div>
          </Link>
          
          {/* Navigation Menu - Always visible */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Admin Menu - Always visible */}
            {true && (
              <div className="flex items-center gap-3">
                <Link 
                  to="/admin" 
                  className={`group relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    location.pathname === '/admin' 
                      ? 'bg-white bg-opacity-30 shadow-lg' 
                      : 'hover:bg-white hover:bg-opacity-20 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    location.pathname === '/admin' 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-white bg-opacity-10 group-hover:bg-opacity-20'
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>

                {isMenuVisible('bitcoin_history', 'everyone') && (
                  <Link 
                    to="/admin/bitcoin-history" 
                    className={`group relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === '/admin/bitcoin-history' 
                        ? 'bg-white bg-opacity-30 shadow-lg' 
                        : 'hover:bg-white hover:bg-opacity-20 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      location.pathname === '/admin/bitcoin-history' 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-white bg-opacity-10 group-hover:bg-opacity-20'
                    }`}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Bitcoin</span>
                  </Link>
                )}

                {isMenuVisible('portfolio_menu', 'everyone') && (
                  <Link 
                    to="/admin/portfolio" 
                    className={`group relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === '/admin/portfolio' 
                        ? 'bg-white bg-opacity-30 shadow-lg' 
                        : 'hover:bg-white hover:bg-opacity-20 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      location.pathname === '/admin/portfolio' 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-white bg-opacity-10 group-hover:bg-opacity-20'
                    }`}>
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Portfolio</span>
                  </Link>
                )}

                {isMenuVisible('market_cap_comparer', 'everyone') && (
                  <Link 
                    to="/admin/market-cap-comparer" 
                    className={`group relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === '/admin/market-cap-comparer' 
                        ? 'bg-white bg-opacity-30 shadow-lg' 
                        : 'hover:bg-white hover:bg-opacity-20 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      location.pathname === '/admin/market-cap-comparer' 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-white bg-opacity-10 group-hover:bg-opacity-20'
                    }`}>
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Vergelijker</span>
                  </Link>
                )}
              </div>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Bitcoin Live Price */}
            <div className="hidden md:block">
              <BitcoinLivePrice />
            </div>
            
            {/* Settings Menu or Login/Register */}
            {isAuthenticated || isImpersonating ? (
              <div className="flex items-center gap-3">
                {/* Settings Dropdown */}
                <div className="relative settings-dropdown">
                  <button 
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    className="flex items-center gap-3 bg-white bg-opacity-20 px-4 py-3 rounded-xl backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span className="font-medium">
                      {isImpersonating ? impersonatedUser : (user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin')}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showSettingsDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                      <div className="py-2">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                              <UserCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {isImpersonating ? impersonatedUser : (user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin')}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isImpersonating 
                                  ? 'Impersonated User' 
                                  : (user?.email || (isAuthenticated ? 'Ingelogd' : 'Niet ingelogd'))
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                          {/* Menu Items */}
                          <Link 
                            to="/admin" 
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setShowSettingsDropdown(false)}
                          >
                            <User className="w-4 h-4" />
                            Mijn Profiel
                          </Link>
                          
                          <Link 
                            to="/admin" 
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setShowSettingsDropdown(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Instellingen
                          </Link>

                        {/* Theme Toggle */}
                        <button 
                          onClick={() => {
                            toggleTheme();
                            setShowSettingsDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {theme === 'light' ? (
                            <>
                              <Moon className="w-4 h-4" />
                              Dark Mode
                            </>
                          ) : (
                            <>
                              <Sun className="w-4 h-4" />
                              Light Mode
                            </>
                          )}
                        </button>

                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        
                        <button 
                          onClick={() => {
                            if (isImpersonating) {
                              // Stop impersonation and return to admin
                              impersonationUtils.stopImpersonation();
                              window.location.href = '/admin';
                            } else {
                              signOut();
                            }
                            setShowSettingsDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {isImpersonating ? 'Terug naar Admin' : 'Uitloggen'}
                        </button>
                      </div>
                    </div>
                  )}
            </div>
          </div>
            ) : (
              <LoginRegister 
                onLogin={async (email, password) => {
                  try {
                    const response = await fetch('/api/accounts/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, password })
                    });
                    if (response.ok) {
                      const data = await response.json();
                      localStorage.setItem('user_account', JSON.stringify(data.account));
                      return true;
                    }
                    return false;
                  } catch (error) {
                    console.error('Login error:', error);
                    return false;
                  }
                }}
                onRegister={async (email, password, name) => {
                  try {
                    const response = await fetch('/api/accounts/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, password, name })
                    });
                    return response.ok;
                  } catch (error) {
                    console.error('Register error:', error);
                    return false;
                  }
                }}
                onPasswordReset={async (email) => {
                  try {
                    const response = await fetch('/api/accounts/reset-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email })
                    });
                    return response.ok;
                  } catch (error) {
                    console.error('Password reset error:', error);
                    return false;
                  }
                }}
              />
            )}
            

                {isMenuVisible('available_pages', 'everyone') && (
                  <Link 
                    to="/admin" 
                    className="hidden lg:flex items-center gap-3 bg-white bg-opacity-20 px-5 py-3 rounded-xl backdrop-blur-sm hover:bg-opacity-30 transition-all"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <div>
                      <div className="text-xs text-orange-100">Beschikbare Pagina's</div>
                      <div className="font-semibold">Beheer</div>
                    </div>
                  </Link>
                )}
          </div>
        </div>
      </div>
    </header>

    </>
  );
}
