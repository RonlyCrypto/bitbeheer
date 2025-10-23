import { Bitcoin, TrendingUp, BarChart3, Shield, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BitcoinLivePrice from './BitcoinLivePrice';

export default function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
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
              <p className="text-orange-100 text-sm">Persoonlijke begeleiding voor Bitcoin investeren</p>
            </div>
          </Link>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Public Menu */}
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                className={`group relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  location.pathname === '/' 
                    ? 'bg-white bg-opacity-30 shadow-lg' 
                    : 'hover:bg-white hover:bg-opacity-20 hover:shadow-md'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  location.pathname === '/' 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-white bg-opacity-10 group-hover:bg-opacity-20'
                }`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Begeleiding</span>
              </Link>
            </div>

            {/* Admin Menu */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white border-opacity-30">
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
