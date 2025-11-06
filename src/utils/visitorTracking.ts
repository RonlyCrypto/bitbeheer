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

  private async sendPageView(path: string, timeSpent: number, isLeaving: boolean) {
    try {
      const visitorData: VisitorData = {
        visitor_id: this.visitorId!,
        session_id: this.sessionId!,
        page_path: path,
        referrer: document.referrer || 'Direct',
        user_agent: navigator.userAgent,
        browser: this.getBrowser(),
        device_type: this.getDeviceType(),
        os: this.getOS()
      };

      // Send to Supabase
      const { supabase } = await import('../lib/supabase');
      await supabase.from('visitor_analytics').insert({
        visitor_id: visitorData.visitor_id,
        session_id: visitorData.session_id,
        page_path: visitorData.page_path,
        referrer: visitorData.referrer,
        user_agent: visitorData.user_agent,
        browser: visitorData.browser,
        device_type: visitorData.device_type,
        os: visitorData.os,
        session_duration: timeSpent > 0 ? timeSpent : null
      });
    } catch (error) {
      // Silently fail - analytics should not break the site
      console.error('Error tracking page view:', error);
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

