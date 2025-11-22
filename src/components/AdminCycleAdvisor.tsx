import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Users, 
  TrendingUp, 
  BarChart3, 
  ToggleLeft,
  Settings,
  Search,
  Filter,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Circle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cycleAdvisorDatabaseService } from '../services/cycleAdvisorDatabaseService';
import { cycleAdvisorService } from '../services/cycleAdvisorService';

interface UserWithAdvisor {
  id: string;
  email: string;
  user_type?: string;
  cycle_advisor_settings?: {
    enabled: boolean;
    mode: 'conservative' | 'balanced' | 'aggressive';
    show_roi_projections: boolean;
    show_cycle_comparison: boolean;
    notification_on_buy_signal: boolean;
    updated_at: string;
  };
  cycleStatus?: {
    riskLevel: 'low' | 'medium' | 'high' | 'very_high';
    level: 'strong_buy' | 'buy' | 'wait' | 'hold' | 'caution' | 'risky';
    description: string;
  };
}

export default function AdminCycleAdvisor() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [users, setUsers] = useState<UserWithAdvisor[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithAdvisor | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    cycleAdvisorEnabled: 0,
    byMode: { conservative: 0, balanced: 0, aggressive: 0 }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [userStatusCache, setUserStatusCache] = useState<Record<string, UserWithAdvisor['cycleStatus']>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter users based on search
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, user_type')
        .order('email');

      if (usersError) throw usersError;

      // Load cycle advisor settings for each user
      const { data: settingsData, error: settingsError } = await supabase
        .from('cycle_advisor_settings')
        .select('*');

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

      // Merge data
      const usersWithAdvisor: UserWithAdvisor[] = (usersData || []).map(user => {
        const advisorSettings = (settingsData || []).find(s => s.user_id === user.id);
        return {
          ...user,
          cycle_advisor_settings: advisorSettings
        };
      });

      // Load cycle status for each user
      const statusCache: Record<string, UserWithAdvisor['cycleStatus']> = {};
      for (const user of usersWithAdvisor) {
        if (user.cycle_advisor_settings?.enabled) {
          try {
            const advisorData = await cycleAdvisorService.getAdvisorData();
            if (advisorData) {
              statusCache[user.id] = {
                riskLevel: advisorData.recommendation.riskLevel,
                level: advisorData.recommendation.level,
                description: advisorData.recommendation.description
              };
            }
          } catch (error) {
            console.warn(`Could not load status for user ${user.email}:`, error);
          }
        }
      }
      setUserStatusCache(statusCache);

      setUsers(usersWithAdvisor);
      setFilteredUsers(usersWithAdvisor);

      // Calculate stats
      const enabledCount = (settingsData || []).filter(s => s.enabled).length;
      const byMode = { conservative: 0, balanced: 0, aggressive: 0 };
      (settingsData || [])
        .filter(s => s.enabled)
        .forEach(s => {
          if (s.mode in byMode) {
            byMode[s.mode as keyof typeof byMode]++;
          }
        });

      setStats({
        totalUsers: usersData?.length || 0,
        cycleAdvisorEnabled: enabledCount,
        byMode
      });

      console.log('✅ Cycle Advisor data loaded');
    } catch (error) {
      console.error('❌ Error loading cycle advisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (user: UserWithAdvisor) => {
    setIsSaving(true);
    try {
      const currentEnabled = user.cycle_advisor_settings?.enabled ?? false;
      await cycleAdvisorDatabaseService.adminToggleCycleAdvisor(user.id, !currentEnabled);
      
      // Update local state
      const updated = users.map(u => 
        u.id === user.id 
          ? {
              ...u,
              cycle_advisor_settings: {
                ...(u.cycle_advisor_settings || {}),
                enabled: !currentEnabled
              } as any
            }
          : u
      );
      setUsers(updated);
      setFilteredUsers(updated);
      console.log(`✅ Cycle advisor ${!currentEnabled ? 'enabled' : 'disabled'} for ${user.email}`);
    } catch (error) {
      console.error('❌ Error toggling cycle advisor:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeMode = async (user: UserWithAdvisor, newMode: 'conservative' | 'balanced' | 'aggressive') => {
    setIsSaving(true);
    try {
      await cycleAdvisorDatabaseService.adminSetCycleAdvisorMode(user.id, newMode);
      
      // Update local state
      const updated = users.map(u => 
        u.id === user.id 
          ? {
              ...u,
              cycle_advisor_settings: {
                ...(u.cycle_advisor_settings || {}),
                mode: newMode
              } as any
            }
          : u
      );
      setUsers(updated);
      setFilteredUsers(updated);
      console.log(`✅ Mode changed to ${newMode} for ${user.email}`);
    } catch (error) {
      console.error('❌ Error changing mode:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'conservative': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'balanced': return 'bg-green-50 text-green-700 border-green-200';
      case 'aggressive': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'conservative': return 'Conservative';
      case 'balanced': return 'Balanced';
      case 'aggressive': return 'Aggressive';
      default: return 'Unknown';
    }
  };

  const getTrafficLightColor = (position: 'below_previous_ath' | 'between_aths' | 'above_latest_ath' | 'unknown' | undefined): 'green' | 'orange' | 'red' | 'gray' => {
    switch (position) {
      case 'below_previous_ath': return 'green'; // Veilig - groen
      case 'between_aths': return 'orange'; // Neutraal - oranje
      case 'above_latest_ath': return 'red'; // Hoog risico - rood
      default: return 'gray'; // Onbekend
    }
  };

  const getTrafficLightLabel = (position: 'below_previous_ath' | 'between_aths' | 'above_latest_ath' | 'unknown' | undefined) => {
    switch (position) {
      case 'below_previous_ath': return 'Veilig - Onder vorige ATH';
      case 'between_aths': return 'Neutraal - Tussen ATHs';
      case 'above_latest_ath': return 'Hoog Risico - Boven huidige ATH';
      default: return 'Onbekend';
    }
  };

  const getRiskColor = (position: 'below_previous_ath' | 'between_aths' | 'above_latest_ath' | 'unknown' | undefined) => {
    const color = getTrafficLightColor(position);
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getRiskLabel = (position: 'below_previous_ath' | 'between_aths' | 'above_latest_ath' | 'unknown' | undefined) => {
    return getTrafficLightLabel(position);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            Cycle Advisor Beheer
          </h2>
          <p className="text-gray-600 mt-1">
            Beheer de Cycle Advisor module per gebruiker
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          Vernieuwen
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overzicht
          </div>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gebruikers
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Instellingen
          </div>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Totaal Gebruikers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Cycle Advisor Enabled */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cycle Advisor Enabled</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.cycleAdvisorEnabled}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalUsers > 0 
                    ? `${Math.round((stats.cycleAdvisorEnabled / stats.totalUsers) * 100)}%` 
                    : '0%'}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Mode Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm font-medium">Mode Verdeling</p>
              <TrendingUp className="w-5 h-5 text-orange-500 opacity-50" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Conservative</span>
                <span className="text-sm font-semibold text-blue-600">{stats.byMode.conservative}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Balanced</span>
                <span className="text-sm font-semibold text-green-600">{stats.byMode.balanced}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Aggressive</span>
                <span className="text-sm font-semibold text-orange-600">{stats.byMode.aggressive}</span>
              </div>
            </div>
          </div>

          {/* Market Status - Traffic Light */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  🚦 Huidige Markt Status
                </h3>
                <p className="text-sm text-gray-600 mt-1">Bitcoin positie in de huidige cyclus</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Safe - Green */}
              <div className="border-2 border-green-500 rounded-lg p-6 text-center bg-green-50">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🟢</span>
                  </div>
                </div>
                <h4 className="font-bold text-green-900 text-lg">VEILIG</h4>
                <p className="text-sm text-green-700 mt-2">Onder vorige ATH</p>
                <p className="text-xs text-green-600 mt-3 font-medium">Beste koopkans</p>
              </div>

              {/* Neutral - Orange */}
              <div className="border-2 border-orange-500 rounded-lg p-6 text-center bg-orange-50">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🟠</span>
                  </div>
                </div>
                <h4 className="font-bold text-orange-900 text-lg">NEUTRAAL</h4>
                <p className="text-sm text-orange-700 mt-2">Tussen vorige & huidige ATH</p>
                <p className="text-xs text-orange-600 mt-3 font-medium">Wachten adviseert</p>
              </div>

              {/* Risky - Red */}
              <div className="border-2 border-red-500 rounded-lg p-6 text-center bg-red-50">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🔴</span>
                  </div>
                </div>
                <h4 className="font-bold text-red-900 text-lg">HOOG RISICO</h4>
                <p className="text-sm text-red-700 mt-2">Boven huidige ATH</p>
                <p className="text-xs text-red-600 mt-3 font-medium">Niet kopen</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-lg">
          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-200 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek gebruiker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status 🚦</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Enabled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Laatst Gewijzigd</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Geen gebruikers gevonden
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const status = userStatusCache[user.id];
                    return (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {status ? (
                            <>
                              <Circle className={`w-4 h-4 ${getRiskColor(status.riskLevel)} rounded-full`} fill="currentColor" />
                              <span className="text-xs font-medium text-gray-700">{getRiskLabel(status.riskLevel)}</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleToggleUser(user)}
                          disabled={isSaving}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            user.cycle_advisor_settings?.enabled
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50`}
                        >
                          <ToggleLeft className="w-4 h-4 mr-1" />
                          {user.cycle_advisor_settings?.enabled ? 'Aan' : 'Uit'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={user.cycle_advisor_settings?.mode || 'balanced'}
                          onChange={(e) => handleChangeMode(user, e.target.value as any)}
                          disabled={!user.cycle_advisor_settings?.enabled || isSaving}
                          className={`px-3 py-1 rounded border ${getModeColor(user.cycle_advisor_settings?.mode || 'balanced')} text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50`}
                        >
                          <option value="conservative">Conservative</option>
                          <option value="balanced">Balanced</option>
                          <option value="aggressive">Aggressive</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.cycle_advisor_settings?.updated_at
                          ? new Date(user.cycle_advisor_settings.updated_at).toLocaleDateString('nl-NL')
                          : 'Nooit'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Over Cycle Advisor</h4>
              <p className="text-sm text-blue-800 mt-1">
                De Cycle Advisor module helpt gebruikers DCA-strategieën op basis van Bitcoin-cycli. 
                Admin kan per gebruiker bepalen welke mode actief is.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Modes Uitleg</h4>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-gray-900">Conservative 🔵</p>
                  <p className="text-sm text-gray-600">
                    Alleen kopen als -20% onder vorige ATH. Zeer voorzichtig, laag risico.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium text-gray-900">Balanced 🟢</p>
                  <p className="text-sm text-gray-600">
                    Kopen als onder vorige ATH. Best voor meeste gebruikers, medium risico.
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="font-medium text-gray-900">Aggressive 🟠</p>
                  <p className="text-sm text-gray-600">
                    Kopen ook net boven vorige ATH. Momentum-trading, hoger risico.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Data Beschikbaarheid</h4>
              <p className="text-sm text-gray-600 mb-3">
                Cycle Advisor gebruikt historische Bitcoin-cycli en ATH-data voor aanbevelingen.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Cycle 1: $1,150 ATH (2013)</li>
                <li>✅ Cycle 2: $19,700 ATH (2017)</li>
                <li>✅ Cycle 3: $69,000 ATH (2021)</li>
                <li>⏳ Cycle 4: ATH nog niet bereikt (current)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

