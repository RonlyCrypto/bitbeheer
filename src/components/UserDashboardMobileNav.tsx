import { BarChart3, Target, PieChart, Mail } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface UserDashboardMobileNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accountApproved: boolean;
  hasApprovedOneOnOne: boolean;
  unreadChatCount: number;
}

export default function UserDashboardMobileNav({
  activeTab,
  onTabChange,
  accountApproved,
  hasApprovedOneOnOne,
  unreadChatCount,
}: UserDashboardMobileNavProps) {
  const location = useLocation();

  if (location.pathname !== '/user-dashboard' && location.pathname !== '/') return null;

  const menuItems = [
    { id: 'overview',   label: 'Overzicht', icon: BarChart3, alwaysEnabled: true },
    { id: 'goals',      label: 'Doelen',    icon: Target,    alwaysEnabled: true },
    { id: 'portfolio',  label: 'Portfolio', icon: PieChart,  alwaysEnabled: false },
    { id: 'helpdesk',   label: 'Helpdesk',  icon: Mail,      alwaysEnabled: false, badge: unreadChatCount > 0 ? unreadChatCount : undefined },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.06)] mobile-bottom-nav">
      <div className="flex items-start justify-around h-16 px-1 pt-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = item.alwaysEnabled || accountApproved || hasApprovedOneOnOne;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => { if (isEnabled) onTabChange(item.id); }}
              disabled={!isEnabled}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                !isEnabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : isActive
                  ? 'text-orange-600'
                  : 'text-gray-400'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-b-full" />
              )}
              <div className={`p-1.5 rounded-xl transition-colors relative ${isActive ? 'bg-orange-50' : ''}`}>
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
