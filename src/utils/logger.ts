/**
 * Logger utility that only logs in development mode
 * Production builds should have minimal console output for security
 */

// Vite uses import.meta.env for environment variables
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    // Warnings in production too, but less verbose
    if (isDevelopment) {
      console.warn(...args);
    } else {
      // In production, only log critical warnings
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production, but keep minimal
    console.error(...args);
  },
  
  debug: (...args: any[]) => {
    // Debug only in development
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  // Silent logger - never logs (for removing logs completely)
  silent: () => {}
};

// Export default for convenience
export default logger;

