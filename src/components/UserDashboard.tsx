import { useState, useEffect } from 'react';
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
  BookOpen
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
  console.log('🎯 UserDashboard component loaded');
  const { user } = useSupabaseAuth();
  const { theme } = useTheme();
  const { isImpersonating, impersonatedUser } = usePermissions();
  const { isOpen: isProfilePopupOpen, closeProfilePopup } = useProfilePopup();
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
        const price = await bitcoinPriceService.getCurrentPrice();
        setBitcoinPrice(price);

        // Load user profile from database
        if (user) {
          try {
            // Fetch user profile from accounts table
            const response = await fetch('/api/accounts');
            if (response.ok) {
              const accounts = await response.json();
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

        // Load goals from database (if goals table exists)
        // TODO: Implement goals table and load real goals
        setGoals([]);

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
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('account_approved, first_appointment_completed')
              .eq('email', user.email)
              .single();
            
            if (userData && !userError) {
              setAccountApproved(userData.account_approved || false);
              setFirstAppointmentCompleted(userData.first_appointment_completed || false);
            } else if (userError?.code === 'PGRST204' || userError?.code === 'PGRST116') {
              // Column doesn't exist or no row found, try accounts table
              const { data: accountData } = await supabase
                .from('accounts')
                .select('account_approved, first_appointment_completed')
                .eq('email', user.email)
                .single();
              
              if (accountData) {
                setAccountApproved(accountData.account_approved || false);
                setFirstAppointmentCompleted(accountData.first_appointment_completed || false);
              } else {
                // Default to false if columns don't exist
                setAccountApproved(false);
                setFirstAppointmentCompleted(false);
              }
            }
          } catch (error) {
            // Silently fail - columns might not exist yet
            console.warn('Could not load account approval status. Columns may not exist. Run add-users-account-status-columns.sql');
            setAccountApproved(false);
            setFirstAppointmentCompleted(false);
          }

          // Check for unread admin messages
          const { data: adminMessages } = await supabase
            .from('support_messages')
            .select('created_at')
            .eq('email', user.email)
            .eq('from_admin', true)
            .order('created_at', { ascending: false });

          const { data: readStatus } = await supabase
            .from('user_chat_read_status')
            .select('last_read_at')
            .eq('user_email', user.email)
            .single();

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
    
    // Poll for unread messages every 30 seconds
    const interval = setInterval(() => {
      if (user?.email) {
        supabase
          .from('support_messages')
          .select('created_at')
          .eq('email', user.email)
          .eq('from_admin', true)
          .order('created_at', { ascending: false })
          .then(({ data: adminMessages }) => {
            supabase
              .from('user_chat_read_status')
              .select('last_read_at')
              .eq('user_email', user.email)
              .single()
              .then(({ data: readStatus }) => {
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
              });
          });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mijn Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Welkom terug, {getDisplayName(user, isImpersonating, impersonatedUser, userProfile)}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
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
                { id: 'education', label: 'Educatie', icon: BookOpen, alwaysEnabled: false },
                { id: 'helpdesk', label: 'Helpdesk', icon: Mail, alwaysEnabled: false, badge: unreadChatCount },
              ].map((tab) => {
                const isEnabled = tab.alwaysEnabled || accountApproved;
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
                      <span className="flex-1">{tab.label}</span>
                      {tab.badge && tab.badge > 0 && (
                        <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {tab.badge > 9 ? '9+' : tab.badge}
                        </span>
                      )}
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
            />}
            {activeTab === 'goals' && accountApproved && <GoalsTab goals={goals} setGoals={setGoals} />}
            {activeTab === 'portfolio' && accountApproved && <PortfolioTab portfolio={portfolio} setPortfolio={setPortfolio} />}
            {activeTab === 'appointments' && <AppointmentsTab 
              appointments={appointments} 
              setAppointments={setAppointments}
              onBookAppointment={() => setShowAppointmentPopup(true)}
              isImpersonating={isImpersonating}
              impersonatedUser={impersonatedUser}
              accountApproved={accountApproved}
              firstAppointmentCompleted={firstAppointmentCompleted}
            />}
            {activeTab === 'education' && accountApproved && <EducationTab />}
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
                        .single();

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
          setShowFirstAppointmentPrompt(false);
          setActiveTab('appointments');
          // Reload account status to check if approved
          if (user?.email) {
            supabase
              .from('users')
              .select('account_approved, first_appointment_completed')
              .eq('email', user.email)
              .single()
              .then(({ data: userData, error: userError }) => {
                if (userData && !userError) {
                  setAccountApproved(userData.account_approved || false);
                  setFirstAppointmentCompleted(userData.first_appointment_completed || false);
                } else if (userError?.code === 'PGRST204' || userError?.code === 'PGRST116') {
                  // Try accounts table as fallback
                  supabase
                    .from('accounts')
                    .select('account_approved, first_appointment_completed')
                    .eq('email', user.email)
                    .single()
                    .then(({ data: accountData }) => {
                      if (accountData) {
                        setAccountApproved(accountData.account_approved || false);
                        setFirstAppointmentCompleted(accountData.first_appointment_completed || false);
                      }
                    });
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
function OverviewTab({ userProfile, goals, appointments, portfolio, onBookAppointment, accountApproved }: any) {
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
  
  const activeGoals = displayGoals.filter((goal) => (goal.status as string) === 'active').length;
  // Calculate upcoming appointments from loaded userAppointments
  const upcomingAppointments = userAppointments.filter((apt: any) => 
    (apt.status === 'pending' || apt.status === 'confirmed') && new Date(apt.date) > new Date()
  ).length;
  const [hasWallet, setHasWallet] = useState(false);
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  
  // Load appointments from database - do this immediately when component mounts
  useEffect(() => {
    const loadAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const email = authData?.user?.email;
        if (!email) {
          setAppointmentsLoading(false);
          return;
        }

        console.log('🔍 Loading appointments for OverviewTab, email:', email);

        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_email', email)
          .in('status', ['pending', 'confirmed']) // Only load pending and confirmed
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) {
          console.error('❌ Error loading appointments:', error);
          setAppointmentsLoading(false);
          return;
        }

        console.log('✅ Loaded appointments in OverviewTab:', data?.length || 0, data);
        setUserAppointments(data || []);
      } catch (error) {
        console.error('❌ Error loading appointments:', error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    // Load immediately
    loadAppointments();

    // Listen for appointment refresh events
    const handleRefresh = () => {
      console.log('🔄 Refresh event received in OverviewTab, reloading appointments...');
      loadAppointments();
    };
    window.addEventListener('refreshAppointments', handleRefresh);
    
    // Also refresh when the tab becomes visible
    const visibilityChangeHandler = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became visible, reloading appointments...');
        loadAppointments();
      }
    };
    document.addEventListener('visibilitychange', visibilityChangeHandler);
    
    return () => {
      window.removeEventListener('refreshAppointments', handleRefresh);
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
    };
  }, []);
  
  // Find user's appointment (pending or confirmed) - prioritize confirmed, then pending
  // Only count appointments that are not cancelled
  const userAppointment = userAppointments
    .filter((apt: any) => apt.status !== 'cancelled')
    .find((apt: any) => apt.status === 'confirmed') 
    || userAppointments
      .filter((apt: any) => apt.status !== 'cancelled')
      .find((apt: any) => apt.status === 'pending');
  const hasAppointment = !!userAppointment && !appointmentsLoading;
  
  // Debug log
  useEffect(() => {
    console.log('🔍 OverviewTab appointment check:', {
      appointmentsLoading,
      userAppointmentsCount: userAppointments.length,
      hasAppointment,
      userAppointment,
      userAppointments,
      filteredAppointments: userAppointments.filter((apt: any) => 
        apt.status === 'pending' || apt.status === 'confirmed'
      )
    });
  }, [userAppointments, hasAppointment, userAppointment, appointmentsLoading]);
  
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

  // Load wallet status and questions on mount
  useEffect(() => {
    const loadWalletStatus = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const email = authData?.user?.email || null;
        if (!email) return;

        const { data: wallet } = await supabase
          .from('wallets')
          .select('id')
          .eq('email', email)
          .limit(1);

        setHasWallet(!!wallet && wallet.length > 0);
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
    loadQuestions();
  }, [userAppointment]);

  const handleAddWallet = async () => {
    if (!walletForm.address.trim()) {
      alert('Voer een geldig wallet adres in');
      return;
    }

    setIsAddingWallet(true);
    try {
      // Get current user email
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email || null;
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

      const { error: insertErr } = await supabase
        .from('wallets')
        .insert([{ email, address: walletForm.address.trim(), name: walletForm.name?.trim() || null, type: walletForm.type, created_at: new Date().toISOString() }]);
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Overzicht</h2>

      {/* Appointment Status Block */}
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
      ) : !hasAppointment ? (
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
      ) : userAppointment.status === 'pending' ? (
        // Pending appointment - waiting for confirmation (green block, disabled button)
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Afspraak ingepland ⏳</h3>
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
              </div>
              <p className="bg-white bg-opacity-20 rounded-lg p-3 text-green-50">
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
                      const { data: authData } = await supabase.auth.getUser();
                      const email = authData?.user?.email;
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
      )}

      {/* Wallet Status - Only show if account is approved */}
      {accountApproved && !hasWallet && (
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
                  className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Wallet toevoegen
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

      {/* Wallet Success - Shows when wallet is being added */}
      {hasWallet && (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aankomende Afspraken</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Portfolio Waarde</p>
              <p className="text-2xl font-bold text-gray-900">
                €{portfolio?.value?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Totaal Sessies</p>
              <p className="text-2xl font-bold text-gray-900">{userProfile?.totalSessions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recente Doelen</h3>
          <div className="space-y-3">
            {goals.slice(0, 3).map((goal: Goal) => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{goal.title}</p>
                  <p className="text-sm text-gray-600">{goal.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    €{goal.currentAmount.toLocaleString()} / €{goal.targetAmount.toLocaleString()}
                  </p>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aankomende Afspraken</h3>
          <div className="space-y-3">
            {userAppointments.filter((apt: any) => 
              (apt.status === 'pending' || apt.status === 'confirmed') && new Date(apt.date) >= new Date()
            ).slice(0, 3).map((appointment: any) => (
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ledger Block - Step 1 */}
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
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Bekijk Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Coinbase Block - Step 2 */}
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
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Start met Coinbase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Goals Tab Component
function GoalsTab({ goals, setGoals }: any) {
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showBitcoinCalculator, setShowBitcoinCalculator] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    targetDate: '',
    category: 'other'
  });
  const [bitcoinGoal, setBitcoinGoal] = useState({
    targetAmount: 0,
    currentAmount: 0,
    monthlyInvestment: 0,
    targetDate: ''
  });

  const handleCreateGoal = async () => {
    try {
      // In production, this would create in Supabase
      const goal = {
        id: Date.now().toString(),
        ...newGoal,
        currentAmount: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setGoals([...goals, goal]);
      setShowNewGoal(false);
      setNewGoal({ title: '', description: '', targetAmount: 0, targetDate: '', category: 'other' });
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const calculateBitcoinGoal = () => {
    if (!bitcoinGoal.targetAmount || !bitcoinGoal.currentAmount || !bitcoinGoal.monthlyInvestment) {
      return null;
    }

    const remainingAmount = bitcoinGoal.targetAmount - bitcoinGoal.currentAmount;
    const monthsNeeded = Math.ceil(remainingAmount / bitcoinGoal.monthlyInvestment);
    const totalInvestment = bitcoinGoal.currentAmount + (bitcoinGoal.monthlyInvestment * monthsNeeded);
    
    return {
      remainingAmount,
      monthsNeeded,
      totalInvestment,
      monthlyInvestment: bitcoinGoal.monthlyInvestment
    };
  };

  const handleCreateBitcoinGoal = () => {
    const calculation = calculateBitcoinGoal();
    if (!calculation) return;

    const goal = {
      id: Date.now().toString(),
      title: `Bitcoin Doel: ${bitcoinGoal.targetAmount} BTC`,
      description: `Maandelijks €${calculation.monthlyInvestment} investeren om ${bitcoinGoal.targetAmount} BTC te bereiken`,
      targetAmount: bitcoinGoal.targetAmount,
      currentAmount: bitcoinGoal.currentAmount,
      targetDate: bitcoinGoal.targetDate,
      status: 'active',
      category: 'bitcoin',
      createdAt: new Date().toISOString(),
      isBitcoinGoal: true,
      targetBitcoinAmount: bitcoinGoal.targetAmount,
      monthlyInvestment: calculation.monthlyInvestment
    };
    
    setGoals([...goals, goal]);
    setShowBitcoinCalculator(false);
    setBitcoinGoal({ targetAmount: 0, currentAmount: 0, monthlyInvestment: 0, targetDate: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mijn Doelen</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBitcoinCalculator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Bitcoin Calculator
          </button>
          <button
            onClick={() => setShowNewGoal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuw Doel
          </button>
        </div>
      </div>

      {showNewGoal && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nieuw Doel Toevoegen</h3>
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
                <option value="other">Anders</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doelbedrag (€)</label>
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
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCreateGoal}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Doel Toevoegen
            </button>
            <button
              onClick={() => setShowNewGoal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Bitcoin Calculator Modal */}
      {showBitcoinCalculator && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Bitcoin Doel Calculator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doel: Aantal Bitcoin</label>
              <input
                type="number"
                step="0.00000001"
                value={bitcoinGoal.targetAmount}
                onChange={(e) => setBitcoinGoal({ ...bitcoinGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bijv. 0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Huidige Bitcoin</label>
              <input
                type="number"
                step="0.00000001"
                value={bitcoinGoal.currentAmount}
                onChange={(e) => setBitcoinGoal({ ...bitcoinGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bijv. 0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maandelijkse Investering (€)</label>
              <input
                type="number"
                value={bitcoinGoal.monthlyInvestment}
                onChange={(e) => setBitcoinGoal({ ...bitcoinGoal, monthlyInvestment: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bijv. 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doel Datum</label>
              <input
                type="date"
                value={bitcoinGoal.targetDate}
                onChange={(e) => setBitcoinGoal({ ...bitcoinGoal, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Calculation Results */}
          {calculateBitcoinGoal() && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Berekening Resultaten:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Nog nodig:</span>
                  <p className="text-blue-900 font-bold">{calculateBitcoinGoal()?.remainingAmount.toFixed(8)} BTC</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Maanden nodig:</span>
                  <p className="text-blue-900 font-bold">{calculateBitcoinGoal()?.monthsNeeded} maanden</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Totaal investering:</span>
                  <p className="text-blue-900 font-bold">€{calculateBitcoinGoal()?.totalInvestment.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleCreateBitcoinGoal}
              disabled={!calculateBitcoinGoal()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Bitcoin Doel Toevoegen
            </button>
            <button
              onClick={() => setShowBitcoinCalculator(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal: Goal) => (
          <div key={goal.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{goal.category}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                goal.status === 'active' ? 'bg-green-100 text-green-800' :
                goal.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {goal.status === 'active' ? 'Actief' : goal.status === 'completed' ? 'Voltooid' : 'Gepauzeerd'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Voortgang</span>
                <span className="font-medium">
                  €{goal.currentAmount.toLocaleString()} / €{goal.targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                <span>{new Date(goal.targetDate).toLocaleDateString('nl-NL')}</span>
              </div>
            </div>
          </div>
        ))}
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
              €{portfolio?.value?.toLocaleString() || '0'}
            </p>
            <p className={`text-sm ${portfolio?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolio?.change >= 0 ? '+' : ''}€{portfolio?.change?.toLocaleString() || '0'} 
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
                <p className="text-lg font-semibold text-gray-900">€{asset.value.toLocaleString()}</p>
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
      console.log('🔄 Refreshing appointments list...');
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
      console.warn('⚠️ No effectiveUserEmail, cannot load appointments');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('📋 Loading appointments for:', {
        effectiveUserEmail,
        isImpersonating: contextImpersonating || isImpersonating,
        impersonatedUser: contextImpersonatedUser || impersonatedUser,
        userEmail: user?.email
      });
      
      // During impersonation, admin can read all appointments
      // We need to filter by user_email in the query or in the frontend
      let query = supabase
        .from('appointments')
        .select('*');
      
      // Filter by user email - this should work for both regular users and admin during impersonation
      query = query.eq('user_email', effectiveUserEmail);
      
      // Order results
      query = query.order('date', { ascending: true })
                   .order('start_time', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error loading appointments:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          effectiveUserEmail
        });
        
        // If RLS error, try a different approach
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          console.warn('⚠️ RLS blocked query, trying alternative...');
          // This might still fail, but at least we log it
        }
        
        throw error;
      }
      
      console.log('✅ Loaded appointments:', {
        count: data?.length || 0,
        appointments: data,
        forEmail: effectiveUserEmail
      });
      
      // Filter out any null/undefined entries
      const validAppointments = (data || []).filter(apt => apt && apt.id);
      
      setUserAppointments(validAppointments);
      setAppointments(validAppointments);
      
      if (validAppointments.length === 0 && data && data.length > 0) {
        console.warn('⚠️ Data returned but filtered out:', data);
      }
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
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