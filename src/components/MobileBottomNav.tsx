import { Link, useLocation } from 'react-router-dom';
import { Shield, BarChart3, TrendingUp, Wallet, BarChart2, Home } from 'lucide-react';
import { usePermissions } from '../contexts/PermissionsContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isImpersonating, canAccessAdmin } = usePermissions();
  const { isMenuVisible } = useSettings();

  if (!isAuthenticated && !isImpersonating) return null;

  // Hide on user/root dashboard (UserDashboardMobileNav handles it)
  if (location.pathname === '/user-dashboard' || location.pathname === '/') return null;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const NavItem = ({
    to,
    icon: Icon,
    label,
    active,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
  }) => (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
        active ? 'text-orange-600' : 'text-gray-400'
      }`}
    >
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-b-full" />
      )}
      <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-orange-50' : ''}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-semibold mt-0.5">{label}</span>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.06)] mobile-bottom-nav">
      <div className="flex items-start justify-around h-16 px-1 pt-1">
        {/* Home */}
        <NavItem
          to="/"
          icon={Home}
          label="Home"
          active={location.pathname === '/'}
        />

        {/* Admin of Dashboard */}
        {!isImpersonating && canAccessAdmin ? (
          <NavItem to="/admin" icon={Shield} label="Admin" active={isActive('/admin') && location.pathname === '/admin'} />
        ) : (
          <NavItem to="/user-dashboard" icon={BarChart3} label="Dashboard" active={isActive('/user-dashboard')} />
        )}

        {/* Bitcoin History - alleen admin */}
        {!isImpersonating && canAccessAdmin && isMenuVisible('bitcoin_history', 'admin') && (
          <NavItem to="/admin/bitcoin-history" icon={TrendingUp} label="Bitcoin" active={isActive('/admin/bitcoin-history')} />
        )}

        {/* Portfolio - alleen admin */}
        {!isImpersonating && canAccessAdmin && isMenuVisible('portfolio_menu', 'admin') && (
          <NavItem to="/admin/portfolio" icon={Wallet} label="Portfolio" active={isActive('/admin/portfolio')} />
        )}

        {/* Vergelijker - alleen admin */}
        {!isImpersonating && canAccessAdmin && isMenuVisible('market_cap_comparer', 'admin') && (
          <NavItem to="/admin/market-cap-comparer" icon={BarChart2} label="Vergelijker" active={isActive('/admin/market-cap-comparer')} />
        )}
      </div>
    </nav>
  );
}
