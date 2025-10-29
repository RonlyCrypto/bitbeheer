-- Create impersonation sessions table
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_session_id ON public.impersonation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_admin_email ON public.impersonation_sessions(admin_email);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_user_email ON public.impersonation_sessions(user_email);

-- Enable RLS
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin can manage impersonation sessions" ON public.impersonation_sessions
  FOR ALL USING (admin_email = 'admin@bitbeheer.nl');

-- Create policy for service role access
CREATE POLICY "Service role can manage impersonation sessions" ON public.impersonation_sessions
  FOR ALL USING (true);
