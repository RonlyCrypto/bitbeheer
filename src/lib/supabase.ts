import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL || 'https://clqbnkvnydlxtimiazqf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscWJua3ZueWRseHRpbWlhenFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzU4OTIsImV4cCI6MjA3NjkxMTg5Mn0.yCBqjTqT03Tjtad2RMjEXXb8aClHqt9x7iwt_u9_TPM';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Only throw error if both URL and key are truly missing (not using fallbacks)
if (!supabaseUrl || supabaseUrl === '' || !supabaseAnonKey || supabaseAnonKey === '') {
  throw new Error('Missing Supabase credentials! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY) in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
