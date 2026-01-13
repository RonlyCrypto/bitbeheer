import { useState, useEffect, useRef } from 'react';
import { Bell, X, Mail, Phone, TrendingDown, TrendingUp, Target, Settings, Calendar, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email: string;
  bear_market_buys_enabled: boolean;
  bear_market_buys_contact_method: 'email' | 'phone';
  bear_market_alerts_enabled: boolean;
  bull_market_alerts_enabled: boolean;
  goal_achievements_enabled: boolean;
  bear_market_buys_global_enabled: boolean;
  bear_market_alerts_global_enabled: boolean;
  bull_market_alerts_global_enabled: boolean;
  goal_achievements_global_enabled: boolean;
}

interface Notification {
  id: string;
  type: 'appointment_approved' | 'goal_achieved' | 'market_alert' | 'unread_message' | 'other';
  title: string;
  message: string;
  icon: React.ElementType;
  color: string;
  timestamp: string;
  read: boolean;
}

interface NotificationDropdownProps {
  unreadCount: number;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationDropdown({ unreadCount, onNotificationClick }: NotificationDropdownProps) {
  const { user } = useSupabaseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pass unreadCount as prop to include in notifications
  const unreadMessages = unreadCount;

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        const defaultPrefs: NotificationPreferences = {
          email: user.email || '',
          bear_market_buys_enabled: false,
          bear_market_buys_contact_method: 'email',
          bear_market_alerts_enabled: false,
          bull_market_alerts_enabled: false,
          goal_achievements_enabled: false,
          bear_market_buys_global_enabled: true,
          bear_market_alerts_global_enabled: true,
          bull_market_alerts_global_enabled: true,
          goal_achievements_global_enabled: true
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const updatePreference = async (field: keyof NotificationPreferences, value: any) => {
    if (!user?.id || !preferences) return;

    setSaving(true);
    try {
      const updated = { ...preferences, [field]: value };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          ...updated
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(updated);
    } catch (error) {
      console.error('Error updating preference:', error);
      alert('Fout bij opslaan van voorkeur');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await loadPreferences();
      await loadNotifications();
      setLoading(false);
    };
    if (user?.id) {
      loadAll();
    }
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);


  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      // Fetch recent appointments approved
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .eq('approved_by_admin', true)
        .order('approved_at', { ascending: false })
        .limit(5);

      // Fetch recent goals achieved (using goals table instead of user_goals)
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(5);

      const notificationList: Notification[] = [];

      // Add appointment notifications
      if (appointments) {
        appointments.forEach((apt) => {
          notificationList.push({
            id: `apt_${apt.id}`,
            type: 'appointment_approved',
            title: '✅ Afspraak Goedgekeurd',
            message: `Jouw afspraak op ${new Date(apt.date).toLocaleDateString('nl-NL')} is goedgekeurd`,
            icon: CheckCircle,
            color: 'green',
            timestamp: apt.approved_at || apt.created_at,
            read: false
          });
        });
      }

      // Add goal notifications
      if (goals) {
        goals.forEach((goal) => {
          notificationList.push({
            id: `goal_${goal.id}`,
            type: 'goal_achieved',
            title: '🎯 Doel Bereikt!',
            message: `Je hebt jouw doel "${goal.title}" bereikt!`,
            icon: CheckCircle,
            color: 'blue',
            timestamp: goal.updated_at || goal.created_at,
            read: false
          });
        });
      }

      // Add unread messages notification
      if (unreadMessages > 0) {
        notificationList.unshift({
          id: 'unread_messages',
          type: 'unread_message',
          title: '💬 Nieuwe Berichten',
          message: `Je hebt ${unreadMessages} ongelezen bericht${unreadMessages !== 1 ? 'en' : ''} in Helpdesk`,
          icon: MessageSquare,
          color: 'orange',
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      // Add mock notifications for demo/testing (can be removed later)
      notificationList.push({
        id: 'demo_1',
        type: 'appointment_approved',
        title: '✅ Afspraak Goedgekeurd',
        message: 'Jouw afspraak op 15 dec. is goedgekeurd door de admin',
        icon: CheckCircle,
        color: 'green',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false
      });

      // Sort by timestamp
      notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(notificationList);
      console.log('✅ Notifications loaded:', notificationList);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };


  if (loading) {
    return (
      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
        title="Notificatie instellingen"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-y-auto">
          {/* Header with Tabs */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Meldingen</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Header */}
            <div className="px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-900">Recente Meldingen</h3>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Geen recente meldingen</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (onNotificationClick) {
                        onNotificationClick(notification);
                      }
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.color === 'green' ? 'bg-green-100' :
                        notification.color === 'blue' ? 'bg-blue-100' :
                        'bg-orange-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          notification.color === 'green' ? 'text-green-600' :
                          notification.color === 'blue' ? 'text-blue-600' :
                          'text-orange-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.timestamp).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

