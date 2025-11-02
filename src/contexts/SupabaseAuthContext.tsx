import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signUpUser, signInUser, signOutUser, getCurrentUser } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import logger from '../utils/logger';

interface SupabaseAuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTest: boolean;
  showWelcomePopup: boolean;
  setShowWelcomePopup: (show: boolean) => void;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    // Test Supabase connection first (only in dev)
    const testSupabaseConnection = async () => {
      try {
        logger.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('accounts').select('count').limit(1);
        if (error) {
          logger.error('Supabase connection error:', error);
        } else {
          logger.log('Supabase connection successful');
        }
      } catch (error) {
        logger.error('Supabase connection test failed:', error);
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('Error getting session:', error);
        }
        setUser(session?.user ?? null);
      } catch (error) {
        logger.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    testSupabaseConnection();
    getInitialSession();

              // Listen for auth changes
              const { data: { subscription } } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                  logger.log('Auth state change:', event);
                  setUser(session?.user ?? null);
                  setLoading(false);
                  
                  // Show welcome popup for new users on first login
                  if (event === 'SIGNED_IN' && session?.user) {
                    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
                    if (!hasSeenWelcome) {
                      setShowWelcomePopup(true);
                      localStorage.setItem('hasSeenWelcome', 'true');
                    }

                    // Login confirmation email is now handled via database trigger
                    // No need to send from frontend - avoids CORS issues and is more secure
                  }
                }
              );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const result = await signUpUser(email, password, userData);
      return result;
    } catch (error) {
      logger.error('Sign up error:', error);
      return { success: false, error: 'Er is een fout opgetreden bij het aanmelden' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in with:', email);
      const result = await signInUser(email, password);
      console.log('Sign in result:', result);
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Er is een fout opgetreden bij het inloggen' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const result = await signOutUser();
      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'Er is een fout opgetreden bij het uitloggen' };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.email === 'admin@bitbeheer.nl' || user?.user_metadata?.role === 'admin';
  const isTest = user?.email === 'test@bitbeheer.nl' || user?.user_metadata?.role === 'test';

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated,
    isAdmin,
    isTest,
    showWelcomePopup,
    setShowWelcomePopup
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
