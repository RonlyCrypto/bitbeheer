import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface ExpandableMenuSectionProps {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
  activeTab: string;
  onSelectItem: (itemId: string) => void;
  isEnabled?: boolean;
  disabledMessage?: string;
}

export default function ExpandableMenuSection({
  title,
  icon: Icon,
  items,
  activeTab,
  onSelectItem,
  isEnabled = true,
  disabledMessage
}: ExpandableMenuSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAnyActive = items.some(item => item.id === activeTab);

  return (
    <div className="space-y-0">
      {/* Header button */}
      <button
        onClick={() => {
          if (isEnabled) {
            setIsExpanded(!isExpanded);
          }
        }}
        disabled={!isEnabled}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors relative group ${
          !isEnabled
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
            : isExpanded || isAnyActive
            ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title={!isEnabled ? disabledMessage : undefined}
      >
        <Icon className="w-5 h-5" />
        <span className="flex-1">{title}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Tooltip for disabled state */}
      {!isEnabled && disabledMessage && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-64 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden">
          {disabledMessage}
        </div>
      )}

      {/* Expanded items */}
      {isExpanded && isEnabled && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectItem(item.id);
                  setIsExpanded(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                  activeTab === item.id
                    ? 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ItemIcon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

