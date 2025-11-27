import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface SidebarTab {
  id: string;
  label: string;
  icon: React.ElementType;
  alwaysEnabled: boolean;
  badge?: number;
}

interface CollapsibleSidebarProps {
  tabs: SidebarTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accountApproved: boolean;
  hasApprovedOneOnOne: boolean;
  children?: React.ReactNode;
}

export default function CollapsibleSidebar({
  tabs,
  activeTab,
  onTabChange,
  accountApproved,
  hasApprovedOneOnOne,
  children
}: CollapsibleSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Collapsible Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 pt-16 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto pt-4 px-2">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const isEnabled = tab.alwaysEnabled || accountApproved || hasApprovedOneOnOne;
              const tooltipText = !isEnabled
                ? "Je moet eerst een 20-minuten afspraak maken. Na deze afspraak bepalen we of we verder met elkaar gaan en dan kan de admin je account volledig open stellen."
                : null;
              const Icon = tab.icon;

              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => {
                      if (isEnabled) {
                        onTabChange(tab.id);
                      }
                    }}
                    disabled={!isEnabled}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative ${
                      !isEnabled
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                        : activeTab === tab.id
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={!isExpanded ? tab.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    
                    {/* Label - Only visible when expanded */}
                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left text-sm">
                          {tab.label}
                        </span>
                        {tab.badge && tab.badge > 0 && (
                          <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                            {tab.badge > 9 ? '9+' : tab.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Badge - Only visible when collapsed */}
                    {!isExpanded && tab.badge && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                        {tab.badge > 9 ? '9' : tab.badge}
                      </span>
                    )}
                  </button>

                  {/* Tooltip - Only show when collapsed and item is disabled */}
                  {!isExpanded && !isEnabled && tooltipText && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-64 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {tooltipText}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer Content - Only visible when expanded */}
        {isExpanded && children && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            {children}
          </div>
        )}

        {/* Footer Content Icons - Only visible when collapsed */}
        {!isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-2">
            <div className="flex justify-center">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

