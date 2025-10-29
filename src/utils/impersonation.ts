// Impersonation utility functions - Simple localStorage version
export interface ImpersonationData {
  isImpersonating: boolean;
  impersonatedUser: string;
  originalUser: string;
  startTime: string;
}

// Simple impersonation state using localStorage
const IMPERSONATION_KEY = 'impersonation_state';

export const impersonationUtils = {
  // Start impersonating a user
  startImpersonation: async (userEmail: string, originalUser: string) => {
    try {
      const impersonationData: ImpersonationData = {
        isImpersonating: true,
        impersonatedUser: userEmail,
        originalUser: originalUser,
        startTime: new Date().toISOString()
      };

      // Store in localStorage for persistence
      localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(impersonationData));
      
      console.log('Started impersonation:', userEmail);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('impersonationStarted', { detail: impersonationData }));
      
      return impersonationData;
    } catch (error) {
      console.error('Error starting impersonation:', error);
      throw error;
    }
  },

  // Stop impersonating
  stopImpersonation: async () => {
    try {
      // Remove from localStorage
      localStorage.removeItem(IMPERSONATION_KEY);
      
      console.log('Stopped impersonation');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('impersonationStopped'));
    } catch (error) {
      console.error('Error stopping impersonation:', error);
    }
  },

  // Check if currently impersonating
  isCurrentlyImpersonating: (): boolean => {
    try {
      const stored = localStorage.getItem(IMPERSONATION_KEY);
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      return data?.isImpersonating === true;
    } catch (error) {
      console.error('Error checking impersonation state:', error);
      return false;
    }
  },

  // Get current impersonation data
  getCurrentImpersonation: (): ImpersonationData | null => {
    try {
      const stored = localStorage.getItem(IMPERSONATION_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      return data?.isImpersonating ? data : null;
    } catch (error) {
      console.error('Error getting impersonation data:', error);
      return null;
    }
  },

  // Get impersonated user email
  getImpersonatedUser: (): string | null => {
    const data = impersonationUtils.getCurrentImpersonation();
    return data?.impersonatedUser || null;
  },

  // Refresh state (for compatibility)
  refreshState: async () => {
    return impersonationUtils.getCurrentImpersonation();
  }
};
