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
  unreadChatCount
}: UserDashboardMobileNavProps) {
  const location = useLocation();
  
  // Only show on mobile and when on user dashboard
  if (location.pathname !== '/user-dashboard' && location.pathname !== '/') {
    return null;
  }

  const menuItems = [
    { id: 'overview', label: 'Overzicht', icon: BarChart3, alwaysEnabled: true },
    { id: 'goals', label: 'Doelen', icon: Target, alwaysEnabled: true },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart, alwaysEnabled: false },
    { id: 'helpdesk', label: 'Helpdesk', icon: Mail, badge: unreadChatCount > 0 ? unreadChatCount : undefined, alwaysEnabled: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = item.alwaysEnabled || accountApproved || hasApprovedOneOnOne;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isEnabled) {
                  onTabChange(item.id);
                }
              }}
              disabled={!isEnabled}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                !isEnabled
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : isActive
                  ? 'text-orange-600'
                  : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-1" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

