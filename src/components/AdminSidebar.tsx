import React from 'react';
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
  ChevronDown
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
  { id: 'chat', label: 'Chat', icon: MessageSquare, badge: 1 },
  { id: 'appointments', label: 'Afspraken', icon: Calendar },
  { id: 'accounts', label: 'Accounts', icon: Users },
  { id: 'email', label: 'E-mail Beheer', icon: Mail },
  { id: 'referral-links', label: 'Referral Links', icon: LinkIcon },
  { id: 'notifications', label: 'Notificaties', icon: Bell, badge: 4 },
  { id: 'seo', label: 'SEO & Analytics', icon: TrendingUp },
  { id: 'cycle-advisor', label: '🚀 Cycle Advisor', icon: Zap },
  { id: 'settings', label: 'Instellingen', icon: Settings },
  { id: 'beheer', label: 'Beheer', icon: Menu },
];

export default function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  isCollapsed = false,
  onToggleCollapse 
}: AdminSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900">MENU</h3>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative group ${
                  activeTab === item.id
                    ? 'bg-orange-100 text-orange-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

