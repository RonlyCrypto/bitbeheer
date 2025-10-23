import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'admin' | 'test' | null;
  login: (password: string) => boolean;
  logout: () => void;
  isSiteAccessible: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Passwords - in production, these should be stored securely
const ADMIN_PASSWORD = 'crypto2024admin';
const TEST_PASSWORD = 'test2024user';

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
    
    // Site is in "soon online" mode, only admin and test users can access
    return isAuthenticated && (userType === 'admin' || userType === 'test');
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
