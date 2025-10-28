import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signUpUser, signInUser, signOutUser, getCurrentUser } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

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
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial Supabase session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        console.log('Initial user:', session?.user);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

              // Listen for auth changes
              const { data: { subscription } } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                  console.log('Auth state change:', event, session);
                  console.log('User from session:', session?.user);
                  setUser(session?.user ?? null);
                  setLoading(false);
                  
                  // Show welcome popup for new users on first login
                  if (event === 'SIGNED_IN' && session?.user) {
                    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
                    if (!hasSeenWelcome) {
                      setShowWelcomePopup(true);
                      localStorage.setItem('hasSeenWelcome', 'true');
                    }

                    // Send login confirmation email
                    try {
                      const { DirectEmailService } = await import('../services/directEmailService');
                      await DirectEmailService.sendLoginConfirmation(
                        session.user.email || '',
                        session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Gebruiker',
                        new Date().toLocaleString('nl-NL'),
                        // Note: IP address and user agent would need to be passed from the login component
                        undefined, // IP address
                        navigator.userAgent // User agent
                      );
                    } catch (emailError) {
                      console.error('Error sending login confirmation email:', emailError);
                      // Don't fail login if email fails
                    }
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
      console.error('Sign up error:', error);
      return { success: false, error: 'Er is een fout opgetreden bij het aanmelden' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInUser(email, password);
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
