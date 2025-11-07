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
  Bell, // Added for notifications
  MessageSquare,
  Calendar,
  Clock,
  AlertCircle,
  ExternalLink,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import NotificatieBeheer from './NotificatieBeheer';
import AccountBeheer from './AccountBeheer';
import AdminChat from './AdminChat';
import CategorieBeheer from './CategorieBeheer';
import EmailVerificationStatus from './EmailVerificationStatus';
import AdminProfile from './AdminProfile';
import AdminSettings from './AdminSettings';
import AdminAppointmentManagement from './AdminAppointmentManagement';
import EmailTemplates from './EmailTemplates';
import ReferralLinksBeheer from './ReferralLinksBeheer';
import SEOAnalytics from './SEOAnalytics';
// import PageManagement from './PageManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSoonOnlineMode, setIsSoonOnlineMode] = useState(true);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-6 md:py-12 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Beheer je Bitcoin begeleiding platform
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto md:overflow-visible scrollbar-hide md:scrollbar-default">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'overview'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'chat'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Chat
                  {metrics.newChats > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center animate-pulse text-[10px] md:text-xs">
                      {metrics.newChats > 9 ? '9+' : metrics.newChats}
                    </span>
                  ) : null}
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'appointments'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Afspraken
                  {metrics.pendingAppointments > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-[10px] md:text-xs">
                      {metrics.pendingAppointments > 9 ? '9+' : metrics.pendingAppointments}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'notifications'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Notificaties
                  {metrics.newNotifications > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center animate-pulse text-[10px] md:text-xs">
                      {metrics.newNotifications > 9 ? '9+' : metrics.newNotifications}
                    </span>
                  ) : null}
                </button>
                <button
                  onClick={() => setActiveTab('accounts')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm relative whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'accounts'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Accounts
                  {metrics.newAccounts > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center animate-pulse text-[10px] md:text-xs">
                      {metrics.newAccounts > 9 ? '9+' : metrics.newAccounts}
                    </span>
                  ) : null}
                </button>
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'pages'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pagina's
                </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
            activeTab === 'categories'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Categorieën
        </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'profile'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profiel
                </button>
                <button
                  onClick={() => setActiveTab('email-templates')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'email-templates'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Email Templates
                </button>
                <button
                  onClick={() => setActiveTab('referral-links')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'referral-links'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Referral Links
                </button>
                <button
                  onClick={() => setActiveTab('seo-analytics')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'seo-analytics'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  SEO & Analytics
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'settings'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Instellingen
                </button>
                <button
                  onClick={() => setActiveTab('controls')}
                  className={`py-2 px-1 md:px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'controls'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Beheer
                </button>
              </nav>
            </div>
          </div>

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

                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
                              <div className="flex items-center gap-4">
                                <div className="bg-orange-100 p-3 rounded-xl">
                                  <MessageSquare className="w-8 h-8 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-2xl font-bold text-gray-900">{metrics.newChats}</h3>
                                  <p className="text-gray-600">Nieuwe Chats</p>
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

                            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
                              <div className="flex items-center gap-4">
                                <div className="bg-orange-100 p-3 rounded-xl">
                                  <Calendar className="w-8 h-8 text-orange-600" />
                                </div>
                                <div className="flex-1">
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
                                <div className="flex-1">
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
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-900">
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
                                  <p className="text-gray-600">
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
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="bg-orange-500 p-3 rounded-xl">
                                    <AlertCircle className="w-8 h-8 text-white" />
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
                                <div className="flex flex-col gap-2">
                                  <Link
                                    to={`/admin?tab=accounts&email=${encodeURIComponent(metrics.upcomingAppointment.user_email)}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                                  >
                                    <User className="w-4 h-4" />
                                    Bekijk Account
                                  </Link>
                                  <button
                                    onClick={() => setActiveTab('appointments')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 border-2 border-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Alle Afspraken
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

              {/* Email Management Section */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Mail className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">E-mail Beheer</h3>
                      <p className="text-gray-600">Beheer notificatie e-mails en verstuur bulk berichten</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/emails"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    E-mail Beheer
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Notificatie E-mails</h4>
                    <p className="text-sm text-gray-600 mb-3">Beheer alle e-mail adressen die notificaties willen ontvangen</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>0 e-mails opgeslagen</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Bulk E-mail</h4>
                    <p className="text-sm text-gray-600 mb-3">Verstuur berichten naar alle of geselecteerde e-mails</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Send className="w-4 h-4" />
                      <span>Klaar voor bulk verzending</span>
                    </div>
                  </div>
                </div>
              </div>

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
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BarChart3 className="w-6 h-6 text-gray-400" />
                            </div>
                            <p>Nog geen activiteit geregistreerd</p>
                            <p className="text-sm">Activiteit wordt hier getoond zodra er data is</p>
                          </div>
                        )}
                      </div>
                    </div>
            </div>
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Beschikbare Pagina's</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Nieuwe Pagina
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {adminPages.map((page) => (
                  <Link
                    key={page.id}
                    to={page.path}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${page.color} p-3 rounded-xl`}>
                        <page.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {page.title}
                        </h4>
                        <p className="text-gray-600 mb-4">{page.description}</p>
                        <div className="flex items-center gap-2 text-orange-600 font-medium">
                          <span>Openen</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <NotificatieBeheer />
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <AccountBeheer />
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

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <CategorieBeheer />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <AdminProfile />
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'email-templates' && (
            <div className="space-y-6">
              <EmailTemplates />
            </div>
          )}

          {/* Referral Links Tab */}
          {activeTab === 'referral-links' && (
            <div className="space-y-6">
              <ReferralLinksBeheer />
            </div>
          )}

          {/* SEO & Analytics Tab */}
          {activeTab === 'seo-analytics' && (
            <div className="space-y-6">
              <SEOAnalytics />
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
              <h3 className="text-2xl font-bold text-gray-900">Beheer Opties</h3>

              {/* Page Visibility Management - Temporarily disabled */}
              {/* <PageManagement /> */}

              <div className="grid md:grid-cols-2 gap-6">
                {adminControls.filter(control => control.id !== 'page-visibility').map((control) => (
                  <div
                    key={control.id}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${control.color} p-3 rounded-xl`}>
                        <control.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {control.title}
                        </h4>
                        <p className="text-gray-600 mb-4">{control.description}</p>
                        <div className="flex items-center gap-2 text-orange-600 font-medium">
                          <Edit3 className="w-4 h-4" />
                          <span>Beheren</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
