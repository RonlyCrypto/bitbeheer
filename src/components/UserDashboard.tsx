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
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
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
import NotificationSettings from './NotificationSettings';
import GoalsTab from './GoalsTab';
import MarketStatusWidget from './MarketStatusWidget';
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
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [previousATH, setPreviousATH] = useState<number>(69000);
  const [latestATH, setLatestATH] = useState<number>(124753);
  const [showMarketStatusPanel, setShowMarketStatusPanel] = useState(false);

  // Load current price data
  useEffect(() => {
    const loadPriceData = async () => {
      try {
        let price = 0;

        // 1️⃣ Try to get from LiveBitcoinPrice localStorage cache
        const bitcoinCache = localStorage.getItem('bitcoin_last_price');
        if (bitcoinCache) {
          try {
            const cacheData = JSON.parse(bitcoinCache);
            if (cacheData.price && cacheData.price > 1000) {
              price = cacheData.price;
            }
          } catch (e) {
            console.warn('⚠️ Cache parse error:', e);
          }
        }

        // 2️⃣ Fallback: Try bitcoinApiService
        if (price === 0) {
          try {
            price = await bitcoinApiService.getCurrentPrice();
          } catch (apiError) {
            console.warn('⚠️ API price fetch failed:', apiError);
          }
        }

        // 3️⃣ Fallback: Use old cached price from localStorage
        if (price === 0) {
          const cached = localStorage.getItem('btc_last_price');
          if (cached) {
            price = parseFloat(cached);
          }
        }

        // Save price to localStorage
        if (price > 0) {
          localStorage.setItem('btc_last_price', price.toString());
          setCurrentPrice(Math.round(price));
        }

        // Load ATH data dynamically
        try {
          const athData = await bitcoinApiService.getATHData();
          setPreviousATH(athData.previousATH);
          setLatestATH(athData.latestATH);
          console.log(`📊 ATH prices loaded: Previous: $${athData.previousATH}, Latest: $${athData.latestATH}`);
        } catch (athError) {
          console.warn('⚠️ Error loading ATH data:', athError);
        }
      } catch (error) {
        console.error('❌ Error loading price data:', error);
      }
    };

    loadPriceData();
    // Refresh every 30 seconds
    const interval = setInterval(loadPriceData, 30000);
    return () => clearInterval(interval);
  }, []);
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

  // Function to refresh account status (called after admin updates or periodically)
  const refreshAccountStatus = async () => {
    if (!user?.email) return;
    try {
      const { data: userData, error: userError } = await supabase
        .from('accounts')
        .select('account_approved, first_appointment_completed, email_verified')
        .eq('email', user.email)
        .maybeSingle();
      
      if (!userError && userData) {
        console.log('🔄 Refreshed account status:', {
          first_appointment_completed: userData.first_appointment_completed,
          account_approved: userData.account_approved
        });
        setAccountApproved(userData.account_approved || false);
        setFirstAppointmentCompleted(userData.first_appointment_completed || false);
        setEmailVerified(userData.email_verified || false);
      }
    } catch (error) {
      console.error('Error refreshing account status:', error);
    }
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load Bitcoin price
        try {
          const price = await bitcoinApiService.getCurrentPrice();
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
    
    // Listen for account status refresh events (from admin updates, etc)
    const handleStatusRefresh = () => {
      console.log('📌 Refreshing account status after admin update');
      refreshAccountStatus();
    };
    window.addEventListener('refreshAccountStatus', handleStatusRefresh);
    
    // Listen for market status page open event
    const handleOpenMarketStatus = () => {
      setShowMarketStatusPanel(true);
      setActiveTab('overview'); // Market-status tab is verborgen
    };
    window.addEventListener('openMarketStatusPage', handleOpenMarketStatus);
    
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
      window.removeEventListener('refreshAccountStatus', handleStatusRefresh);
      window.removeEventListener('newAdminMessage', handleNewMessage);
      window.removeEventListener('openMarketStatusPage', handleOpenMarketStatus);
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
              <NotificationDropdown 
                unreadCount={unreadChatCount}
                onNotificationClick={(notification) => {
                  // Navigate based on notification type
                  if (notification.type === 'unread_message') {
                    setActiveTab('helpdesk');
                  } else if (notification.type === 'appointment_approved') {
                    setActiveTab('overview'); // Appointments tab is verborgen
                  } else if (notification.type === 'goal_achieved') {
                    setActiveTab('goals');
                  }
                }}
              />
              <NotificationSettings 
                onPhoneNumberSaved={(phone) => {
                  // Update userProfile with new phone number
                  setUserProfile({
                    ...userProfile,
                    phone: phone
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-100 flex">
        {/* User Sidebar */}
        <UserSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accountApproved={accountApproved}
          hasApprovedOneOnOne={hasApprovedOneOnOne}
          unreadChatCount={unreadChatCount}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-7xl">
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
            {activeTab === 'goals' && (accountApproved || hasApprovedOneOnOne) && <GoalsTab goals={goals} setGoals={setGoals} user={user} />}
            {activeTab === 'portfolio' && (accountApproved || hasApprovedOneOnOne) && <PortfolioPage />}

            {/* Market Status tab - tijdelijk verborgen */}
            {/* {activeTab === 'market-status' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">📊 Markt Positie Analyse</h2>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
                  <MarketStatusWidget 
                    position="between_aths" 
                    compact={false}
                    currentPrice={currentPrice}
                    previousATH={previousATH}
                    latestATH={latestATH}
                  />
                </div>
              </div>
            )} */}
            {/* Appointments tab - tijdelijk verborgen */}
            {/* 
            {activeTab === 'appointments' && (
              <AppointmentsTab 
              appointments={appointments} 
              setAppointments={setAppointments}
              onBookAppointment={() => setShowAppointmentPopup(true)}
              isImpersonating={isImpersonating}
              impersonatedUser={impersonatedUser}
              accountApproved={accountApproved}
              firstAppointmentCompleted={firstAppointmentCompleted}
              />
            )}
            */}
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
          setActiveTab('overview'); // Terug naar overview in plaats van appointments (tab is verborgen)
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
  // 🐛 DEBUG MODE - Toggle via console: localStorage.setItem('wallet_debug', 'true') or localStorage.setItem('wallet_debug', 'false')
  const DEBUG = typeof localStorage !== 'undefined' && localStorage.getItem('wallet_debug') === 'true';
  const log = (title: string, data?: any) => {
    if (DEBUG) {
      console.log(`%c[WALLET] ${title}`, 'color: #0066cc; font-weight: bold;', data || '');
    }
  };
  const err = (title: string, data?: any) => {
    if (DEBUG) {
      console.error(`%c[WALLET ERROR] ${title}`, 'color: #cc0000; font-weight: bold;', data || '');
    }
  };

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

          // 🔄 POLLING FALLBACK: Check for updates every 3 seconds (in case real-time fails)
          let pollCount = 0;
          const pollInterval = setInterval(async () => {
            if (pollCount > 20) {
              // Stop after 60 seconds
              clearInterval(pollInterval);
              return;
            }
            
            try {
              const { data: updatedWallet } = await supabase
                .from('wallets')
                .select('*')
                .eq('email', email)
                .eq('address', walletRecord.address)
                .single();

              if (updatedWallet && (updatedWallet.balance > 0 || updatedWallet.transaction_count > 0)) {
                log('Wallet data updated via polling', updatedWallet);
                
                let updatedTransactions: BitcoinTransaction[] = [];
                if (updatedWallet.wallet_data?.transactions && Array.isArray(updatedWallet.wallet_data.transactions)) {
                  updatedTransactions = updatedWallet.wallet_data.transactions.map((tx: any) => {
                    const txPrice = tx.price || bitcoinPrice;
                    const txValue = tx.value || 0;
                    const txCurrentValue = tx.currentValue || (txValue ? (txValue / 100000000) * bitcoinPrice : 0);
                    const txProfit = tx.profit !== undefined ? tx.profit : (txCurrentValue - (txValue / 100000000) * txPrice);
                    const txProfitPercent = tx.profitPercent !== undefined ? tx.profitPercent : (txPrice > 0 ? ((bitcoinPrice - txPrice) / txPrice) * 100 : 0);
                    
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
                
                setWalletData(updatedWallet);
                setWalletTransactions(updatedTransactions);
                clearInterval(pollInterval);
              }
            } catch (error) {
              err('Poll error', error);
            }
            
            pollCount++;
          }, 3000);

          return () => {
            clearInterval(pollInterval);
          };
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

      // 1️⃣ QUICK: Save wallet immediately without fetching data
      const { data: newWallet, error: insertErr } = await supabase
        .from('wallets')
        .insert([{
          email,
          address: walletForm.address.trim(),
          name: walletForm.name?.trim() || null,
          type: walletForm.type,
          balance: 0, // Placeholder - will be updated in background
          transaction_count: 0,
          total_received: 0,
          total_sent: 0,
          first_seen: null,
          last_seen: new Date().toISOString(),
          wallet_data: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertErr) {
        console.error('Insert error:', insertErr);
        throw insertErr;
      }

      // Update UI state immediately
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

      // 2️⃣ BACKGROUND: Fetch data asynchronously with retries
      setTimeout(async () => {
        let retries = 0;
        const maxRetries = 3;
        
        const fetchWalletData = async () => {
          try {
            log(`Fetching wallet data (attempt ${retries + 1}/${maxRetries})`);
            const walletApiData = await bitcoinApiService.getWalletData(walletForm.address.trim(), 50);
            
            log('Wallet data received', {
              balance: walletApiData.balance,
              transactionCount: walletApiData.transactionCount,
              txListLength: walletApiData.transactions?.length || 0
            });
            
            // Get last transaction
            const lastTx = walletApiData.transactions && walletApiData.transactions.length > 0
              ? walletApiData.transactions[0]
              : null;

            // Update wallet in DB with actual data
            const { error: updateError } = await supabase
              .from('wallets')
              .update({
                balance: walletApiData.balance,
                transaction_count: walletApiData.transactionCount,
                total_received: walletApiData.totalReceived,
                total_sent: walletApiData.totalSent,
                first_seen: walletApiData.firstSeen ? new Date(walletApiData.firstSeen).toISOString() : null,
                last_seen: new Date().toISOString(),
                last_transaction_hash: lastTx?.hash || null,
                last_transaction_time: lastTx?.time ? new Date(lastTx.time * 1000).toISOString() : null,
                wallet_data: walletApiData.transactions ? { transactions: walletApiData.transactions } : null,
                updated_at: new Date().toISOString()
              })
              .eq('id', newWallet.id);

            if (updateError) {
              err('Database update error', updateError);
              throw updateError;
            }

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
              log('Wallet history save (non-critical):', historyError);
            }

            log('Wallet data synced successfully:', walletForm.address.trim());
            return true;
          } catch (error) {
            err(`Attempt ${retries + 1} failed`, error);
            retries++;
            
            if (retries < maxRetries) {
              log(`Retrying in 5 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
              return fetchWalletData();
            } else {
              err('All retry attempts failed. Wallet added but data sync failed.');
              return false;
            }
          }
        };

        await fetchWalletData();
      }, 2000); // Delay to avoid blocking UI
      
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

      {/* Actiebalk - Wallet toevoegen (altijd bovenaan, volle breedte) */}
      {(accountApproved || hasApprovedOneOnOne) && !hasWallet && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Wallet className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🔐 Voeg je BTC wallet toe</h3>
              <p className="text-gray-700 mb-4">
                Beheer je Bitcoin veilig in eigen handen
              </p>
              {!showWalletForm ? (
                <button 
                  onClick={() => setShowWalletForm(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Wallet toevoegen
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Wallet Naam</label>
                    <input
                      type="text"
                      value={walletForm.name}
                      onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })}
                      placeholder="Bijv. Mijn Bitcoin Wallet"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Bitcoin Adres</label>
                    <input
                      type="text"
                      value={walletForm.address}
                      onChange={(e) => setWalletForm({ ...walletForm, address: e.target.value })}
                      placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddWallet}
                      disabled={isAddingWallet}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

      {/* Grid Layout: Linkerkolom | Rechterkolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LINKERKOLOM - Bitcoin Veiligheidscheck + Wallet (8 kolommen) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bitcoin Veiligheidscheck - Vervangt aanmeldproces na goedkeuring */}
          {accountApproved && (firstAppointmentCompleted || hasApprovedOneOnOne) ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Jouw Bitcoin Veiligheidscheck</h3>
              <div className="space-y-3">
            {/* Stap 1: Account aangemaakt */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Account aangemaakt</p>
            </div>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                Toevoegen <ArrowRight className="w-4 h-4" />
              </button>
                    </div>
            
            {/* Stap 2: Wallet toevoegen */}
            {hasWallet ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
                  <p className="font-medium text-gray-900">Wallet toegevoegd</p>
                  </div>
                </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Wallet toevoegen</p>
            </div>
            <button
                  onClick={() => setShowWalletForm(true)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
                  Toevoegen <ArrowRight className="w-4 h-4" />
            </button>
          </div>
            )}
            
            {/* Stap 3: Seed phrase veilig opgeslagen */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                <p className="font-medium text-gray-900">Seed phrase veilig opgeslagen</p>
        </div>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                Uitleg <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Stap 4: Eerste aankoop gedaan */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                <p className="font-medium text-gray-900">Eerste aankoop gedaan</p>
                </div>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                Start <ArrowRight className="w-4 h-4" />
              </button>
              </div>

            {/* Stap 5: Bitcoin verplaatst naar eigen wallet */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Bitcoin verplaatst naar eigen wallet</p>
          </div>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                Uitleg <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Uitleg nodig?</a>
          <button
            onClick={() => {
                // Navigate to helpdesk
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'helpdesk' }));
                }
              }}
              className="w-full mt-3 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Hulp nodig? Stel je vraag
          </button>
        </div>
            </div>
          ) : null}

          {/* Wallet Block - Compact en mooi */}
          {hasWallet && walletData && !showSuccessMessage && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              {/* Wallet uitleg bovenaan */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Dit is je eigen wallet. <strong>Geef nooit je seed code aan iemand.</strong> Jij hebt alles in eigen beheer.
                  </p>
                </div>
              </div>

              {/* Wallet header met link naar portfolio */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                {walletData.name || 'Mijn Bitcoin Wallet'}
              </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-mono">
                  {walletData.address ? 
                          `${walletData.address.slice(0, 6)}...${walletData.address.slice(-6)}` : 
                    '***'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletData.address);
                  }}
                        className="text-blue-600 hover:text-blue-800"
                  title="Kopieer adres"
                >
                        <Copy className="w-3 h-3" />
                </button>
              </div>
                  </div>
                  </div>
                <button
                  onClick={() => onNavigateToPortfolio?.()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 flex-shrink-0"
                >
                  Portfolio <ArrowRight className="w-4 h-4" />
                </button>
                </div>
                
              {/* Bitcoin balance */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-xs font-medium text-gray-600 mb-1">Mijn Bitcoin</h4>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {walletData.balance?.toFixed(4) || '0.0000'} BTC
                  </div>
                <p className="text-xs text-gray-500">
                    {walletData.transaction_count || 0} transacties
                </p>
                </div>
                
              {/* Laatste transacties */}
              {walletTransactions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">📊 Laatste transacties</h4>
                  <div className="space-y-2">
                    {walletTransactions.slice(0, 3).map((tx, index) => {
                      const txDate = new Date(tx.time * 1000);
                      const formattedDate = txDate.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });
                      const btcAmount = Math.abs(tx.value) / 100000000;
                      const isIncoming = tx.value > 0;
                      const txType = isIncoming ? 'Koop' : 'Verkoop';

                    return (
                        <div key={tx.hash || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2 flex-1">
                            <div className={`w-2 h-2 rounded-full ${isIncoming ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-medium text-gray-900">{btcAmount.toFixed(4)} BTC</span>
                            <span className="text-xs text-gray-500">({txType})</span>
                        </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formattedDate}</span>
                            {tx.hash && (
                              <a
                                href={`https://blockstream.info/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                                title="Bekijk transactie"
                          >
                            <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                  </div>
                </div>
              );
            })}
          </div>
                  {walletTransactions.length > 3 && (
            <button
              onClick={() => onNavigateToPortfolio?.()}
                      className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
                      Alle transacties bekijken
            </button>
          )}
        </div>
      )}
        </div>

        {/* RECHTERKOLOM - Custody-status (4 kolommen) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Custody-status */}
          {(accountApproved || hasApprovedOneOnOne) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Custody-status</h3>
          <div className="space-y-3">
                {/* Exchange status */}
                <div className={`p-4 rounded-lg border-2 ${
                  !hasWallet || !walletData || walletData.balance === 0
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        !hasWallet || !walletData || walletData.balance === 0
                          ? 'bg-red-100' 
                          : 'bg-gray-200'
                      }`}>
                        {(!hasWallet || !walletData || walletData.balance === 0) && (
                          <X className="w-4 h-4 text-red-600" />
            )}
            </div>
            <div>
                        <p className={`font-semibold text-sm ${
                          !hasWallet || !walletData || walletData.balance === 0
                            ? 'text-red-900' 
                            : 'text-gray-600'
                        }`}>
                          Bitcoin staat nog op exchange
                        </p>
                        <p className={`text-xs ${
                          !hasWallet || !walletData || walletData.balance === 0
                            ? 'text-red-700' 
                            : 'text-gray-500'
                        }`}>
                          Risico: Gecontroleerd door bedrijf
                        </p>
            </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      !hasWallet || !walletData || walletData.balance === 0
                        ? 'border-red-400' 
                        : 'border-gray-300'
                    }`}></div>
          </div>
        </div>

                {/* Eigen wallet status */}
                <div className={`p-4 rounded-lg border-2 ${
                  hasWallet && walletData && walletData.balance > 0
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
      <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        hasWallet && walletData && walletData.balance > 0
                          ? 'bg-green-100' 
                          : 'bg-gray-200'
                      }`}>
                        {hasWallet && walletData && walletData.balance > 0 && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
            </div>
            <div>
                        <p className={`font-semibold text-sm ${
                          hasWallet && walletData && walletData.balance > 0
                            ? 'text-green-900' 
                            : 'text-gray-600'
                        }`}>
                          Bitcoin staat in eigen wallet
                        </p>
                        <p className={`text-xs ${
                          hasWallet && walletData && walletData.balance > 0
                            ? 'text-green-700' 
                            : 'text-gray-500'
                        }`}>
                          Veilig: Zelf in eigen handen
                      </p>
            </div>
          </div>
                    {hasWallet && walletData && walletData.balance > 0 && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>
            </div>
            </div>
          </div>
      )}
        </div>
      </div>

      {/* Leer & Waarschuwingen, Beginnersdoelen en Custody-status - 1 rij (1/3 1/3 1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leer & Waarschuwingen - 1/3 breedte */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📚 Leer & Waarschuwingen</h3>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Vragen Beantwoord &gt;</a>
            </div>

                  <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">⚠️ Veelgemaakte fouten</h4>
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">Koop nooit via DM's</p>
                  </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">Deel nooit je seed</p>
                    </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">Laat BTC niet lang op exchanges</p>
                  </div>
                </div>
        </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Tip van vandaag</h4>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p className="font-semibold text-orange-900 mb-1 text-sm">Niet je keys = niet je Bitcoin</p>
              <p className="text-xs text-orange-800">
                Gebruik altijd alleen je eigen wallet om zeker te weten dat jij je Bitcoin bezit.
              </p>
          </div>
          </div>
        </div>

        {/* Beginnersdoelen - 1/3 breedte */}
        {(accountApproved || hasApprovedOneOnOne) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🎯 Beginnersdoelen</h3>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Je klas over &gt;</a>
            </div>
          <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-600">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Koop €100 BTC</p>
                </div>
                <span className="text-sm text-gray-500">0/1</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-600">2</span>
          </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Seed phrase noteren</p>
        </div>
                <span className="text-sm text-gray-500">0/1</span>
        </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-600">3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">BTC verplaatsen</p>
                </div>
                <span className="text-sm text-gray-500">0/1</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-600">4</span>
          </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Veiligheidsvideo</p>
        </div>
                <span className="text-sm text-gray-500">0/1</span>
              </div>
          </div>
        </div>
      )}
        {/* Lege kolom - 1/3 breedte */}
        <div></div>
      </div>

      {/* Stappenblokken (Ledger, Coinbase & Hulp nodig?) - Onderaan naast elkaar (3/8 3/8 2/8) */}
      <ReferralBlocksWithHelp onBookAppointment={onBookAppointment} />
    </div>
  );
}

// ReferralBlocksWithHelp Component - Renders Ledger, Coinbase and Help in 3/8 3/8 2/8 layout
function ReferralBlocksWithHelp({ onBookAppointment }: { onBookAppointment?: () => void }) {
  const [ledgerLink, setLedgerLink] = useState<string | null>(null);
  const [coinbaseLink, setCoinbaseLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralLinks();
    
    const handleUpdate = () => {
      loadReferralLinks();
    };
    window.addEventListener('referralLinksUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('referralLinksUpdated', handleUpdate);
    };
  }, []);

  const loadReferralLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_links')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      const ledger = data?.find(link => 
        link.title.toLowerCase().includes('ledger')
      );
      const coinbase = data?.find(link => 
        link.title.toLowerCase().includes('coinbase')
      );

      setLedgerLink(ledger?.url || null);
      setCoinbaseLink(coinbase?.url || null);
    } catch (error) {
      console.error('Error loading referral links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLedgerClick = () => {
    if (ledgerLink) {
      window.open(ledgerLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCoinbaseClick = () => {
    if (coinbaseLink) {
      window.open(coinbaseLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-8 gap-6">
      {/* Ledger - 3/8 */}
      <div className="lg:col-span-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl relative">
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Stap 1
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Shield className="w-8 h-8 text-white" />
      </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900 mb-3">Ledger Hardware Wallet</h3>
            <p className="text-blue-800 mb-4 leading-relaxed">
              Een Ledger is een hardware wallet die je Bitcoin offline bewaart. Het is de veiligste manier 
              om je Bitcoin op te slaan omdat het niet verbonden is met het internet. Je privésleutels blijven 
              altijd onder jouw controle en kunnen niet gehackt worden.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Offline opslag van je privésleutels</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Bescherming tegen hackers en malware</span>
            </div>
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Ondersteuning voor 1000+ cryptocurrencies</span>
              </div>
            </div>
          <button
              onClick={handleLedgerClick}
              disabled={!ledgerLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Koop een Ledger
            </button>
              </div>
            </div>
        </div>

      {/* Coinbase - 3/8 */}
      <div className="lg:col-span-3 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-xl relative">
        <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Stap 2
                </div>
        <div className="flex items-start gap-4">
          <div className="bg-orange-600 p-3 rounded-xl">
            <TrendingUp className="w-8 h-8 text-white" />
                </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-orange-900 mb-3">Coinbase Exchange</h3>
            <p className="text-orange-800 mb-4 leading-relaxed">
              Coinbase is een van de meest betrouwbare en gebruiksvriendelijke exchanges voor het kopen van Bitcoin. 
              Perfect voor beginners met een intuïtieve interface en sterke beveiliging.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-orange-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Gereguleerd en verzekerd</span>
                    </div>
              <div className="flex items-center gap-2 text-orange-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Eenvoudige DCA instellingen</span>
                    </div>
              <div className="flex items-center gap-2 text-orange-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Lage transactiekosten</span>
                    </div>
                  </div>
            <button 
              onClick={handleCoinbaseClick}
              disabled={!coinbaseLink}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Start met Coinbase
            </button>
              </div>
              </div>
              </div>

      {/* Hulp nodig? - 2/8 */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Hulp nodig?</h3>
        <p className="text-sm text-gray-700 mb-4">
          Twijfel of vragen? Wij helpen je persoonlijk.
        </p>
        <div className="space-y-3">
            <button
            onClick={() => onBookAppointment && onBookAppointment()}
            className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
            <Calendar className="w-5 h-5" />
            Plan gesprek
            </button>
            <button
              onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'helpdesk' }));
              }
            }}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Stel je vraag
                  </button>
                </div>
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
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Afspraken laden...</p>
        </div>
      ) : viewMode === 'agenda' ? (
        <div className="space-y-4">
          <AgendaView
            appointments={userAppointments}
            onAppointmentClick={handleAppointmentClick}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onBookAppointment={onBookAppointment}
            setSelectedAppointment={setSelectedAppointment}
          />
        </div>
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
          <AgendaView
            appointments={userAppointments}
            onAppointmentClick={handleAppointmentClick}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onBookAppointment={onBookAppointment}
            setSelectedAppointment={setSelectedAppointment}
            isListMode={true}
            listItems={
              <div className="space-y-4 pb-20">
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
            }
          />
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