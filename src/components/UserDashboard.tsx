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
  HelpCircle,
  Trophy,
  PartyPopper,
  Sparkles,
  Edit,
  Trash2
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
                  .from('accounts')
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
                profitPercent: txProfitPercent,
                status: tx.status || 'confirmed',
                confirmations: tx.confirmations || 0
              };
            });
          }
          
          setWalletData({ ...walletRecord, lastTransaction });
          setWalletTransactions(transactions);

          // 🔄 REALTIME WALLET REFRESH: Check for new transactions every 10 seconds
          const lastKnownTxHash = lastTransaction?.hash || walletRecord.last_transaction_hash || null;
          
          const refreshWalletData = async () => {
            try {
              // Check for new transactions via Blockstream API
              const { hasNew, newTxHash } = await bitcoinApiService.checkForNewTransactions(
                walletRecord.address,
                lastKnownTxHash
              );
              
              if (hasNew) {
                log('🔄 Nieuwe transactie gedetecteerd! Wallet wordt ververst...', { newTxHash });
                
                // Fetch fresh wallet data
                const freshWalletData = await bitcoinApiService.getWalletData(walletRecord.address, 50);
                
                // Update Supabase
                const { error: updateError } = await supabase
                  .from('wallets')
                  .update({
                    balance: freshWalletData.balance,
                    transaction_count: freshWalletData.transactionCount,
                    total_received: freshWalletData.totalReceived,
                    total_sent: freshWalletData.totalSent,
                    last_seen: new Date().toISOString(),
                    last_transaction_hash: freshWalletData.transactions[0]?.hash || null,
                    last_transaction_time: freshWalletData.transactions[0]?.time 
                      ? new Date(freshWalletData.transactions[0].time * 1000).toISOString() 
                      : null,
                    wallet_data: { transactions: freshWalletData.transactions },
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', walletRecord.id);
                
                if (!updateError) {
                  // Update local state
                  const currentPrice = await bitcoinApiService.getCurrentPrice().catch(() => currentBitcoinPrice);
                  const updatedTransactions = freshWalletData.transactions.map((tx: any) => ({
                    hash: tx.hash || '',
                    time: tx.time || Math.floor(new Date().getTime() / 1000),
                    value: tx.value || 0,
                    price: tx.price || currentPrice,
                    currentValue: tx.currentValue || 0,
                    profit: tx.profit || 0,
                    profitPercent: tx.profitPercent || 0,
                    status: tx.status || 'confirmed',
                    confirmations: tx.confirmations || 0
                  }));
                  
                  setWalletData({
                    ...walletRecord,
                    balance: freshWalletData.balance,
                    transaction_count: freshWalletData.transactionCount,
                    lastTransaction: freshWalletData.transactions[0] || null
                  });
                  setWalletTransactions(updatedTransactions);
                  
                  log('✅ Wallet succesvol ververst met nieuwe transacties', {
                    newBalance: freshWalletData.balance,
                    newTxCount: freshWalletData.transactionCount
                  });
                } else {
                  err('Error updating wallet in database', updateError);
                }
              }
            } catch (error) {
              err('Error refreshing wallet', error);
            }
          };
          
          // Start real-time refresh interval (every 10 seconds)
          const refreshInterval = setInterval(refreshWalletData, 10000);
          
          // Also check immediately
          refreshWalletData();

          return () => {
            clearInterval(refreshInterval);
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
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
                  {/* BTC Balance in het midden */}
                  <div className="text-center mx-4">
                    <span className="text-sm font-semibold text-gray-700">
                      {walletData.balance?.toFixed(4) || '0.0000'} BTC
                    </span>
                  </div>
                  </div>
                <button
                  onClick={() => onNavigateToPortfolio?.()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 flex-shrink-0"
                >
                  Portfolio <ArrowRight className="w-4 h-4" />
                </button>
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
                      const isPending = tx.status === 'pending';

                    return (
                        <div key={tx.hash || index} className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors ${isPending ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 flex-1">
                            <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500 animate-pulse' : (isIncoming ? 'bg-green-500' : 'bg-red-500')}`}></div>
                            <span className="text-xs font-medium text-gray-900">{btcAmount.toFixed(4)} BTC</span>
                            <span className="text-xs text-gray-500">({txType})</span>
                            {isPending && (
                              <span className="text-xs text-yellow-600 font-medium">⏳ Pending</span>
                            )}
                  </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formattedDate}</span>
                            {tx.hash && (
                              <a
                                href={`https://blockstream.info/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                                title={isPending ? "Bekijk pending transactie" : "Bekijk transactie"}
                          >
                            <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                  </div>
                </div>
              );
            })}
          </div>
                </div>
              )}
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
                </div>
                
      {/* Leer & Waarschuwingen en Beginnersdoelen - 1 rij (2/3 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Beginnersdoelen - 2/3 breedte */}
        {(accountApproved || hasApprovedOneOnOne) && (
          <div className="lg:col-span-2">
            <BeginnersGoals walletData={walletData} walletTransactions={walletTransactions} onBookAppointment={onBookAppointment} />
                  </div>
        )}
        
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

          {/* Hulp nodig? */}
          <div className="pt-4 border-t border-gray-200 mt-4">
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
      </div>

      {/* Stappenblokken (Ledger & Coinbase) - Onderaan naast elkaar (1/2 1/2) */}
      <ReferralBlocksWithHelp onBookAppointment={onBookAppointment} />
    </div>
  );
}

// BeginnersGoals Component
function BeginnersGoals({ walletData, walletTransactions, onBookAppointment }: { walletData: any; walletTransactions: BitcoinTransaction[]; onBookAppointment?: () => void }) {
  const { user } = useSupabaseAuth();
  const [showAddGoalPopup, setShowAddGoalPopup] = useState(false);
  const [customGoals, setCustomGoals] = useState<any[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState('');
  const [newGoalType, setNewGoalType] = useState<'save' | 'monthly'>('save');
  const [newGoalMonthlyAmount, setNewGoalMonthlyAmount] = useState('');
  const [newGoalMonthlyCurrency, setNewGoalMonthlyCurrency] = useState<'btc' | 'eur'>('btc');
  const [newGoalMonthlyEurAmount, setNewGoalMonthlyEurAmount] = useState<string>('');
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>([]);
  const [showMilestonePopup, setShowMilestonePopup] = useState(false);
  const [currentMilestoneCelebration, setCurrentMilestoneCelebration] = useState<number | null>(null);
  const [showMonthlyGoalPopup, setShowMonthlyGoalPopup] = useState(false);
  const [selectedMonthlyGoal, setSelectedMonthlyGoal] = useState<any>(null);
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<any>(null);
  const [showEditGoalPopup, setShowEditGoalPopup] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<any>(null);
  const [editGoalAmount, setEditGoalAmount] = useState('');
  const [editGoalTimeframe, setEditGoalTimeframe] = useState('');
  const [editGoalMonthlyAmount, setEditGoalMonthlyAmount] = useState('');
  const [editGoalMonthlyCurrency, setEditGoalMonthlyCurrency] = useState<'btc' | 'eur'>('btc');
  const [editGoalMonthlyEurAmount, setEditGoalMonthlyEurAmount] = useState<string>('');

  // Calculate wallet balance in BTC
  const currentBalance = walletData?.balance || 0;

  // Bitcoin milestones with meaningful descriptions
  const btcMilestones = [
    { 
      label: '0.01 BTC', 
      value: 0.01,
      title: 'Eerste serieuze stap',
      description: 'Slechts een klein percentage van de wereldbevolking zal ooit 0.01 Bitcoin bezitten. Je hoort nu al bij een kleine groep.',
      icon: '🟢'
    },
    { 
      label: '0.1 BTC', 
      value: 0.1,
      title: 'Elite niveau',
      description: 'Naar schatting kunnen minder dan 1% van de mensen wereldwijd ooit 0.1 Bitcoin bezitten. Dit wordt gezien als een sterke lange-termijn positie.',
      icon: '🟠'
    },
    { 
      label: '1 BTC', 
      value: 1,
      title: 'Bitcoin volledige eenheid',
      description: 'Er zijn maar 21 miljoen Bitcoin. Als je 1 BTC bezit, hoor je bij een extreem kleine groep wereldwijd. Dit is voor de meeste mensen onbereikbaar.',
      icon: '🔒'
    }
  ];

  // Calculate which milestone the user has reached
  // Progress bar uses logarithmic scale: 0.01 BTC = 10%, 0.1 BTC = 50%, 1 BTC = 100%
  const getCurrentMilestone = () => {
    if (currentBalance >= 1) {
      return { current: 1, next: null, progress: 100, reached: [0.01, 0.1, 1] };
    }
    if (currentBalance >= 0.1) {
      // Between 0.1 and 1 BTC: progress from 50% to 100%
      const progress = 50 + ((currentBalance - 0.1) / 0.9) * 50;
      return { current: 0.1, next: 1, progress: Math.min(100, progress), reached: [0.01, 0.1] };
    }
    if (currentBalance >= 0.01) {
      // Between 0.01 and 0.1 BTC: progress from 10% to 50%
      const progress = 10 + ((currentBalance - 0.01) / 0.09) * 40;
      return { current: 0.01, next: 0.1, progress: Math.min(50, progress), reached: [0.01] };
    }
    // Below 0.01 BTC: progress from 0% to 10%
    const progress = (currentBalance / 0.01) * 10;
    return { current: 0, next: 0.01, progress: Math.min(10, progress), reached: [] };
  };

  const milestoneProgress = getCurrentMilestone();
  
  // Get milestone info
  const getMilestoneInfo = (value: number) => {
    return btcMilestones.find(m => m.value === value);
  };

  // Detect new milestone achievements and show celebration popup
  useEffect(() => {
    const newlyReached = milestoneProgress.reached.filter(m => !celebratedMilestones.includes(m));
    
    if (newlyReached.length > 0) {
      // Show celebration for the highest newly reached milestone
      const highestNewMilestone = Math.max(...newlyReached);
      setCurrentMilestoneCelebration(highestNewMilestone);
      setShowMilestonePopup(true);
      setCelebratedMilestones([...celebratedMilestones, ...newlyReached]);
    }
  }, [milestoneProgress.reached, currentBalance, celebratedMilestones]);

  // Default goals - focused on steps toward next milestone (must be after milestoneProgress is defined)
  const getDefaultGoals = () => {
    const goals = [];
    
    // Add milestone-based goals
    if (milestoneProgress.next) {
      if (milestoneProgress.next === 0.01) {
        goals.push({
          id: 'step-toward-0.01',
          title: 'Volgende stap naar 0.01 BTC',
          description: 'Koop Bitcoin en verplaats naar eigen wallet',
          type: 'milestone_step' as const,
          target: milestoneProgress.next,
          completed: currentBalance >= milestoneProgress.next
        });
      } else if (milestoneProgress.next === 0.1) {
        goals.push({
          id: 'step-toward-0.1',
          title: 'Volgende stap naar 0.1 BTC',
          description: 'Bouw je positie verder uit met regelmatige aankopen',
          type: 'milestone_step' as const,
          target: milestoneProgress.next,
          completed: currentBalance >= milestoneProgress.next
        });
      } else if (milestoneProgress.next === 1) {
        goals.push({
          id: 'step-toward-1',
          title: 'Volgende stap naar 1 BTC',
          description: 'Een volledige Bitcoin - de ultieme mijlpaal',
          type: 'milestone_step' as const,
          target: milestoneProgress.next,
          completed: currentBalance >= milestoneProgress.next
        });
      }
    }
    
    return goals;
  };

  const defaultGoals = getDefaultGoals();

  // Load custom goals from database
  useEffect(() => {
    const loadCustomGoals = async () => {
      if (!user?.id) {
        setLoadingGoals(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', 'beginners')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedGoals = data.map(goal => {
            // Parse goal data from description or title
            const isMonthly = goal.title.toLowerCase().includes('stort elke maand') || goal.title.toLowerCase().includes('elke maand');
            const isBTC = goal.title.toLowerCase().includes('btc') || goal.title.toLowerCase().includes('bitcoin');
            const isEUR = goal.title.toLowerCase().includes('€') || goal.title.toLowerCase().includes('euro');
            
            if (isMonthly) {
              // Monthly goal
              const amountMatch = goal.title.match(/(\d+\.?\d*)/);
              const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
              
              return {
                id: goal.id,
                title: goal.title,
                type: 'monthly' as const,
                monthlyAmount: amount,
                monthlyCurrency: isBTC ? 'btc' as const : 'eur' as const,
                custom: true,
                completed: goal.status === 'completed',
                dbId: goal.id,
                created_at: goal.created_at
              };
            } else {
              // Save goal
              const amountMatch = goal.title.match(/(\d+\.?\d*)/);
              const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
              const timeframeMatch = goal.description?.match(/(\d+\s*(maanden?|weken?|dagen?))/i);
              const timeframe = timeframeMatch ? timeframeMatch[1] : '';
              
              return {
                id: goal.id,
                title: goal.title,
                type: 'btc' as const,
                target: amount,
                timeframe: timeframe,
                custom: true,
                completed: goal.status === 'completed' || currentBalance >= amount,
                dbId: goal.id,
                created_at: goal.created_at
              };
            }
          });
          setCustomGoals(formattedGoals);
        }
      } catch (error) {
        console.error('Error loading custom goals:', error);
      } finally {
        setLoadingGoals(false);
      }
    };

    loadCustomGoals();
  }, [user?.id, currentBalance]);

  // Calculate progress for goals
  const getGoalProgress = (goal: any) => {
    if (goal.type === 'btc') {
      if (goal.completed) return { completed: true, remaining: 0 };
      const remaining = Math.max(0, goal.target - currentBalance);
      return { completed: false, remaining };
    } else if (goal.type === 'milestone_step') {
      if (goal.completed) return { completed: true, remaining: 0 };
      const remaining = Math.max(0, goal.target - currentBalance);
      return { completed: false, remaining };
    } else {
      // EUR goal - check transactions
      // For now, mark as not completed (can be enhanced later)
      return { completed: false, remaining: goal.target };
    }
  };

  const handleAddGoal = async () => {
    if (!user?.id || !user?.email) {
      alert('Je moet ingelogd zijn om een doel toe te voegen');
      return;
    }

    try {
      if (newGoalType === 'save') {
        if (!newGoalAmount || !newGoalTimeframe) return;
        
        const title = `Spaar ${newGoalAmount} BTC binnen ${newGoalTimeframe}`;
        const description = `Spaardoel: ${newGoalAmount} BTC binnen ${newGoalTimeframe}`;
        const targetAmount = parseFloat(newGoalAmount);
        const isCompleted = currentBalance >= targetAmount;

        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            email: user.email,
            title: title,
            description: description,
            category: 'beginners',
            status: isCompleted ? 'completed' : 'active',
            target_amount: targetAmount,
            current_amount: currentBalance,
            target_date: null
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const goal = {
            id: data.id,
            title: title,
            target: targetAmount,
            type: 'btc' as const,
            timeframe: newGoalTimeframe,
            custom: true,
            completed: isCompleted,
            dbId: data.id
          };
          setCustomGoals([...customGoals, goal]);
        }
      } else {
        if (newGoalMonthlyCurrency === 'btc') {
          if (!newGoalMonthlyAmount) return;
          
          const title = `Stort elke maand ${newGoalMonthlyAmount} BTC`;
          const description = `Maandelijks doel: ${newGoalMonthlyAmount} BTC per maand`;

          const { data, error } = await supabase
            .from('goals')
            .insert({
              user_id: user.id,
              email: user.email,
              title: title,
              description: description,
              category: 'beginners',
              status: 'active',
              target_amount: parseFloat(newGoalMonthlyAmount),
              current_amount: 0,
              target_date: null
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const goal = {
              id: data.id,
              title: title,
              monthlyAmount: parseFloat(newGoalMonthlyAmount),
              monthlyCurrency: 'btc' as const,
              type: 'monthly' as const,
              custom: true,
              completed: false,
              dbId: data.id
            };
            setCustomGoals([...customGoals, goal]);
          }
        } else {
          if (!newGoalMonthlyEurAmount) return;
          
          const title = `Stort elke maand €${newGoalMonthlyEurAmount}`;
          const description = `Maandelijks doel: €${newGoalMonthlyEurAmount} per maand`;

          const { data, error } = await supabase
            .from('goals')
            .insert({
              user_id: user.id,
              email: user.email,
              title: title,
              description: description,
              category: 'beginners',
              status: 'active',
              target_amount: parseFloat(newGoalMonthlyEurAmount),
              current_amount: 0,
              target_date: null
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const goal = {
              id: data.id,
              title: title,
              monthlyAmount: parseFloat(newGoalMonthlyEurAmount),
              monthlyCurrency: 'eur' as const,
              type: 'monthly' as const,
              custom: true,
              completed: false,
              dbId: data.id
            };
            setCustomGoals([...customGoals, goal]);
          }
        }
      }
      
      setShowAddGoalPopup(false);
      setNewGoalAmount('');
      setNewGoalTimeframe('');
      setNewGoalMonthlyAmount('');
      setNewGoalMonthlyEurAmount('');
      setNewGoalMonthlyCurrency('btc');
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Er is een fout opgetreden bij het toevoegen van het doel. Probeer het opnieuw.');
    }
  };

  // Check monthly goals - check if user has deposited this month
  const checkMonthlyGoal = (goal: any) => {
    if (goal.type !== 'monthly') return null;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Check if there are transactions this month
    const thisMonthTransactions = walletTransactions.filter(tx => {
      const txDate = new Date(tx.time * 1000);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && tx.value > 0;
    });
    
    const hasDepositedThisMonth = thisMonthTransactions.length > 0;
    
    if (goal.monthlyCurrency === 'btc') {
      // Check if deposited amount matches or exceeds monthly goal
      const totalDeposited = thisMonthTransactions.reduce((sum, tx) => sum + (Math.abs(tx.value) / 100000000), 0);
      return {
        deposited: hasDepositedThisMonth && totalDeposited >= goal.monthlyAmount,
        amount: totalDeposited
      };
    } else {
      // For EUR goals, just check if any deposit was made
      return {
        deposited: hasDepositedThisMonth,
        amount: 0
      };
    }
  };

  // Analyze monthly goal transactions for popup
  const analyzeMonthlyGoalTransactions = (goal: any) => {
    if (goal.type !== 'monthly') return null;

    const now = new Date();
    // Try to get created_at from goal
    let goalStartDate = new Date();
    if (goal.created_at) {
      goalStartDate = new Date(goal.created_at);
    } else {
      // Fallback: start from 6 months ago
      goalStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }
    
    const months: any[] = [];
    
    // Get all deposit transactions (positive value)
    const depositTransactions = walletTransactions
      .filter(tx => tx.value > 0)
      .map(tx => ({
        ...tx,
        date: new Date(tx.time * 1000),
        amount: Math.abs(tx.value) / 100000000, // Convert to BTC
        txid: tx.hash || ''
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate months from goal start to now
    let currentDate = new Date(goalStartDate.getFullYear(), goalStartDate.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

    while (currentDate <= endDate) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const monthTransactions = depositTransactions.filter(tx => {
        const txMonth = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
        return txMonth === monthKey;
      });

      const totalAmount = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const targetAmount = goal.monthlyAmount || 0;
      const isCurrentMonth = currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
      
      let status: 'completed' | 'missed' | 'made_up' | 'extra' | 'pending' = 'pending';
      if (isCurrentMonth && totalAmount === 0) {
        status = 'pending';
      } else if (totalAmount >= targetAmount) {
        if (totalAmount > targetAmount * 1.1) {
          // More than 10% over target = extra deposit
          status = 'extra';
        } else {
          status = 'completed';
        }
      } else if (totalAmount > 0 && totalAmount < targetAmount) {
        // Partial deposit - check if it's making up for a missed month
        status = 'made_up';
      } else if (!isCurrentMonth && totalAmount === 0) {
        status = 'missed';
      }

      months.push({
        month: currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }),
        monthKey,
        date: new Date(currentDate),
        transactions: monthTransactions,
        totalAmount,
        targetAmount,
        status,
        isCurrentMonth
      });

      // Move to next month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // Check for made-up months (extra deposits that cover missed months)
    const missedMonths = months.filter(m => m.status === 'missed');
    const extraDeposits = months.filter(m => m.status === 'extra' || (m.status === 'completed' && m.totalAmount > m.targetAmount * 1.1));
    
    // Try to match extra deposits with missed months (simplified logic)
    missedMonths.forEach(missed => {
      // Find if there's an extra deposit in a later month that could cover this missed month
      const extraDeposit = extraDeposits.find(extra => 
        extra.date > missed.date && 
        extra.totalAmount >= (missed.targetAmount + extra.targetAmount)
      );
      if (extraDeposit) {
        const monthIndex = months.findIndex(m => m.monthKey === missed.monthKey);
        if (monthIndex !== -1) {
          months[monthIndex].status = 'made_up';
        }
      }
    });

    return {
      months,
      totalDeposited: depositTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      missedCount: months.filter(m => m.status === 'missed').length,
      completedCount: months.filter(m => m.status === 'completed' || m.status === 'made_up').length
    };
  };

  const handleMonthlyGoalClick = (goal: any) => {
    setSelectedMonthlyGoal(goal);
    setShowMonthlyGoalPopup(true);
  };

  const handleDeleteGoal = (goal: any) => {
    setGoalToDelete(goal);
    setShowDeleteConfirmPopup(true);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete || !user?.id) return;

    try {
      // Delete from database if it has a dbId
      if (goalToDelete.dbId) {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', goalToDelete.dbId)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Remove from local state
      setCustomGoals(customGoals.filter(g => g.id !== goalToDelete.id));
      setShowDeleteConfirmPopup(false);
      setGoalToDelete(null);
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Er is een fout opgetreden bij het verwijderen van het doel. Probeer het opnieuw.');
    }
  };

  const handleEditGoal = (goal: any) => {
    setGoalToEdit(goal);
    
    if (goal.type === 'monthly') {
      if (goal.monthlyCurrency === 'btc') {
        setEditGoalMonthlyAmount(goal.monthlyAmount?.toString() || '');
        setEditGoalMonthlyCurrency('btc');
      } else {
        // Extract EUR amount from title
        const eurMatch = goal.title.match(/€(\d+\.?\d*)/);
        setEditGoalMonthlyEurAmount(eurMatch ? eurMatch[1] : '');
        setEditGoalMonthlyCurrency('eur');
      }
    } else {
      // Save goal
      setEditGoalAmount(goal.target?.toString() || '');
      setEditGoalTimeframe(goal.timeframe || '');
    }
    
    setShowEditGoalPopup(true);
  };

  const handleUpdateGoal = async () => {
    if (!goalToEdit || !user?.id || !user?.email) return;

    try {
      if (goalToEdit.type === 'monthly') {
        if (editGoalMonthlyCurrency === 'btc') {
          if (!editGoalMonthlyAmount) return;
          
          const title = `Stort elke maand ${editGoalMonthlyAmount} BTC`;
          const description = `Maandelijks doel: ${editGoalMonthlyAmount} BTC per maand`;

          const { error } = await supabase
            .from('goals')
            .update({
              title: title,
              description: description,
              target_amount: parseFloat(editGoalMonthlyAmount),
              updated_at: new Date().toISOString()
            })
            .eq('id', goalToEdit.dbId)
            .eq('user_id', user.id);

          if (error) throw error;

          // Update local state
          setCustomGoals(customGoals.map(g => 
            g.id === goalToEdit.id 
              ? { ...g, title, monthlyAmount: parseFloat(editGoalMonthlyAmount), monthlyCurrency: 'btc' }
              : g
          ));
        } else {
          if (!editGoalMonthlyEurAmount) return;
          
          const title = `Stort elke maand €${editGoalMonthlyEurAmount}`;
          const description = `Maandelijks doel: €${editGoalMonthlyEurAmount} per maand`;

          const { error } = await supabase
            .from('goals')
            .update({
              title: title,
              description: description,
              target_amount: parseFloat(editGoalMonthlyEurAmount),
              updated_at: new Date().toISOString()
            })
            .eq('id', goalToEdit.dbId)
            .eq('user_id', user.id);

          if (error) throw error;

          // Update local state
          setCustomGoals(customGoals.map(g => 
            g.id === goalToEdit.id 
              ? { ...g, title, monthlyAmount: parseFloat(editGoalMonthlyEurAmount), monthlyCurrency: 'eur' }
              : g
          ));
        }
      } else {
        // Save goal
        if (!editGoalAmount) return;
        
        const timeframeMatch = editGoalTimeframe.match(/(\d+\s*(maanden?|weken?|dagen?))/i);
        const timeframe = timeframeMatch ? timeframeMatch[1] : editGoalTimeframe;
        const title = `Spaar ${editGoalAmount} BTC${timeframe ? ` binnen ${timeframe}` : ''}`;
        const description = timeframe ? `Spaardoel: ${editGoalAmount} BTC binnen ${timeframe}` : `Spaardoel: ${editGoalAmount} BTC`;

        const { error } = await supabase
          .from('goals')
          .update({
            title: title,
            description: description,
            target_amount: parseFloat(editGoalAmount),
            updated_at: new Date().toISOString()
          })
          .eq('id', goalToEdit.dbId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setCustomGoals(customGoals.map(g => 
          g.id === goalToEdit.id 
            ? { ...g, title, target: parseFloat(editGoalAmount), timeframe }
            : g
        ));
      }

      setShowEditGoalPopup(false);
      setGoalToEdit(null);
      setEditGoalAmount('');
      setEditGoalTimeframe('');
      setEditGoalMonthlyAmount('');
      setEditGoalMonthlyEurAmount('');
      setEditGoalMonthlyCurrency('btc');
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Er is een fout opgetreden bij het bijwerken van het doel. Probeer het opnieuw.');
    }
  };

  // Calculate overall progress percentage
  const calculateOverallProgress = () => {
    const allGoalsList = [...customGoals, ...defaultGoals];
    const completedCount = allGoalsList.filter(goal => {
      if (goal.type === 'monthly') {
        const monthlyCheck = checkMonthlyGoal(goal);
        return monthlyCheck?.deposited || false;
      }
      const progress = getGoalProgress(goal);
      return goal.completed || progress.completed;
    }).length;
    return allGoalsList.length > 0 ? (completedCount / allGoalsList.length) * 100 : 0;
  };

  // Custom goals first, then default goals
  const allGoals = [...customGoals, ...defaultGoals];

  const overallProgress = calculateOverallProgress();

                    return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🎯 Jouw Bitcoin Mijlpalen</h3>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Wat betekent dit? &gt;</a>
      </div>
      
      {/* Bitcoin Milestones Section */}
      <div className="mb-6 p-5 bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl border border-orange-200">
        {/* Progress Bar with Milestones */}
        <div className="w-full bg-gray-200 rounded-full h-5 mb-4 relative overflow-visible">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, milestoneProgress.progress))}%` }}
          ></div>
          
          {/* Milestone markers */}
          <div className="absolute inset-0 flex justify-between items-center px-2">
            {btcMilestones.map((milestone) => {
              const isReached = milestoneProgress.reached.includes(milestone.value);
              let position = 0;
              if (milestone.value === 0.01) position = 10;
              else if (milestone.value === 0.1) position = 50;
              else if (milestone.value === 1) position = 100;
              
              return (
                <div
                  key={milestone.value}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)', zIndex: 10 }}
                >
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${isReached ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs mt-1.5 whitespace-nowrap font-medium ${isReached ? 'text-green-700' : 'text-gray-500'}`}>
                    {milestone.label}
                  </span>
                </div>
              );
                          })}
                        </div>
                          </div>

        {/* Milestone Status List */}
        <div className="space-y-2 mb-4">
          {btcMilestones.map((milestone) => {
            const isReached = milestoneProgress.reached.includes(milestone.value);
            const isNext = milestoneProgress.next === milestone.value;
            const milestoneInfo = getMilestoneInfo(milestone.value);
            
            return (
              <div 
                key={milestone.value}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  isReached ? 'bg-green-50 border border-green-200' : 
                  isNext ? 'bg-orange-50 border border-orange-200' : 
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isReached ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isNext ? (
                    <span className="text-orange-600">⏳</span>
                  ) : (
                    <span className="text-gray-400">🔒</span>
                  )}
                          </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{milestone.label}</span>
                    <span className="text-xs text-gray-500">—</span>
                    <span className={`text-sm font-medium ${isReached ? 'text-green-700' : isNext ? 'text-orange-700' : 'text-gray-600'}`}>
                      {milestoneInfo?.title}
                    </span>
                  </div>
                  {isReached && (
                    <p className="text-xs text-green-700 italic">
                      {milestoneInfo?.description}
                    </p>
                  )}
                  {isNext && (
                    <p className="text-xs text-gray-600">
                      Nog {Math.max(0, milestone.value - currentBalance).toFixed(4)} BTC tot deze mijlpaal
                    </p>
                  )}
                </div>
              </div>
            );
          })}
                </div>

        {/* Next Milestone Info */}
        {milestoneProgress.next && (
          <div className="text-center pt-3 border-t border-orange-200">
            <p className="text-sm text-gray-700">
              Nog <span className="font-semibold text-orange-600">{Math.max(0, milestoneProgress.next - currentBalance).toFixed(4)} BTC</span> tot je <span className="font-semibold">{milestoneProgress.next} BTC</span> mijlpaal
            </p>
              </div>
        )}
        {!milestoneProgress.next && (
          <div className="text-center pt-3 border-t border-green-200 bg-green-50 rounded-lg p-3">
            <p className="text-sm font-semibold text-green-700">
              🎉 Gefeliciteerd! Je beheert meer dan 1 BTC!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Je behoort tot een extreem kleine groep wereldwijd
            </p>
            </div>
        )}
      </div>

      {/* Milestone Celebration Popup */}
      {showMilestonePopup && currentMilestoneCelebration !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMilestonePopup(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-6 right-8 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute top-8 left-1/2 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              <div className="absolute top-10 right-4 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
              <div className="absolute top-12 left-8 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                  <PartyPopper className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
                  <Sparkles className="w-6 h-6 text-pink-500 absolute -bottom-1 -left-1 animate-pulse" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Gefeliciteerd!
              </h3>
              
              <p className="text-lg text-gray-700 mb-4">
                Je hebt de mijlpaal van <span className="font-bold text-orange-600">{currentMilestoneCelebration} BTC</span> bereikt.
              </p>
              
              <p className="text-sm text-gray-600 mb-6">
                {currentMilestoneCelebration === 0.01 && "Je hoort nu al bij een kleine groep mensen wereldwijd."}
                {currentMilestoneCelebration === 0.1 && "Je behoort nu tot een zeer kleine groep mensen wereldwijd."}
                {currentMilestoneCelebration === 1 && "Je behoort tot een extreem kleine groep mensen wereldwijd. Dit is een bijzondere prestatie!"}
              </p>
              
              <button
                onClick={() => setShowMilestonePopup(false)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Geweldig! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Section - Only show if there are custom goals */}
      {allGoals.length > 0 && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Jouw doelen</span>
              <span className="text-sm font-semibold text-orange-600">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
        {allGoals.map((goal, index) => {
          const progress = getGoalProgress(goal);
          const isCompleted = goal.completed || progress.completed;
          const monthlyCheck = goal.type === 'monthly' ? checkMonthlyGoal(goal) : null;
          const monthlyCompleted = monthlyCheck?.deposited || false;
          
          // Calculate progress percentage for this goal
          let goalProgress = 0;
          if (goal.type === 'btc' || goal.type === 'milestone_step') {
            goalProgress = goal.completed ? 100 : Math.min(100, (currentBalance / goal.target) * 100);
          } else if (goal.type === 'eur') {
            // For EUR goals, we can calculate based on transactions or set to 0 for now
            goalProgress = goal.completed ? 100 : 0;
          } else if (goal.type === 'monthly') {
            if (monthlyCheck) {
              if (goal.monthlyCurrency === 'btc') {
                goalProgress = monthlyCheck.deposited ? 100 : Math.min(100, (monthlyCheck.amount / goal.monthlyAmount) * 100);
              } else {
                goalProgress = monthlyCheck.deposited ? 100 : 0;
              }
            }
          }
              
              return (
            <div key={goal.id}>
              <div 
                onClick={() => goal.type === 'monthly' && handleMonthlyGoalClick(goal)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCompleted || monthlyCompleted
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                } ${goal.type === 'monthly' ? 'cursor-pointer hover:shadow-md' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted || monthlyCompleted
                    ? 'bg-green-500' 
                    : 'bg-orange-100'
                }`}>
                  {isCompleted || monthlyCompleted ? (
                    <Trophy className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-semibold ${
                      isCompleted || monthlyCompleted ? 'text-white' : 'text-orange-600'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                  <div className="flex-1">
                  <p className={`font-medium ${
                    isCompleted || monthlyCompleted ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {goal.title}
                  </p>
                  {goal.description && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {goal.description}
                    </p>
                  )}
                  {!isCompleted && (goal.type === 'btc' || goal.type === 'milestone_step') && progress.remaining > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      nog {progress.remaining.toFixed(4)} BTC te gaan
                    </p>
                  )}
                  {goal.type === 'monthly' && (
                    <p className={`text-xs mt-0.5 ${
                      monthlyCompleted ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {monthlyCompleted ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Goed gedaan! Je hebt deze maand gestort 🎉
                      </span>
                      ) : (
                        'Je hebt deze maand nog niet gestort'
                      )}
                    </p>
                  )}
                    </div>
                <div className="flex items-center gap-2">
                  {(isCompleted || monthlyCompleted) && (
                    <div className="flex items-center gap-1">
                      <PartyPopper className="w-4 h-4 text-green-600" />
                      <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  {/* Edit and Delete buttons for custom goals */}
                  {goal.custom && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGoal(goal);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Bewerk doel"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(goal);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Verwijder doel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                    </div>
              {/* Progress bar for each goal */}
              {!isCompleted && !monthlyCompleted && (
                <div className="mt-1 ml-11">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, goalProgress))}%` }}
                    ></div>
                  </div>
                    </div>
              )}
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* Subtle CTA */}
      <div className="mt-6 pt-4 border-t border-gray-200">
            <button
          onClick={() => setShowAddGoalPopup(true)}
          className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
            >
          <Plus className="w-4 h-4" />
          Voeg een doel toe
            </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          Of <button onClick={() => onBookAppointment && onBookAppointment()} className="text-orange-600 hover:text-orange-700 underline">plan een begeleid moment</button> om je volgende stap te bespreken
        </p>
        </div>

      {/* Monthly Goal Detail Popup */}
      {showMonthlyGoalPopup && selectedMonthlyGoal && (() => {
        const analysis = analyzeMonthlyGoalTransactions(selectedMonthlyGoal);
        if (!analysis) return null;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMonthlyGoalPopup(false)}>
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedMonthlyGoal.title}</h3>
                <button
                  onClick={() => setShowMonthlyGoalPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
            </div>

              {/* Calendar Overview */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Maandoverzicht</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {analysis.months.map((month) => {
                    let bgColor = 'bg-gray-100';
                    let borderColor = 'border-gray-300';
                    let textColor = 'text-gray-700';
                    let statusText = '';
                    
                    if (month.status === 'completed') {
                      bgColor = 'bg-green-100';
                      borderColor = 'border-green-500';
                      textColor = 'text-green-900';
                      statusText = '✓';
                    } else if (month.status === 'missed') {
                      bgColor = 'bg-red-100';
                      borderColor = 'border-red-500';
                      textColor = 'text-red-900';
                      statusText = '✗';
                    } else if (month.status === 'made_up') {
                      bgColor = 'bg-orange-100';
                      borderColor = 'border-orange-500';
                      textColor = 'text-orange-900';
                      statusText = '↩';
                    } else if (month.status === 'extra') {
                      bgColor = 'bg-blue-100';
                      borderColor = 'border-blue-500';
                      textColor = 'text-blue-900';
                      statusText = '⭐';
                    } else {
                      bgColor = 'bg-gray-100';
                      borderColor = 'border-gray-300';
                      textColor = 'text-gray-600';
                      statusText = month.isCurrentMonth ? '...' : '';
                    }

                    return (
                      <div
                        key={month.monthKey}
                        className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} text-center`}
                      >
                        <div className="text-xs font-semibold mb-1">{month.date.toLocaleDateString('nl-NL', { month: 'short' })}</div>
                        <div className="text-lg font-bold mb-1">{statusText}</div>
                        <div className="text-xs">{month.date.getFullYear()}</div>
                        {month.totalAmount > 0 && (
                          <div className="text-xs mt-1 font-medium">
                            {month.totalAmount.toFixed(4)} {selectedMonthlyGoal.monthlyCurrency === 'btc' ? 'BTC' : '€'}
            </div>
                        )}
          </div>
                    );
                  })}
        </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                    <span>Voltooid</span>
            </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                    <span>Gemist</span>
            </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
                    <span>Goedgemaakt</span>
          </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                    <span>Extra storting</span>
        </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                    <span>Nog te doen</span>
            </div>
          </div>
        </div>

              {/* Transaction Details */}
            <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Transactie overzicht</h4>
                <div className="space-y-3">
                  {analysis.months
                    .filter(month => month.transactions.length > 0)
                    .map((month) => (
                      <div key={month.monthKey} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">{month.month}</h5>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            month.status === 'completed' ? 'bg-green-100 text-green-800' :
                            month.status === 'missed' ? 'bg-red-100 text-red-800' :
                            month.status === 'made_up' ? 'bg-orange-100 text-orange-800' :
                            month.status === 'extra' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {month.status === 'completed' && '✓ Voltooid'}
                            {month.status === 'missed' && '✗ Gemist'}
                            {month.status === 'made_up' && '↩ Goedgemaakt'}
                            {month.status === 'extra' && '⭐ Extra storting'}
                          </span>
      </div>

                        {month.status === 'extra' && (
                          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                            🎉 Goed van je dat je extra hebt gestort!
            </div>
          )}

                        <div className="space-y-2">
                          {month.transactions.map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  month.status === 'completed' ? 'bg-green-500' :
                                  month.status === 'made_up' ? 'bg-orange-500' :
                                  month.status === 'extra' ? 'bg-blue-500' :
                                  'bg-gray-400'
                                }`}></div>
                  <div>
                                  <div className="font-medium text-gray-900">
                                    {tx.amount.toFixed(4)} {selectedMonthlyGoal.monthlyCurrency === 'btc' ? 'BTC' : '€'}
                  </div>
                                  <div className="text-xs text-gray-500">
                                    {tx.date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                              <a
                                href={`https://blockstream.info/tx/${tx.txid || tx.hash || ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
          </div>
                          ))}
        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Totaal deze maand:</span>
                            <span className="font-semibold text-gray-900">
                              {month.totalAmount.toFixed(4)} {selectedMonthlyGoal.monthlyCurrency === 'btc' ? 'BTC' : '€'}
                            </span>
                </div>
                          {month.totalAmount > month.targetAmount && (
                            <div className="mt-1 text-xs text-blue-600">
                              +{(month.totalAmount - month.targetAmount).toFixed(4)} {selectedMonthlyGoal.monthlyCurrency === 'btc' ? 'BTC' : '€'} extra
                </div>
                          )}
                        </div>
              </div>
            ))}
                  
                  {analysis.months.filter(month => month.transactions.length === 0 && month.status === 'missed').length > 0 && (
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h5 className="font-semibold text-red-900 mb-2">Gemiste maanden</h5>
                      <div className="space-y-1">
                        {analysis.months
                          .filter(month => month.transactions.length === 0 && month.status === 'missed')
                          .map((month) => (
                            <div key={month.monthKey} className="text-sm text-red-700">
                              {month.month} - Je kunt deze maand goedmaken met een extra storting
          </div>
                          ))}
                      </div>
                    </div>
                  )}
        </div>
      </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowMonthlyGoalPopup(false)}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </div>
    </div>
  );
      })()}

      {/* Monthly Goal Detail Popup */}
      {showMonthlyGoalPopup && selectedMonthlyGoal && (() => {
        const analysis = analyzeMonthlyGoalTransactions(selectedMonthlyGoal);
        if (!analysis) return null;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMonthlyGoalPopup(false)}>
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedMonthlyGoal.title}</h3>
                <button
                  onClick={() => setShowMonthlyGoalPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Calendar Overview */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Maandoverzicht</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {analysis.months.map((month) => {
                    let bgColor = 'bg-gray-100';
                    let borderColor = 'border-gray-300';
                    let textColor = 'text-gray-700';
                    let statusText = '';
                    
                    if (month.status === 'completed') {
                      bgColor = 'bg-green-100';
                      borderColor = 'border-green-500';
                      textColor = 'text-green-900';
                      statusText = '✓';
                    } else if (month.status === 'missed') {
                      bgColor = 'bg-red-100';
                      borderColor = 'border-red-500';
                      textColor = 'text-red-900';
                      statusText = '✗';
                    } else if (month.status === 'made_up') {
                      bgColor = 'bg-orange-100';
                      borderColor = 'border-orange-500';
                      textColor = 'text-orange-900';
                      statusText = '↩';
                    } else if (month.status === 'extra') {
                      bgColor = 'bg-blue-100';
                      borderColor = 'border-blue-500';
                      textColor = 'text-blue-900';
                      statusText = '⭐';
      } else {
                      bgColor = 'bg-gray-100';
                      borderColor = 'border-gray-300';
                      textColor = 'text-gray-600';
                      statusText = month.isCurrentMonth ? '...' : '';
                    }

  return (
                      <div
                        key={month.monthKey}
                        className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} text-center`}
                      >
                        <div className="text-xs font-semibold mb-1">{month.date.toLocaleDateString('nl-NL', { month: 'short' })}</div>
                        <div className="text-lg font-bold mb-1">{statusText}</div>
                        <div className="text-xs">{month.date.getFullYear()}</div>
                        {month.totalAmount > 0 && (
                          <div className="text-xs mt-1 font-medium">
                            {month.totalAmount.toFixed(4)} {selectedMonthlyGoal.monthlyCurrency === 'btc' ? 'BTC' : '€'}
        </div>
                        )}
                      </div>
                    );
                  })}
      </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                    <span>Voltooid</span>
              </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                    <span>Gemist</span>
            </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
                    <span>Goedgemaakt</span>
              </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                    <span>Extra storting</span>
            </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                    <span>Nog te doen</span>
              </div>
            </div>
        </div>

              {/* Transaction Details */}
                <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Transactie overzicht</h4>
                <div className="space-y-3">
                  {analysis.months
                    .filter(month => month.transactions.length > 0)
                    .map((month) => (
                      <div key={month.monthKey} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">{month.month}</h5>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            month.status === 'completed' ? 'bg-green-100 text-green-800' :
                            month.status === 'missed' ? 'bg-red-100 text-red-800' :
                            month.status === 'made_up' ? 'bg-orange-100 text-orange-800' :
                            month.status === 'extra' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {month.status === 'completed' && '✓ Voltooid'}
                            {month.status === 'missed' && '✗ Gemist'}
                            {month.status === 'made_up' && '↩ Goedgemaakt'}
                            {month.status === 'extra' && '⭐ Extra storting'}
                          </span>
                </div>
                        
                        {month.status === 'extra' && (
                          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                            🎉 Goed van je dat je extra hebt gestort!
                </div>
                        )}

                        <div className="space-y-2">
                          {month.transactions.map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  month.status === 'completed' ? 'bg-green-500' :
                                  month.status === 'made_up' ? 'bg-orange-500' :
                                  month.status === 'extra' ? 'bg-blue-500' :
                                  'bg-gray-400'
                                }`}></div>
                <div>
                                  <div className="font-medium text-gray-900">
                                    {tx.amount.toFixed(4)} {selectedMonthlyGoal.monthlyCurrency === 'btc' ? 'BTC' : '€'}
                </div>
                                  <div className="text-xs text-gray-500">
                                    {tx.date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
                    </div>
                              {tx.txid && (
                                <a
                                  href={`https://blockstream.info/tx/${tx.txid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                    </div>
                          ))}
                    </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Totaal deze maand:</span>
                            <span className="font-semibold text-gray-900">
                              {month.totalAmount.toFixed(4)} {selectedMonthlyGoal.monthlyCurrency === 'btc' ? 'BTC' : '€'}
                            </span>
                  </div>
                          {month.totalAmount > month.targetAmount && (
                            <div className="mt-1 text-xs text-blue-600">
                              +{(month.totalAmount - month.targetAmount).toFixed(4)} {selectedMonthlyGoal.monthlyCurrency === 'btc' ? 'BTC' : '€'} extra
                </div>
              )}
                        </div>
                      </div>
                    ))}
                  
                  {analysis.months.filter(month => month.transactions.length === 0 && month.status === 'missed').length > 0 && (
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h5 className="font-semibold text-red-900 mb-2">Gemiste maanden</h5>
                      <div className="space-y-1">
                        {analysis.months
                          .filter(month => month.transactions.length === 0 && month.status === 'missed')
                          .map((month) => (
                            <div key={month.monthKey} className="text-sm text-red-700">
                              {month.month} - Je kunt deze maand goedmaken met een extra storting
                            </div>
                          ))}
                      </div>
            </div>
          )}
              </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowMonthlyGoalPopup(false)}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Goal Popup */}
      {showEditGoalPopup && goalToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
          setShowEditGoalPopup(false);
          setGoalToEdit(null);
          setEditGoalAmount('');
          setEditGoalTimeframe('');
          setEditGoalMonthlyAmount('');
          setEditGoalMonthlyEurAmount('');
          setEditGoalMonthlyCurrency('btc');
        }}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Doel bewerken</h3>
              <button
                onClick={() => {
                  setShowEditGoalPopup(false);
                  setGoalToEdit(null);
                  setEditGoalAmount('');
                  setEditGoalTimeframe('');
                  setEditGoalMonthlyAmount('');
                  setEditGoalMonthlyEurAmount('');
                  setEditGoalMonthlyCurrency('btc');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {goalToEdit.type === 'monthly' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kies valuta
                    </label>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setEditGoalMonthlyCurrency('btc')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                          editGoalMonthlyCurrency === 'btc'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        <Wallet className="w-4 h-4" /> BTC
                      </button>
                      <button
                        onClick={() => setEditGoalMonthlyCurrency('eur')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                          editGoalMonthlyCurrency === 'eur'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" /> EUR
                      </button>
                    </div>
                    {editGoalMonthlyCurrency === 'btc' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hoeveel BTC per maand?
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={editGoalMonthlyAmount}
                          onChange={(e) => setEditGoalMonthlyAmount(e.target.value)}
                          placeholder="0.001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hoeveel Euro per maand?
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editGoalMonthlyEurAmount}
                          onChange={(e) => setEditGoalMonthlyEurAmount(e.target.value)}
                          placeholder="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hoeveel BTC wil je sparen?
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editGoalAmount}
                      onChange={(e) => setEditGoalAmount(e.target.value)}
                      placeholder="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Binnen hoeveel tijd? (bijv. "3 maanden")
                    </label>
                    <input
                      type="text"
                      value={editGoalTimeframe}
                      onChange={(e) => setEditGoalTimeframe(e.target.value)}
                      placeholder="3 maanden"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleUpdateGoal}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Opslaan
                </button>
                <button
                  onClick={() => {
                    setShowEditGoalPopup(false);
                    setGoalToEdit(null);
                    setEditGoalAmount('');
                    setEditGoalTimeframe('');
                    setEditGoalMonthlyAmount('');
                    setEditGoalMonthlyEurAmount('');
                    setEditGoalMonthlyCurrency('btc');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmPopup && goalToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirmPopup(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Doel verwijderen</h3>
              <button
                onClick={() => setShowDeleteConfirmPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              Weet je zeker dat je het doel <strong>"{goalToDelete.title}"</strong> wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>

            <div className="flex gap-2">
              <button
                onClick={confirmDeleteGoal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Ja, verwijderen
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirmPopup(false);
                  setGoalToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Popup */}
      {showAddGoalPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddGoalPopup(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Nieuw doel toevoegen</h3>
              <button
                onClick={() => setShowAddGoalPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setNewGoalType('save')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newGoalType === 'save'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  Spaar doel
                </button>
                <button
                  onClick={() => setNewGoalType('monthly')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newGoalType === 'monthly'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  Maandelijks
                </button>
              </div>
              
              {newGoalType === 'save' ? (
                <>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hoeveel BTC wil je sparen?
                    </label>
                <input
                  type="number"
                      step="0.0001"
                      value={newGoalAmount}
                      onChange={(e) => setNewGoalAmount(e.target.value)}
                      placeholder="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Binnen hoeveel tijd? (bijv. "3 maanden")
                    </label>
                <input
                      type="text"
                      value={newGoalTimeframe}
                      onChange={(e) => setNewGoalTimeframe(e.target.value)}
                      placeholder="3 maanden"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kies valuta
                    </label>
                    <div className="flex gap-2">
            <button
                        onClick={() => setNewGoalMonthlyCurrency('btc')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newGoalMonthlyCurrency === 'btc'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        BTC
            </button>
            <button
                        onClick={() => setNewGoalMonthlyCurrency('eur')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newGoalMonthlyCurrency === 'eur'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        Euro
            </button>
          </div>
        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {newGoalMonthlyCurrency === 'btc' ? 'Hoeveel BTC per maand?' : 'Hoeveel Euro per maand?'}
                    </label>
                    <input
                      type="number"
                      step={newGoalMonthlyCurrency === 'btc' ? '0.0001' : '1'}
                      value={newGoalMonthlyCurrency === 'btc' ? newGoalMonthlyAmount : newGoalMonthlyEurAmount}
                      onChange={(e) => {
                        if (newGoalMonthlyCurrency === 'btc') {
                          setNewGoalMonthlyAmount(e.target.value);
                        } else {
                          setNewGoalMonthlyEurAmount(e.target.value);
                        }
                      }}
                      placeholder={newGoalMonthlyCurrency === 'btc' ? '0.001' : '100'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddGoal}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Toevoegen
                </button>
                  <button
                    onClick={() => {
                    setShowAddGoalPopup(false);
                    setNewGoalAmount('');
                    setNewGoalTimeframe('');
                    setNewGoalMonthlyAmount('');
                    setNewGoalMonthlyEurAmount('');
                    setNewGoalMonthlyCurrency('btc');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuleren
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
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
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ledger - 1/2 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl relative">
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

      {/* Coinbase - 1/2 */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-xl relative">
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