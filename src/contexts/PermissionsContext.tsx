import React, { createContext, useContext, useState, useEffect } from 'react';
import { impersonationUtils } from '../utils/impersonation';

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
  const [accountType, setAccountType] = useState<AccountType>('user');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null);

  useEffect(() => {
    const checkImpersonation = () => {
      const impersonationData = impersonationUtils.getCurrentImpersonation();
      if (impersonationData) {
        setIsImpersonating(impersonationData.isImpersonating);
        setImpersonatedUser(impersonationData.impersonatedUser);
        // When impersonating, user has basic permissions
        setAccountType('user');
      } else {
        setIsImpersonating(false);
        setImpersonatedUser(null);
        // Check actual user permissions from localStorage or API
        const userAccount = localStorage.getItem('user_account');
        if (userAccount) {
          try {
            const account = JSON.parse(userAccount);
            if (account.is_admin) {
              setAccountType('admin');
            } else if (account.is_test) {
              setAccountType('test');
            } else if (account.is_premium) {
              setAccountType('premium');
            } else {
              setAccountType('user');
            }
          } catch (error) {
            setAccountType('user');
          }
        } else {
          setAccountType('user');
        }
      }
    };

    checkImpersonation();
    
    // Listen for impersonation changes
    const handleImpersonationChange = () => checkImpersonation();
    window.addEventListener('impersonationStarted', handleImpersonationChange);
    window.addEventListener('impersonationStopped', handleImpersonationChange);
    
    return () => {
      window.removeEventListener('impersonationStarted', handleImpersonationChange);
      window.removeEventListener('impersonationStopped', handleImpersonationChange);
    };
  }, []);

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
