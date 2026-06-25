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
    { id: 'overview',  label: 'Overzicht',   icon: BarChart3, alwaysEnabled: true  },
    { id: 'goals',     label: 'Mijn Doelen', icon: Target,    alwaysEnabled: true  },
    { id: 'portfolio', label: 'Portfolio',   icon: PieChart,  alwaysEnabled: false },
    { id: 'helpdesk',  label: 'Helpdesk',    icon: Mail,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined, alwaysEnabled: false },
  ];

  const milestones = [
    { label: 'Kennismaking gedaan',    achieved: isUnlocked },
    { label: 'Hardware wallet besteld', achieved: isUnlocked && hasWallet },
    { label: 'Bitcoin gekocht',         achieved: isUnlocked && hasWallet && hasBitcoin },
  ];

  const iconBarHeight = 9 + 36 + menuItems.length * 42 + 8 + milestones.length * 22 + 12;

  return (
    /* Outer wrapper — altijd w-14 in de layout, overflow-visible zodat overlay uitsteekt */
    <div style={{ position: 'relative', width: '56px', minHeight: `${iconBarHeight}px` }}>

      {/* Icon bar — altijd zichtbaar, neemt w-14 in de layout */}
      <div className="bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm overflow-hidden" style={{ width: '56px' }}>
        {/* Uitklap-knop */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Inklappen' : 'Uitklappen'}
          className="flex items-center justify-center h-9 border-b border-gray-100 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Iconen */}
        <nav className="flex flex-col gap-0.5 px-2 pt-2 pb-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = item.alwaysEnabled || isUnlocked;
            return (
              <button
                key={item.id}
                onClick={() => { if (isEnabled) onTabChange(item.id); }}
                disabled={!isEnabled}
                title={!isExpanded ? item.label : undefined}
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
              </button>
            );
          })}
        </nav>

        {/* Sterren — ingeklapt */}
        <div className="border-t border-gray-100 pt-2 pb-3 flex flex-col items-center gap-1.5">
          {milestones.map((m, i) => (
            <Star
              key={i}
              title={m.label}
              className={`w-4 h-4 ${m.achieved ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Overlay panel — verschijnt rechts van de icon bar bij uitklappen */}
      {isExpanded && (
        <div
          className="absolute bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden"
          style={{ left: '60px', top: 0, width: '168px' }}
        >
          {/* Lege ruimte ter hoogte van de knop */}
          <div style={{ height: '36px', borderBottom: '1px solid #f3f4f6' }} />

          {/* Labels */}
          <nav className="flex flex-col gap-0.5 px-2 pt-2 pb-1">
            {menuItems.map((item) => {
              const isEnabled = item.alwaysEnabled || isUnlocked;
              return (
                <button
                  key={item.id}
                  onClick={() => { if (isEnabled) { onTabChange(item.id); setIsExpanded(false); } }}
                  disabled={!isEnabled}
                  className={`flex items-center gap-3 px-3 h-10 w-full rounded-lg text-sm font-medium transition-colors ${
                    !isEnabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : activeTab === item.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sterren — uitgeklapt */}
          <div className="border-t border-gray-100 px-3 pt-2 pb-3 space-y-2">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Voortgang</p>
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <Star className={`w-4 h-4 shrink-0 ${m.achieved ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}`} />
                <span className={`text-xs leading-tight ${m.achieved ? 'text-gray-700' : 'text-gray-300'}`}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
