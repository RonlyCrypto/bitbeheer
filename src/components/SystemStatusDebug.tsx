import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useSettings } from '../contexts/SettingsContext';
import { impersonationUtils } from '../utils/impersonation';

export default function SystemStatusDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { user, isAuthenticated, signIn, signOut } = useSupabaseAuth();
  const { isImpersonating, impersonatedUser, canAccessAdmin, accountType } = usePermissions();
  const { isMenuVisible, pageVisibility } = useSettings();

  // Force refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const impersonationData = impersonationUtils.getCurrentImpersonation();

  const statusChecks = [
    {
      name: 'Supabase Authentication',
      status: isAuthenticated,
      details: `User: ${user?.email || 'None'}, Auth: ${isAuthenticated}`
    },
    {
      name: 'User Object',
      status: !!user,
      details: `Email: ${user?.email || 'None'}, Metadata: ${JSON.stringify(user?.user_metadata || {})}`
    },
    {
      name: 'Permissions Context',
      status: accountType !== 'user' || isImpersonating,
      details: `Account Type: ${accountType}, Can Access Admin: ${canAccessAdmin}`
    },
    {
      name: 'Impersonation State',
      status: isImpersonating,
      details: `Impersonating: ${isImpersonating}, User: ${impersonatedUser || 'None'}`
    },
    {
      name: 'Impersonation Utils',
      status: !!impersonationData,
      details: `Data: ${JSON.stringify(impersonationData || {})}`
    },
    {
      name: 'Menu Visibility - Bitcoin',
      status: isMenuVisible('bitcoin_history', 'everyone'),
      details: `Bitcoin menu visible: ${isMenuVisible('bitcoin_history', 'everyone')}`
    },
    {
      name: 'Menu Visibility - Portfolio',
      status: isMenuVisible('portfolio_menu', 'everyone'),
      details: `Portfolio menu visible: ${isMenuVisible('portfolio_menu', 'everyone')}`
    },
    {
      name: 'Settings Context',
      status: pageVisibility.length > 0,
      details: `Page visibility items: ${pageVisibility.length}`
    }
  ];

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Status Debug
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {statusChecks.map((check, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {getStatusIcon(check.status)}
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${getStatusColor(check.status)}`}>
                {check.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-all">
                {check.details}
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('🧪 Testing impersonation...');
                impersonationUtils.startImpersonation('test@example.com', 'admin@bitbeheer.nl');
              }}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
            >
              Test Impersonation
            </button>
            <button
              onClick={() => {
                console.log('🛑 Stopping impersonation...');
                impersonationUtils.stopImpersonation();
              }}
              className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
            >
              Stop Impersonation
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
