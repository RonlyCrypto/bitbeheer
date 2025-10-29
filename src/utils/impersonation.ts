// Impersonation utility functions
export interface ImpersonationData {
  isImpersonating: boolean;
  impersonatedUser: string;
  originalUser: string;
  startTime: string;
}

// Secure impersonation state using server-side sessions
let impersonationState: ImpersonationData | null = null;
let currentSessionId: string | null = null;

export const impersonationUtils = {
  // Start impersonating a user (secure server-side)
  startImpersonation: async (userEmail: string, originalUser: string) => {
    try {
      const response = await fetch('https://clqbnkvnyldlxtimiaqf.supabase.co/functions/v1/impersonation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscWJua3ZueWRseHRpbWlhenFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzU4OTIsImV4cCI6MjA3NjkxMTg5Mn0.2QqJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJg',
        },
        body: JSON.stringify({
          action: 'start',
          adminEmail: originalUser,
          userEmail: userEmail
        })
      });

      const result = await response.json();

      if (result.success) {
        currentSessionId = result.sessionId;
        impersonationState = {
          isImpersonating: true,
          impersonatedUser: userEmail,
          originalUser: originalUser,
          startTime: new Date().toISOString()
        };
        
        console.log('Started secure impersonation session:', result.sessionId);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('impersonationStarted', { detail: impersonationState }));
      } else {
        console.error('Failed to start impersonation:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error starting impersonation:', error);
      throw error;
    }
  },

  // Stop impersonating (secure server-side)
  stopImpersonation: async () => {
    if (currentSessionId) {
      try {
        const response = await fetch('https://clqbnkvnyldlxtimiaqf.supabase.co/functions/v1/impersonation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'stop',
            sessionId: currentSessionId
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('Stopped secure impersonation session:', currentSessionId);
        } else {
          console.error('Failed to stop impersonation:', result.error);
        }
      } catch (error) {
        console.error('Error stopping impersonation:', error);
      }
    }

    impersonationState = null;
    currentSessionId = null;
    
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

  // Refresh state from server (secure verification)
  refreshState: async () => {
    if (!currentSessionId) {
      impersonationState = null;
      return null;
    }

    try {
      const response = await fetch('https://clqbnkvnyldlxtimiaqf.supabase.co/functions/v1/impersonation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscWJua3ZueWRseHRpbWlhenFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzU4OTIsImV4cCI6MjA3NjkxMTg5Mn0.2QqJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJgJg',
        },
        body: JSON.stringify({
          action: 'verify',
          sessionId: currentSessionId
        })
      });

      const result = await response.json();

      if (result.success && result.isImpersonating) {
        impersonationState = {
          isImpersonating: true,
          impersonatedUser: result.userEmail,
          originalUser: result.adminEmail,
          startTime: result.startTime
        };
        console.log('Verified secure impersonation session:', result);
      } else {
        impersonationState = null;
        currentSessionId = null;
        console.log('Impersonation session expired or invalid');
      }

      return impersonationState;
    } catch (error) {
      console.error('Error verifying impersonation state:', error);
      impersonationState = null;
      currentSessionId = null;
      return null;
    }
  }
};
