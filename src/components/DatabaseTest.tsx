import { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase, getUsers, getAccounts } from '../lib/supabase';

export default function DatabaseTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Test 1: Check if Supabase client is configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        throw new Error('Supabase credentials not configured');
      }

      // Test 2: Try to fetch users
      const { data: usersData, error: usersError } = await getUsers();
      if (usersError) {
        throw new Error(`Users table error: ${usersError.message}`);
      }

      // Test 3: Try to fetch accounts
      const { data: accountsData, error: accountsError } = await getAccounts();
      if (accountsError) {
        throw new Error(`Accounts table error: ${accountsError.message}`);
      }

      // Test 4: Check if admin and test accounts exist
      const adminAccount = accountsData.find(acc => acc.is_admin);
      const testAccount = accountsData.find(acc => acc.is_test);

      if (!adminAccount || !testAccount) {
        throw new Error('Admin or test accounts not found in database');
      }

      setIsConnected(true);
      setUsers(usersData);
      setAccounts(accountsData);
    } catch (err) {
      console.error('Database connection test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Database connectie testen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Database className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Database Connectie Test</h1>
              <p className="text-gray-600">Test de Supabase database connectie</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mb-8">
            {isConnected ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Database Verbonden!</h3>
                  <p className="text-green-700">Supabase database is succesvol verbonden en werkt correct.</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Database Verbinding Mislukt</h3>
                  <p className="text-red-700">{error || 'Onbekende fout opgetreden'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Database Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users Tabel</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Aantal records: <span className="font-semibold">{users.length}</span></p>
                <p className="text-sm text-gray-600">Status: <span className="text-green-600 font-semibold">✓ Verbonden</span></p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts Tabel</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Aantal records: <span className="font-semibold">{accounts.length}</span></p>
                <p className="text-sm text-gray-600">Status: <span className="text-green-600 font-semibold">✓ Verbonden</span></p>
              </div>
            </div>
          </div>

          {/* Accounts List */}
          {accounts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts in Database</h3>
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-600">{account.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.is_admin && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                          ADMIN
                        </span>
                      )}
                      {account.is_test && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                          TEST
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={testDatabaseConnection}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Database className="w-5 h-5" />
              Test Opnieuw
            </button>
            
            {isConnected && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Ga naar Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
