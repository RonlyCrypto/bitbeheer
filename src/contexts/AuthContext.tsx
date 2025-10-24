import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'admin' | 'test' | null;
  login: (password: string) => boolean;
  logout: () => void;
  isSiteAccessible: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Passwords - using environment variables for security
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
const TEST_PASSWORD = process.env.REACT_APP_TEST_PASSWORD || 'test123';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'test' | null>(null);

  useEffect(() => {
    // Check if user is already authenticated (from localStorage)
    const authStatus = localStorage.getItem('admin_authenticated');
    const storedUserType = localStorage.getItem('user_type') as 'admin' | 'test' | null;
    if (authStatus === 'true' && storedUserType) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setUserType('admin');
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('user_type', 'admin');
      return true;
    } else if (password === TEST_PASSWORD) {
      setIsAuthenticated(true);
      setUserType('test');
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('user_type', 'test');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('user_type');
  };

  const isSiteAccessible = (): boolean => {
    // Check if site is in "soon online" mode
    const isSoonOnlineMode = localStorage.getItem('soon_online_mode') !== 'false';
    
    if (!isSoonOnlineMode) {
      // Site is live, everyone can access
      return true;
    }
    
    // If admin is logged in, they can see the full site (not SoonOnlinePage)
    if (isAuthenticated && (userType === 'admin' || userType === 'test')) {
      return true;
    }
    
    // Non-authenticated users see SoonOnlinePage
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, login, logout, isSiteAccessible }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
