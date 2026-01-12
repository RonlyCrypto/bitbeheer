import { useState, useEffect } from 'react';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Plus
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import AppointmentBookingPopup from './AppointmentBookingPopup';
import PortfolioPage from '../pages/PortfolioPage';
import UserSidebar from './UserSidebar';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  company?: string;
  bio?: string;
  joinDate: string;
  lastLogin: string;
}

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'review' | 'strategy' | 'follow-up';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export default function UserDashboardSimple() {
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false);
  const [accountApproved, setAccountApproved] = useState(false);
  const [firstAppointmentCompleted, setFirstAppointmentCompleted] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [hasApprovedOneOnOne, setHasApprovedOneOnOne] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        // Load account status
        const { data: accountData } = await supabase
          .from('accounts')
          .select('account_approved, first_appointment_completed, email_verified')
          .eq('email', user.email)
          .maybeSingle();

        if (accountData) {
          setAccountApproved(accountData.account_approved || false);
          setFirstAppointmentCompleted(accountData.first_appointment_completed || false);
          setEmailVerified(accountData.email_verified || false);
        }

        // Check for approved one-on-one
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('one_on_one_approved')
          .eq('user_email', user.email)
          .eq('one_on_one_approved', true)
          .limit(1);

        setHasApprovedOneOnOne((appointmentsData?.length || 0) > 0);

        // Load user profile
        const response = await fetch('/api/accounts');
        if (response.ok) {
          const accountsData = await response.json();
          const accounts = Array.isArray(accountsData) ? accountsData : (accountsData?.accounts || []);
          const userAccount = accounts.find((account: any) => account.email === user.email);
          
          if (userAccount) {
            setUserProfile({
              id: userAccount.id || user.id,
              email: userAccount.email || user.email || '',
              name: userAccount.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Gebruiker',
              first_name: userAccount.first_name,
              last_name: userAccount.last_name,
              phone: userAccount.phone,
              location: userAccount.location,
              company: userAccount.company,
              bio: user.user_metadata?.bio || '',
              joinDate: userAccount.created_at ? new Date(userAccount.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              lastLogin: new Date().toISOString()
            });
          }
        }

        // Load appointments
        const { data: appointmentsData2 } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_email', user.email)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });

        if (appointmentsData2) {
          setAppointments(appointmentsData2.map((apt: any) => ({
            id: apt.id,
            title: apt.title || 'Afspraak',
            date: apt.date,
            time: apt.start_time || '',
            duration: apt.duration || 30,
            type: apt.type || 'consultation',
            status: apt.status || 'scheduled',
            notes: apt.notes
          })));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.date}T${apt.time}`);
    return aptDate >= new Date() && apt.status !== 'cancelled';
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* User Sidebar */}
      <UserSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accountApproved={accountApproved}
        hasApprovedOneOnOne={hasApprovedOneOnOne}
        unreadChatCount={0}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white">
                  <h1 className="text-3xl font-bold mb-2">
                    Welkom, {userProfile?.name || user?.email?.split('@')[0] || 'Gebruiker'}!
                  </h1>
                  <p className="text-orange-100">
                    {accountApproved || hasApprovedOneOnOne 
                      ? 'Je account is actief. Je kunt nu alle functies gebruiken.'
                      : 'Maak je eerste afspraak om toegang te krijgen tot alle functies.'
                    }
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 p-3 rounded-xl">
                        <Calendar className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</h3>
                        <p className="text-gray-600">Aankomende afspraken</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {accountApproved || hasApprovedOneOnOne ? 'Actief' : 'In afwachting'}
                        </h3>
                        <p className="text-gray-600">Account status</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {emailVerified ? '✓' : '—'}
                        </h3>
                        <p className="text-gray-600">Email geverifieerd</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle acties</h2>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setShowAppointmentPopup(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Nieuwe afspraak
                    </button>
                    {(accountApproved || hasApprovedOneOnOne) && (
                      <button
                        onClick={() => setActiveTab('portfolio')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PieChart className="w-5 h-5" />
                        Portfolio bekijken
                      </button>
                    )}
                  </div>
                </div>

                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Aankomende afspraken</h2>
                    <div className="space-y-4">
                      {upcomingAppointments.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{apt.title}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(`${apt.date}T${apt.time}`).toLocaleString('nl-NL', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              apt.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {apt.status === 'confirmed' ? 'Bevestigd' : 'In afwachting'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (accountApproved || hasApprovedOneOnOne) && (
              <PortfolioPage />
            )}

            {/* Appointments tab - tijdelijk verborgen */}
            {/* {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Mijn afspraken</h2>
                  <button
                    onClick={() => setShowAppointmentPopup(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Nieuwe afspraak
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Je hebt nog geen afspraken</p>
                      <button
                        onClick={() => setShowAppointmentPopup(true)}
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Maak je eerste afspraak
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((apt) => (
                        <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{apt.title}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(`${apt.date}T${apt.time}`).toLocaleString('nl-NL', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {apt.notes && (
                                <p className="text-sm text-gray-500 mt-2">{apt.notes}</p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              apt.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : apt.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {apt.status === 'completed' ? 'Voltooid' : 
                               apt.status === 'cancelled' ? 'Geannuleerd' : 
                               'Gepland'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Appointment Booking Popup */}
      <AppointmentBookingPopup
        isOpen={showAppointmentPopup}
        onClose={() => setShowAppointmentPopup(false)}
        onSuccess={() => {
          setShowAppointmentPopup(false);
          window.dispatchEvent(new Event('refreshAppointments'));
          setActiveTab('overview'); // Terug naar overview in plaats van appointments
        }}
        accountApproved={accountApproved}
        firstAppointmentCompleted={firstAppointmentCompleted}
      />
    </div>
  );
}

