import {
  BarChart3, MessageSquare, Calendar, Users, Mail,
  Link as LinkIcon, Bell, TrendingUp, Zap, Settings, Menu
} from 'lucide-react';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadChatCount?: number;
}

const TABS = [
  { id: 'overview',               label: 'Dashboard',  icon: BarChart3 },
  { id: 'chat',                   label: 'Chat',        icon: MessageSquare },
  { id: 'appointments',           label: 'Afspraken',   icon: Calendar },
  { id: 'accounts',               label: 'Accounts',    icon: Users },
  { id: 'email-management',       label: 'E-mail',      icon: Mail },
  { id: 'referral-links',         label: 'Referral',    icon: LinkIcon },
  { id: 'notification-management',label: 'Notificaties',icon: Bell },
  { id: 'seo-analytics',          label: 'SEO',         icon: TrendingUp },
  { id: 'cycle-advisor',          label: 'Cycle',       icon: Zap },
  { id: 'settings',               label: 'Instellingen',icon: Settings },
  { id: 'controls',               label: 'Beheer',      icon: Menu },
];

export default function AdminMobileTabBar({ activeTab, onTabChange, unreadChatCount = 0 }: Props) {
  return (
    <div className="md:hidden bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-1 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge = id === 'chat' && unreadChatCount > 0 ? unreadChatCount : 0;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors relative ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
