import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Mail,
  Clock,
  MessageSquare,
  Globe,
  Lock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AccountBeheer from './AccountBeheer';
import AdminAppointmentManagement from './AdminAppointmentManagement';
import EmailManagementTab from './EmailManagementTab';
import AdminSidebar from './AdminSidebar';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export default function AdminDashboardSimple() {
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSoonOnlineMode, setIsSoonOnlineMode] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    newChats: 0,
    pendingAppointments: 0,
    upcomingAppointment: null as any,
    newAccounts: 0
  });

  useEffect(() => {
    const soonOnlineMode = localStorage.getItem('soon_online_mode');
    setIsSoonOnlineMode(soonOnlineMode !== 'false');

    loadUsers();
    loadMetrics();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const storedUsers = localStorage.getItem('bitbeheer_emails');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      const storedUsers = localStorage.getItem('bitbeheer_emails');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    }
  };

  const loadMetrics = async () => {
    try {
      // Load pending appointments
      const { data: appointments, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'pending')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (!aptError && appointments) {
        setMetrics(prev => ({
          ...prev,
          pendingAppointments: appointments.length,
          upcomingAppointment: appointments.length > 0 ? appointments[0] : null
        }));
      }

      // Load accounts needing attention
      const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .eq('account_approved', false)
        .order('created_at', { ascending: false });

      if (!accError && accounts) {
        setMetrics(prev => ({
          ...prev,
          newAccounts: accounts.length
        }));
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const toggleSoonOnlineMode = () => {
    const newMode = !isSoonOnlineMode;
    setIsSoonOnlineMode(newMode);
    localStorage.setItem('soon_online_mode', newMode.toString());
    
    if (newMode) {
      alert('Website is nu in "Soon Online" modus. Alleen admin en test gebruikers kunnen de site zien.');
    } else {
      alert('Website is nu live! Alle bezoekers kunnen de site zien.');
    }
  };

  // Simplified sidebar items for simple version
  const simpleMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Afspraken', icon: Calendar },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'email-management', label: 'E-mail Beheer', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex pb-20 md:pb-0">
      <h1 className="sr-only">BitBeheer Admin Dashboard - Beheer Bitcoin Begeleiding Platform</h1>
      
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadChatCount={0}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Site Status Toggle */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isSoonOnlineMode ? 'bg-orange-100' : 'bg-green-100'}`}>
                      {isSoonOnlineMode ? <Lock className="w-8 h-8 text-orange-600" /> : <Globe className="w-8 h-8 text-green-600" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {isSoonOnlineMode ? 'Website in "Soon Online" Modus' : 'Website Live'}
                      </h3>
                      <p className="text-gray-600">
                        {isSoonOnlineMode 
                          ? 'Alleen admin en test gebruikers kunnen de site zien' 
                          : 'Alle bezoekers kunnen de site zien'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSoonOnlineMode}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isSoonOnlineMode
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSoonOnlineMode ? (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        Site Live Maken
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        Terug naar Soon Online
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <Calendar className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{metrics.pendingAppointments}</h3>
                      <p className="text-gray-600">Afspraken in Afwachting</p>
                    </div>
                  </div>
                  {metrics.pendingAppointments > 0 && (
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="mt-4 w-full text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Bekijk afspraken →
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{metrics.newAccounts}</h3>
                      <p className="text-gray-600">Accounts die aandacht nodig hebben</p>
                    </div>
                  </div>
                  {metrics.newAccounts > 0 && (
                    <button
                      onClick={() => setActiveTab('accounts')}
                      className="mt-4 w-full text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Bekijk accounts →
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {metrics.upcomingAppointment ? 'Binnenkort' : 'Geen'}
                      </h3>
                      <p className="text-gray-600">
                        {metrics.upcomingAppointment 
                          ? new Date(metrics.upcomingAppointment.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
                          : 'Volgende afspraak'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointment Detail */}
              {metrics.upcomingAppointment && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-orange-500 p-3 rounded-xl">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-900 mb-2">
                          Binnenkort: Afspraak met {metrics.upcomingAppointment.user_name || metrics.upcomingAppointment.user_email}
                        </h3>
                        <div className="space-y-1 text-orange-800">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(metrics.upcomingAppointment.date).toLocaleDateString('nl-NL', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {metrics.upcomingAppointment.start_time} - {metrics.upcomingAppointment.end_time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Bekijk alle afspraken
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recente Activiteit</h3>
                <div className="space-y-3">
                  {users.length > 0 ? (
                    users.slice(0, 5).map((user, index) => (
                      <div key={user.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || 'Niet opgegeven'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{user.date || 'Onbekend'}</p>
                          <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            {user.category || 'Niet opgegeven'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p>Nog geen activiteit geregistreerd</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <AccountBeheer />
            </div>
          )}

          {/* Email Management Tab */}
          {activeTab === 'email-management' && (
            <div className="space-y-6">
              <EmailManagementTab />
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <AdminAppointmentManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

