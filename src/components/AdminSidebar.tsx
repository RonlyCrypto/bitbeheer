import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  Users, 
  Mail, 
  Link as LinkIcon, 
  Bell, 
  TrendingUp, 
  Zap, 
  Settings,
  Menu,
  ChevronRight
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  unreadChatCount?: number;
}

const getMenuItems = (unreadChatCount: number = 0): MenuItem[] => [
  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
  { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadChatCount > 0 ? unreadChatCount : undefined },
  { id: 'appointments', label: 'Afspraken', icon: Calendar },
  { id: 'accounts', label: 'Accounts', icon: Users },
  { id: 'email-management', label: 'E-mail Beheer', icon: Mail },
  { id: 'referral-links', label: 'Referral Links', icon: LinkIcon },
  { id: 'notification-management', label: 'Notificaties', icon: Bell, badge: 4 },
  { id: 'seo-analytics', label: 'SEO & Analytics', icon: TrendingUp },
  { id: 'cycle-advisor', label: '🚀 Cycle Advisor', icon: Zap },
  { id: 'settings', label: 'Instellingen', icon: Settings },
  { id: 'controls', label: 'Beheer', icon: Menu },
];

export default function AdminSidebar({ 
  activeTab, 
  onTabChange,
  unreadChatCount = 0
}: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const menuItems = getMenuItems(unreadChatCount);

  // Persist collapsed state per user
  useEffect(() => {
    const savedState = localStorage.getItem('admin_sidebar_expanded');
    if (savedState !== null) {
      setIsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('admin_sidebar_expanded', JSON.stringify(newState));
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ml-12 mt-8 ${
      isExpanded ? 'w-64' : 'w-20'
    }`}>
      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto flex flex-col">
        <div className={`flex flex-col gap-2 ${isExpanded ? 'p-3' : 'p-2'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative group ${
                  activeTab === item.id
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

