// Impersonation utility functions
export interface ImpersonationData {
  isImpersonating: boolean;
  impersonatedUser: string;
  originalUser: string;
  startTime: string;
}

// Simple in-memory impersonation state (no localStorage)
let impersonationState: ImpersonationData | null = null;

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
    console.log('Started impersonation:', data);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('impersonationStarted', { detail: data }));
  },

  // Stop impersonating
  stopImpersonation: () => {
    impersonationState = null;
    console.log('Stopped impersonation');
    
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
  }
};
