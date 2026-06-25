import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Target,
  PieChart,
  Mail,
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

  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Overzicht', icon: BarChart3, alwaysEnabled: true },
    { id: 'goals', label: 'Mijn Doelen', icon: Target, alwaysEnabled: true },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart, alwaysEnabled: false },
    { id: 'helpdesk', label: 'Helpdesk', icon: Mail, badge: unreadChatCount > 0 ? unreadChatCount : undefined, alwaysEnabled: false },
  ];

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col hidden md:flex w-14 flex-shrink-0">
      <nav className="flex-1 flex flex-col pt-3">
        <div className="flex flex-col gap-0.5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = item.alwaysEnabled || accountApproved || hasApprovedOneOnOne;

            return (
              <button
                key={item.id}
                onClick={() => { if (isEnabled) onTabChange(item.id); }}
                disabled={!isEnabled}
                title={item.label}
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors group ${
                  !isEnabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : activeTab === item.id
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
