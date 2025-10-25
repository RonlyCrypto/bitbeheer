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
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
        setUser(session?.user ?? null);
        setLoading(false);
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
    isTest
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
