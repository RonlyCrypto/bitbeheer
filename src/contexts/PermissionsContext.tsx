import React, { createContext, useContext, useState, useEffect } from 'react';
import { impersonationUtils } from '../utils/impersonation';
import { useSupabaseAuth } from './SupabaseAuthContext';

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
  const { user } = useSupabaseAuth();
  
  const [accountType, setAccountType] = useState<AccountType>('user');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null);

  useEffect(() => {
    const checkImpersonation = () => {
      const impersonationData = impersonationUtils.getCurrentImpersonation();
      console.log('🔍 Checking impersonation:', impersonationData);
      
      if (impersonationData && impersonationData.isImpersonating) {
        setIsImpersonating(true);
        setImpersonatedUser(impersonationData.impersonatedUser);
        // When impersonating, user has basic permissions (not admin)
        setAccountType('user');
        console.log('🎭 Impersonating user:', impersonationData.impersonatedUser);
        console.log('🎭 User will see regular user interface');
      } else {
        setIsImpersonating(false);
        setImpersonatedUser(null);
        
        // Check if user is logged in via Supabase
        if (user) {
          console.log('👤 Supabase user detected:', user);
          console.log('📧 User email:', user.email);
          console.log('🏷️ User metadata:', user.user_metadata);
          
          // Check if user is admin based on email or metadata
          if (user.email === 'admin@bitbeheer.nl' || user.user_metadata?.is_admin) {
            setAccountType('admin');
            console.log('👑 Admin user detected via email or metadata');
          } else if (user.user_metadata?.is_test) {
            setAccountType('test');
            console.log('🧪 Test user detected');
          } else if (user.user_metadata?.is_premium) {
            setAccountType('premium');
            console.log('⭐ Premium user detected');
          } else {
            setAccountType('user');
            console.log('👤 Regular user detected');
          }
        } else {
          setAccountType('user');
          console.log('❌ No user logged in');
        }
      }
    };

    checkImpersonation();
    
    // Listen for impersonation events
    const handleImpersonationStarted = () => {
      console.log('Impersonation started event received');
      checkImpersonation();
    };
    
    const handleImpersonationStopped = () => {
      console.log('Impersonation stopped event received');
      checkImpersonation();
    };
    
    window.addEventListener('impersonationStarted', handleImpersonationStarted);
    window.addEventListener('impersonationStopped', handleImpersonationStopped);
    
    // Check every second for changes
    const interval = setInterval(checkImpersonation, 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('impersonationStarted', handleImpersonationStarted);
      window.removeEventListener('impersonationStopped', handleImpersonationStopped);
    };
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    const userPermissions = PERMISSIONS[accountType] || [];
    return userPermissions.includes(permission);
  };

  const canAccessAdmin = hasPermission('admin.dashboard');
  const canAccessPremium = hasPermission('premium.features');
  const canAccessBasic = hasPermission('user.dashboard');
  
  // Debug logging
  console.log('🎭 PermissionsContext - isImpersonating:', isImpersonating);
  console.log('🎭 PermissionsContext - impersonatedUser:', impersonatedUser);
  console.log('🎭 PermissionsContext - accountType:', accountType);
  console.log('🎭 PermissionsContext - Should show banner:', isImpersonating && impersonatedUser);
  

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
