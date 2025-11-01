-- Database trigger for automatic login confirmation emails
-- This trigger will automatically send login confirmation emails via Supabase Edge Function
-- when a user logs in, without requiring frontend calls

-- Step 1: Create a table to log login events (optional, for tracking)
CREATE TABLE IF NOT EXISTS public.login_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own login events
CREATE POLICY "Users can view own login events" ON public.login_events
  FOR SELECT USING (auth.uid() = user_id);

-- Step 2: Create a function to handle login events
-- Note: Supabase doesn't have direct Auth event triggers in PostgreSQL
-- Alternative: Use Supabase Edge Function webhook or call from application layer
-- For now, this creates a function that can be called manually or via Edge Function

CREATE OR REPLACE FUNCTION public.log_login_event(
  p_user_email VARCHAR(255),
  p_user_id UUID,
  p_ip_address VARCHAR(45) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_login_event_id UUID;
BEGIN
  INSERT INTO public.login_events (
    user_email,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    p_user_email,
    p_user_id,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_login_event_id;
  
  RETURN v_login_event_id;
END;
$$;

-- Step 3: Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_login_event TO authenticated;

-- Note: To automatically send emails on login, you would need to:
-- 1. Set up a Supabase Edge Function webhook for auth events
-- 2. Or call the log_login_event function from your application's backend
-- 3. The Edge Function can then call send-login-confirmation function

-- Example Edge Function webhook setup (this would be in Supabase Dashboard):
-- Go to: Database > Webhooks > New Webhook
-- Event: auth.users.insert (for new logins)
-- Or use Supabase Realtime to listen for auth events

-- Alternative: Use Supabase Auth hooks in Edge Function
-- Create an Edge Function that listens to auth webhooks
-- This avoids CORS issues and keeps email logic server-side

