import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Settings, 
  Bell, 
  BarChart3, 
  PieChart,
  Clock,
  CheckCircle,
  Mail,
  Activity,
  ExternalLink,
  Calculator,
  Wallet,
  Shield,
  ArrowLeft,
  Plus,
  X,
  Video,
  BookOpen,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { bitcoinPriceService, BitcoinPrice } from '../services/bitcoinPriceService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useProfilePopup } from '../contexts/ProfilePopupContext';
import AppointmentQuestionsForm from './AppointmentQuestionsForm';
import { getDisplayName, getDisplayEmail } from '../utils/emailUtils';
import { supabase } from '../lib/supabase';
import ProfilePopup from './ProfilePopup';
import AppointmentBookingPopup from './AppointmentBookingPopup';
import Helpdesk from './Helpdesk';
import AgendaView from './AgendaView';
import PortfolioPage from '../pages/PortfolioPage';
import { bitcoinApiService, BitcoinTransaction } from '../services/bitcoinApiService';
import PortfolioChart from './PortfolioChart';
import SignupProcessFlow from './SignupProcessFlow';
import ReferralBlocks from './ReferralBlocks';
import NotificationDropdown from './NotificationDropdown';

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
  avatar?: string;
  joinDate: string;
  lastLogin: string;
  totalSessions: number;
  currentGoal?: string;
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';
  experience?: 'beginner' | 'intermediate' | 'advanced';
  investmentGoal?: string;
  preferredContact?: 'email' | 'phone' | 'whatsapp';
  newsletterSubscription?: boolean;
  marketingConsent?: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  category: 'retirement' | 'house' | 'education' | 'emergency' | 'bitcoin' | 'other';
  createdAt: string;
  isBitcoinGoal?: boolean;
  targetBitcoinAmount?: number;
  monthlyInvestment?: number;
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

interface Portfolio {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  assets: Array<{
    name: string;
    symbol: string;
    amount: number;
    value: number;
    percentage: number;
  }>;
}

