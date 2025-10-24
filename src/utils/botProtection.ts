// Bot Protection Utilities
export interface BotProtectionConfig {
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  suspiciousPatterns: string[];
  blockedIPs: string[];
  allowedUserAgents: string[];
}

export const defaultBotProtectionConfig: BotProtectionConfig = {
  maxRequestsPerHour: 10,
  maxRequestsPerDay: 50,
  suspiciousPatterns: [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
    'python', 'php', 'java', 'node', 'automated'
  ],
  blockedIPs: [],
  allowedUserAgents: [
    'mozilla', 'chrome', 'safari', 'firefox', 'edge'
  ]
};

// Generate a simple fingerprint
export const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('BitBeheer Bot Protection', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.cookieEnabled ? 'cookies' : 'no-cookies'
  ].join('|');
  
  return btoa(fingerprint).substring(0, 32);
};

// Check if user agent is suspicious
export const isSuspiciousUserAgent = (userAgent: string, config: BotProtectionConfig): boolean => {
  const lowerUA = userAgent.toLowerCase();
  
  // Check for blocked patterns
  for (const pattern of config.suspiciousPatterns) {
    if (lowerUA.includes(pattern)) {
      return true;
    }
  }
  
  // Check if user agent is too short or empty
  if (userAgent.length < 10) {
    return true;
  }
  
  // Check if user agent contains only allowed patterns
  const hasAllowedPattern = config.allowedUserAgents.some(pattern => 
    lowerUA.includes(pattern)
  );
  
  return !hasAllowedPattern;
};

// Check for spam patterns in text
export const detectSpamPatterns = (text: string): number => {
  const spamPatterns = [
    /\b(viagra|casino|lottery|winner|free money|click here|buy now)\b/i,
    /\b(bitcoin|crypto|investment|profit|guaranteed)\b/i,
    /[A-Z]{10,}/, // Excessive caps
    /[!]{3,}/, // Excessive punctuation
    /(.)\1{4,}/, // Repeated characters
    /\b(urgent|limited time|act now|don't miss)\b/i
  ];
  
  let spamScore = 0;
  
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      spamScore += 0.2;
    }
  }
  
  return Math.min(spamScore, 1.0);
};

// Check for bot behavior patterns
export const detectBotBehavior = (): number => {
  let botScore = 0;
  
  // Check for missing or suspicious properties
  if (!navigator.cookieEnabled) botScore += 0.2;
  if (!navigator.language) botScore += 0.2;
  if (navigator.userAgent.length < 20) botScore += 0.3;
  
  // Check for missing JavaScript features
  if (typeof window === 'undefined') botScore += 0.5;
  if (typeof document === 'undefined') botScore += 0.5;
  if (typeof navigator === 'undefined') botScore += 0.5;
  
  // Check for suspicious screen size
  if (screen.width === 0 || screen.height === 0) botScore += 0.3;
  
  // Check for missing plugins
  if (navigator.plugins && navigator.plugins.length === 0) botScore += 0.1;
  
  return Math.min(botScore, 1.0);
};

// Rate limiting check
export const checkRateLimit = async (endpoint: string, maxRequests: number = 10): Promise<boolean> => {
  try {
    const response = await fetch('/api/rate-limit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint,
        maxRequests,
        fingerprint: generateFingerprint()
      })
    });
    
    const data = await response.json();
    return data.allowed;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow if check fails
  }
};

// Comprehensive bot detection
export const detectBot = (userAgent: string, config: BotProtectionConfig = defaultBotProtectionConfig): boolean => {
  // Check user agent
  if (isSuspiciousUserAgent(userAgent, config)) {
    return true;
  }
  
  // Check bot behavior
  const behaviorScore = detectBotBehavior();
  if (behaviorScore > 0.5) {
    return true;
  }
  
  // Check for missing essential properties
  if (!navigator.userAgent || !navigator.language || !screen.width) {
    return true;
  }
  
  return false;
};

// Form submission protection
export const protectFormSubmission = async (
  formData: any,
  endpoint: string,
  config: BotProtectionConfig = defaultBotProtectionConfig
): Promise<{ allowed: boolean; reason?: string; spamScore?: number }> => {
  try {
    // Check rate limiting
    const rateLimitAllowed = await checkRateLimit(endpoint, config.maxRequestsPerHour);
    if (!rateLimitAllowed) {
      return { allowed: false, reason: 'Rate limit exceeded' };
    }
    
    // Check bot detection
    if (detectBot(navigator.userAgent, config)) {
      return { allowed: false, reason: 'Bot detected' };
    }
    
    // Check spam patterns
    const spamScore = detectSpamPatterns(
      (formData.message || '') + ' ' + (formData.email || '')
    );
    
    if (spamScore > 0.7) {
      return { allowed: false, reason: 'Spam detected', spamScore };
    }
    
    return { allowed: true, spamScore };
    
  } catch (error) {
    console.error('Form protection check failed:', error);
    return { allowed: true }; // Allow if check fails
  }
};

// Honeypot field for additional protection
export const createHoneypotField = (): HTMLInputElement => {
  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'website';
  honeypot.style.display = 'none';
  honeypot.style.position = 'absolute';
  honeypot.style.left = '-9999px';
  honeypot.tabIndex = -1;
  honeypot.setAttribute('autocomplete', 'off');
  honeypot.setAttribute('aria-hidden', 'true');
  return honeypot;
};

// Check if honeypot was filled (indicates bot)
export const checkHoneypot = (formData: any): boolean => {
  return !!(formData.website && formData.website.trim() !== '');
};

// Time-based protection (check if form was filled too quickly)
export const checkFormTiming = (startTime: number, minTime: number = 3000): boolean => {
  const elapsed = Date.now() - startTime;
  return elapsed >= minTime;
};

// CAPTCHA-like challenge (simple math)
export const generateMathChallenge = (): { question: string; answer: number } => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const operation = Math.random() > 0.5 ? '+' : '-';
  
  let question: string;
  let answer: number;
  
  if (operation === '+') {
    question = `${a} + ${b} = ?`;
    answer = a + b;
  } else {
    question = `${a} - ${b} = ?`;
    answer = a - b;
  }
  
  return { question, answer };
};

// Verify math challenge
export const verifyMathChallenge = (userAnswer: string, correctAnswer: number): boolean => {
  const parsed = parseInt(userAnswer, 10);
  return !isNaN(parsed) && parsed === correctAnswer;
};
