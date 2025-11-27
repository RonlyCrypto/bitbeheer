import { useState, useEffect, useRef } from 'react';
import { Settings, X, Mail, Phone, TrendingDown, TrendingUp, Target } from 'lucide-react';
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

export default function NotificationSettings() {
  const { user } = useSupabaseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadPreferences = async () => {
    if (!user?.id) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      loadPreferences();
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Notificatie instellingen"
      >
        <Settings className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notificatie Instellingen</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Instellingen laden...</p>
              </div>
            ) : preferences ? (
              <>
                {/* Bear Market Buys */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
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
                          : 'bg-gray-300 dark:bg-gray-600'
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Deze functie is momenteel uitgeschakeld door de admin</p>
                  )}
                  {preferences.bear_market_buys_enabled && preferences.bear_market_buys_global_enabled && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Contactvoorkeur:</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePreference('bear_market_buys_contact_method', 'email')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            preferences.bear_market_buys_contact_method === 'email'
                              ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-2 border-orange-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent'
                          }`}
                        >
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email
                        </button>
                        <button
                          onClick={() => updatePreference('bear_market_buys_contact_method', 'phone')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            preferences.bear_market_buys_contact_method === 'phone'
                              ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-2 border-orange-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent'
                          }`}
                        >
                          <Phone className="w-4 h-4 inline mr-1" />
                          Telefoon
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bear Market Alerts */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
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
                          : 'bg-gray-300 dark:bg-gray-600'
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Deze functie is momenteel uitgeschakeld door de admin</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ontvang meldingen wanneer we in een bear market zitten</p>
                </div>

                {/* Bull Market Alerts */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
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
                          : 'bg-gray-300 dark:bg-gray-600'
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Deze functie is momenteel uitgeschakeld door de admin</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ontvang meldingen wanneer we in een bull market zitten</p>
                </div>

                {/* Goal Achievements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
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
                          : 'bg-gray-300 dark:bg-gray-600'
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Deze functie is momenteel uitgeschakeld door de admin</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ontvang meldingen wanneer je een doel hebt behaald</p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

