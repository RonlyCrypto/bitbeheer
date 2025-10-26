import { useState, useEffect } from 'react';
import { Users, Eye, LogIn, Mail, Calendar, MessageSquare, Tag, Search, Filter, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';

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

  // Calculate remaining time for verification
  const getRemainingTime = (user: UserAccount) => {
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
    return getRemainingTime(user) <= 0;
  };

  // Check if account is in warning period (last 2 days)
  const isInWarningPeriod = (user: UserAccount) => {
    if (user.email_verified) return false;
    const remaining = getRemainingTime(user);
    return remaining > 0 && remaining <= 2;
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

        // Try accounts API first
        const accountsResponse = await fetch('/api/accounts');
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          setUsers(accountsData.accounts || []);
          return;
        }
        
        // Fallback to users API
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          // Filter for account_aanmelden category
          const accountUsers = usersData.users?.filter((user: any) => user.category === 'account_aanmelden') || [];
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

      // Reload accounts
      const accountsResponse = await fetch('/api/accounts');
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setUsers(accountsData.accounts || []);
      } else {
        // Fallback to users API
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const accountUsers = usersData.users?.filter((user: any) => user.category === 'account_aanmelden') || [];
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
      (verificationFilter === 'expired' && isAccountExpired(user));
    
    return matchesSearch && matchesCategory && matchesVerification;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(users.map(user => user.category)))];

  const handleViewUser = (user: UserAccount) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleLoginAsUser = (user: UserAccount) => {
    // Set user session in localStorage
    localStorage.setItem('user_session', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      category: user.category,
      loginTime: new Date().toISOString()
    }));
    
    // Redirect to user dashboard
    window.location.href = '/user-dashboard';
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

  // Manually verify account as admin
  const handleManualVerify = async (user: UserAccount) => {
    try {
      const response = await fetch('/api/save-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          userData: {
            email_verified: true,
            verified_at: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(u => 
          u.id === user.id 
            ? { ...u, email_verified: true, verified_at: new Date().toISOString() }
            : u
        ));
        console.log('Account manually verified:', user.email);
      } else {
        console.error('Failed to verify account');
      }
    } catch (error) {
      console.error('Error verifying account:', error);
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

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek op e-mail, naam of bericht..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Alle Categorieën' : category}
                    </option>
                  ))}
                </select>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="verified">Geverifieerd</option>
                  <option value="pending">In Behandeling</option>
                  <option value="expired">Verlopen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Verification Status Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Email Verificatie Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Totaal</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Geverifieerd</p>
                    <p className="text-2xl font-bold text-green-600">{users.filter(u => u.email_verified).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">In Behandeling</p>
                    <p className="text-2xl font-bold text-orange-600">{users.filter(u => !u.email_verified && !isAccountExpired(u)).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verlopen</p>
                    <p className="text-2xl font-bold text-red-600">{users.filter(u => isAccountExpired(u)).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{filteredUsers.length}</h3>
                  <p className="text-gray-600">Gevonden Accounts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <LogIn className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {filteredUsers.filter(user => user.lastLogin).length}
                  </h3>
                  <p className="text-gray-600">Actieve Gebruikers</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {filteredUsers.filter(user => user.emailSent).length}
                  </h3>
                  <p className="text-gray-600">E-mails Verzonden</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Tag className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {Array.from(new Set(filteredUsers.map(user => user.category))).length}
                  </h3>
                  <p className="text-gray-600">Categorieën</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Alle Accounts ({filteredUsers.length})</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Geen accounts gevonden</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className={`p-6 hover:bg-gray-50 ${
                    isAccountExpired(user) && !user.isAdmin && !user.isTest ? 'bg-gray-100 opacity-60' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900">{user.email}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{user.name}</span>
                            {user.isAdmin && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                                ADMIN
                              </span>
                            )}
                            {user.isTest && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                                TEST
                              </span>
                            )}
                            {user.category && !user.isAdmin && !user.isTest && (
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
                            {user.loginCount && (
                              <span>Logins: {user.loginCount}</span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {user.isAdmin || user.isTest ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Altijd Actief
                              </span>
                            ) : user.email_verified ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Geverifieerd
                              </span>
                            ) : isAccountExpired(user) ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                <XCircle className="w-3 h-3" />
                                Verlopen
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                isInWarningPeriod(user) 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {getRemainingTime(user)} dagen resterend
                              </span>
                            )}
                            {!user.email_verified && !isAccountExpired(user) && !user.isAdmin && !user.isTest && (
                              <button
                                onClick={() => handleManualVerify(user)}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                              >
                                Handmatig Bevestigen
                              </button>
                            )}
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
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Account Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
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
              </div>
              
              {selectedUser.message && selectedUser.message !== 'Geen bericht' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bericht</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUser.message}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
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
              
              {selectedUser.lastLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Laatste Login</label>
                  <p className="text-gray-900">{selectedUser.lastLogin}</p>
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
