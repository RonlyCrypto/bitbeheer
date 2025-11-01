-- Database function to get all user dashboard data in one query
-- This reduces frontend queries and improves performance

-- Function to get user dashboard data (appointments, account status, chat status, wallet status)
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_email VARCHAR(255))
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_user_appointments JSON;
  v_account_status JSON;
  v_chat_status JSON;
  v_wallet_status JSON;
  v_last_read_at TIMESTAMP WITH TIME ZONE;
  v_unread_count INTEGER := 0;
BEGIN
  -- Get appointments (pending or confirmed, not cancelled)
  SELECT json_agg(
    json_build_object(
      'id', id,
      'date', date,
      'start_time', start_time,
      'end_time', end_time,
      'duration_minutes', duration_minutes,
      'status', status,
      'teams_link', teams_link,
      'notes', notes,
      'created_at', created_at,
      'user_email', user_email
    )
    ORDER BY date ASC, start_time ASC
  ) INTO v_user_appointments
  FROM public.appointments
  WHERE user_email = p_user_email
    AND status IN ('pending', 'confirmed');
  
  -- Get account status from users or accounts table (with fallback)
  SELECT json_build_object(
    'account_approved', COALESCE(u.account_approved, a.account_approved, false),
    'first_appointment_completed', COALESCE(u.first_appointment_completed, a.first_appointment_completed, false),
    'email_verified', COALESCE(u.email_confirmed_at IS NOT NULL, false)
  ) INTO v_account_status
  FROM (SELECT p_user_email AS email) AS lookup
  LEFT JOIN public.users u ON u.email = lookup.email
  LEFT JOIN public.accounts a ON a.email = lookup.email
  LIMIT 1;
  
  -- Get chat read status (last_read_at from user_chat_read_status)
  SELECT last_read_at INTO v_last_read_at
  FROM public.user_chat_read_status
  WHERE user_email = p_user_email
  LIMIT 1;
  
  -- Count unread admin messages
  SELECT COUNT(*) INTO v_unread_count
  FROM public.support_messages sm
  WHERE sm.email = p_user_email
    AND sm.from_admin = true
    AND (v_last_read_at IS NULL OR sm.created_at > v_last_read_at);
  
  -- Build chat status
  v_chat_status := json_build_object(
    'last_read_at', v_last_read_at,
    'unread_count', v_unread_count,
    'has_unread', (v_unread_count > 0)
  );
  
  -- Check wallet status
  SELECT json_build_object(
    'has_wallet', EXISTS (
      SELECT 1 FROM public.wallets
      WHERE email = p_user_email
      LIMIT 1
    )
  ) INTO v_wallet_status;
  
  -- Combine all data
  SELECT json_build_object(
    'appointments', COALESCE(v_user_appointments, '[]'::json),
    'account_status', COALESCE(v_account_status, '{"account_approved": false, "first_appointment_completed": false, "email_verified": false}'::json),
    'chat_status', COALESCE(v_chat_status, '{"last_read_at": null, "unread_count": 0, "has_unread": false}'::json),
    'wallet_status', COALESCE(v_wallet_status, '{"has_wallet": false}'::json)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_dashboard_data TO authenticated;

-- Note: Function uses SECURITY DEFINER so it bypasses RLS
-- We still filter by p_user_email for security
-- Users should only call this function with their own email

-- Example usage:
-- SELECT get_user_dashboard_data('user@example.com');

