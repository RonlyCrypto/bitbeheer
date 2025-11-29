import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Target, 
  PieChart,
  Calendar, 
  Mail, 
  TrendingUp, 
  ChevronRight
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  alwaysEnabled: boolean;
}

interface UserSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accountApproved: boolean;
  hasApprovedOneOnOne: boolean;
  unreadChatCount: number;
}

export default function UserSidebar({ 
  activeTab, 
  onTabChange,
  accountApproved,
  hasApprovedOneOnOne,
  unreadChatCount
}: UserSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Persist collapsed state per user
  useEffect(() => {
    const savedState = localStorage.getItem('user_sidebar_expanded');
    if (savedState !== null) {
      setIsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('user_sidebar_expanded', JSON.stringify(newState));
  };

  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Overzicht', icon: BarChart3, alwaysEnabled: true },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart, alwaysEnabled: false },
    { id: 'appointments', label: 'Afspraken', icon: Calendar, alwaysEnabled: true },
    { id: 'helpdesk', label: 'Helpdesk', icon: Mail, badge: unreadChatCount > 0 ? unreadChatCount : undefined, alwaysEnabled: false },
    { id: 'market-status', label: 'Markt Status', icon: TrendingUp, alwaysEnabled: true },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ml-12 mt-8 ${
      isExpanded ? 'w-64' : 'w-20'
    }`}>
      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto flex flex-col">
        <div className={`flex flex-col gap-2 ${isExpanded ? 'p-3' : 'p-2'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = item.alwaysEnabled || accountApproved || hasApprovedOneOnOne;
            const tooltipText = !isEnabled 
              ? "Je moet eerst een 20-minuten afspraak maken. Na deze afspraak bepalen we of we verder met elkaar gaan en dan kan de admin je account volledig open stellen."
              : null;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isEnabled) {
                    onTabChange(item.id);
                  }
                }}
                disabled={!isEnabled}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative group ${
                  !isEnabled
                    ? 'text-gray-400 cursor-not-allowed opacity-50'
                    : activeTab === item.id
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium truncate">{item.label}</span>
                  </>
                )}
                {!isExpanded && !isEnabled && tooltipText && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-64 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {tooltipText}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Chevron Toggle Button */}
      <div className={`border-t border-gray-200 ${isExpanded ? 'p-3' : 'p-2'}`}>
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}

