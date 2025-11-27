import { useState, useEffect } from 'react';
import { Bell, TrendingDown, TrendingUp, Target, Mail, Phone, ToggleLeft, ToggleRight, Users, Save, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NotificatieBeheer from './NotificatieBeheer';

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

export default function NotificationManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'preferences' | 'users'>('preferences');
  const [globalSettings, setGlobalSettings] = useState({
    bear_market_buys_global_enabled: true,
    bear_market_alerts_global_enabled: true,
    bull_market_alerts_global_enabled: true,
    goal_achievements_global_enabled: true
  });
  const [bearMarketBuysUsers, setBearMarketBuysUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load global settings from first user's preferences (they should all be the same)
      const { data: prefsData, error: prefsError } = await supabase
        .from('notification_preferences')
        .select('bear_market_buys_global_enabled, bear_market_alerts_global_enabled, bull_market_alerts_global_enabled, goal_achievements_global_enabled')
        .limit(1)
        .maybeSingle();

      if (prefsData) {
        setGlobalSettings({
          bear_market_buys_global_enabled: prefsData.bear_market_buys_global_enabled ?? true,
          bear_market_alerts_global_enabled: prefsData.bear_market_alerts_global_enabled ?? true,
          bull_market_alerts_global_enabled: prefsData.bull_market_alerts_global_enabled ?? true,
          goal_achievements_global_enabled: prefsData.goal_achievements_global_enabled ?? true
        });
      }

      // Load bear market buys users
      const { data: usersData, error: usersError } = await supabase
        .from('notification_preferences')
        .select('id, user_id, email, bear_market_buys_enabled, bear_market_buys_contact_method')
        .eq('bear_market_buys_enabled', true);

      if (usersError) throw usersError;

      // Also get user details from accounts table
      const userIds = usersData?.map(u => u.user_id).filter(Boolean) || [];
      if (userIds.length > 0) {
        const { data: userDetails, error: userDetailsError } = await supabase
          .from('accounts')
          .select('id, email, name, phone')
          .in('id', userIds);

        if (!userDetailsError && userDetails) {
          const enrichedUsers = usersData?.map(pref => {
            const userDetail = userDetails.find(u => u.id === pref.user_id);
            return {
              ...pref,
              name: userDetail?.name || '',
              phone: userDetail?.phone || ''
            };
          }) || [];
          setBearMarketBuysUsers(enrichedUsers);
        } else {
          setBearMarketBuysUsers(usersData || []);
        }
      } else {
        setBearMarketBuysUsers([]);
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
      alert('Fout bij laden van notificatie gegevens');
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalSetting = async (field: keyof typeof globalSettings, value: boolean) => {
    setSaving(true);
    try {
      // Update all notification preferences with new global setting
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [field]: value })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

      if (error) throw error;

      setGlobalSettings(prev => ({ ...prev, [field]: value }));
      await loadData(); // Reload to get updated user list
    } catch (error) {
      console.error('Error updating global setting:', error);
      alert('Fout bij opslaan van instelling');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSubTab === 'users'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Notificatie Aanmeldingen
          </button>
          <button
            onClick={() => setActiveSubTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSubTab === 'preferences'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Voorkeuren & Instellingen
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'users' && (
        <div>
          <NotificatieBeheer />
        </div>
      )}

      {activeSubTab === 'preferences' && (
        <div className="space-y-6">
          {/* Global Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Globale Instellingen</h3>
            <p className="text-sm text-gray-600 mb-6">
              Schakel notificatie functies in of uit voor alle gebruikers
            </p>

            <div className="space-y-4">
              {/* Bear Market Buys Global */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-900">Bear Market Buys</label>
                    <p className="text-xs text-gray-600">Gebruikers kunnen zich aanmelden voor bear market buy begeleiding</p>
                  </div>
                </div>
                <button
                  onClick={() => updateGlobalSetting('bear_market_buys_global_enabled', !globalSettings.bear_market_buys_global_enabled)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    globalSettings.bear_market_buys_global_enabled ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      globalSettings.bear_market_buys_global_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Bear Market Alerts Global */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-900">Bear Market Meldingen</label>
                    <p className="text-xs text-gray-600">Email meldingen wanneer we in een bear market zitten</p>
                  </div>
                </div>
                <button
                  onClick={() => updateGlobalSetting('bear_market_alerts_global_enabled', !globalSettings.bear_market_alerts_global_enabled)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    globalSettings.bear_market_alerts_global_enabled ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      globalSettings.bear_market_alerts_global_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Bull Market Alerts Global */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-900">Bull Market Meldingen</label>
                    <p className="text-xs text-gray-600">Email meldingen wanneer we in een bull market zitten</p>
                  </div>
                </div>
                <button
                  onClick={() => updateGlobalSetting('bull_market_alerts_global_enabled', !globalSettings.bull_market_alerts_global_enabled)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    globalSettings.bull_market_alerts_global_enabled ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      globalSettings.bull_market_alerts_global_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Goal Achievements Global */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-900">Behaalde Doelen Meldingen</label>
                    <p className="text-xs text-gray-600">Email meldingen wanneer gebruikers doelen behalen</p>
                  </div>
                </div>
                <button
                  onClick={() => updateGlobalSetting('goal_achievements_global_enabled', !globalSettings.goal_achievements_global_enabled)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    globalSettings.goal_achievements_global_enabled ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      globalSettings.goal_achievements_global_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Bear Market Buys Users */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Bear Market Buys Groep
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gebruikers die zich hebben aangemeld voor bear market buy begeleiding ({bearMarketBuysUsers.length} gebruikers)
                </p>
              </div>
            </div>

            {bearMarketBuysUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Geen gebruikers met bear market buys ingeschakeld</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Naam
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefoon
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contactvoorkeur
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bearMarketBuysUsers.map((user) => (
                      <tr key={user.id || user.user_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {user.name || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {user.phone || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            user.bear_market_buys_contact_method === 'phone'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.bear_market_buys_contact_method === 'phone' ? (
                              <>
                                <Phone className="w-3 h-3" />
                                Telefoon
                              </>
                            ) : (
                              <>
                                <Mail className="w-3 h-3" />
                                Email
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

