import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Users, 
  FileText, 
  ChevronRight,
  Plus,
  Edit3,
  Eye,
  Wallet,
  Mail, // Added for email management
  Send, // Added for bulk email
  Globe,
  Lock,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Calendar,
  Clock,
  AlertCircle,
  ExternalLink,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AccountBeheer from './AccountBeheer';
import AdminChat from './AdminChat';
import AdminSettings from './AdminSettings';
import AdminAppointmentManagement from './AdminAppointmentManagement';
import ReferralLinksBeheer from './ReferralLinksBeheer';
import SEOAnalytics from './SEOAnalytics';
import EmailManagementTab from './EmailManagementTab';
import NotificationManagement from './NotificationManagement';
import AdminCycleAdvisor from './AdminCycleAdvisor';
import ProfilePopup from './ProfilePopup';
import { useProfilePopup } from '../contexts/ProfilePopupContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import AdminSidebar from './AdminSidebar';
// import PageManagement from './PageManagement';

export default function AdminDashboard() {
  const { user } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser } = usePermissions();
  const { isOpen: isProfilePopupOpen, closeProfilePopup } = useProfilePopup();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSoonOnlineMode, setIsSoonOnlineMode] = useState(true);
  const [userProfile, setUserProfile] = useState<any>({
    id: user?.id || '',
    email: user?.email || '',
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin',
    first_name: user?.user_metadata?.first_name || '',
    last_name: user?.user_metadata?.last_name || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    company: user?.user_metadata?.company || '',
    bio: user?.user_metadata?.bio || 'Administrator van BitBeheer'
  });
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    newChats: 0,
    pendingAppointments: 0,
    upcomingAppointment: null as any,
    newAccounts: 0,
    newNotifications: 0
  });

  useEffect(() => {
    // Check current soon online mode status
    const soonOnlineMode = localStorage.getItem('soon_online_mode');
    setIsSoonOnlineMode(soonOnlineMode !== 'false');

    // Load users for recent activity
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          // Fallback to localStorage
          const storedUsers = localStorage.getItem('bitbeheer_emails');
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to localStorage
        const storedUsers = localStorage.getItem('bitbeheer_emails');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
      }
    };

    loadUsers();
    loadMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    
    // Listen for refresh events from chat component
    const handleRefresh = () => {
      loadMetrics();
    };
    window.addEventListener('refreshMetrics', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshMetrics', handleRefresh);
    };
  }, []);

  const loadMetrics = async () => {
    try {
      // Load all chat messages from users (non-admin)
      const { data: chatMessages, error: chatError } = await supabase
        .from('support_messages')
        .select('email, created_at')
        .eq('from_admin', false);

      if (chatError) {
        console.error('Error loading chat messages:', chatError);
      }

      // Get unique emails that sent messages
      const uniqueChatEmails = chatMessages 
        ? [...new Set(chatMessages.map(m => m.email))]
        : [];

      // Load read status for all chats
      const { data: readStatuses } = await supabase
        .from('chat_read_status')
        .select('user_email, last_read_at')
        .eq('admin_email', 'admin@bitbeheer.nl');

      // Find unread chats (chats with messages newer than last_read_at or no read status)
      const unreadChats = uniqueChatEmails.filter(userEmail => {
        const readStatus = readStatuses?.find(r => r.user_email === userEmail);
        if (!readStatus) {
          // No read status = unread
          return true;
        }
        
        // Check if there are messages newer than last_read_at
        const userMessages = chatMessages?.filter(m => m.email === userEmail) || [];
        const hasNewMessages = userMessages.some(msg => {
          const msgTime = new Date(msg.created_at).getTime();
          const readTime = new Date(readStatus.last_read_at).getTime();
          return msgTime > readTime;
        });
        
        return hasNewMessages;
      });

      // Load pending appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'pending')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      // Find upcoming appointment (next confirmed appointment in the future)
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('*')
        .in('status', ['confirmed', 'pending'])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      const now = new Date();
      // Find the next appointment in the future (any confirmed or pending appointment)
      const upcomingAppt = allAppointments?.find(apt => {
        try {
          // Combine date and time to create full datetime
          const aptDateStr = apt.date;
          const aptTimeStr = apt.start_time || '00:00:00';
          
          // Create date object from date and time strings
          const aptDateTime = new Date(`${aptDateStr}T${aptTimeStr}`);
          
          // Check if date is valid
          if (isNaN(aptDateTime.getTime())) {
            return false;
          }
          
          // Check if appointment is in the future
          return aptDateTime > now;
        } catch (error) {
          console.error('Error parsing appointment date:', error, apt);
          return false;
        }
      }) || null;

      // Load all accounts (to count accounts in specific sections)
      const { data: allAccounts } = await supabase
        .from('accounts')
        .select('email, email_verified, first_appointment_completed, account_approved, is_admin, is_test, created_at')
        .neq('email', 'admin@bitbeheer.nl');
      
      // Also get data from users table for first_appointment_completed and account_approved
      const { data: allUsers } = await supabase
        .from('users')
        .select('email, first_appointment_completed, account_approved')
        .neq('email', 'admin@bitbeheer.nl');
      
      // Create a map for quick lookup
      const usersMap = new Map<string, { first_appointment_completed?: boolean; account_approved?: boolean }>();
      allUsers?.forEach((user: any) => {
        usersMap.set(user.email, {
          first_appointment_completed: user.first_appointment_completed || false,
          account_approved: user.account_approved || false
        });
      });
      
      // Count accounts that need attention:
      // 1. Wachtend op Verificatie: email_verified = false AND not expired (created within 5 days)
      // 2. Geverifieerd - Wachtend op 20min Gesprek: email_verified = true AND first_appointment_completed = false AND account_approved = false
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      const accountsNeedingAttention = allAccounts?.filter((account: any) => {
        // Skip admin and test accounts
        if (account.is_admin || account.is_test) return false;
        
        const userData = usersMap.get(account.email);
        const firstAppointmentCompleted = userData?.first_appointment_completed ?? account.first_appointment_completed ?? false;
        const accountApproved = userData?.account_approved ?? account.account_approved ?? false;
        
        // Section 1: Wachtend op Verificatie
        if (!account.email_verified) {
          const createdDate = new Date(account.created_at);
          const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreation <= 5) {
            return true; // Account is waiting for verification and not expired
          }
        }
        
        // Section 2: Geverifieerd - Wachtend op 20min Gesprek
        if (account.email_verified && 
            !firstAppointmentCompleted && 
            !accountApproved) {
          return true;
        }
        
        return false;
      }) || [];

      // Count notifications that still need to be sent (email_sent = false or null)
      // This should match exactly what "Nog Te Verzenden" shows in NotificatieBeheer
      const { data: allNotificationUsers } = await supabase
        .from('users')
        .select('id, email_sent, category')
        .order('created_at', { ascending: false });

      // Count only users where email has NOT been sent yet
      // Use same logic as NotificatieBeheer: !user.emailSent (emailSent = false, null, or undefined)
      const newNotificationsCount = allNotificationUsers?.filter(user => {
        // Only count if email_sent is explicitly false, null, or undefined (not true)
        // This matches the logic in NotificatieBeheer: filteredUsers.filter(user => !user.emailSent)
        return user.email_sent !== true;
      }).length || 0;

      setMetrics({
        newChats: unreadChats.length,
        pendingAppointments: appointments?.length || 0,
        upcomingAppointment: upcomingAppt,
        newAccounts: accountsNeedingAttention.length,
        newNotifications: newNotificationsCount
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const toggleSoonOnlineMode = () => {
    const newMode = !isSoonOnlineMode;
    setIsSoonOnlineMode(newMode);
    localStorage.setItem('soon_online_mode', String(newMode));
    
    if (!newMode) {
      // Site is now live
      alert('Website is nu live! Alle bezoekers kunnen de site zien.');
    } else {
      // Site is back to "soon online" mode
      alert('Website is terug in "Soon Online" modus. Alleen admin en test gebruikers kunnen de site zien.');
    }
  };

  const adminPages = [
    {
      id: 'bitcoin-history',
      title: 'Bitcoin Geschiedenis',
      description: 'Bitcoin prijsdata, DCA simulator en market cycli',
      icon: TrendingUp,
      path: '/admin/bitcoin-history',
      color: 'bg-orange-500'
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      description: 'Koppel je Bitcoin wallets en bekijk je inkoop geschiedenis',
      icon: Wallet,
      path: '/admin/portfolio',
      color: 'bg-blue-500'
    },
    {
      id: 'market-cap-comparer',
      title: 'Market Cap Vergelijker',
      description: 'Vergelijk cryptocurrencies op basis van marktkapitalisatie',
      icon: BarChart3,
      path: '/admin/market-cap-comparer',
      color: 'bg-green-500'
    }
  ];

  const adminControls = [
    {
      id: 'aanmeldingen',
      title: 'Aanmeldingen Beheren',
      description: 'Bekijk en beheer nieuwe aanmeldingen',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 'content',
      title: 'Content Beheren',
      description: 'Pas website content en teksten aan',
      icon: FileText,
      color: 'bg-orange-500'
    },
    {
      id: 'page-visibility',
      title: 'Pagina Zichtbaarheid',
      description: 'Beheer welke pagina\'s zichtbaar zijn',
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      id: 'settings',
      title: 'Instellingen',
      description: 'Algemene instellingen en configuratie',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex pb-20 md:pb-0">
      {/* SEO H1 Tag */}
      <h1 className="sr-only">BitBeheer Admin Dashboard - Beheer Bitcoin Begeleiding Platform</h1>
      
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
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

                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-2 border-orange-200">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="bg-orange-100 p-2 md:p-3 rounded-xl flex-shrink-0">
                                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{metrics.newChats}</h3>
                                  <p className="text-xs md:text-sm text-gray-600 truncate">Nieuwe Chats</p>
                                </div>
                              </div>
                              {metrics.newChats > 0 && (
                                <button
                                  onClick={() => setActiveTab('chat')}
                                  className="mt-4 w-full text-sm text-orange-600 hover:text-orange-700 font-medium"
                                >
                                  Bekijk chats →
                                </button>
                              )}
                            </div>

                            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-2 border-orange-200">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="bg-orange-100 p-2 md:p-3 rounded-xl flex-shrink-0">
                                  <Calendar className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{metrics.pendingAppointments}</h3>
                                  <p className="text-xs md:text-sm text-gray-600 truncate">Afspraken in Afwachting</p>
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

                            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-2 border-green-200">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="bg-green-100 p-2 md:p-3 rounded-xl flex-shrink-0">
                                  <Users className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{metrics.newAccounts}</h3>
                                  <p className="text-xs md:text-sm text-gray-600 truncate">Accounts die aandacht nodig hebben</p>
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

                            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border-2 border-blue-200">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="bg-blue-100 p-2 md:p-3 rounded-xl flex-shrink-0">
                                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base md:text-lg font-bold text-gray-900">
                                    {metrics.upcomingAppointment ? (
                                      (() => {
                                        try {
                                          const aptDate = new Date(`${metrics.upcomingAppointment.date}T${metrics.upcomingAppointment.start_time || '00:00:00'}`);
                                          const hoursUntil = (aptDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
                                          if (hoursUntil <= 48) {
                                            return 'Binnenkort';
                                          } else {
                                            return 'Volgende afspraak';
                                          }
                                        } catch (e) {
                                          return 'Volgende afspraak';
                                        }
                                      })()
                                    ) : 'Geen'}
                                  </h3>
                                  <p className="text-xs md:text-sm text-gray-600 truncate">
                                    {metrics.upcomingAppointment 
                                      ? (() => {
                                          try {
                                            const aptDate = new Date(metrics.upcomingAppointment.date);
                                            if (isNaN(aptDate.getTime())) {
                                              return 'Volgende afspraak';
                                            }
                                            return `${aptDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} ${metrics.upcomingAppointment.start_time || ''}`;
                                          } catch (e) {
                                            return 'Volgende afspraak';
                                          }
                                        })()
                                      : 'Volgende afspraak'
                                    }
                                  </p>
                                </div>
                              </div>
                              {metrics.upcomingAppointment && (
                                <div className="mt-4 space-y-2">
                                  <p className="text-sm text-gray-700">
                                    <strong>Met:</strong> {metrics.upcomingAppointment.user_name || metrics.upcomingAppointment.user_email}
                                  </p>
                                  <Link
                                    to={`/admin?tab=accounts&email=${encodeURIComponent(metrics.upcomingAppointment.user_email)}`}
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    Bekijk account <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Upcoming Appointment Detail Card */}
                          {metrics.upcomingAppointment && (
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 md:p-6 shadow-lg">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 md:gap-4 min-w-0 flex-1">
                                  <div className="bg-orange-500 p-2 md:p-3 rounded-xl flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-base md:text-xl font-bold text-orange-900 mb-2 break-words">
                                      Binnenkort: Afspraak met {metrics.upcomingAppointment.user_name || metrics.upcomingAppointment.user_email}
                                    </h3>
                                    <div className="space-y-1 text-orange-800 text-sm md:text-base">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                        <span className="break-words">
                                          {new Date(metrics.upcomingAppointment.date).toLocaleDateString('nl-NL', { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long', 
                                            year: 'numeric' 
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                        <span className="break-words">
                                          {metrics.upcomingAppointment.start_time} - {metrics.upcomingAppointment.end_time}
                                        </span>
                                      </div>
                                      {(() => {
                                        const aptDateTime = new Date(`${metrics.upcomingAppointment.date}T${metrics.upcomingAppointment.start_time}`);
                                        const hoursUntil = (aptDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
                                        return (
                                          <div className="flex items-center gap-2 mt-2">
                                            <span className="text-lg font-bold">
                                              Over {Math.round(hoursUntil * 10) / 10} uur
                                            </span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                  <Link
                                    to={`/admin?tab=accounts&email=${encodeURIComponent(metrics.upcomingAppointment.user_email)}`}
                                    className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
                                  >
                                    <User className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Bekijk Account</span>
                                    <span className="sm:hidden">Account</span>
                                  </Link>
                                  <button
                                    onClick={() => setActiveTab('appointments')}
                                    className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white text-orange-600 border-2 border-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
                                  >
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Alle Afspraken</span>
                                    <span className="sm:hidden">Afspraken</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

              {/* Email Management Section */}
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className="bg-purple-100 p-2 md:p-3 rounded-xl flex-shrink-0">
                      <Mail className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">E-mail Beheer</h3>
                      <p className="text-xs md:text-sm text-gray-600 break-words">Beheer notificatie e-mails en verstuur bulk berichten</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('email-management')}
                    className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0"
                  >
                    <Mail className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">E-mail Beheer</span>
                    <span className="sm:hidden">Beheer</span>
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Notificatie E-mails</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-3 break-words">Beheer alle e-mail adressen die notificaties willen ontvangen</p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                      <Users className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">0 e-mails opgeslagen</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Bulk E-mail</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-3 break-words">Verstuur berichten naar alle of geselecteerde e-mails</p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                      <Send className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">Klaar voor bulk verzending</span>
                    </div>
                  </div>
                </div>
              </div>

                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Recente Activiteit</h3>
                      <div className="space-y-2 md:space-y-3">
                        {users.length > 0 ? (
                          users.slice(0, 5).map((user, index) => (
                            <div key={user.id || index} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg gap-2 overflow-hidden">
                              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Users className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 text-xs md:text-sm truncate">{user.name || 'Niet opgegeven'}</p>
                                  <p className="text-xs md:text-sm text-gray-600 truncate">{user.email}</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-xs md:text-sm text-gray-500 whitespace-nowrap">{user.date || 'Onbekend'}</p>
                                <span className="inline-block px-1.5 md:px-2 py-0.5 md:py-1 text-xs bg-orange-100 text-orange-800 rounded-full whitespace-nowrap">
                                  {user.category || 'Niet opgegeven'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BarChart3 className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm md:text-base">Nog geen activiteit geregistreerd</p>
                            <p className="text-xs md:text-sm">Activiteit wordt hier getoond zodra er data is</p>
                          </div>
                        )}
                      </div>
                    </div>
            </div>
          )}

          {/* Pages Tab */}

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

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <AdminChat />
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <AdminAppointmentManagement />
            </div>
          )}

          {/* Referral Links Tab */}
          {activeTab === 'referral-links' && (
            <div className="space-y-6">
              <ReferralLinksBeheer />
            </div>
          )}

          {/* Notification Management Tab */}
          {activeTab === 'notification-management' && (
            <div className="space-y-6">
              <NotificationManagement />
            </div>
          )}

          {/* SEO & Analytics Tab */}
          {activeTab === 'seo-analytics' && (
            <div className="space-y-6">
              <SEOAnalytics />
            </div>
          )}

          {/* Cycle Advisor Tab */}
          {activeTab === 'cycle-advisor' && (
            <div className="space-y-6">
              <AdminCycleAdvisor />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <AdminSettings />
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Beheer Opties & Pagina's</h3>
                <button className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base whitespace-nowrap">
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Nieuwe Pagina</span>
                  <span className="sm:hidden">Nieuw</span>
                </button>
              </div>

              {/* Beschikbare Pagina's */}
              <div>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Beschikbare Pagina's</h4>
                <div className="grid md:grid-cols-2 gap-3 md:gap-6 mb-8">
                  {adminPages.map((page) => (
                    <Link
                      key={page.id}
                      to={page.path}
                      className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className={`${page.color} p-2 md:p-3 rounded-xl flex-shrink-0`}>
                          <page.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors break-words">
                            {page.title}
                          </h4>
                          <p className="text-sm md:text-base text-gray-600 mb-4 break-words">{page.description}</p>
                          <div className="flex items-center gap-2 text-orange-600 font-medium text-sm md:text-base">
                            <span>Openen</span>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Beheer Opties */}
              <div>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Beheer Opties</h4>
                <div className="grid md:grid-cols-2 gap-3 md:gap-6">
                  {adminControls.filter(control => control.id !== 'page-visibility').map((control) => (
                    <div
                      key={control.id}
                      className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => {
                        if (control.id === 'aanmeldingen') {
                          setActiveTab('accounts');
                        } else if (control.id === 'settings') {
                          setActiveTab('settings');
                        } else if (control.id === 'content') {
                          // Could link to content management if exists
                          console.log('Content beheer - nog te implementeren');
                        }
                      }}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className={`${control.color} p-2 md:p-3 rounded-xl flex-shrink-0`}>
                          <control.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors break-words">
                            {control.title}
                          </h4>
                          <p className="text-sm md:text-base text-gray-600 mb-4 break-words">{control.description}</p>
                          <div className="flex items-center gap-2 text-orange-600 font-medium text-sm md:text-base">
                            <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Beheren</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Popup */}
      <ProfilePopup
        isOpen={isProfilePopupOpen}
        onClose={closeProfilePopup}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        user={user}
        isImpersonating={isImpersonating}
        impersonatedUser={impersonatedUser}
      />
    </div>
  );
}
