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
  const [isExpanded, setIsExpanded] = useState(() => {
    try { return localStorage.getItem('sidebar_expanded') === 'true'; } catch { return false; }
  });

  const toggleExpanded = (val: boolean) => {
    setIsExpanded(val);
    try { localStorage.setItem('sidebar_expanded', String(val)); } catch {}
  };

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

  return (
    /* Wrapper neemt altijd 56px in de layout; kaart klapt naar LINKS uit */
    <div style={{ position: 'relative', width: '56px', flexShrink: 0 }}>
      <div
        className="absolute top-0 right-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
        style={{
          width: isExpanded ? '200px' : '56px',
          transition: 'width 220ms ease',
          zIndex: 30,
        }}
      >
        {/* Uitklap-knop — pijl wijst naar links (uitklappen = naar links) */}
        <button
          onClick={() => toggleExpanded(!isExpanded)}
          title={isExpanded ? 'Inklappen' : 'Uitklappen'}
          className="flex items-center justify-end h-9 border-b border-gray-100 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
        >
          <span className="flex items-center justify-center w-14 shrink-0">
            {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </span>
        </button>

        {/* Menu items — label links, icoon rechts */}
        <nav className="flex flex-col gap-0.5 px-1.5 pt-2 pb-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = item.alwaysEnabled || isUnlocked;
            return (
              <button
                key={item.id}
                onClick={() => { if (isEnabled) onTabChange(item.id); }}
                disabled={!isEnabled}
                title={!isExpanded ? item.label : undefined}
                className={`relative flex items-center flex-row-reverse h-10 rounded-lg transition-colors overflow-hidden w-full ${
                  !isEnabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : activeTab === item.id
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {/* Icoon — altijd rechts, vaste breedte */}
                <span className="flex items-center justify-center w-10 shrink-0">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                {/* Label — schuift in vanuit links */}
                <span
                  className="text-sm font-medium whitespace-nowrap overflow-hidden text-left pl-3"
                  style={{
                    maxWidth: isExpanded ? '140px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'max-width 200ms ease, opacity 150ms ease',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sterren / voortgang */}
        <div className="border-t border-gray-100 pt-2 pb-3 flex flex-col gap-1.5 overflow-hidden">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center flex-row-reverse">
              {/* Ster rechts */}
              <span className="flex items-center justify-center w-10 shrink-0">
                <Star
                  title={!isExpanded ? m.label : undefined}
                  className={`w-4 h-4 ${m.achieved ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}`}
                />
              </span>
              {/* Label links */}
              <span
                className="text-xs whitespace-nowrap overflow-hidden pl-3"
                style={{
                  maxWidth: isExpanded ? '140px' : '0px',
                  opacity: isExpanded ? 1 : 0,
                  transition: 'max-width 200ms ease, opacity 150ms ease',
                  color: m.achieved ? '#374151' : '#d1d5db',
                }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
