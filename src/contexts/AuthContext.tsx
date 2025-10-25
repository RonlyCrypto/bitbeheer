import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'admin' | 'test' | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isSiteAccessible: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin authentication using Supabase
const authenticateAdmin = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, accountType: data.accountType };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await authenticateAdmin(username, password);
      
      if (result.success) {
        setIsAuthenticated(true);
        setUserType(result.accountType as 'admin' | 'test');
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('user_type', result.accountType);
        localStorage.setItem('admin_username', username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
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
