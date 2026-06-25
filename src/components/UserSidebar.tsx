import React, { useState } from 'react';
import {
  BarChart3,
  Target,
  PieChart,
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
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
  hasWallet: boolean;
  hasBitcoin?: boolean;
  unreadChatCount: number;
}

export default function UserSidebar({
  activeTab,
  onTabChange,
  accountApproved,
  hasApprovedOneOnOne,
  hasWallet,
  hasBitcoin = false,
  unreadChatCount
}: UserSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isUnlocked = accountApproved || hasApprovedOneOnOne;

  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Overzicht', icon: BarChart3, alwaysEnabled: true },
    { id: 'goals', label: 'Mijn Doelen', icon: Target, alwaysEnabled: true },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart, alwaysEnabled: false },
    { id: 'helpdesk', label: 'Helpdesk', icon: Mail, badge: unreadChatCount > 0 ? unreadChatCount : undefined, alwaysEnabled: false },
  ];

  const milestones = [
    { label: 'Kennismaking gedaan', achieved: isUnlocked },
    { label: 'Hardware wallet besteld', achieved: isUnlocked && hasWallet },
    { label: 'Bitcoin gekocht', achieved: isUnlocked && hasWallet && hasBitcoin },
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm transition-all duration-300 overflow-hidden ${isExpanded ? 'w-52' : 'w-14'}`}>
      {/* Uitschuif-knop */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Inklappen' : 'Uitklappen'}
        className="flex items-center justify-center h-9 border-b border-gray-100 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-t-xl transition-colors shrink-0"
      >
        {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Menu items */}
      <nav className="flex-1 flex flex-col pt-2 pb-1">
        <div className="flex flex-col gap-0.5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = item.alwaysEnabled || isUnlocked;

            return (
              <button
                key={item.id}
                onClick={() => { if (isEnabled) onTabChange(item.id); }}
                disabled={!isEnabled}
                title={!isExpanded ? item.label : undefined}
                className={`relative flex items-center h-10 rounded-lg transition-colors group ${
                  isExpanded ? 'gap-3 px-3' : 'justify-center'
                } ${
                  !isEnabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : activeTab === item.id
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {item.badge && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
                {/* Tooltip — links van de sidebar (sidebar zit rechts) */}
                {!isExpanded && (
                  <span className="absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Voortgang sterren */}
      <div className="border-t border-gray-100 pt-2 pb-3 px-2">
        {isExpanded ? (
          <div className="space-y-2 px-1">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Voortgang</p>
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <Star
                  className={`w-4 h-4 shrink-0 ${m.achieved ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}`}
                />
                <span className={`text-xs leading-tight ${m.achieved ? 'text-gray-700' : 'text-gray-300'}`}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            {milestones.map((m, i) => (
              <Star
                key={i}
                title={m.label}
                className={`w-4 h-4 ${m.achieved ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
