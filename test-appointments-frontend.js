// Test script for browser console
// Paste this in the browser console while on the admin dashboard

(async () => {
  console.log('🧪 Testing appointments query...');
  
  // Import supabase (assuming it's available globally or import it)
  const { supabase } = await import('./src/lib/supabase.ts');
  
  // 1. Check session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('📊 Session:', {
    email: sessionData?.session?.user?.email,
    isAdmin: sessionData?.session?.user?.email === 'admin@bitbeheer.nl',
    hasToken: !!sessionData?.session?.access_token,
    tokenPreview: sessionData?.session?.access_token?.substring(0, 50) + '...',
    sessionError
  });
  
  // 2. Try count query
  const { count, error: countError } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });
  
  console.log('📊 Count query:', { count, error: countError });
  
  // 3. Try select query
  const { data: appointments, error: selectError } = await supabase
    .from('appointments')
    .select('id, user_email, date, start_time, status')
    .limit(5);
  
  console.log('📊 Select query:', {
    count: appointments?.length || 0,
    appointments,
    error: selectError
  });
  
  // 4. Decode JWT to see what's inside (if token exists)
  if (sessionData?.session?.access_token) {
    try {
      const payload = JSON.parse(atob(sessionData.session.access_token.split('.')[1]));
      console.log('🔐 JWT Payload:', {
        email: payload.email,
        role: payload.role,
        sub: payload.sub,
        fullPayload: payload
      });
    } catch (e) {
      console.warn('⚠️ Could not decode JWT:', e);
    }
  }
  
  return {
    sessionEmail: sessionData?.session?.user?.email,
    isAdmin: sessionData?.session?.user?.email === 'admin@bitbeheer.nl',
    appointmentCount: count,
    appointments: appointments || [],
    errors: {
      session: sessionError,
      count: countError,
      select: selectError
    }
  };
})();

