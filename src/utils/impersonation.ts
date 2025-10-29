// Impersonation utility functions with Supabase integration
import { supabase } from '../lib/supabase';

export interface ImpersonationData {
  isImpersonating: boolean;
  impersonatedUser: string;
  originalUser: string;
  startTime: string;
}

// Cache for current impersonation state
let currentImpersonationState: ImpersonationData | null = null;

export const impersonationUtils = {
  // Start impersonating a user
  startImpersonation: async (userEmail: string, originalUser: string) => {
    try {
      console.log('🎭 Starting impersonation:', userEmail, 'by', originalUser);
      
      // Generate unique session ID
      const sessionId = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert session into Supabase
      const { data, error } = await supabase
        .from('impersonation_sessions')
        .insert({
          admin_email: originalUser,
          user_email: userEmail,
          session_id: sessionId,
          start_time: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating impersonation session:', error);
        throw new Error(`Failed to create impersonation session: ${error.message}`);
      }

      // Update local state
      const impersonationData: ImpersonationData = {
        isImpersonating: true,
        impersonatedUser: userEmail,
        originalUser: originalUser,
        startTime: new Date().toISOString()
      };

      currentImpersonationState = impersonationData;
      
      // Store session ID in localStorage for persistence
      localStorage.setItem('impersonation_session_id', sessionId);
      
      console.log('✅ Started impersonation session:', sessionId);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('impersonationStarted', { detail: impersonationData }));
      
      return impersonationData;
    } catch (error) {
      console.error('❌ Error starting impersonation:', error);
      throw error;
    }
  },

  // Stop impersonating
  stopImpersonation: async () => {
    try {
      console.log('🛑 Stopping impersonation...');
      
      const sessionId = localStorage.getItem('impersonation_session_id');
      
      if (sessionId) {
        // Deactivate session in Supabase
        const { error } = await supabase
          .from('impersonation_sessions')
          .update({ is_active: false })
          .eq('session_id', sessionId);

        if (error) {
          console.error('❌ Error deactivating session:', error);
        } else {
          console.log('✅ Deactivated impersonation session:', sessionId);
        }
      }

      // Clear local state
      currentImpersonationState = null;
      localStorage.removeItem('impersonation_session_id');
      
      console.log('✅ Stopped impersonation');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('impersonationStopped'));
    } catch (error) {
      console.error('❌ Error stopping impersonation:', error);
    }
  },

  // Check if currently impersonating
  isCurrentlyImpersonating: (): boolean => {
    return currentImpersonationState?.isImpersonating === true;
  },

  // Get current impersonation data
  getCurrentImpersonation: (): ImpersonationData | null => {
    return currentImpersonationState;
  },

  // Get impersonated user email
  getImpersonatedUser: (): string | null => {
    return currentImpersonationState?.impersonatedUser || null;
  },

  // Refresh state from Supabase
  refreshState: async (): Promise<ImpersonationData | null> => {
    try {
      const sessionId = localStorage.getItem('impersonation_session_id');
      
      if (!sessionId) {
        currentImpersonationState = null;
        return null;
      }

      console.log('🔄 Refreshing impersonation state from Supabase...');

      // Check if session exists and is active in Supabase
      const { data, error } = await supabase
        .from('impersonation_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log('❌ No active impersonation session found');
        currentImpersonationState = null;
        localStorage.removeItem('impersonation_session_id');
        return null;
      }

      // Check if session expired
      if (new Date() > new Date(data.expires_at)) {
        console.log('⏰ Impersonation session expired');
        currentImpersonationState = null;
        localStorage.removeItem('impersonation_session_id');
        
        // Deactivate expired session
        await supabase
          .from('impersonation_sessions')
          .update({ is_active: false })
          .eq('session_id', sessionId);
        
        return null;
      }

      // Update local state with data from Supabase
      currentImpersonationState = {
        isImpersonating: true,
        impersonatedUser: data.user_email,
        originalUser: data.admin_email,
        startTime: data.start_time
      };

      console.log('✅ Refreshed impersonation state:', currentImpersonationState);
      return currentImpersonationState;
    } catch (error) {
      console.error('❌ Error refreshing impersonation state:', error);
      currentImpersonationState = null;
      return null;
    }
  }
};
