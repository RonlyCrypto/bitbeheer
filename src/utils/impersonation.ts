// Impersonation utility functions
export interface ImpersonationData {
  isImpersonating: boolean;
  impersonatedUser: string;
  originalUser: string;
  startTime: string;
}

export const impersonationUtils = {
  // Start impersonating a user
  startImpersonation: (userEmail: string, originalUser: string) => {
    const data: ImpersonationData = {
      isImpersonating: true,
      impersonatedUser: userEmail,
      originalUser: originalUser,
      startTime: new Date().toISOString()
    };
    
    localStorage.setItem('impersonation', JSON.stringify(data));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('impersonationStarted', { detail: data }));
  },

  // Stop impersonating
  stopImpersonation: () => {
    localStorage.removeItem('impersonation');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('impersonationStopped'));
  },

  // Check if currently impersonating
  isCurrentlyImpersonating: (): boolean => {
    const data = localStorage.getItem('impersonation');
    if (!data) return false;
    
    try {
      const parsed = JSON.parse(data);
      return parsed.isImpersonating === true;
    } catch {
      return false;
    }
  },

  // Get current impersonation data
  getCurrentImpersonation: (): ImpersonationData | null => {
    const data = localStorage.getItem('impersonation');
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  // Get impersonated user email
  getImpersonatedUser: (): string | null => {
    const data = this.getCurrentImpersonation();
    return data?.impersonatedUser || null;
  }
};
