import { Bitcoin, TrendingUp, BarChart3, Shield, Wallet, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import BitcoinLivePrice from './BitcoinLivePrice';
import LoginRegister from './LoginRegister';

export default function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { user, signOut } = useSupabaseAuth();
  
  return (
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
          
          {/* Navigation Menu - Only visible for admin users */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Admin Menu - Only visible when authenticated and user is admin */}
            {isAuthenticated && user?.user_metadata?.is_admin && (
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
              </div>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Bitcoin Live Price */}
            <div className="hidden md:block">
              <BitcoinLivePrice />
            </div>
            
            {/* User Menu or Login/Register */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-3 bg-white bg-opacity-20 px-4 py-3 rounded-xl backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300">
                    <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{user.user_metadata?.name || user.email}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="py-2">
                      <Link 
                        to="/dashboard" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Mijn Dashboard
                      </Link>
                      <button 
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Uitloggen
                      </button>
                    </div>
                  </div>
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
            
            <div className="hidden lg:flex items-center gap-3 bg-white bg-opacity-20 px-5 py-3 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-5 h-5" />
              <div>
                <div className="text-xs text-orange-100">Educatief Platform</div>
                <div className="font-semibold">Voor Beginners</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
