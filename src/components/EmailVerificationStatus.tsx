import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Clock, Trash2, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  verification_token_created: string;
  verified_at: string;
  created_at: string;
}

export default function EmailVerificationStatus() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'expired'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUsers = async () => {
    setIsRefreshing(true);
    await loadUsers();
    setIsRefreshing(false);
  };

  const deleteExpiredUser = async (userId: string) => {
    if (!confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getVerificationStatus = (user: User) => {
    if (user.email_verified) {
      return { status: 'verified', color: 'text-green-600', icon: CheckCircle };
    }

    const tokenCreated = new Date(user.verification_token_created);
    const now = new Date();
    const daysDiff = (now.getTime() - tokenCreated.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 5) {
      return { status: 'expired', color: 'text-red-600', icon: XCircle };
    }

    return { status: 'pending', color: 'text-orange-600', icon: Clock };
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const { status } = getVerificationStatus(user);
      
      switch (filter) {
        case 'verified':
          return status === 'verified';
        case 'pending':
          return status === 'pending';
        case 'expired':
          return status === 'expired';
        default:
          return true;
      }
    });
  };

  const getStatusCounts = () => {
    const counts = { verified: 0, pending: 0, expired: 0, total: users.length };
    
    users.forEach(user => {
      const { status } = getVerificationStatus(user);
      if (status === 'verified') counts.verified++;
      else if (status === 'pending') counts.pending++;
      else if (status === 'expired') counts.expired++;
    });

    return counts;
  };

  const counts = getStatusCounts();
  const filteredUsers = getFilteredUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Verificatie Status</h2>
          <p className="text-gray-600">Beheer en controleer email verificaties</p>
        </div>
        <button
          onClick={refreshUsers}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Laden...' : 'Vernieuwen'}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Totaal</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Geverifieerd</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{counts.verified}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">In Behandeling</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{counts.pending}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Verlopen</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{counts.expired}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Alle', count: counts.total },
          { key: 'verified', label: 'Geverifieerd', count: counts.verified },
          { key: 'pending', label: 'In Behandeling', count: counts.pending },
          { key: 'expired', label: 'Verlopen', count: counts.expired }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === key
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gebruiker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aanmeld Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verificatie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const { status, color, icon: Icon } = getVerificationStatus(user);
                const tokenCreated = new Date(user.verification_token_created);
                const now = new Date();
                const daysDiff = Math.floor((now.getTime() - tokenCreated.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className={`text-sm font-medium ${color}`}>
                          {status === 'verified' && 'Geverifieerd'}
                          {status === 'pending' && 'In Behandeling'}
                          {status === 'expired' && 'Verlopen'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {status === 'verified' && user.verified_at && (
                        <span className="text-green-600">
                          {new Date(user.verified_at).toLocaleDateString('nl-NL')}
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="text-orange-600">
                          {daysDiff} dag{daysDiff !== 1 ? 'en' : ''} geleden
                        </span>
                      )}
                      {status === 'expired' && (
                        <span className="text-red-600">
                          Verlopen ({daysDiff} dagen)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {status === 'expired' && (
                        <button
                          onClick={() => deleteExpiredUser(user.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Verwijder
                        </button>
                      )}
                      {status === 'verified' && (
                        <span className="text-green-600">Actief</span>
                      )}
                      {status === 'pending' && (
                        <span className="text-orange-600">Wachtend</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Geen gebruikers gevonden voor dit filter</p>
        </div>
      )}
    </div>
  );
}
