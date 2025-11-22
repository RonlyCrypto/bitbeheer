import { useState, useEffect } from 'react';
import { Users, Eye, LogIn, Mail, Calendar, MessageSquare, Tag, Search, Filter, RefreshCw, Clock, CheckCircle, XCircle, Send, UserCheck, AlertTriangle, UserCog } from 'lucide-react';
import { impersonationUtils } from '../utils/impersonation';
import { supabase } from '../lib/supabase';
import SignupProcessFlow from './SignupProcessFlow';

interface UserAccount {
  id: string;
  email: string;
  name: string;
  message: string;
  category: string;
  date: string;
  timestamp: string;
  emailSent?: boolean;
  emailSentDate?: string;
  lastLogin?: string;
  loginCount?: number;
  isAdmin?: boolean;
  isTest?: boolean;
  registrationDate?: string;
  email_verified?: boolean;
  verification_token?: string;
  verification_token_created?: string;
  verified_at?: string;
  created_at?: string;
  actief?: boolean;
  bevestigd?: boolean;
  account_approved?: boolean;
  first_appointment_completed?: boolean;
}

export default function AccountBeheer() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [showStatusTab, setShowStatusTab] = useState(false);

  // Calculate remaining time for verification
  const getRemainingTime = (user: UserAccount): number | null => {
    if (user.email_verified) return null;
    
    const createdDate = new Date(user.created_at || user.timestamp || user.registrationDate || Date.now());
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = 5 - daysSinceCreation;
    
    return remainingDays > 0 ? remainingDays : 0;
  };

  // Check if account should be deleted
  const isAccountExpired = (user: UserAccount) => {
    if (user.email_verified) return false;
    // Admin and test accounts are always active
    if (user.isAdmin || user.isTest) return false;
    const remaining = getRemainingTime(user);
    return remaining !== null && remaining <= 0;
  };

  // Check if account is in warning period (last 2 days)
  const isInWarningPeriod = (user: UserAccount) => {
    if (user.email_verified) return false;
    const remaining = getRemainingTime(user);
    return remaining !== null && remaining > 0 && remaining <= 2;
  };

  // Load accounts from backend API
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // First sync users from Supabase Auth
        try {
          await fetch('/api/sync-users');
        } catch (syncError) {
          console.log('Sync users failed, continuing with existing data:', syncError);
        }

        // Try accounts API first (these are the actual user accounts in Supabase)
        const accountsResponse = await fetch('/api/accounts');
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          console.log('Accounts loaded from API:', accountsData.accounts);
          
          // Remove duplicates based on email (keep first occurrence)
          const uniqueAccounts = (accountsData.accounts || []).reduce((acc: any[], account: any) => {
            if (!acc.find(a => a.email === account.email)) {
              acc.push(account);
            }
            return acc;
          }, []);
          
          // Enrich accounts with approval status from Supabase
          const enrichedAccounts = await Promise.all(uniqueAccounts.map(async (account: any) => {
            try {
              // Get all data from both tables
              const { data: userData } = await supabase
                .from('users')
                .select('email_verified, verified_at, actief, account_approved, first_appointment_completed, verification_token_created, email_sent_date, created_at')
                .eq('email', account.email)
                .maybeSingle();
              
              const { data: accountData } = await supabase
                .from('accounts')
                .select('email_verified, verified_at, actief, account_approved, first_appointment_completed, created_at')
                .eq('email', account.email)
                .maybeSingle();
              
            // Prefer data from accounts table, fallback to users table
            const finalData: any = accountData || userData || {};
            
            return {
              ...account,
              // Use verified status from database (accounts or users table)
              email_verified: finalData.email_verified ?? account.email_verified ?? false,
              verified_at: finalData.verified_at ?? account.verified_at,
              actief: finalData.actief !== undefined ? finalData.actief : (account.actief !== undefined ? account.actief : true),
              account_approved: finalData.account_approved || false,
              first_appointment_completed: finalData.first_appointment_completed || false,
              verification_token_created: userData?.verification_token_created || account.verification_token_created,
              email_sent_date: userData?.email_sent_date || account.emailSentDate || account.email_sent_date,
              created_at: finalData.created_at || account.created_at || account.timestamp || account.registrationDate
            };
            } catch (error) {
              // If columns don't exist, default to false
              return {
                ...account,
                email_verified: account.email_verified || false,
                actief: account.actief !== undefined ? account.actief : true,
                account_approved: false,
                first_appointment_completed: false
              };
            }
          }));
          
          setUsers(enrichedAccounts);
          return;
        }
        
        // Fallback to users API (for notification signups)
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          // Filter for nieuwe_gebruiker category (from login form) and account_aanmelden (from aanmeldformulier)
          const accountUsers = usersData.users?.filter((user: any) => 
            user.category === 'nieuwe_gebruiker' || user.category === 'account_aanmelden'
          ) || [];
          console.log('Users loaded from API (fallback):', accountUsers);
          setUsers(accountUsers);
          return;
        }
        
        console.error('Failed to load accounts from both APIs');
        // Fallback to localStorage for development
        const storedAccounts = localStorage.getItem('bitbeheer_accounts');
        if (storedAccounts) {
          setUsers(JSON.parse(storedAccounts));
        }
      } catch (error) {
        console.error('Error loading accounts:', error);
        // Fallback to localStorage for development
        const storedAccounts = localStorage.getItem('bitbeheer_accounts');
        if (storedAccounts) {
          setUsers(JSON.parse(storedAccounts));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
    
    // Listen for refresh events from other components (e.g., after account approval)
    const handleRefresh = () => {
      refreshAccounts();
    };
    
    window.addEventListener('refreshAccounts', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshAccounts', handleRefresh);
    };
  }, []);

  // Refresh accounts function
  const refreshAccounts = async () => {
    setIsRefreshing(true);
    try {
      // First sync users from Supabase Auth
      try {
        await fetch('/api/sync-users');
      } catch (syncError) {
        console.log('Sync users failed, continuing with existing data:', syncError);
      }

      // Reload accounts (actual user accounts from Supabase)
      const accountsResponse = await fetch('/api/accounts');
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        console.log('Accounts refreshed from API:', accountsData.accounts);
        
        // Remove duplicates based on email (keep first occurrence)
        const uniqueAccounts = (accountsData.accounts || []).reduce((acc: any[], account: any) => {
          if (!acc.find(a => a.email === account.email)) {
            acc.push(account);
          }
          return acc;
        }, []);
        
        // Enrich accounts with approval status from Supabase
        const enrichedAccounts = await Promise.all(uniqueAccounts.map(async (account: any) => {
          try {
            // Get all data from both tables
            const { data: userData } = await supabase
              .from('users')
              .select('email_verified, verified_at, actief, account_approved, first_appointment_completed')
              .eq('email', account.email)
              .maybeSingle();
            
            const { data: accountData } = await supabase
              .from('accounts')
              .select('email_verified, verified_at, actief, account_approved, first_appointment_completed')
              .eq('email', account.email)
              .maybeSingle();
            
            // Prefer data from accounts table, fallback to users table
            const finalData: any = accountData || userData || {};
            
            return {
              ...account,
              // Use verified status from database (accounts or users table)
              email_verified: finalData.email_verified ?? account.email_verified ?? false,
              verified_at: finalData.verified_at ?? account.verified_at,
              actief: finalData.actief !== undefined ? finalData.actief : (account.actief !== undefined ? account.actief : true),
              account_approved: finalData.account_approved || false,
              first_appointment_completed: finalData.first_appointment_completed || false
            };
          } catch (error) {
            // If columns don't exist, default to false
            return {
              ...account,
              email_verified: account.email_verified || false,
              actief: account.actief !== undefined ? account.actief : true,
              account_approved: false,
              first_appointment_completed: false
            };
          }
        }));
        
        setUsers(enrichedAccounts);
      } else {
        // Fallback to users API (for notification signups)
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const accountUsers = usersData.users?.filter((user: any) => 
            user.category === 'nieuwe_gebruiker' || user.category === 'account_aanmelden'
          ) || [];
          console.log('Users refreshed from API (fallback):', accountUsers);
          setUsers(accountUsers);
        }
      }
    } catch (error) {
      console.error('Error refreshing accounts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter users by search term and category
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || user.category === selectedCategory;
    
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && user.email_verified) ||
      (verificationFilter === 'pending' && !user.email_verified && !isAccountExpired(user)) ||
      (verificationFilter === 'expired' && isAccountExpired(user)) ||
      (verificationFilter === 'admin' && user.isAdmin) ||
      (verificationFilter === 'test' && user.isTest) ||
      (verificationFilter === 'no_email' && !user.emailSent);
    
    return matchesSearch && matchesCategory && matchesVerification;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(users.map(user => user.category)))];

  const handleViewUser = (user: UserAccount) => {
    setSelectedUser(user);
    setShowStatusTab(false); // Always start with Profiel tab
    setShowUserModal(true);
  };

  const handleLoginAsUser = async (user: UserAccount) => {
    try {
      // Starting impersonation (no email in logs)
      
      // Start impersonation using secure impersonation utils
      await impersonationUtils.startImpersonation(user.email, 'admin@bitbeheer.nl');
      
      // Impersonation started (silent)
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        window.location.href = '/user-dashboard';
      }, 100);
      
    } catch (error) {
      console.error('❌ Failed to start impersonation:', error);
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      alert(`Kon niet inloggen als gebruiker: ${errorMessage}\n\nControleer of de database tabel 'impersonation_sessions' bestaat.`);
    }
  };

  const handleUpdateUserLogin = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lastLogin: new Date().toLocaleString('nl-NL'),
          loginCount: (users.find(u => u.id === userId)?.loginCount || 0) + 1
        })
      });

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                lastLogin: new Date().toLocaleString('nl-NL'),
                loginCount: (user.loginCount || 0) + 1
              }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user login:', error);
    }
  };

  // Manually verify account as admin - set status to 'actief' when verified
  const handleManualVerify = async (user: UserAccount) => {
    try {
      const now = new Date().toISOString();
      
      // Update both accounts and users tables in Supabase
      try {
        // Update accounts table
        const { error: accountsError } = await supabase
          .from('accounts')
          .update({ 
            email_verified: true,
            verified_at: now,
            actief: true,
            updated_at: now
          })
          .eq('email', user.email);
        
        if (accountsError) {
          console.error('Error updating accounts table:', accountsError);
        }
        
        // Update users table
        const { error: usersError } = await supabase
          .from('users')
          .update({ 
            email_verified: true,
            verified_at: now,
            actief: true,
            updated_at: now
          })
          .eq('email', user.email);
        
        if (usersError) {
          console.error('Error updating users table:', usersError);
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }

      // Also call the API endpoint as backup
      try {
        await fetch('/api/save-user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            userData: {
              email_verified: true,
              verified_at: now,
              actief: true
            }
          }),
        });
      } catch (apiError) {
        console.error('API update error:', apiError);
      }

      // Refresh accounts to get updated data from database
      await refreshAccounts();
      
      alert('Account succesvol geverifieerd en geactiveerd!');
    } catch (error) {
      console.error('Error verifying account:', error);
      alert('Fout bij het verifiëren van het account. Probeer het opnieuw.');
    }
  };


  // Manual account activation
  const handleManualActivate = async (userId: string) => {
    setIsActivating(userId);
    
    try {
      const response = await fetch('/api/manual-activate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        alert('Account succesvol geactiveerd!');
        refreshAccounts(); // Refresh the list
      } else {
        alert('Fout bij het activeren van het account');
      }
    } catch (error) {
      console.error('Error activating account:', error);
      alert('Fout bij het activeren van het account');
    } finally {
      setIsActivating(null);
    }
  };

  // Update account status (actief/inactief)
  const handleUpdateAccountStatus = async (userId: string, newStatus: boolean) => {
    setIsUpdatingStatus(userId);
    
    try {
      const response = await fetch('https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/update-account-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          userId, 
          actief: newStatus 
        }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, actief: newStatus }
            : user
        ));
        alert(`Account ${newStatus ? 'geactiveerd' : 'gedeactiveerd'}!`);
      } else {
        alert('Fout bij het updaten van account status');
      }
    } catch (error) {
      console.error('Error updating account status:', error);
      alert('Fout bij het updaten van account status');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleImpersonateUser = async (user: UserAccount) => {
    if (user.isAdmin || user.isTest) {
      alert('Je kunt geen admin of test accounts impersoneren');
      return;
    }

    if (confirm(`Weet je zeker dat je wilt inloggen als ${user.name} (${user.email})?`)) {
      try {
        // Starting impersonation (no email in logs)
        
        // Start impersonation using impersonation utils
        await impersonationUtils.startImpersonation(user.email, 'admin@bitbeheer.nl');
        
        // Impersonation started (silent)
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          window.location.href = '/user-dashboard';
        }, 100);
        
      } catch (error) {
        console.error('❌ Failed to start impersonation:', error);
        alert('Kon niet inloggen als gebruiker. Probeer het opnieuw.');
      }
    }
  };

  // Resend verification email (fixed)
  const handleResendVerificationEmail = async (user: UserAccount) => {
    if (!user.verification_token) {
      console.error('No verification token found');
      return;
    }

    setIsSendingEmail(user.id);
    
    try {
      const response = await fetch('https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          verificationToken: user.verification_token
        })
      });

      if (response.ok) {
        alert('Bevestigingsmail opnieuw verzonden!');
      } else {
        const errorData = await response.json();
        console.error('Email sending error:', errorData);
        alert('Fout bij het verzenden van de bevestigingsmail');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Fout bij het verzenden van de bevestigingsmail');
    } finally {
      setIsSendingEmail(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Accounts laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Account Beheer</h1>
                  <p className="text-gray-600">Beheer alle aangemelde accounts en bekijk gebruikersdata</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshAccounts}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Synchroniseren...' : 'Synchroniseren'}
                </button>
                <div className="text-sm text-gray-500">
                  {users.length} accounts totaal
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filter */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek op e-mail, naam of bericht..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all min-w-[180px]"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Alle Categorieën' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-500" />
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all min-w-[180px]"
                >
                  <option value="all">🔍 Alle Status</option>
                  <option value="verified">✅ Geverifieerd ({users.filter(u => u.email_verified || u.isAdmin || u.isTest).length})</option>
                  <option value="pending">⏳ In Behandeling ({users.filter(u => !u.email_verified && !isAccountExpired(u) && !u.isAdmin && !u.isTest).length})</option>
                  <option value="expired">❌ Verlopen ({users.filter(u => isAccountExpired(u) && !u.isAdmin && !u.isTest).length})</option>
                  <option value="admin">👑 Admin Accounts ({users.filter(u => u.isAdmin).length})</option>
                  <option value="test">🧪 Test Accounts ({users.filter(u => u.isTest).length})</option>
                  <option value="no_email">📧 Geen Email Verzonden ({users.filter(u => !u.emailSent).length})</option>
                </select>
                </div>
              </div>
            </div>
          </div>


          {/* Active Accounts Section - Only accounts with account_approved = true */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Actieve Accounts</h2>
                  <p className="text-gray-600 mt-1">
                    {filteredUsers.filter(user => (user.account_approved === true) || user.isAdmin || user.isTest).length} van {users.filter(user => (user.account_approved === true) || user.isAdmin || user.isTest).length} actieve accounts (Dashboard 100% actief)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500">
                    Laatste update: {new Date().toLocaleTimeString('nl-NL')}
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredUsers.filter(user => (user.account_approved === true) || user.isAdmin || user.isTest).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen volledig actieve accounts</h3>
                  <p className="text-gray-600">Geen accounts met volledige dashboard toegang</p>
                </div>
              ) : (
                filteredUsers
                  .filter(user => (user.account_approved === true) || user.isAdmin || user.isTest)
                  .map((user) => (
                    <div key={user.id} className="p-3 md:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm md:text-base text-gray-900 break-words">{user.email}</span>
                            {user.name && (
                              <>
                                <span className="text-xs text-gray-500 hidden sm:inline">•</span>
                                <span className="text-xs md:text-sm text-gray-600 break-words">{user.name}</span>
                              </>
                            )}
                            {user.isAdmin && (
                              <span className="text-[10px] md:text-xs bg-red-100 text-red-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold flex-shrink-0">
                                ADMIN
                              </span>
                            )}
                            {user.isTest && (
                              <span className="text-[10px] md:text-xs bg-yellow-100 text-yellow-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold flex-shrink-0">
                                TEST
                              </span>
                            )}
                            {user.category && !user.isAdmin && !user.isTest && (
                              <>
                                <span className="text-xs text-gray-500 hidden sm:inline">•</span>
                                <span className="text-[10px] md:text-xs bg-orange-100 text-orange-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0 break-words">
                                  {user.category}
                                </span>
                              </>
                            )}
                          </div>
                          {user.message && user.message !== 'Geen bericht' && (
                            <p className="text-xs md:text-sm text-gray-600 mb-1 break-words">{user.message}</p>
                          )}
                          <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-400 flex-wrap">
                            <span>Aangemeld: {user.registrationDate || user.date}</span>
                            {user.lastLogin && (
                              <span>Laatste login: {user.lastLogin}</span>
                            )}
                            {user.loginCount !== undefined && (
                              <span>Logins: {user.loginCount}</span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 md:gap-2 flex-wrap">
                            {user.isAdmin || user.isTest ? (
                              <span className="inline-flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs bg-blue-100 text-blue-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">
                                <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span className="hidden sm:inline">Altijd Actief</span>
                                <span className="sm:hidden">Actief</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs bg-green-100 text-green-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">
                                <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                Geverifieerd
                              </span>
                            )}
                            {/* First appointment status */}
                            {user.first_appointment_completed && (
                              <span className="inline-flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs bg-orange-100 text-orange-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">
                                <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span className="hidden sm:inline">20min Gesprek Voltooid</span>
                                <span className="sm:hidden">20min</span>
                              </span>
                            )}
                            {/* Account approval status */}
                            {user.account_approved && (
                              <span className="inline-flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs bg-purple-100 text-purple-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold flex-shrink-0">
                                <UserCheck className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span className="hidden sm:inline">Dashboard Actief</span>
                                <span className="sm:hidden">Dashboard</span>
                              </span>
                            )}
                            {!user.isAdmin && !user.isTest && (
                              <select
                                value={user.actief !== false ? 'actief' : 'inactief'}
                                onChange={(e) => handleUpdateAccountStatus(user.id, e.target.value === 'actief')}
                                disabled={isUpdatingStatus === user.id}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 bg-green-50 flex-shrink-0"
                              >
                                <option value="actief">🟢 Actief</option>
                                <option value="inactief">🔴 Inactief</option>
                              </select>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
                          >
                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Bekijken</span>
                            <span className="sm:hidden">Bekijk</span>
                          </button>
                          <button
                            onClick={() => {
                              handleLoginAsUser(user);
                              handleUpdateUserLogin(user.id);
                            }}
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs md:text-sm"
                          >
                            <LogIn className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Inloggen als</span>
                            <span className="sm:hidden">Login</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Verified but No Appointment Section */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-orange-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Geverifieerd - Wachtend op 20min Gesprek</h2>
                  <p className="text-gray-600 mt-1">
                    {filteredUsers.filter(user => 
                      (user.email_verified || user.isAdmin || user.isTest) && 
                      !user.first_appointment_completed && 
                      !user.account_approved && 
                      !user.isAdmin && 
                      !user.isTest
                    ).length} accounts hebben email bevestigd maar nog geen eerste afspraak gehad
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredUsers.filter(user => 
                (user.email_verified || user.isAdmin || user.isTest) && 
                !user.first_appointment_completed && 
                !user.account_approved && 
                !user.isAdmin && 
                !user.isTest
              ).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen accounts in deze categorie</h3>
                  <p className="text-gray-600">Alle geverifieerde accounts hebben een gesprek gehad of zijn goedgekeurd</p>
                </div>
              ) : (
                filteredUsers
                  .filter(user => 
                    (user.email_verified || user.isAdmin || user.isTest) && 
                    !user.first_appointment_completed && 
                    !user.account_approved && 
                    !user.isAdmin && 
                    !user.isTest
                  )
                  .map((user) => (
                    <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-gray-900">{user.email}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{user.name}</span>
                              {user.category && (
                                <>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    {user.category}
                                  </span>
                                </>
                              )}
                            </div>
                            {user.message && user.message !== 'Geen bericht' && (
                              <p className="text-sm text-gray-600 mb-2">{user.message}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Aangemeld: {user.registrationDate || user.date}</span>
                              {user.lastLogin && (
                                <span>Laatste login: {user.lastLogin}</span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Geverifieerd
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                <Clock className="w-3 h-3" />
                                Wacht op 20min Gesprek
                              </span>
                              {/* Status dropdown - default to actief for verified accounts */}
                              <select
                                value={user.actief !== false ? 'actief' : 'inactief'}
                                onChange={(e) => handleUpdateAccountStatus(user.id, e.target.value === 'actief')}
                                disabled={isUpdatingStatus === user.id}
                                className="text-xs px-2 py-1 rounded-full border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                              >
                                <option value="actief">🟢 Actief</option>
                                <option value="inactief">🔴 Inactief</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Bekijken
                          </button>
                          <button
                            onClick={() => {
                              handleLoginAsUser(user);
                              handleUpdateUserLogin(user.id);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <LogIn className="w-4 h-4" />
                            Inloggen als
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Pending Verification Accounts Section */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Wachtend op Verificatie</h2>
                  <p className="text-gray-600 mt-1">
                    {filteredUsers.filter(user => !user.email_verified && !isAccountExpired(user) && !user.isAdmin && !user.isTest).length} accounts wachten op email bevestiging
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredUsers.filter(user => !user.email_verified && !isAccountExpired(user) && !user.isAdmin && !user.isTest).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-orange-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen accounts in behandeling</h3>
                  <p className="text-gray-600">Alle accounts zijn geverifieerd of verlopen</p>
                </div>
              ) : (
                filteredUsers
                  .filter(user => !user.email_verified && !isAccountExpired(user) && !user.isAdmin && !user.isTest)
                  .map((user) => (
                    <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-gray-900">{user.email}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{user.name}</span>
                              {user.category && (
                                <>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    {user.category}
                                  </span>
                                </>
                              )}
                            </div>
                            {user.message && user.message !== 'Geen bericht' && (
                              <p className="text-sm text-gray-600 mb-2">{user.message}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Aangemeld: {user.registrationDate || user.date}</span>
                              {user.lastLogin && (
                                <span>Laatste login: {user.lastLogin}</span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                isInWarningPeriod(user) 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {getRemainingTime(user)} dagen resterend
                              </span>
                              {/* Status dropdown - default to actief for verified accounts */}
                              {user.email_verified && (
                                <select
                                  value={user.actief !== false ? 'actief' : 'inactief'}
                                  onChange={(e) => handleUpdateAccountStatus(user.id, e.target.value === 'actief')}
                                  disabled={isUpdatingStatus === user.id}
                                  className="text-xs px-2 py-1 rounded-full border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                                >
                                  <option value="actief">🟢 Actief</option>
                                  <option value="inactief">🔴 Inactief</option>
                                </select>
                              )}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleManualVerify(user)}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                  Handmatig Bevestigen
                                </button>
                                <button
                                  onClick={() => handleResendVerificationEmail(user)}
                                  disabled={isSendingEmail === user.id}
                                  className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors disabled:opacity-50"
                                >
                                  {isSendingEmail === user.id ? 'Verzenden...' : 'Email Opnieuw'}
                                </button>
                                <button
                                  onClick={() => handleManualActivate(user.id)}
                                  disabled={isActivating === user.id}
                                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50"
                                >
                                  {isActivating === user.id ? 'Activeren...' : 'Activeren'}
                                </button>
                                <button
                                  onClick={() => handleImpersonateUser(user)}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                  title="Inloggen als deze gebruiker"
                                >
                                  <UserCog className="w-3 h-3 inline mr-1" />
                                  Inloggen
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Bekijken
                          </button>
                          <button
                            onClick={() => {
                              handleLoginAsUser(user);
                              handleUpdateUserLogin(user.id);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <LogIn className="w-4 h-4" />
                            Inloggen als
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Expired Accounts Section */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Verlopen Accounts</h2>
                  <p className="text-gray-600 mt-1">
                    {filteredUsers.filter(user => isAccountExpired(user) && !user.isAdmin && !user.isTest).length} accounts zijn verlopen (5+ dagen niet bevestigd)
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredUsers.filter(user => isAccountExpired(user) && !user.isAdmin && !user.isTest).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <XCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen verlopen accounts</h3>
                  <p className="text-gray-600">Alle accounts zijn actief of in behandeling</p>
                </div>
              ) : (
                filteredUsers
                  .filter(user => isAccountExpired(user) && !user.isAdmin && !user.isTest)
                  .map((user) => (
                    <div key={user.id} className="p-6 bg-gray-100 opacity-75 hover:bg-gray-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-gray-600 line-through">{user.email}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{user.name}</span>
                              {user.category && (
                                <>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                    {user.category}
                                  </span>
                                </>
                              )}
                            </div>
                            {user.message && user.message !== 'Geen bericht' && (
                              <p className="text-sm text-gray-500 mb-2">{user.message}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Aangemeld: {user.registrationDate || user.date}</span>
                              <span className="text-red-500 font-medium">Verlopen op: {new Date(new Date(user.created_at || user.timestamp || user.registrationDate || Date.now()).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                <XCircle className="w-3 h-3" />
                                Verlopen
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    if (confirm(`Weet je zeker dat je een nieuw account wilt aanmaken voor ${user.email}? Dit zal alle gegevens opnieuw instellen.`)) {
                                      // TODO: Implement account recreation
                                      alert('Functie wordt binnenkort toegevoegd');
                                    }
                                  }}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                  Nieuw Account Aanmaken
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Weet je zeker dat je dit verlopen account wilt verwijderen?`)) {
                                      // TODO: Implement account deletion
                                      alert('Functie wordt binnenkort toegevoegd');
                                    }
                                  }}
                                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
                                >
                                  Verwijderen
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Bekijken
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Enhanced Email Verification Status - Bottom Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mt-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Email Verificatie Overzicht</h3>
                <p className="text-gray-600 text-sm">Complete status van alle account verificaties</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-blue-100">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 font-medium mb-1">Totaal Accounts</p>
                <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                <p className="text-xs text-blue-500 mt-1">Alle aangemelde accounts</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-green-600 font-medium mb-1">Geverifieerd</p>
                <p className="text-2xl font-bold text-green-900">{users.filter(u => u.email_verified || u.isAdmin || u.isTest).length}</p>
                <p className="text-xs text-green-500 mt-1">Actief & Bevestigd</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-orange-100">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-xs text-orange-600 font-medium mb-1">In Behandeling</p>
                <p className="text-2xl font-bold text-orange-900">{users.filter(u => !u.email_verified && !isAccountExpired(u) && !u.isAdmin && !u.isTest).length}</p>
                <p className="text-xs text-orange-500 mt-1">Wacht op bevestiging</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-red-100">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-xs text-red-600 font-medium mb-1">Verlopen</p>
                <p className="text-2xl font-bold text-red-900">{users.filter(u => isAccountExpired(u) && !u.isAdmin && !u.isTest).length}</p>
                <p className="text-xs text-red-500 mt-1">5+ dagen niet bevestigd</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setVerificationFilter('pending')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              >
                <Clock className="w-4 h-4" />
                Bekijk In Behandeling ({users.filter(u => !u.email_verified && !isAccountExpired(u) && !u.isAdmin && !u.isTest).length})
              </button>
              <button
                onClick={() => setVerificationFilter('expired')}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                <XCircle className="w-4 h-4" />
                Bekijk Verlopen ({users.filter(u => isAccountExpired(u) && !u.isAdmin && !u.isTest).length})
              </button>
              <button
                onClick={() => setVerificationFilter('all')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                <Users className="w-4 h-4" />
                Bekijk Alle Accounts
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Account Details</h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setShowStatusTab(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setShowStatusTab(false)}
                  className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                    !showStatusTab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profiel
                </button>
                <button
                  onClick={() => setShowStatusTab(true)}
                  className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors relative flex items-center gap-2 ${
                    selectedUser.account_approved && selectedUser.first_appointment_completed && selectedUser.email_verified
                      ? showStatusTab
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-green-600 hover:text-green-700 hover:border-green-300'
                      : showStatusTab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Status
                  {selectedUser.account_approved && selectedUser.first_appointment_completed && selectedUser.email_verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </button>
              </nav>
            </div>
            
            <div className="space-y-6">
              {!showStatusTab ? (
                /* Profiel Info */
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
                      <p className="text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
                      <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                        {selectedUser.category}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aangemeld</label>
                      <p className="text-gray-900">{selectedUser.date}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Status</label>
                      <p className={`text-sm ${selectedUser.emailSent ? 'text-green-600' : 'text-orange-600'}`}>
                        {selectedUser.emailSent ? 'Verzonden' : 'Nog niet verzonden'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Count</label>
                      <p className="text-gray-900">{selectedUser.loginCount || 0}</p>
                    </div>
                  </div>
                  
                  {selectedUser.message && selectedUser.message !== 'Geen bericht' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bericht</label>
                      <p className="text-gray-900 bg-white p-3 rounded-lg">{selectedUser.message}</p>
                    </div>
                  )}
                  
                  {selectedUser.lastLogin && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Laatste Login</label>
                      <p className="text-gray-900">{selectedUser.lastLogin}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Aanmeldproces Schema */
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Aanmeldproces Status</h4>
                  <SignupProcessFlow 
                    user={{
                      email_verified: selectedUser.email_verified,
                      first_appointment_completed: selectedUser.first_appointment_completed,
                      account_approved: selectedUser.account_approved,
                      created_at: selectedUser.created_at,
                      verified_at: selectedUser.verified_at,
                      email: selectedUser.email,
                      verification_token_created: selectedUser.verification_token_created,
                      email_sent_date: selectedUser.emailSentDate || selectedUser.email_sent_date
                    }}
                    showLegend={false}
                    onResendVerificationEmail={() => handleResendVerificationEmail(selectedUser)}
                    isResendingEmail={isSendingEmail === selectedUser.id}
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  handleLoginAsUser(selectedUser);
                  handleUpdateUserLogin(selectedUser.id);
                  setShowUserModal(false);
                }}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Inloggen als deze gebruiker
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
