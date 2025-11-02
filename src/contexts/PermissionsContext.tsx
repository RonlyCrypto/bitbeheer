import React, { createContext, useContext, useState, useEffect } from 'react';
import { impersonationUtils } from '../utils/impersonation';
import { useSupabaseAuth } from './SupabaseAuthContext';
import logger from '../utils/logger';

export type AccountType = 'admin' | 'user' | 'test' | 'premium' | 'basic';

interface PermissionsContextType {
  accountType: AccountType;
  isImpersonating: boolean;
  impersonatedUser: string | null;
  canAccessAdmin: boolean;
  canAccessPremium: boolean;
  canAccessBasic: boolean;
  hasPermission: (permission: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

// Permission definitions
const PERMISSIONS = {
  admin: [
    'admin.dashboard',
    'admin.accounts',
    'admin.bitcoin',
    'admin.portfolio',
    'admin.comparer',
    'admin.impersonate',
    'user.dashboard',
    'user.profile',
    'user.goals',
    'user.portfolio',
    'user.appointments',
    'user.education'
  ],
  user: [
    'user.dashboard',
    'user.profile',
    'user.goals',
    'user.portfolio',
    'user.appointments',
    'user.education'
  ],
  premium: [
    'user.dashboard',
    'user.profile',
    'user.goals',
    'user.portfolio',
    'user.appointments',
    'user.education',
    'premium.features',
    'premium.analytics'
  ],
  basic: [
    'user.dashboard',
    'user.profile',
    'user.goals',
    'user.portfolio',
    'user.appointments',
    'user.education'
  ],
  test: [
    'admin.dashboard',
    'admin.accounts',
    'admin.bitcoin',
    'admin.portfolio',
    'admin.comparer',
    'admin.impersonate',
    'user.dashboard',
    'user.profile',
    'user.goals',
    'user.portfolio',
    'user.appointments',
    'user.education'
  ]
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSupabaseAuth();
  
  const [accountType, setAccountType] = useState<AccountType>('user');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null);

  useEffect(() => {
    const checkImpersonation = () => {
      // Check impersonation state from localStorage
      const impersonationData = impersonationUtils.getCurrentImpersonation();
      
      if (impersonationData && impersonationData.isImpersonating) {
        setIsImpersonating(true);
        setImpersonatedUser(impersonationData.impersonatedUser);
        // When impersonating, user has basic permissions (not admin)
        setAccountType('user');
      } else {
        setIsImpersonating(false);
        setImpersonatedUser(null);
        
        // Wait for auth to finish initializing before setting state
        if (loading) {
          return;
        }

        // Check if user is logged in via Supabase
        if (user) {
          // Check if user is admin based on email or metadata
          if (user.email === 'admin@bitbeheer.nl' || user.user_metadata?.is_admin) {
            setAccountType('admin');
          } else if (user.user_metadata?.is_test) {
            setAccountType('test');
          } else if (user.user_metadata?.is_premium) {
            setAccountType('premium');
          } else {
            setAccountType('user');
          }
        } else {
          setAccountType('user');
        }
      }
    };

    checkImpersonation();
    
    // Listen for impersonation events
    const handleImpersonationStarted = () => {
      checkImpersonation();
    };
    
    const handleImpersonationStopped = () => {
      checkImpersonation();
    };
    
    window.addEventListener('impersonationStarted', handleImpersonationStarted);
    window.addEventListener('impersonationStopped', handleImpersonationStopped);
    window.addEventListener('storage', checkImpersonation);
    
    return () => {
      window.removeEventListener('impersonationStarted', handleImpersonationStarted);
      window.removeEventListener('impersonationStopped', handleImpersonationStopped);
      window.removeEventListener('storage', checkImpersonation);
    };
  }, [user, loading]);

  const hasPermission = (permission: string): boolean => {
    const userPermissions = PERMISSIONS[accountType] || [];
    return userPermissions.includes(permission);
  };

  const canAccessAdmin = hasPermission('admin.dashboard');
  const canAccessPremium = hasPermission('premium.features');
  const canAccessBasic = hasPermission('user.dashboard');
  

  return (
    <PermissionsContext.Provider value={{
      accountType,
      isImpersonating,
      impersonatedUser,
      canAccessAdmin,
      canAccessPremium,
      canAccessBasic,
      hasPermission
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};
