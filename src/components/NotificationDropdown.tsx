import { useState, useEffect, useRef } from 'react';
import { Bell, X, Mail, Phone, TrendingDown, TrendingUp, Target, Settings, Calendar, CheckCircle, Clock } from 'lucide-react';
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
  type: 'appointment_approved' | 'goal_achieved' | 'market_alert' | 'other';
  title: string;
  message: string;
  icon: React.ElementType;
  color: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationDropdown({ unreadCount }: { unreadCount: number }) {
  const { user } = useSupabaseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'settings'>('recent');
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPreferences();
    loadNotifications();
  }, [user]);

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
        // Create default preferences
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
    } finally {
      setLoading(false);
    }
  };

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

      // Fetch recent goals achieved
      const { data: goals } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('achieved', true)
        .order('achieved_at', { ascending: false })
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
            timestamp: goal.achieved_at || goal.created_at,
            read: false
          });
        });
      }

      // Sort by timestamp
      notificationList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(notificationList);
    } catch (error) {
      console.error('Error loading notifications:', error);
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

      {isOpen && preferences && (
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
            
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'recent'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Recent
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Instellingen
              </button>
            </div>
          </div>

          {/* Recent Notifications Tab */}
          {activeTab === 'recent' && (
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
                    <div key={notification.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
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
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {/* Bear Market Buys */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <label className="text-sm font-medium text-gray-900">
                    Bear Market Buys
                  </label>
                </div>
                <button
                  onClick={() => {
                    if (preferences.bear_market_buys_global_enabled) {
                      updatePreference('bear_market_buys_enabled', !preferences.bear_market_buys_enabled);
                    }
                  }}
                  disabled={!preferences.bear_market_buys_global_enabled || saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.bear_market_buys_enabled && preferences.bear_market_buys_global_enabled
                      ? 'bg-orange-600'
                      : 'bg-gray-300'
                  } ${!preferences.bear_market_buys_global_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.bear_market_buys_enabled && preferences.bear_market_buys_global_enabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {!preferences.bear_market_buys_global_enabled && (
                <p className="text-xs text-gray-500 mb-2">Deze functie is momenteel uitgeschakeld door de admin</p>
              )}
              {preferences.bear_market_buys_enabled && preferences.bear_market_buys_global_enabled && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-600 mb-2">Contactvoorkeur:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePreference('bear_market_buys_contact_method', 'email')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        preferences.bear_market_buys_contact_method === 'email'
                          ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </button>
                    <button
                      onClick={() => updatePreference('bear_market_buys_contact_method', 'phone')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        preferences.bear_market_buys_contact_method === 'phone'
                          ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefoon (Aanbevolen)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bear Market Alerts */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <label className="text-sm font-medium text-gray-900">
                    Bear Market Meldingen
                  </label>
                </div>
                <button
                  onClick={() => {
                    if (preferences.bear_market_alerts_global_enabled) {
                      updatePreference('bear_market_alerts_enabled', !preferences.bear_market_alerts_enabled);
                    }
                  }}
                  disabled={!preferences.bear_market_alerts_global_enabled || saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.bear_market_alerts_enabled && preferences.bear_market_alerts_global_enabled
                      ? 'bg-orange-600'
                      : 'bg-gray-300'
                  } ${!preferences.bear_market_alerts_global_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.bear_market_alerts_enabled && preferences.bear_market_alerts_global_enabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {!preferences.bear_market_alerts_global_enabled && (
                <p className="text-xs text-gray-500">Deze functie is momenteel uitgeschakeld door de admin</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Ontvang email meldingen wanneer we in een bear market zitten</p>
            </div>

            {/* Bull Market Alerts */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <label className="text-sm font-medium text-gray-900">
                    Bull Market Meldingen
                  </label>
                </div>
                <button
                  onClick={() => {
                    if (preferences.bull_market_alerts_global_enabled) {
                      updatePreference('bull_market_alerts_enabled', !preferences.bull_market_alerts_enabled);
                    }
                  }}
                  disabled={!preferences.bull_market_alerts_global_enabled || saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.bull_market_alerts_enabled && preferences.bull_market_alerts_global_enabled
                      ? 'bg-orange-600'
                      : 'bg-gray-300'
                  } ${!preferences.bull_market_alerts_global_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.bull_market_alerts_enabled && preferences.bull_market_alerts_global_enabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {!preferences.bull_market_alerts_global_enabled && (
                <p className="text-xs text-gray-500">Deze functie is momenteel uitgeschakeld door de admin</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Ontvang email meldingen wanneer we in een bull market zitten</p>
            </div>

            {/* Goal Achievements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <label className="text-sm font-medium text-gray-900">
                    Behaalde Doelen Meldingen
                  </label>
                </div>
                <button
                  onClick={() => {
                    if (preferences.goal_achievements_global_enabled) {
                      updatePreference('goal_achievements_enabled', !preferences.goal_achievements_enabled);
                    }
                  }}
                  disabled={!preferences.goal_achievements_global_enabled || saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.goal_achievements_enabled && preferences.goal_achievements_global_enabled
                      ? 'bg-orange-600'
                      : 'bg-gray-300'
                  } ${!preferences.goal_achievements_global_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.goal_achievements_enabled && preferences.goal_achievements_global_enabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {!preferences.goal_achievements_global_enabled && (
                <p className="text-xs text-gray-500">Deze functie is momenteel uitgeschakeld door de admin</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Ontvang email meldingen wanneer je een doel hebt behaald</p>
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

