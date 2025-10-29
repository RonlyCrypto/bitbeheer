import { useState, useEffect } from 'react';
import { 
  User, 
  Target, 
  Calendar, 
  TrendingUp, 
  Settings, 
  Bell, 
  BarChart3, 
  PieChart,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  BookOpen,
  Users,
  DollarSign,
  Activity,
  ExternalLink,
  Calculator,
  Info,
  Wallet,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { bitcoinPriceService, BitcoinPrice } from '../services/bitcoinPriceService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { getDisplayName, getDisplayEmail } from '../utils/emailUtils';

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

        // Load goals - using mock data for now
        setGoals([
          {
            id: '1',
            title: 'Bitcoin Emergency Fund',
            description: 'Build a 6-month emergency fund in Bitcoin',
            targetAmount: 50000,
            currentAmount: 15000,
            targetDate: '2024-12-31',
            status: 'active',
            category: 'emergency',
            createdAt: '2024-01-15'
          },
          {
            id: '2',
            title: 'House Down Payment',
            description: 'Save for house down payment using DCA strategy',
            targetAmount: 100000,
            currentAmount: 25000,
            targetDate: '2025-06-30',
            status: 'active',
            category: 'house',
            createdAt: '2024-02-01'
          }
        ]);

        // Load appointments - using mock data for now
        setAppointments([
          {
            id: '1',
            title: 'Portfolio Review',
            date: '2024-11-15',
            time: '14:00',
            duration: 60,
            type: 'review',
            status: 'scheduled',
            notes: 'Quarterly portfolio review and strategy adjustment'
          },
          {
            id: '2',
            title: 'DCA Strategy Consultation',
            date: '2024-11-22',
            time: '10:00',
            duration: 90,
            type: 'consultation',
            status: 'scheduled',
            notes: 'Discuss optimal DCA amounts and timing'
          }
        ]);
        setShowFirstAppointmentPrompt(false);

        // Load portfolio - using mock data for now
        setPortfolio({
          id: '1',
          name: 'Mijn Portfolio',
          value: 45000,
          change: 2500,
          changePercent: 5.9,
          assets: [
            { name: 'Bitcoin', symbol: 'BTC', amount: 0.5, value: 20000, percentage: 44.4 },
            { name: 'Ethereum', symbol: 'ETH', amount: 2.0, value: 15000, percentage: 33.3 },
            { name: 'Diversified Altcoins', symbol: 'ALTS', amount: 1000, value: 10000, percentage: 22.2 }
          ]
        });
        setHasWallet(true);

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleAddWallet = async () => {
    if (!walletForm.address.trim()) {
      alert('Voer een geldig wallet adres in');
      return;
    }

    setIsAddingWallet(true);
    try {
      // Simulate API call to add wallet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update portfolio with new wallet
      const newPortfolio = {
        id: '1',
        name: 'Mijn Portfolio',
        value: 45000,
        change: 2500,
        changePercent: 5.9,
        assets: [
          { name: 'Bitcoin', symbol: 'BTC', amount: 0.5, value: 20000, percentage: 44.4 },
          { name: 'Ethereum', symbol: 'ETH', amount: 2.0, value: 15000, percentage: 33.3 },
          { name: 'Diversified Altcoins', symbol: 'ALTS', amount: 1000, value: 10000, percentage: 22.2 }
        ]
      };
      
      setPortfolio(newPortfolio);
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
                <p className="text-gray-600 dark:text-gray-400">Welkom terug, {getDisplayName(user, isImpersonating, impersonatedUser)}!</p>
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
                { id: 'overview', label: 'Overzicht', icon: BarChart3 },
                { id: 'profile', label: 'Profiel', icon: User },
                { id: 'goals', label: 'Doelen', icon: Target },
                { id: 'portfolio', label: 'Portfolio', icon: PieChart },
                { id: 'appointments', label: 'Afspraken', icon: Calendar },
                { id: 'education', label: 'Educatie', icon: BookOpen },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab userProfile={userProfile} goals={goals} appointments={appointments} portfolio={portfolio} />}
            {activeTab === 'profile' && <ProfileTab userProfile={userProfile} setUserProfile={setUserProfile} user={user} isImpersonating={isImpersonating} impersonatedUser={impersonatedUser} />}
            {activeTab === 'goals' && <GoalsTab goals={goals} setGoals={setGoals} />}
            {activeTab === 'portfolio' && <PortfolioTab portfolio={portfolio} setPortfolio={setPortfolio} />}
            {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} setAppointments={setAppointments} />}
            {activeTab === 'education' && <EducationTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ userProfile, goals, appointments, portfolio }: any) {
  const activeGoals = goals.filter((goal: Goal) => goal.status === 'active').length;
  const upcomingAppointments = appointments.filter((apt: Appointment) => 
    apt.status === 'scheduled' && new Date(apt.date) > new Date()
  ).length;
  const [hasWallet, setHasWallet] = useState(false);
  const [showFirstAppointmentPrompt, setShowFirstAppointmentPrompt] = useState(appointments.length === 0);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [walletForm, setWalletForm] = useState({
    address: '',
    name: '',
    type: 'bitcoin'
  });
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  const handleAddWallet = async () => {
    if (!walletForm.address.trim()) {
      alert('Voer een geldig wallet adres in');
      return;
    }

    setIsAddingWallet(true);
    try {
      // Simulate API call to add wallet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update portfolio with new wallet
      const newPortfolio = {
        id: '1',
        name: 'Mijn Portfolio',
        value: 45000,
        change: 2500,
        changePercent: 5.9,
        assets: [
          { name: 'Bitcoin', symbol: 'BTC', amount: 0.5, value: 20000, percentage: 44.4 },
          { name: 'Ethereum', symbol: 'ETH', amount: 2.0, value: 15000, percentage: 33.3 },
          { name: 'Diversified Altcoins', symbol: 'ALTS', amount: 1000, value: 10000, percentage: 22.2 }
        ]
      };
      
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

      {/* First Appointment Prompt */}
      {showFirstAppointmentPrompt && (
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
                  setShowFirstAppointmentPrompt(false);
                  setActiveTab('appointments');
                }}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Plan je afspraak in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Status */}
      {!hasWallet && (
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
            {appointments.slice(0, 3).map((appointment: Appointment) => (
              <div key={appointment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{appointment.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString('nl-NL')} om {appointment.time}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status === 'scheduled' ? 'Gepland' : appointment.status}
                </span>
              </div>
            ))}
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

// Profile Tab Component
function ProfileTab({ userProfile, setUserProfile, user, isImpersonating, impersonatedUser }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    first_name: userProfile?.first_name || '',
    last_name: userProfile?.last_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    company: userProfile?.company || '',
    bio: userProfile?.bio || '',
    investmentGoal: userProfile?.investmentGoal || '',
    preferredContact: userProfile?.preferredContact || 'email',
    newsletterSubscription: userProfile?.newsletterSubscription || false,
    marketingConsent: userProfile?.marketingConsent || false
  });

  const handleSave = async () => {
    try {
      // In production, this would update Supabase
      setUserProfile({ ...userProfile, ...formData });
      setIsEditing(false);
      alert('Profiel succesvol bijgewerkt!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Fout bij het bijwerken van profiel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mijn Profiel</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          {isEditing ? 'Annuleren' : 'Bewerken'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Naam *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={getDisplayEmail(user, isImpersonating, impersonatedUser, true)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Voornaam</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Achternaam</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefoon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locatie</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bedrijf/Organisatie</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Investeringsdoel</label>
            <select
              value={formData.investmentGoal}
              onChange={(e) => setFormData({ ...formData, investmentGoal: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            >
              <option value="">Selecteer je investeringsdoel</option>
              <option value="pensioen">Pensioen opbouw</option>
              <option value="sparen">Lange termijn sparen</option>
              <option value="trading">Actief trading</option>
              <option value="diversificatie">Portfolio diversificatie</option>
              <option value="leren">Leren over Bitcoin</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Over mij</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Opslaan
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        )}
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
function AppointmentsTab({ appointments, setAppointments }: any) {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    type: 'consultation',
    notes: '',
    reason: ''
  });

  // Load available appointment slots
  useEffect(() => {
    const loadAvailableSlots = async () => {
      try {
        // Mock available slots - in production this would come from Supabase
        const mockSlots = [
          { id: '1', date: '2024-11-20', time: '09:00', duration: 20, available: true },
          { id: '2', date: '2024-11-20', time: '10:00', duration: 20, available: true },
          { id: '3', date: '2024-11-20', time: '14:00', duration: 20, available: false },
          { id: '4', date: '2024-11-21', time: '09:00', duration: 20, available: true },
          { id: '5', date: '2024-11-21', time: '11:00', duration: 20, available: true },
          { id: '6', date: '2024-11-21', time: '15:00', duration: 20, available: false },
          { id: '7', date: '2024-11-22', time: '10:00', duration: 20, available: true },
          { id: '8', date: '2024-11-22', time: '13:00', duration: 20, available: true },
        ];
        setAvailableSlots(mockSlots);
      } catch (error) {
        console.error('Error loading available slots:', error);
      }
    };

    loadAvailableSlots();
  }, []);

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Selecteer een datum en tijd');
      return;
    }

    try {
      // In production, this would create in Supabase
      const appointment = {
        id: Date.now().toString(),
        title: newAppointment.title || 'Eerste Afspraak',
        date: selectedDate,
        time: selectedTime,
        duration: 20,
        type: 'consultation',
        notes: newAppointment.notes,
        reason: newAppointment.reason,
        status: 'pending_approval',
        created_at: new Date().toISOString()
      };
      setAppointments([...appointments, appointment]);
      setShowNewAppointment(false);
      setNewAppointment({ title: '', date: '', time: '', duration: 60, type: 'consultation', notes: '', reason: '' });
      setSelectedDate('');
      setSelectedTime('');
      alert('Afspraak aanvraag verzonden! Giovanni zal deze beoordelen en bevestigen.');
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const getAvailableSlotsForDate = (date: string) => {
    return availableSlots.filter(slot => slot.date === date && slot.available);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mijn Afspraken</h2>
        <button
          onClick={() => setShowNewAppointment(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Afspraak Aanvragen
        </button>
      </div>

      {/* Appointment Request Form */}
      {showNewAppointment && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Afspraak Aanvragen</h3>
          
          <div className="space-y-6">
            {/* Reason for appointment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reden voor afspraak</label>
              <select
                value={newAppointment.reason}
                onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Selecteer een reden</option>
                <option value="first_consultation">Eerste kennismaking (20 min)</option>
                <option value="portfolio_review">Portfolio review</option>
                <option value="strategy_discussion">Strategie bespreking</option>
                <option value="goal_setting">Doelen stellen</option>
                <option value="other">Anders</option>
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecteer Datum</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Array.from(new Set(availableSlots.map(slot => slot.date))).map(date => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedDate === date
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{formatDate(date)}</div>
                    <div className="text-sm text-gray-600">
                      {getAvailableSlotsForDate(date).length} beschikbare tijden
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecteer Tijd</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getAvailableSlotsForDate(selectedDate).map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        selectedTime === slot.time
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{slot.time}</div>
                      <div className="text-sm text-gray-600">{slot.duration} min</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aanvullende opmerkingen (optioneel)</label>
              <textarea
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Vertel ons meer over wat je wilt bespreken..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCreateAppointment}
                disabled={!selectedDate || !selectedTime}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Afspraak Aanvragen
              </button>
              <button
                onClick={() => {
                  setShowNewAppointment(false);
                  setSelectedDate('');
                  setSelectedTime('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewAppointment && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nieuwe Afspraak Inplannen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
              <input
                type="text"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={newAppointment.type}
                onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="consultation">Consultatie</option>
                <option value="review">Review</option>
                <option value="strategy">Strategie</option>
                <option value="follow-up">Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Datum</label>
              <input
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tijd</label>
              <input
                type="time"
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duur (minuten)</label>
              <select
                value={newAppointment.duration}
                onChange={(e) => setNewAppointment({ ...newAppointment, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={30}>30 minuten</option>
                <option value={60}>1 uur</option>
                <option value={90}>1.5 uur</option>
                <option value={120}>2 uur</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notities</label>
              <textarea
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCreateAppointment}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Afspraak Inplannen
            </button>
            <button
              onClick={() => setShowNewAppointment(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {appointments.map((appointment: Appointment) => (
          <div key={appointment.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{appointment.title}</h3>
                  <p className="text-sm text-gray-600 capitalize">{appointment.type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(appointment.date).toLocaleDateString('nl-NL')} om {appointment.time} 
                    ({appointment.duration} minuten)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {appointment.status === 'scheduled' ? 'Gepland' : 
                   appointment.status === 'completed' ? 'Voltooid' : 'Geannuleerd'}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            {appointment.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{appointment.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
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