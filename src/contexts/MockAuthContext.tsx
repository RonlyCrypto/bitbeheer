import React, { createContext, useContext, useState, useEffect } from 'react';

interface MockUser {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  is_test: boolean;
}

interface MockAuthContextType {
  user: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('mock_user');
      }
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Mock authentication - accept specific credentials
      if (email === 'admin@bitbeheer.nl' && password === 'admin123') {
        const mockUser: MockUser = {
          id: 'admin-123',
          email: 'admin@bitbeheer.nl',
          name: 'Admin User',
          is_admin: true,
          is_test: false
        };
        
        setUser(mockUser);
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        console.log('Mock login successful:', mockUser);
        return { success: true };
      } else if (email === 'test@bitbeheer.nl' && password === 'test123') {
        const mockUser: MockUser = {
          id: 'test-123',
          email: 'test@bitbeheer.nl',
          name: 'Test User',
          is_admin: false,
          is_test: true
        };
        
        setUser(mockUser);
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        console.log('Mock login successful:', mockUser);
        return { success: true };
      } else if (email === 'user@bitbeheer.nl' && password === 'user123') {
        const mockUser: MockUser = {
          id: 'user-123',
          email: 'user@bitbeheer.nl',
          name: 'Regular User',
          is_admin: false,
          is_test: false
        };
        
        setUser(mockUser);
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        console.log('Mock login successful:', mockUser);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Mock login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      setUser(null);
      localStorage.removeItem('mock_user');
      console.log('Mock logout successful');
      return { success: true };
    } catch (error) {
      console.error('Mock logout error:', error);
      return { success: false, error: 'Logout failed' };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <MockAuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      isAuthenticated
    }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};
