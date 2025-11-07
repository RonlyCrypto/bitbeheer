import { Link, useLocation } from 'react-router-dom';
import { Shield, BarChart3, TrendingUp, Wallet, BarChart2, Home } from 'lucide-react';
import { usePermissions } from '../contexts/PermissionsContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isImpersonating, canAccessAdmin } = usePermissions();
  const { isMenuVisible } = useSettings();

  // Only show on mobile and when authenticated
  if (!isAuthenticated && !isImpersonating) {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home/Dashboard */}
        {!isImpersonating && canAccessAdmin ? (
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/admin') && location.pathname === '/admin'
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}
          >
            <Shield className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Admin</span>
          </Link>
        ) : (
          <Link
            to="/user-dashboard"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/user-dashboard')
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
        )}

        {/* Bitcoin History - Only for admins */}
        {!isImpersonating && canAccessAdmin && isMenuVisible('bitcoin_history', 'admin') && (
          <Link
            to="/admin/bitcoin-history"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/admin/bitcoin-history')
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Bitcoin</span>
          </Link>
        )}

        {/* Portfolio - Only for admins */}
        {!isImpersonating && canAccessAdmin && isMenuVisible('portfolio_menu', 'admin') && (
          <Link
            to="/admin/portfolio"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/admin/portfolio')
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}
          >
            <Wallet className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Portfolio</span>
          </Link>
        )}

        {/* Market Cap Comparer - Only for admins */}
        {!isImpersonating && canAccessAdmin && isMenuVisible('market_cap_comparer', 'admin') && (
          <Link
            to="/admin/market-cap-comparer"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/admin/market-cap-comparer')
                ? 'text-orange-600'
                : 'text-gray-500'
            }`}
          >
            <BarChart2 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Vergelijker</span>
          </Link>
        )}

        {/* Home - Always visible */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            location.pathname === '/'
              ? 'text-orange-600'
              : 'text-gray-500'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </Link>
      </div>
    </nav>
  );
}

