// Visitor tracking utility for analytics
// Tracks page views, session duration, and visitor behavior

interface VisitorData {
  visitor_id: string;
  session_id: string;
  page_path: string;
  referrer: string;
  user_agent: string;
  browser: string;
  device_type: string;
  os: string;
  ip_address?: string;
  country?: string;
  country_code?: string;
  city?: string;
  region?: string;
  timezone?: string;
  language?: string;
}

class VisitorTracker {
  private visitorId: string | null = null;
  private sessionId: string | null = null;
  private sessionStartTime: number = Date.now();
  private currentPage: string = '';
  private pageViewStartTime: number = Date.now();

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    // Get or create visitor ID (stored in localStorage)
    this.visitorId = localStorage.getItem('visitor_id') || this.generateId();
    if (!localStorage.getItem('visitor_id')) {
      localStorage.setItem('visitor_id', this.visitorId);
    }

    // Get or create session ID (stored in sessionStorage)
    this.sessionId = sessionStorage.getItem('session_id') || this.generateId();
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', this.sessionId);
    }

    // Track page view on load
    this.trackPageView(window.location.pathname);

    // Track page view on navigation (for SPA)
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname);
    });

    // Track session end when user leaves
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });

    // Track page visibility changes (to calculate session duration)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, pause tracking
        this.trackPageView(this.currentPage, true);
      } else {
        // Page is visible again, resume tracking
        this.pageViewStartTime = Date.now();
      }
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'Tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  private async trackPageView(path: string, isLeaving: boolean = false) {
    // Calculate time spent on previous page
    if (this.currentPage && this.currentPage !== path) {
      const timeSpent = Math.floor((Date.now() - this.pageViewStartTime) / 1000);
      await this.sendPageView(this.currentPage, timeSpent, isLeaving);
    }

    // Update current page
    this.currentPage = path;
    this.pageViewStartTime = Date.now();

    // Track new page view
    if (!isLeaving) {
      await this.sendPageView(path, 0, false);
    }
  }

  private async getLocationData(): Promise<{ country?: string; country_code?: string; city?: string; region?: string; timezone?: string }> {
    try {
      // Try to get location from IP using a free geolocation API
      // Using ipapi.co (free tier: 1000 requests/day)
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name || undefined,
          country_code: data.country_code || undefined,
          city: data.city || undefined,
          region: data.region || undefined,
          timezone: data.timezone || undefined
        };
      }
    } catch (error) {
      // Silently fail - location is optional
      console.error('Error fetching location:', error);
    }
    return {};
  }

  private async sendPageView(path: string, timeSpent: number, isLeaving: boolean) {
    try {
      // Get location data (only on first page view to avoid rate limits)
      let locationData = {};
      if (!isLeaving && path === window.location.pathname) {
        locationData = await this.getLocationData();
      }

      const visitorData: VisitorData = {
        visitor_id: this.visitorId!,
        session_id: this.sessionId!,
        page_path: path,
        referrer: document.referrer || 'Direct',
        user_agent: navigator.userAgent,
        browser: this.getBrowser(),
        device_type: this.getDeviceType(),
        os: this.getOS(),
        language: navigator.language || navigator.languages?.[0] || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...locationData
      };

      // Get IP address via Edge Function (more secure)
      // CORS errors worden opgevangen en we vallen terug op alternatieve methode
      let ipAddress: string | undefined;
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase.functions.invoke('get-visitor-ip', {
          // Add headers to help with CORS if needed
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (error) {
          console.debug('get-visitor-ip function error (non-critical):', error);
        } else if (data?.ip) {
          ipAddress = data.ip;
        }
      } catch (error: any) {
        // CORS of andere errors - fallback naar alternatieve methode
        console.debug('get-visitor-ip function failed (non-critical), using fallback:', error?.message || error);
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ipAddress = ipData.ip;
          }
        } catch (e) {
          // IP is optional - geen probleem als dit faalt
        }
      }

      // Send to Supabase
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.from('visitor_analytics').insert({
        visitor_id: visitorData.visitor_id,
        session_id: visitorData.session_id,
        page_path: visitorData.page_path,
        referrer: visitorData.referrer,
        user_agent: visitorData.user_agent,
        browser: visitorData.browser,
        device_type: visitorData.device_type,
        os: visitorData.os,
        ip_address: ipAddress,
        country: visitorData.country,
        country_code: visitorData.country_code,
        city: visitorData.city,
        region: visitorData.region,
        timezone: visitorData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: visitorData.language,
        session_duration: timeSpent > 0 ? timeSpent : null
      });

      if (error) {
        console.error('Error inserting visitor analytics:', error);
        // Log more details for debugging
        console.error('Visitor data that failed:', {
          visitor_id: visitorData.visitor_id,
          page_path: visitorData.page_path,
          error_message: error.message,
          error_code: error.code
        });
      } else {
        console.log('Visitor analytics tracked successfully:', visitorData.page_path);
      }
    } catch (error) {
      // Log error but don't break the site
      console.error('Error tracking page view:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
    }
  }

  private async trackSessionEnd() {
    if (this.currentPage) {
      const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      await this.sendPageView(this.currentPage, sessionDuration, true);
    }
  }

  // Public method to manually track events
  public trackEvent(eventName: string, data?: any) {
    // Can be extended for custom event tracking
    console.log('Event tracked:', eventName, data);
  }
}

// Initialize tracker
let visitorTracker: VisitorTracker | null = null;

export const initVisitorTracking = () => {
  if (typeof window !== 'undefined' && !visitorTracker) {
    visitorTracker = new VisitorTracker();
  }
  return visitorTracker;
};

export default initVisitorTracking;