export default function UserDashboard() {
  const { user } = useSupabaseAuth();
  const { theme } = useTheme();
  const { isImpersonating, impersonatedUser } = usePermissions();
  const { isOpen: isProfilePopupOpen, openProfilePopup, closeProfilePopup } = useProfilePopup();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);
  const [showFirstAppointmentPrompt, setShowFirstAppointmentPrompt] = useState(false);
  const [showBitcoinCalculator, setShowBitcoinCalculator] = useState(false);
  const [bitcoinPrice, setBitcoinPrice] = useState<BitcoinPrice | null>(null);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [walletForm, setWalletForm] = useState({
    address: '',
    name: '',
    type: 'bitcoin'
  });
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [accountApproved, setAccountApproved] = useState(false);
  const [firstAppointmentCompleted, setFirstAppointmentCompleted] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [hasApprovedOneOnOne, setHasApprovedOneOnOne] = useState(false);
  const [allUserAppointments, setAllUserAppointments] = useState<any[]>([]);
  const [bitcoinGoal, setBitcoinGoal] = useState({
    targetAmount: 0,
    currentAmount: 0,
    monthlyInvestment: 0,
    targetDate: ''
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load Bitcoin price
        try {
          const price = await bitcoinPriceService.getCurrentPrice();
          setBitcoinPrice(price);
        } catch (priceError) {
          console.warn('⚠️ Could not fetch Bitcoin price:', priceError);
          // Continue anyway, price is not critical
        }

        // Load user profile from database
        if (user) {
          try {
            // Fetch user profile from accounts table
            const response = await fetch('/api/accounts');
            if (response.ok) {
              const accountsData = await response.json();
              // Ensure accounts is an array
              const accounts = Array.isArray(accountsData) ? accountsData : (accountsData?.accounts || []);
              const userAccount = accounts.find((account: any) => account.email === user.email);
              
              if (userAccount) {
                setUserProfile({
                  id: userAccount.id || user.id,
                  email: userAccount.email || user.email || '',
                  name: userAccount.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Gebruiker',
                  first_name: userAccount.first_name,
                  last_name: userAccount.last_name,
                  phone: userAccount.phone || user.user_metadata?.phone,
                  location: userAccount.location || user.user_metadata?.location,
                  company: userAccount.company,
                  bio: user.user_metadata?.bio || 'Passionate about Bitcoin and DCA strategies',
                  joinDate: userAccount.created_at ? new Date(userAccount.created_at).toISOString().split('T')[0] : (user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
                  lastLogin: userAccount.last_login ? new Date(userAccount.last_login).toISOString() : new Date().toISOString(),
                  totalSessions: userAccount.login_count || 0,
                  riskProfile: user.user_metadata?.riskProfile || 'moderate',
                  experience: userAccount.experience_level || user.user_metadata?.experience || 'intermediate',
                  investmentGoal: userAccount.investment_goal,
                  preferredContact: userAccount.preferred_contact,
                  newsletterSubscription: userAccount.newsletter_subscription,
                  marketingConsent: userAccount.marketing_consent
                });
              } else {
                // Fallback to user metadata if account not found
                setUserProfile({
                  id: user.id,
                  email: user.email || '',
                  name: user.user_metadata?.name || user.email?.split('@')[0] || 'Gebruiker',
                  phone: user.user_metadata?.phone,
                  location: user.user_metadata?.location,
                  bio: user.user_metadata?.bio || 'Passionate about Bitcoin and DCA strategies',
                  joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  lastLogin: new Date().toISOString(),
                  totalSessions: 0,
                  riskProfile: user.user_metadata?.riskProfile || 'moderate',
                  experience: user.user_metadata?.experience || 'intermediate'
                });
              }
            } else {
              // Fallback to user metadata if API fails
              setUserProfile({
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'Gebruiker',
                phone: user.user_metadata?.phone,
                location: user.user_metadata?.location,
                bio: user.user_metadata?.bio || 'Passionate about Bitcoin and DCA strategies',
                joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                lastLogin: new Date().toISOString(),
                totalSessions: 0,
                riskProfile: user.user_metadata?.riskProfile || 'moderate',
                experience: user.user_metadata?.experience || 'intermediate'
              });
            }
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Fallback to user metadata if error
            setUserProfile({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Gebruiker',
              phone: user.user_metadata?.phone,
              location: user.user_metadata?.location,
              bio: user.user_metadata?.bio || 'Passionate about Bitcoin and DCA strategies',
              joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              lastLogin: new Date().toISOString(),
              totalSessions: 0,
              riskProfile: user.user_metadata?.riskProfile || 'moderate',
              experience: user.user_metadata?.experience || 'intermediate'
            });
          }
        }

        // Load goals from database
        if (user?.email) {
          const { data: goalsData, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .eq('email', user.email)
            .order('created_at', { ascending: false });
          
          if (!goalsError && goalsData) {
            console.log('📋 Loaded goals:', goalsData);
            setGoals(goalsData);
          } else {
            console.log('⚠️ Could not load goals:', goalsError?.message);
            setGoals([]);
          }
        }

        // Load appointments/goals/portfolio from DB — TODO: implement when schema is ready
        setShowFirstAppointmentPrompt(false);

        // Wallet: detect single wallet from DB
        if (user?.email) {
          const { data: wallets, error: walletErr } = await supabase
            .from('wallets')
            .select('*')
            .eq('email', user.email)
            .limit(1);
          if (!walletErr && wallets && wallets.length > 0) {
            setHasWallet(true);
          } else {
            setHasWallet(false);
          }

          // Load account approval status - try users table first, then accounts
          try {
            // Use maybeSingle() instead of single() to handle missing records gracefully
            const { data: userData, error: userError } = await supabase
              .from('accounts')
              .select('account_approved, first_appointment_completed, email_verified')
              .eq('email', user.email)
              .maybeSingle();
            
            if (userError) {
              console.error('🔍 Error loading from users table:', userError);
            }
            
            if (userData && !userError) {
              console.log('🔍 UserDashboard - Loaded from accounts table:', {
                account_approved: userData.account_approved,
                first_appointment_completed: userData.first_appointment_completed,
                email_verified: userData.email_verified
              });
              setAccountApproved(userData.account_approved || false);
              setFirstAppointmentCompleted(userData.first_appointment_completed || false);
              setEmailVerified(userData.email_verified || false);
            } else {
              // Default to false if no data found
              console.warn('🔍 No account data found in accounts table');
              setAccountApproved(false);
              setFirstAppointmentCompleted(false);
              setEmailVerified(false);
            }
          } catch (error) {
            console.error('🔍 Exception loading account approval status:', error);
            // Silently fail - columns might not exist yet
            console.warn('Could not load account approval status. Columns may not exist. Run add-users-account-status-columns.sql');
            setAccountApproved(false);
            setFirstAppointmentCompleted(false);
            setEmailVerified(false);
          }

          // Load appointments to check for one_on_one_approved status
          // Get effective user email (considering impersonation)
          const effectiveEmail = (isImpersonating && impersonatedUser) 
            ? impersonatedUser 
            : (user.email || null);
          
          if (effectiveEmail) {
            const { data: userAppts } = await supabase
              .from('appointments')
              .select('id, status, one_on_one_approved')
              .eq('user_email', effectiveEmail);
            
            if (userAppts) {
              setAllUserAppointments(userAppts);
              // Check if any appointment has one_on_one_approved = true
              const hasApproved = userAppts.some((apt: any) => 
                (apt.status === 'pending' || apt.status === 'confirmed') && apt.one_on_one_approved === true
              );
              setHasApprovedOneOnOne(hasApproved);
              
              // If one_on_one_approved, also ensure accountApproved is true
              if (hasApproved && !accountApproved) {
                // Trigger a refresh to get latest account status
                // (accountApproved should already be set by admin button, but check as backup)
                supabase
                  .from('users')
                  .select('account_approved, first_appointment_completed')
                  .eq('email', effectiveEmail)
                  .single()
                  .then(({ data: userData }) => {
                    if (userData) {
                      setAccountApproved(userData.account_approved || false);
                      setFirstAppointmentCompleted(userData.first_appointment_completed || false);
                    }
                  });
              }
            }
          }

          // Check for unread admin messages using effectiveEmail
          const { data: adminMessages } = await supabase
            .from('support_messages')
            .select('created_at')
            .eq('email', effectiveEmail || user.email || '')
            .eq('from_admin', true)
            .order('created_at', { ascending: false });

          // Get read status (404 is normal if no record exists yet)
          const { data: readStatus, error: readStatusError } = await supabase
            .from('user_chat_read_status')
            .select('last_read_at')
            .eq('user_email', effectiveEmail || user.email || '')
            .maybeSingle(); // Use maybeSingle instead of single to avoid 404 errors

          if (adminMessages && adminMessages.length > 0) {
            const lastReadTime = readStatus?.last_read_at 
              ? new Date(readStatus.last_read_at).getTime()
              : 0;
            
            const unreadCount = adminMessages.filter(msg => {
              const msgTime = new Date(msg.created_at).getTime();
              return msgTime > lastReadTime;
            }).length;
            
            setUnreadChatCount(unreadCount);
          } else {
            setUnreadChatCount(0);
          }
        }

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
    
    // Listen for account refresh events (when admin approves account)
    const handleAccountRefresh = async () => {
      const currentUser = user;
      if (currentUser?.email) {
        try {
          // Get effective user email (considering impersonation)
          const effectiveEmail = (isImpersonating && impersonatedUser) 
            ? impersonatedUser 
            : (currentUser.email || null);
          
          if (!effectiveEmail) return;
          
          const { data: accountData, error: accountError } = await supabase
            .from('accounts')
            .select('account_approved, first_appointment_completed, email_verified')
            .eq('email', effectiveEmail)
            .maybeSingle();
          
          if (accountData && !accountError) {
            setAccountApproved(accountData.account_approved || false);
            setFirstAppointmentCompleted(accountData.first_appointment_completed || false);
            setEmailVerified(accountData.email_verified || false);
          } else if (accountError?.code === 'PGRST204' || accountError?.code === 'PGRST116') {
            // No data found, use defaults
            setAccountApproved(false);
            setFirstAppointmentCompleted(false);
            setEmailVerified(false);
          } else {
            // Try accounts table as fallback (shouldn't be needed but keeping for safety)
            const { data: fallbackData } = await supabase
              .from('accounts')
              .select('account_approved, first_appointment_completed')
              .eq('email', effectiveEmail)
              .single();
            
            if (accountData) {
              setAccountApproved(accountData.account_approved || false);
              setFirstAppointmentCompleted(accountData.first_appointment_completed || false);
            }
          }
          
          // Also refresh appointments to check one_on_one_approved status
          const { data: userAppts } = await supabase
            .from('appointments')
            .select('id, status, one_on_one_approved')
            .eq('user_email', effectiveEmail);
          
          if (userAppts) {
            setAllUserAppointments(userAppts);
            const hasApproved = userAppts.some((apt: any) => 
              (apt.status === 'pending' || apt.status === 'confirmed') && apt.one_on_one_approved === true
            );
            setHasApprovedOneOnOne(hasApproved);
            
            // If one_on_one_approved but accountApproved is false, refresh account status
            if (hasApproved && !accountApproved) {
              // This should already be set, but refresh as backup
            }
          }
        } catch (error) {
          // Silently fail
        }
      }
    };
    
    window.addEventListener('refreshAccounts', handleAccountRefresh);
    
    // Function to check and update unread chat count
    const checkUnreadMessages = async () => {
      const effectiveEmail = (isImpersonating && impersonatedUser) 
        ? impersonatedUser 
        : (user?.email || null);
      
      if (!effectiveEmail) return;
      
      try {
        const { data: adminMessages } = await supabase
          .from('support_messages')
          .select('created_at')
          .eq('email', effectiveEmail)
          .eq('from_admin', true)
          .order('created_at', { ascending: false });
        
        const { data: readStatus } = await supabase
          .from('user_chat_read_status')
          .select('last_read_at')
          .eq('user_email', effectiveEmail)
          .maybeSingle();
        
        if (adminMessages && adminMessages.length > 0) {
          const lastReadTime = readStatus?.last_read_at 
            ? new Date(readStatus.last_read_at).getTime()
            : 0;
          
          const unreadCount = adminMessages.filter(msg => {
            const msgTime = new Date(msg.created_at).getTime();
            return msgTime > lastReadTime;
          }).length;
          
          setUnreadChatCount(unreadCount);
        } else {
          setUnreadChatCount(0);
        }
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };
    
    // Poll for unread messages every 10 seconds (faster updates)
    checkUnreadMessages(); // Check immediately
    const interval = setInterval(checkUnreadMessages, 10000);
    
    // Listen for new messages event (triggered when admin sends a message)
    const handleNewMessage = () => {
      checkUnreadMessages();
    };
    window.addEventListener('newAdminMessage', handleNewMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshAccounts', handleAccountRefresh);
      window.removeEventListener('newAdminMessage', handleNewMessage);
    };
  }, [user, isImpersonating, impersonatedUser]);

  const handleAddWallet = async () => {
    if (!walletForm.address.trim()) {
      alert('Voer een geldig wallet adres in');
      return;
    }

    if (hasWallet) {
      alert('Je kunt maar één wallet toevoegen. Neem contact op met de admin voor wijzigingen.');
      return;
    }

    setIsAddingWallet(true);
    try {
      if (!user?.email) throw new Error('Geen gebruiker bekend');

      // Check again server-side for existing wallet
      const { data: existing, error: checkErr } = await supabase
        .from('wallets')
        .select('id')
        .eq('email', user.email)
        .limit(1);
      if (checkErr) throw checkErr;
      if (existing && existing.length > 0) {
        setHasWallet(true);
        alert('Er is al een wallet gekoppeld aan dit account.');
        setIsAddingWallet(false);
        return;
      }

      // Insert wallet
      const { error: insertErr } = await supabase
        .from('wallets')
        .insert([
          {
            email: user.email,
            address: walletForm.address.trim(),
            name: walletForm.name?.trim() || null,
            type: walletForm.type,
            created_at: new Date().toISOString(),
          }
        ]);
      if (insertErr) throw insertErr;

      setHasWallet(true);
      
      // Close form after success
      setTimeout(() => {
        setShowWalletForm(false);
        setWalletForm({ address: '', name: '', type: 'bitcoin' });
      }, 1000);
      
    } catch (error) {
      console.error('Error adding wallet:', error);
      alert('Fout bij het toevoegen van wallet');
    } finally {
      setIsAddingWallet(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* SEO H1 Tag */}
      <h1 className="sr-only">BitBeheer Gebruikers Dashboard - Bitcoin Portfolio en Begeleiding</h1>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mijn Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">Welkom terug, {getDisplayName(user, isImpersonating, impersonatedUser, userProfile)}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown unreadCount={unreadChatCount} />
              <button 
                onClick={() => {
                  openProfilePopup();
                }}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Open profiel instellingen"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overzicht', icon: BarChart3, alwaysEnabled: true },
                { id: 'goals', label: 'Doelen', icon: Target, alwaysEnabled: false },
                { id: 'portfolio', label: 'Portfolio', icon: PieChart, alwaysEnabled: false },
                { id: 'appointments', label: 'Afspraken', icon: Calendar, alwaysEnabled: true },
                { id: 'helpdesk', label: 'Helpdesk', icon: Mail, alwaysEnabled: false, badge: unreadChatCount > 0 ? unreadChatCount : undefined },
              ].map((tab) => {
                // Tab is enabled if always enabled OR account is approved OR one-on-one is approved
                const isEnabled = tab.alwaysEnabled || accountApproved || hasApprovedOneOnOne;
                const tooltipText = !isEnabled 
                  ? "Je moet eerst een 20-minuten afspraak maken. Na deze afspraak bepalen we of we verder met elkaar gaan en dan kan de admin je account volledig open stellen."
                  : null;
                
                return (
                  <div key={tab.id} className="relative group">
                    <button
                      onClick={() => {
                        if (isEnabled) {
                          setActiveTab(tab.id);
                        }
                      }}
                      disabled={!isEnabled}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                        !isEnabled
                          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                          : activeTab === tab.id
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="flex-1 relative">
                        {tab.label}
                        {tab.badge && tab.badge > 0 && (
                          <span className="absolute -top-1 -right-6 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {tab.badge > 9 ? '9+' : tab.badge}
                          </span>
                        )}
                      </span>
                    </button>
                    {!isEnabled && tooltipText && (
                      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-64 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {tooltipText}
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab 
              userProfile={userProfile} 
              goals={goals} 
              appointments={appointments} 
              portfolio={portfolio}
              onBookAppointment={() => setShowAppointmentPopup(true)}
              accountApproved={accountApproved}
              isImpersonating={isImpersonating}
              impersonatedUser={impersonatedUser}
              hasApprovedOneOnOne={hasApprovedOneOnOne}
              onNavigateToPortfolio={() => setActiveTab('portfolio')}
              user={user}
              emailVerified={emailVerified}
              firstAppointmentCompleted={firstAppointmentCompleted}
            />}
            {activeTab === 'goals' && (accountApproved || hasApprovedOneOnOne) && <GoalsTab goals={goals} setGoals={setGoals} />}
            {activeTab === 'portfolio' && (accountApproved || hasApprovedOneOnOne) && <PortfolioPage />}
            {activeTab === 'appointments' && <AppointmentsTab 
              appointments={appointments} 
              setAppointments={setAppointments}
              onBookAppointment={() => setShowAppointmentPopup(true)}
              isImpersonating={isImpersonating}
              impersonatedUser={impersonatedUser}
              accountApproved={accountApproved}
              firstAppointmentCompleted={firstAppointmentCompleted}
            />}
            {activeTab === 'helpdesk' && (
              <Helpdesk 
                onMessageRead={async () => {
                  // Mark messages as read when helpdesk is opened
                  if (user?.email) {
                    try {
                      const { data: existing } = await supabase
                        .from('user_chat_read_status')
                        .select('id')
                        .eq('user_email', user.email)
                        .maybeSingle(); // Use maybeSingle to avoid 404 errors

                      const readStatus = {
                        user_email: user.email,
                        last_read_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      };

                      if (existing) {
                        await supabase
                          .from('user_chat_read_status')
                          .update(readStatus)
                          .eq('id', existing.id);
                      } else {
                        await supabase
                          .from('user_chat_read_status')
                          .insert([readStatus]);
                      }
                      setUnreadChatCount(0);
                    } catch (error) {
                      console.error('Error marking messages as read:', error);
                    }
                  }
                }}
              />
            )}
          </div>
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

      {/* Appointment Booking Popup */}
      <AppointmentBookingPopup
        isOpen={showAppointmentPopup}
        onClose={() => setShowAppointmentPopup(false)}
        onSuccess={() => {
          setShowAppointmentPopup(false);
          // Refresh appointments after booking
          window.dispatchEvent(new Event('refreshAppointments'));
          setShowFirstAppointmentPrompt(false);
          setActiveTab('appointments');
          // Reload account status to check if approved
          if (user?.email) {
            supabase
              .from('accounts')
              .select('account_approved, first_appointment_completed, email_verified')
              .eq('email', user.email)
              .maybeSingle()
              .then(({ data: accountData, error: accountError }) => {
                if (accountData && !accountError) {
                  setAccountApproved(accountData.account_approved || false);
                setFirstAppointmentCompleted(accountData.first_appointment_completed || false);
                  setEmailVerified(accountData.email_verified || false);
                } else if (accountError?.code === 'PGRST204' || accountError?.code === 'PGRST116') {
                  // No data found, use defaults
                  setAccountApproved(false);
                  setFirstAppointmentCompleted(false);
                  setEmailVerified(false);
                }
              });
          }
          // Trigger refresh of appointments list
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refreshAppointments'));
          }, 500); // Small delay to ensure appointment is saved
        }}
        accountApproved={accountApproved}
        firstAppointmentCompleted={firstAppointmentCompleted}
      />
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ userProfile, goals, appointments, portfolio, onBookAppointment, accountApproved, isImpersonating, impersonatedUser, hasApprovedOneOnOne, onNavigateToPortfolio, user, emailVerified, firstAppointmentCompleted }: any) {
  // Determine goals to display based on account status
  const displayGoals = accountApproved 
    ? [
        {
          id: 'hw-wallet',
          title: 'Bestel je hardware wallet',
          description: 'Kies en bestel een geschikte hardware wallet voor veilige Bitcoin opslag',
          status: 'active',
          targetAmount: 0,
          currentAmount: 0,
          targetDate: '',
          category: 'hardware',
          createdAt: new Date().toISOString()
        },
        {
          id: 'second-appointment',
          title: 'Plan je 2de gesprek',
          description: 'Plan een vervolgafspraak na het ontvangen van je hardware wallet',
          status: 'active',
          targetAmount: 0,
          currentAmount: 0,
          targetDate: '',
          category: 'appointment',
          createdAt: new Date().toISOString()
        }
      ]
    : [
        {
          id: 'first-appointment',
          title: 'Maak een 20min gesprek',
          description: 'Boek je eerste kennismakingsgesprek van 20 minuten',
          status: 'active',
          targetAmount: 0,
          currentAmount: 0,
          targetDate: '',
          category: 'appointment',
          createdAt: new Date().toISOString()
        }
      ];
  
  const [hasWallet, setHasWallet] = useState(false);
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<BitcoinTransaction[]>([]);
  const [currentBitcoinPrice, setCurrentBitcoinPrice] = useState<number>(96640);
  const [selectedTransaction, setSelectedTransaction] = useState<BitcoinTransaction | null>(null);
  
  const activeGoals = displayGoals.filter((goal) => (goal.status as string) === 'active').length;
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  
  // Load appointments from database - do this immediately when component mounts
  useEffect(() => {
    const loadAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        // Get effective user email (considering impersonation)
        // Use impersonated user email if impersonating, otherwise use user prop
        const effectiveEmail = (isImpersonating && impersonatedUser) 
          ? impersonatedUser 
          : user?.email;
        
        if (!effectiveEmail) {
          setAppointmentsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('appointments')
          .select('*, one_on_one_approved')
          .eq('user_email', effectiveEmail)
          // Load ALL appointments, not just pending/confirmed - we filter in the frontend
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) {
          // Only log real errors
          if (error.code !== 'PGRST116' && error.code !== 'PGRST204') {
            console.error('Error loading appointments:', error);
          }
          setAppointmentsLoading(false);
          return;
        }

        setUserAppointments(data || []);
      } catch (error) {
        // Only log real errors
        if (error instanceof Error && !error.message.includes('PGRST')) {
          console.error('Error loading appointments:', error);
        }
      } finally {
        setAppointmentsLoading(false);
      }
    };

    // Load immediately
    loadAppointments();

    // Listen for appointment refresh events
    const handleRefresh = () => {
      loadAppointments();
    };
    window.addEventListener('refreshAppointments', handleRefresh);
    
    // Also refresh when the tab becomes visible
    const visibilityChangeHandler = () => {
      if (!document.hidden) {
        loadAppointments();
      }
    };
    document.addEventListener('visibilitychange', visibilityChangeHandler);
    
    return () => {
      window.removeEventListener('refreshAppointments', handleRefresh);
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
    };
  }, [isImpersonating, impersonatedUser]);
  
  // Find user's appointment (pending or confirmed) - prioritize confirmed, then pending
  // For the green block: show ANY pending/confirmed appointment (regardless of date)
  // BUT: Don't show if one_on_one_approved is true (appointment is completed and approved)
  // For the counter: only count future appointments
  const allValidAppointments = userAppointments.filter((apt: any) => {
    if (apt.status === 'cancelled') return false;
    return apt.status === 'pending' || apt.status === 'confirmed';
  });
  
  // Find any pending or confirmed appointment for the block (no date restriction)
  // BUT: Hide block if one_on_one_approved is true (the 20min conversation is done and approved)
  const userAppointment = allValidAppointments
    .filter((apt: any) => !apt.one_on_one_approved) // Hide if already approved
    .find((apt: any) => apt.status === 'confirmed') 
    || allValidAppointments
      .filter((apt: any) => !apt.one_on_one_approved) // Hide if already approved
      .find((apt: any) => apt.status === 'pending');
  const hasAppointment = !!userAppointment && !appointmentsLoading;
  
  // Note: hasApprovedOneOnOne is now calculated in the parent UserDashboard component
  // This ensures tabs are unlocked even if accountApproved is not yet set
  
  // For upcoming appointments counter: only count future appointments
  const futureValidAppointments = allValidAppointments.filter((apt: any) => {
    // Check if appointment is in the future (combine date and time)
    const appointmentDateTime = new Date(`${apt.date}T${apt.end_time || apt.start_time || '23:59:59'}`);
    const now = new Date();
    return appointmentDateTime >= now;
  });
  
  // Calculate upcoming appointments count
  const upcomingAppointments = futureValidAppointments.length;
  
  
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [showQuestionsForm, setShowQuestionsForm] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(false);
  const [questionsData, setQuestionsData] = useState({
    has_bitcoin_experience: null as boolean | null,
    knows_hardware_wallet: null as boolean | null,
    has_crypto_wallet: null as boolean | null,
    investment_experience: '',
    monthly_investment_budget: '',
    main_goal: '',
    questions_or_concerns: ''
  });
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [walletForm, setWalletForm] = useState({
    address: '',
    name: '',
    type: 'bitcoin'
  });
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(96640);

  // Load Bitcoin price
  useEffect(() => {
    const loadPrice = async () => {
      try {
        const price = await bitcoinApiService.getCurrentPrice();
        setBitcoinPrice(price);
        setCurrentBitcoinPrice(price);
      } catch (error) {
        console.error('Error loading Bitcoin price:', error);
      }
    };
    loadPrice();
    const interval = setInterval(loadPrice, 60000); // Update elke minuut
    return () => clearInterval(interval);
  }, []);

  // Load wallet status and questions on mount
  useEffect(() => {
    const loadWalletStatus = async () => {
      try {
        // Get effective user email (considering impersonation)
        const { data: authData } = await supabase.auth.getUser();
        const sessionEmail = authData?.user?.email;
        
        // Use impersonated user email if impersonating, otherwise use session email
        const email = (isImpersonating && impersonatedUser) 
          ? impersonatedUser 
          : (sessionEmail || null);
        
        if (!email) return;

        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('email', email)
          .limit(1);

        if (wallet && wallet.length > 0) {
          setHasWallet(true);
          // Load wallet_data to get transactions if needed
          const walletRecord = wallet[0];
          // If wallet_data exists, parse it to get last transaction
          let lastTransaction = null;
          let transactions: BitcoinTransaction[] = [];
          
          if (walletRecord.wallet_data?.transactions && Array.isArray(walletRecord.wallet_data.transactions) && walletRecord.wallet_data.transactions.length > 0) {
            lastTransaction = walletRecord.wallet_data.transactions[0]; // Most recent transaction
            // Get current price for calculations
            const currentPrice = await bitcoinApiService.getCurrentPrice().catch(() => currentBitcoinPrice);
            // Convert wallet_data transactions to BitcoinTransaction format
            transactions = walletRecord.wallet_data.transactions.map((tx: any) => {
              const txPrice = tx.price || currentPrice;
              const txValue = tx.value || 0;
              const txCurrentValue = tx.currentValue || (txValue ? (txValue / 100000000) * currentPrice : 0);
              const txProfit = tx.profit !== undefined ? tx.profit : (txCurrentValue - (txValue / 100000000) * txPrice);
              const txProfitPercent = tx.profitPercent !== undefined ? tx.profitPercent : (txPrice > 0 ? ((currentPrice - txPrice) / txPrice) * 100 : 0);
              
              return {
                hash: tx.hash || '',
                time: tx.time || Math.floor(new Date(tx.date || Date.now()).getTime() / 1000),
                value: txValue,
                price: txPrice,
                currentValue: txCurrentValue,
                profit: txProfit,
                profitPercent: txProfitPercent
              };
            });
          }
          
          setWalletData({ ...walletRecord, lastTransaction });
          setWalletTransactions(transactions);
        } else {
          setHasWallet(false);
          setWalletData(null);
          setWalletTransactions([]);
        }
      } catch (error) {
        console.error('Error loading wallet status:', error);
      }
    };

    const loadQuestions = async () => {
      if (userAppointment && userAppointment.status === 'confirmed') {
        try {
          const { data: questions } = await supabase
            .from('appointment_questions')
            .select('*')
            .eq('appointment_id', userAppointment.id)
            .single();

          if (questions) {
            // Check if all required questions are answered
            const hasRequiredAnswers = 
              questions.has_bitcoin_experience !== null &&
              questions.knows_hardware_wallet !== null &&
              questions.main_goal !== '';
            
            setQuestionsAnswered(hasRequiredAnswers);
            
            setQuestionsData({
              has_bitcoin_experience: questions.has_bitcoin_experience,
              knows_hardware_wallet: questions.knows_hardware_wallet,
              has_crypto_wallet: questions.has_crypto_wallet,
              investment_experience: questions.investment_experience || '',
              monthly_investment_budget: questions.monthly_investment_budget || '',
              main_goal: questions.main_goal || '',
              questions_or_concerns: questions.questions_or_concerns || ''
            });
          } else {
            setQuestionsAnswered(false);
          }
        } catch (error) {
          console.error('Error loading questions:', error);
          setQuestionsAnswered(false);
        }
      }
    };

    loadWalletStatus();

    // Listen for wallet updates
    const handleWalletUpdate = () => {
      loadWalletStatus();
    };
    window.addEventListener('walletUpdated', handleWalletUpdate);

    loadQuestions();
    
    return () => {
      window.removeEventListener('walletUpdated', handleWalletUpdate);
    };
  }, [userAppointment, isImpersonating, impersonatedUser]);

  const handleAddWallet = async () => {
    if (!walletForm.address.trim()) {
      alert('Voer een geldig wallet adres in');
      return;
    }

    // Validate Bitcoin address
    if (!bitcoinApiService.validateBitcoinAddress(walletForm.address.trim())) {
      alert('Ongeldig Bitcoin adres. Controleer het adres en probeer opnieuw.');
      return;
    }

    setIsAddingWallet(true);
    try {
      // Get effective user email (considering impersonation)
      const { data: authData } = await supabase.auth.getUser();
      const sessionEmail = authData?.user?.email;
      
      // Use impersonated user email if impersonating, otherwise use session email
      const email = (isImpersonating && impersonatedUser) 
        ? impersonatedUser 
        : (sessionEmail || null);
      
      if (!email) throw new Error('Geen gebruiker bekend');

      // Check existing wallet
      const { data: existing, error: checkErr } = await supabase
        .from('wallets')
        .select('id')
        .eq('email', email)
        .limit(1);
      if (checkErr) throw checkErr;
      if (existing && existing.length > 0) {
        setHasWallet(true);
        alert('Er is al een wallet gekoppeld aan dit account.');
        setIsAddingWallet(false);
        return;
      }

      // Fetch wallet data from Bitcoin API
      const walletApiData = await bitcoinApiService.getWalletData(walletForm.address.trim());
      
      // Get current Bitcoin price
      const currentBtcPrice = await bitcoinApiService.getCurrentPrice();
      setBitcoinPrice(currentBtcPrice);

      // Get last transaction
      const lastTx = walletApiData.transactions && walletApiData.transactions.length > 0
        ? walletApiData.transactions[0]
        : null;

      // Insert wallet with portfolio data
      const { data: newWallet, error: insertErr } = await supabase
        .from('wallets')
        .insert([{
          email,
          address: walletForm.address.trim(),
          name: walletForm.name?.trim() || null,
          type: walletForm.type,
          balance: walletApiData.balance,
          transaction_count: walletApiData.transactionCount,
          total_received: walletApiData.totalReceived,
          total_sent: walletApiData.totalSent,
          first_seen: walletApiData.firstSeen ? new Date(walletApiData.firstSeen) : null,
          last_seen: walletApiData.lastSeen ? new Date(walletApiData.lastSeen) : new Date(),
          last_transaction_hash: lastTx?.hash || null,
          last_transaction_time: lastTx?.time ? new Date(lastTx.time * 1000) : null,
          wallet_data: walletApiData.transactions ? { transactions: walletApiData.transactions } : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Save wallet history for admin
      const { error: historyError } = await supabase
        .from('wallet_history')
        .insert([{
          user_email: email,
          wallet_id: newWallet.id,
          wallet_address: walletForm.address.trim(),
          wallet_name: walletForm.name?.trim() || null,
          action: 'added',
          wallet_balance: walletApiData.balance,
          transaction_count: walletApiData.transactionCount,
          wallet_data_snapshot: {
            balance: walletApiData.balance,
            transactions: walletApiData.transactions || [],
            transactionCount: walletApiData.transactionCount
          }
        }]);

      if (historyError) {
        console.error('Error saving wallet history:', historyError);
        // Continue even if history fails
      }

      // Update state
      setHasWallet(true);
      setWalletData(newWallet);
      setShowSuccessMessage(true);
      
      // Trigger wallet update event to refresh PortfolioPage
      window.dispatchEvent(new CustomEvent('walletUpdated'));
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      // Close form after success
      setTimeout(() => {
        setShowWalletForm(false);
        setWalletForm({ address: '', name: '', type: 'bitcoin' });
      }, 2000);
      
    } catch (error: any) {
      console.error('Error adding wallet:', error);
      const errorMessage = error?.message || 'Fout bij het toevoegen van wallet';
      alert(errorMessage);
    } finally {
      setIsAddingWallet(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Overzicht</h2>

      {/* Appointment Status Block */}
      {/* Hide appointment block if account is approved/activated OR one-on-one is approved */}
      {!(accountApproved || hasApprovedOneOnOne) && (
        <>
        {appointmentsLoading ? (
          // Loading state - don't show anything while loading
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 rounded-xl w-16 h-16"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : !userAppointment ? (
        // No appointment - show prompt to book
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Maak je eerste afspraak! 🎯</h3>
              <p className="text-orange-100 mb-4">
                Dit is een 20-minuten gesprek om te kijken wat ik voor je kan betekenen. 
                We bespreken je doelen, risicoprofiel en maken een persoonlijk plan voor jouw Bitcoin reis.
              </p>
              <button 
                onClick={() => {
                  if (onBookAppointment) {
                    onBookAppointment();
                  }
                }}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Plan je afspraak in
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Any appointment (pending or confirmed)
        userAppointment.status === 'pending' ? (
        // Pending appointment - waiting for confirmation (orange block)
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Afspraak ingepland ⏳</h3>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-3 text-sm">
                <p className="font-semibold mb-1">ℹ️ Over dit gesprek:</p>
                <p className="text-orange-50">
                  Dit is een 20-minuten kennismaking waarbij we bespreken wie jij bent en wie ik ben, wat je doel is en of dat mogelijk is.
                </p>
              </div>
              <div className="space-y-2 text-orange-100 mb-4">
                <p>
                  <strong>Datum:</strong> {new Date(userAppointment.date).toLocaleDateString('nl-NL', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p>
                  <strong>Tijd:</strong> {userAppointment.start_time} - {userAppointment.end_time}
                </p>
              </div>
              <button 
                disabled
                className="bg-white bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-75"
              >
                Wacht op goedkeuring
              </button>
              <p className="bg-white bg-opacity-20 rounded-lg p-3 mt-3 text-orange-50 text-sm">
                📬 Wacht tot dit bevestigd is door de admin. Je ontvangt een bevestigingsmail zodra de afspraak is goedgekeurd.
              </p>
            </div>
          </div>
        </div>
        ) : (
        // Confirmed appointment - show info and questions form
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Afspraak Bevestigd! ✅</h3>
              <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-3 text-sm">
                <p className="font-semibold mb-1">ℹ️ Over dit gesprek:</p>
                <p className="text-green-50">
                  Dit is een 20-minuten kennismaking waarbij we bespreken wie jij bent en wie ik ben, wat je doel is en of dat mogelijk is.
                </p>
              </div>
              <div className="space-y-2 text-green-100 mb-4">
                <p>
                  <strong>Datum:</strong> {new Date(userAppointment.date).toLocaleDateString('nl-NL', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p>
                  <strong>Tijd:</strong> {userAppointment.start_time} - {userAppointment.end_time}
                </p>
                <p>
                  <strong>Duur:</strong> {userAppointment.duration_minutes} minuten
                </p>
                {userAppointment.teams_link && (
                  <div className="mt-3">
                    <a
                      href={userAppointment.teams_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
                    >
                      <Video className="w-4 h-4" />
                      Open Microsoft Teams Link
                    </a>
                  </div>
                )}
              </div>

              {!showQuestionsForm ? (
                <div>
                  {questionsAnswered ? (
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 text-green-50 mb-4">
                      <p className="font-semibold mb-2">✅ Vragenlijst is beantwoord</p>
                      <p className="text-sm mb-3">Je kunt je antwoorden nog steeds bewerken als je wilt.</p>
                      <button
                        onClick={() => setShowQuestionsForm(true)}
                        className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors text-sm"
                      >
                        Bewerk Antwoorden
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="bg-white bg-opacity-20 rounded-lg p-3 text-green-50 mb-4">
                        💬 Om ons gesprek goed voor te bereiden, beantwoord graag de volgende vragen:
                      </p>
                      <button
                        onClick={() => setShowQuestionsForm(true)}
                        className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                      >
                        Beantwoord Vragen
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <AppointmentQuestionsForm
                  appointmentId={userAppointment.id}
                  questionsData={questionsData}
                  setQuestionsData={setQuestionsData}
                  onClose={() => setShowQuestionsForm(false)}
                  onSave={async (data) => {
                    setIsSavingQuestions(true);
                    try {
                      // Get effective user email (considering impersonation)
                      const { data: authData } = await supabase.auth.getUser();
                      const sessionEmail = authData?.user?.email;
                      
                      // Use impersonated user email if impersonating, otherwise use session email
                      const email = (isImpersonating && impersonatedUser) 
                        ? impersonatedUser 
                        : (sessionEmail || null);
                      
                      if (!email) throw new Error('Geen gebruiker bekend');

                      // Check if questions already exist
                      const { data: existing } = await supabase
                        .from('appointment_questions')
                        .select('id')
                        .eq('appointment_id', userAppointment.id)
                        .single();

                      const questionData = {
                        appointment_id: userAppointment.id,
                        user_email: email,
                        ...data,
                        updated_at: new Date().toISOString()
                      };

                      if (existing) {
                        // Update existing
                        const { error } = await supabase
                          .from('appointment_questions')
                          .update(questionData)
                          .eq('id', existing.id);
                        if (error) throw error;
                      } else {
                        // Insert new
                        const { error } = await supabase
                          .from('appointment_questions')
                          .insert([questionData]);
                        if (error) throw error;
                      }

                      alert('Bedankt! Je antwoorden zijn opgeslagen. We zien elkaar binnenkort!');
                      setQuestionsAnswered(true);
                      setShowQuestionsForm(false);
                      // Reload questions to update state
                      const loadQuestions = async () => {
                        try {
                          const { data: questions } = await supabase
                            .from('appointment_questions')
                            .select('*')
                            .eq('appointment_id', userAppointment.id)
                            .single();

                          if (questions) {
                            const hasRequiredAnswers = 
                              questions.has_bitcoin_experience !== null &&
                              questions.knows_hardware_wallet !== null &&
                              questions.main_goal !== '';
                            setQuestionsAnswered(hasRequiredAnswers);
                          }
                        } catch (error) {
                          console.error('Error reloading questions:', error);
                        }
                      };
                      await loadQuestions();
                    } catch (error: any) {
                      console.error('Error saving questions:', error);
                      alert(`Fout bij opslaan: ${error.message}`);
                    } finally {
                      setIsSavingQuestions(false);
                    }
                  }}
                  isSaving={isSavingQuestions}
                />
              )}
            </div>
          </div>
        </div>
        )
      )}
        </>
      )}

      {/* Wallet Status - Only show if account is approved AND no wallet exists */}
      {(accountApproved || hasApprovedOneOnOne) && !hasWallet && (
        <div className={`bg-yellow-50 border border-yellow-200 rounded-xl transition-all duration-500 overflow-hidden ${
          showWalletForm ? 'p-6' : 'p-6'
        }`}>
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Wallet className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Voeg je BTC wallet toe</h3>
              <p className="text-yellow-700 mb-4">
                Om je portfolio te kunnen volgen en je doelen te bereiken, voeg je Bitcoin wallet toe aan je account.
              </p>
              
              {!showWalletForm ? (
                <button 
                  onClick={() => setShowWalletForm(true)}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Wallet toevoegen
                  </span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-2">Wallet Naam</label>
                    <input
                      type="text"
                      value={walletForm.name}
                      onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })}
                      placeholder="Bijv. Mijn Bitcoin Wallet"
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-2">Bitcoin Adres</label>
                    <input
                      type="text"
                      value={walletForm.address}
                      onChange={(e) => setWalletForm({ ...walletForm, address: e.target.value })}
                      placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddWallet}
                      disabled={isAddingWallet}
                      className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAddingWallet ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Toevoegen...
                        </>
                      ) : (
                        'Toevoegen'
                      )}
                    </button>
                    <button
                      onClick={() => setShowWalletForm(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wallet Success Message - Animated entry */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-2 border-green-300 p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl animate-pulse">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-1">✓ Wallet succesvol toegevoegd!</h3>
              <p className="text-green-700">Je wallet is gekoppeld en je portfolio wordt bijgewerkt.</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 hover:text-green-800 transition-colors"
              aria-label="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Wallet Overview Block - Shows wallet details */}
      {hasWallet && walletData && !showSuccessMessage && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {walletData.name || 'Mijn Bitcoin Wallet'}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600 font-mono">
                  {walletData.address ? 
                    `${walletData.address.slice(0, 8)}...${walletData.address.slice(-8)}` : 
                    '***'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletData.address);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                  title="Kopieer adres"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm text-gray-600 mb-1">Wallet Waarde</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${((walletData.balance || 0) * bitcoinPrice).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {walletData.balance?.toFixed(8) || '0.00000000'} BTC
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm text-gray-600 mb-1">Totaal BTC</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {walletData.balance?.toFixed(4) || '0.0000'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {walletData.transaction_count || 0} transacties
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="text-sm text-gray-600 mb-2">Laatste Transactie</div>
                  {(() => {
                    // Use the first (most recent) transaction from walletTransactions array
                    const lastTx = walletTransactions && walletTransactions.length > 0 ? walletTransactions[0] : null;
                    
                    if (!lastTx) {
                      return <div className="text-xs text-gray-500 break-words">Geen transacties</div>;
                    }

                    let txDate: Date | null = null;
                    let txTime: string | null = null;
                    let txHash: string | null = null;

                    try {
                      // lastTx.time is a Unix timestamp in seconds
                      if (lastTx.time) {
                        txDate = new Date(lastTx.time * 1000);
                        if (!isNaN(txDate.getTime())) {
                          txTime = txDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
                        }
                        txHash = lastTx.hash || null;
                      }
                    } catch (e) {
                      console.error('Error parsing transaction time:', e);
                    }

                    if (!txDate || isNaN(txDate.getTime())) {
                      return <div className="text-xs text-gray-500 break-words">Geen transacties</div>;
                    }

                    return (
                      <>
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {txDate.toLocaleDateString('nl-NL', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}
                        </div>
                        {txTime && (
                          <div className="text-xs text-gray-500 mb-2">
                            {txTime}
                          </div>
                        )}
                        {txHash && (
                          <div className="text-xs text-gray-500 mb-2 font-mono">
                            {txHash.length > 16 ? `${txHash.slice(0, 8)}...${txHash.slice(-8)}` : txHash}
                          </div>
                        )}
                        {onNavigateToPortfolio && (
                          <button
                            onClick={() => onNavigateToPortfolio()}
                            className="w-full mt-2 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Naar Portfolio
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Success - Shows when wallet is being added (old fallback) */}
      {hasWallet && !walletData && !showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl animate-pulse">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Wallet succesvol toegevoegd!</h3>
              <p className="text-green-700">
                Je portfolio wordt nu geladen met je wallet gegevens...
              </p>
            </div>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Actieve Doelen</p>
              <p className="text-2xl font-bold text-gray-900">{activeGoals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Behaalde Doelen</p>
              <p className="text-2xl font-bold text-gray-900">{goals.filter((g: Goal) => (g.status as string) === 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aankomende Afspraken</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          {/* Aanmeldproces Stappen */}
          {!accountApproved && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Jouw Aanmeldproces</h3>
              <SignupProcessFlow 
                user={{
                  email_verified: emailVerified,
                  first_appointment_completed: firstAppointmentCompleted,
                  account_approved: accountApproved,
                  created_at: user?.created_at,
                  email: user?.email
                }}
                showLegend={false}
                accordionMode={true}
                simpleMode={true}
                hasApprovedOneOnOne={hasApprovedOneOnOne}
              />
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recente Doelen</h3>
          <div className="space-y-3">
            {goals && goals.length > 0 ? (
              goals.slice(0, 3).map((goal: Goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{goal.title}</p>
                    <p className="text-sm text-gray-600">{goal.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${goal.currentAmount.toLocaleString('en-US')} / ${goal.targetAmount.toLocaleString('en-US')}
                    </p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Geen doelen ingesteld</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aankomende Afspraken</h3>
          <div className="space-y-3">
            {userAppointments.filter((apt: any) => {
              if (apt.status !== 'pending' && apt.status !== 'confirmed') return false;
              // Combine date and time to check if appointment is in the future
              const appointmentDateTime = new Date(`${apt.date}T${apt.end_time || apt.start_time || '23:59:59'}`);
              const now = new Date();
              return appointmentDateTime >= now;
            }).slice(0, 3).map((appointment: any) => (
              <div key={appointment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  appointment.status === 'confirmed' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <Calendar className={`w-4 h-4 ${
                    appointment.status === 'confirmed' ? 'text-green-600' : 'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Eerste Afspraak</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString('nl-NL', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })} om {appointment.start_time}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  appointment.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : appointment.status === 'pending'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status === 'confirmed' ? 'Bevestigd' : appointment.status === 'pending' ? 'In Afwachting' : appointment.status}
                </span>
              </div>
            ))}
            {userAppointments.filter((apt: any) => 
              (apt.status === 'pending' || apt.status === 'confirmed') && new Date(apt.date) >= new Date()
            ).length === 0 && (
              <p className="text-gray-500 text-center py-4">Geen aankomende afspraken</p>
            )}
          </div>
        </div>
      </div>

      {/* Coinbase and Ledger Blocks */}
      <ReferralBlocks />
    </div>
  );
}


// Goals Tab Component
function GoalsTab({ goals, setGoals }: any) {
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showBitcoinCalculator, setShowBitcoinCalculator] = useState(false);
  const [goalTemplate, setGoalTemplate] = useState<string | null>(null);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    targetDate: '',
    category: 'other',
    targetBitcoinAmount: 0,
    currentBitcoinAmount: 0,
    monthlyInvestment: 0
  });
  const [bitcoinGoal, setBitcoinGoal] = useState({
    targetAmount: 0,
    currentAmount: 0,
    monthlyInvestment: 0,
    targetDate: ''
  });

  // Load Bitcoin price
  useEffect(() => {
    const loadBitcoinPrice = async () => {
      try {
        const price = await bitcoinPriceService.getCurrentPrice();
        setBitcoinPrice(price.price);
      } catch (error) {
        console.error('Error loading Bitcoin price:', error);
        setBitcoinPrice(95000); // Fallback price
      }
    };
    loadBitcoinPrice();
  }, []);

  const handleCreateGoal = async () => {
    try {
      let goal: any;
      
      if (goalTemplate === 'bitcoin') {
        // Bitcoin goal with calculation
        const remainingBTC = newGoal.targetBitcoinAmount - newGoal.currentBitcoinAmount;
        const monthsNeeded = Math.ceil((remainingBTC * bitcoinPrice) / newGoal.monthlyInvestment);
        
        goal = {
          id: Date.now().toString(),
          title: `${newGoal.targetBitcoinAmount} Bitcoin Doel`,
          description: `Maandelijks $${newGoal.monthlyInvestment.toLocaleString('en-US')} investeren om ${newGoal.targetBitcoinAmount} BTC te bereiken (${monthsNeeded} maanden)`,
          targetAmount: newGoal.targetBitcoinAmount * bitcoinPrice,
          currentAmount: newGoal.currentBitcoinAmount * bitcoinPrice,
          targetDate: newGoal.targetDate,
          category: 'bitcoin',
          status: 'active',
          createdAt: new Date().toISOString(),
          isBitcoinGoal: true,
          targetBitcoinAmount: newGoal.targetBitcoinAmount,
          currentBitcoinAmount: newGoal.currentBitcoinAmount,
          monthlyInvestment: newGoal.monthlyInvestment,
          bitcoinPriceAtCreation: bitcoinPrice
        };
      } else {
        // Regular goal
        goal = {
          id: Date.now().toString(),
          title: newGoal.title,
          description: newGoal.description,
          targetAmount: newGoal.targetAmount,
          currentAmount: 0,
          targetDate: newGoal.targetDate,
          category: newGoal.category,
          status: 'active',
          createdAt: new Date().toISOString()
        };
      }
      
      setGoals([...goals, goal]);
      setShowNewGoal(false);
      setGoalTemplate(null);
      setNewGoal({ 
        title: '', 
        description: '', 
        targetAmount: 0, 
        targetDate: '', 
        category: 'other',
        targetBitcoinAmount: 0,
        currentBitcoinAmount: 0,
        monthlyInvestment: 0
      });
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mijn Doelen</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setGoalTemplate(null);
              setShowNewGoal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuw Doel
          </button>
        </div>
      </div>

      {/* Goal Templates */}
      {!showNewGoal && !showBitcoinCalculator && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => {
              setGoalTemplate('bitcoin');
              setShowBitcoinCalculator(true);
            }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 p-6 rounded-xl hover:border-orange-500 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-orange-900">Bitcoin Doel</h3>
            </div>
            <p className="text-sm text-orange-800">
              Stel een doel in voor een bepaald aantal Bitcoin met automatische berekening van maandelijkse inleg
            </p>
          </button>
          <button
            onClick={() => {
              setGoalTemplate('amount');
              setShowNewGoal(true);
            }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 p-6 rounded-xl hover:border-blue-500 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-blue-900">Bedrag Doel</h3>
            </div>
            <p className="text-sm text-blue-800">
              Stel een doel in voor een bepaald bedrag in euro's met doeldatum
            </p>
          </button>
          <button
            onClick={() => {
              setGoalTemplate('custom');
              setShowNewGoal(true);
            }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-6 rounded-xl hover:border-purple-500 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-purple-900">Aangepast Doel</h3>
            </div>
            <p className="text-sm text-purple-800">
              Maak een volledig aangepast doel met eigen titel en beschrijving
            </p>
          </button>
        </div>
      )}

      {showNewGoal && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nieuw Doel Toevoegen</h3>
          {goalTemplate === 'bitcoin' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doel: Aantal Bitcoin</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={newGoal.targetBitcoinAmount}
                    onChange={(e) => {
                      const btcAmount = parseFloat(e.target.value) || 0;
                      setNewGoal({ 
                        ...newGoal, 
                        targetBitcoinAmount: btcAmount,
                        targetAmount: btcAmount * bitcoinPrice
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Bijv. 0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Huidige Bitcoin</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={newGoal.currentBitcoinAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentBitcoinAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Bijv. 0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maandelijkse Investering ($)</label>
                  <input
                    type="number"
                    value={newGoal.monthlyInvestment}
                    onChange={(e) => setNewGoal({ ...newGoal, monthlyInvestment: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Bijv. 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doel Datum</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              {newGoal.targetBitcoinAmount > 0 && newGoal.currentBitcoinAmount >= 0 && newGoal.monthlyInvestment > 0 && (
                <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-3">Berekening:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-orange-700 font-medium">Nog nodig:</span>
                      <p className="text-orange-900 font-bold">
                        {(newGoal.targetBitcoinAmount - newGoal.currentBitcoinAmount).toFixed(8)} BTC
                        <span className="text-xs text-gray-600 ml-2">
                          (${((newGoal.targetBitcoinAmount - newGoal.currentBitcoinAmount) * bitcoinPrice).toLocaleString('en-US')})
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-orange-700 font-medium">Maanden nodig:</span>
                      <p className="text-orange-900 font-bold">
                        {Math.ceil(((newGoal.targetBitcoinAmount - newGoal.currentBitcoinAmount) * bitcoinPrice) / newGoal.monthlyInvestment)} maanden
                      </p>
                    </div>
                    <div>
                      <span className="text-orange-700 font-medium">Maandelijks inleggen:</span>
                      <p className="text-orange-900 font-bold">${newGoal.monthlyInvestment.toLocaleString('en-US')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {goalTemplate !== 'bitcoin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categorie</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="retirement">Pensioen</option>
                  <option value="house">Huis</option>
                  <option value="education">Onderwijs</option>
                  <option value="emergency">Noodfonds</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="other">Anders</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doelbedrag ($)</label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doeldatum</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschrijving</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCreateGoal}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Doel Toevoegen
            </button>
            <button
              onClick={() => {
                setShowNewGoal(false);
                setGoalTemplate(null);
                setNewGoal({
                  title: '',
                  description: '',
                  targetAmount: 0,
                  targetDate: '',
                  category: 'other',
                  targetBitcoinAmount: 0,
                  currentBitcoinAmount: 0,
                  monthlyInvestment: 0
                });
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}


      {/* Behaalde Doelen Section */}
      {goals.filter((g: Goal) => g.currentAmount >= g.targetAmount && g.status === 'active').length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Behaalde Doelen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {goals
              .filter((g: Goal) => g.currentAmount >= g.targetAmount && g.status === 'active')
              .map((goal: Goal) => (
                <div key={goal.id} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border-2 border-green-300 relative">
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="mb-4">
                    <h3 className="font-bold text-green-900 text-lg">{goal.title}</h3>
                    <p className="text-sm text-green-700 capitalize mt-1">{goal.category}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-800 font-medium">🎉 Doel behaald!</p>
                    <p className="text-xs text-green-600 mt-1">
                      {(goal as any).isBitcoinGoal 
                        ? `${((goal as any).currentBitcoinAmount || 0).toFixed(8)} BTC bereikt`
                        : `$${goal.currentAmount.toLocaleString('en-US')} bereikt`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const updatedGoals = goals.map((g: Goal) => 
                        g.id === goal.id ? { ...g, status: 'completed' as const } : g
                      );
                      setGoals(updatedGoals);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Markeer als Voltooid
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals
          .filter((g: Goal) => g.currentAmount < g.targetAmount || g.status !== 'active')
          .map((goal: Goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isBitcoinGoal = goal.isBitcoinGoal || goal.category === 'bitcoin';
            
            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{goal.category}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    goal.status === 'active' ? 'bg-green-100 text-green-800' :
                    goal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {goal.status === 'active' ? 'Actief' : goal.status === 'completed' ? 'Voltooid' : 'Gepauzeerd'}
                  </span>
                </div>
                
                {goal.description && (
                  <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Voortgang</span>
                    <span className="font-medium">
                      {isBitcoinGoal && (goal as any).currentBitcoinAmount !== undefined ? (
                        <>
                          {((goal as any).currentBitcoinAmount || 0).toFixed(8)} / {((goal as any).targetBitcoinAmount || 0).toFixed(8)} BTC
                          <span className="text-xs text-gray-500 ml-2">
                            (${goal.currentAmount.toLocaleString('en-US')} / ${goal.targetAmount.toLocaleString('en-US')})
                          </span>
                        </>
                      ) : (
                        <>${goal.currentAmount.toLocaleString('en-US')} / ${goal.targetAmount.toLocaleString('en-US')}</>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        progress >= 100 ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{Math.round(progress)}%</span>
                    {goal.targetDate && (
                      <span>{new Date(goal.targetDate).toLocaleDateString('nl-NL')}</span>
                    )}
                  </div>
                  {isBitcoinGoal && (goal as any).monthlyInvestment && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Maandelijks: ${((goal as any).monthlyInvestment || 0).toLocaleString('en-US')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// Portfolio Tab Component
function PortfolioTab({ portfolio, setPortfolio }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mijn Portfolio</h2>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Overzicht</h3>
            <p className="text-gray-600">Huidige waarde en prestaties</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              ${portfolio?.value?.toLocaleString('en-US') || '0'}
            </p>
            <p className={`text-sm ${portfolio?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolio?.change >= 0 ? '+' : ''}${portfolio?.change?.toLocaleString('en-US') || '0'} 
              ({portfolio?.changePercent >= 0 ? '+' : ''}{portfolio?.changePercent || 0}%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {portfolio?.assets?.map((asset: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{asset.name}</span>
                <span className="text-sm text-gray-600">{asset.symbol}</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">${asset.value.toLocaleString('en-US')}</p>
                <p className="text-sm text-gray-600">{asset.percentage}% van portfolio</p>
                <p className="text-xs text-gray-500">{asset.amount} stuks</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Appointments Tab Component
function AppointmentsTab({ appointments, setAppointments, onBookAppointment, isImpersonating, impersonatedUser }: any) {
  const { user } = useSupabaseAuth();
  const { isImpersonating: contextImpersonating, impersonatedUser: contextImpersonatedUser } = usePermissions();
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'agenda'>('agenda');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Get effective user email (impersonated user if impersonating, otherwise real user)
  const effectiveUserEmail = (isImpersonating || contextImpersonating) && (impersonatedUser || contextImpersonatedUser) 
    ? (impersonatedUser || contextImpersonatedUser)
    : user?.email;

  useEffect(() => {
    loadUserAppointments();
  }, [effectiveUserEmail, refreshKey]);

  // Expose refresh function via window event
  useEffect(() => {
    const handleRefreshAppointments = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('refreshAppointments', handleRefreshAppointments);
    return () => window.removeEventListener('refreshAppointments', handleRefreshAppointments);
  }, []);

  const cancelAppointment = async (aptId: string) => {
    if (!confirm('Weet je zeker dat je deze afspraak wilt annuleren?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', aptId)
        .eq('status', 'pending'); // Only allow cancel if status is pending

      if (error) {
        if (error.code === '42501') {
          alert('Je hebt geen toestemming om deze afspraak te annuleren. Alleen afspraken met status "In Afwachting" kunnen geannuleerd worden.');
        } else {
          throw error;
        }
        return;
      }

      // Refresh the appointments list
      setRefreshKey(prev => prev + 1);
      alert('Afspraak succesvol geannuleerd');
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      alert(`Fout bij annuleren: ${error.message}`);
    }
  };

  const loadUserAppointments = async () => {
    if (!effectiveUserEmail) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      
      // During impersonation, admin can read all appointments
      // We need to filter by user_email in the query or in the frontend
      let query = supabase
        .from('appointments')
        .select('*, one_on_one_approved');
      
      // Filter by user email - this should work for both regular users and admin during impersonation
      query = query.eq('user_email', effectiveUserEmail);
      
      // Order results
      query = query.order('date', { ascending: true })
                   .order('start_time', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        // Only log real errors, not expected cases
        if (error.code !== 'PGRST116' && error.code !== 'PGRST204') {
          console.error('Error loading appointments:', error);
        }
        throw error;
      }
      
      // Filter out any null/undefined entries
      const validAppointments = (data || []).filter(apt => apt && apt.id);
      
      setUserAppointments(validAppointments);
      setAppointments(validAppointments);
      
    } catch (error) {
      // Only log real errors, not expected empty results
      if (error instanceof Error && !error.message.includes('PGRST')) {
        console.error('Error loading appointments:', error);
      }
      setUserAppointments([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setViewMode('list');
    // Scroll to the appointment in the list
    setTimeout(() => {
      const element = document.getElementById(`appointment-${appointment.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // If viewing details, show that instead
  if (selectedAppointment && viewMode === 'list') {
    const apt = selectedAppointment;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedAppointment(null);
              setViewMode('agenda');
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Terug naar Agenda
          </button>
          <button
            onClick={onBookAppointment}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuwe Afspraak
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Afspraak Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">
                      {new Date(apt.date).toLocaleDateString('nl-NL', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">
                      {apt.start_time} - {apt.end_time} ({apt.duration_minutes} minuten)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      apt.status === 'confirmed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : apt.status === 'pending'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {apt.status === 'confirmed' ? '✅ Bevestigd' :
                       apt.status === 'pending' ? '⏳ In Afwachting' :
                       '❌ Geannuleerd'}
                    </span>
                    {apt.one_on_one_approved && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        ✓ 1 op 1 Goedgekeurd
                      </span>
                    )}
                  </div>
                  {apt.notes && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opmerkingen:</p>
                      <p className="text-gray-600 dark:text-gray-400">{apt.notes}</p>
                    </div>
                  )}
                  {apt.teams_link && (
                    <div className="mt-4">
                      <a
                        href={apt.teams_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Open Microsoft Teams Link
                      </a>
                    </div>
                  )}
                  {apt.status === 'pending' && (
                    <div className="mt-4">
                      <button
                        onClick={() => cancelAppointment(apt.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Annuleer Afspraak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mijn Afspraken</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => {
                setViewMode('agenda');
                setSelectedAppointment(null);
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedAppointment(null);
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Lijst
            </button>
          </div>
          <button
            onClick={onBookAppointment}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Afspraak Boeken
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Afspraken laden...</p>
        </div>
      ) : viewMode === 'agenda' ? (
        <AgendaView
          appointments={userAppointments}
          onAppointmentClick={handleAppointmentClick}
        />
      ) : userAppointments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-200 dark:border-gray-700 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nog geen afspraken</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Plan je eerste afspraak in om te beginnen!</p>
          <button
            onClick={onBookAppointment}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Afspraak Boeken
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {userAppointments.map((apt: any) => {
            const dateObj = new Date(apt.date);
            const isPast = new Date(`${apt.date}T${apt.end_time}`) < new Date();
            
            return (
              <div
                id={`appointment-${apt.id}`}
                key={apt.id}
                onClick={() => handleAppointmentClick(apt)}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-2 cursor-pointer hover:shadow-md transition-all ${
                  apt.status === 'confirmed'
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                    : apt.status === 'pending'
                    ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      apt.status === 'confirmed'
                        ? 'bg-green-100 dark:bg-green-900'
                        : apt.status === 'pending'
                        ? 'bg-orange-100 dark:bg-orange-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Calendar className={`w-6 h-6 ${
                        apt.status === 'confirmed'
                          ? 'text-green-600 dark:text-green-400'
                          : apt.status === 'pending'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Eerste Afspraak
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {dateObj.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {apt.start_time} - {apt.end_time} ({apt.duration_minutes} minuten)
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : apt.status === 'pending'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {apt.status === 'confirmed' ? '✅ Bevestigd' :
                           apt.status === 'pending' ? '⏳ In Afwachting' :
                           '❌ Geannuleerd'}
                        </span>
                        {apt.one_on_one_approved && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            ✓ 1 op 1 Goedgekeurd
                          </span>
                        )}
                      </div>
                      {apt.notes && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Opmerkingen:</strong> {apt.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      apt.status === 'confirmed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : apt.status === 'pending'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : apt.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {apt.status === 'confirmed' ? '✅ Bevestigd' :
                       apt.status === 'pending' ? '⏳ In Afwachting' :
                       apt.status === 'cancelled' ? '❌ Geannuleerd' :
                       '❓ Onbekend'}
                    </span>
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => cancelAppointment(apt.id)}
                        className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Annuleren
                      </button>
                    )}
                    {apt.status === 'confirmed' && apt.teams_link && (
                      <a
                        href={apt.teams_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" />
                        Teams Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Education Tab Component
function EducationTab() {
  const courses = [
    {
      id: 1,
      title: 'Bitcoin Basics',
      description: 'Leer de fundamenten van Bitcoin en cryptocurrency',
      progress: 75,
      duration: '2 uur',
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'DCA Strategieën',
      description: 'Ontdek verschillende Dollar Cost Averaging strategieën',
      progress: 30,
      duration: '1.5 uur',
      level: 'Gemiddeld'
    },
    {
      id: 3,
      title: 'Portfolio Management',
      description: 'Leer hoe je je crypto portfolio beheert',
      progress: 0,
      duration: '3 uur',
      level: 'Gevorderd'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Educatie & Cursussen</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {course.level}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Voortgang</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{course.duration}</span>
                <span>{course.progress === 0 ? 'Niet gestart' : course.progress === 100 ? 'Voltooid' : 'In progress'}</span>
              </div>
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              {course.progress === 0 ? 'Start Cursus' : course.progress === 100 ? 'Herbekijk' : 'Verder gaan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}