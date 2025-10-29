// Impersonation utility functions
export interface ImpersonationData {
  isImpersonating: boolean;
  impersonatedUser: string;
  originalUser: string;
  startTime: string;
}

// Persistent impersonation state using localStorage
const IMPERSONATION_KEY = 'bitbeheer_impersonation';

// Get initial state from localStorage
let impersonationState: ImpersonationData | null = (() => {
  try {
    const stored = localStorage.getItem(IMPERSONATION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading impersonation state:', error);
    return null;
  }
})();

export const impersonationUtils = {
  // Start impersonating a user
  startImpersonation: (userEmail: string, originalUser: string) => {
    const data: ImpersonationData = {
      isImpersonating: true,
      impersonatedUser: userEmail,
      originalUser: originalUser,
      startTime: new Date().toISOString()
    };
    
    impersonationState = data;
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(data));
      console.log('Started impersonation and saved to localStorage:', data);
    } catch (error) {
      console.error('Error saving impersonation state:', error);
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('impersonationStarted', { detail: data }));
  },

  // Stop impersonating
  stopImpersonation: () => {
    impersonationState = null;
    
    // Remove from localStorage
    try {
      localStorage.removeItem(IMPERSONATION_KEY);
      console.log('Stopped impersonation and removed from localStorage');
    } catch (error) {
      console.error('Error removing impersonation state:', error);
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('impersonationStopped'));
  },

  // Check if currently impersonating
  isCurrentlyImpersonating: (): boolean => {
    return impersonationState?.isImpersonating === true;
  },

  // Get current impersonation data
  getCurrentImpersonation: (): ImpersonationData | null => {
    return impersonationState;
  },

  // Get impersonated user email
  getImpersonatedUser: (): string | null => {
    return impersonationState?.impersonatedUser || null;
  },

  // Refresh state from localStorage (useful after page reload)
  refreshState: () => {
    try {
      const stored = localStorage.getItem(IMPERSONATION_KEY);
      impersonationState = stored ? JSON.parse(stored) : null;
      console.log('Refreshed impersonation state from localStorage:', impersonationState);
      return impersonationState;
    } catch (error) {
      console.error('Error refreshing impersonation state:', error);
      impersonationState = null;
      return null;
    }
  }
};
