-- Extend update_own_account_setting to let the admin write on behalf of an
-- impersonated user (still only via this narrow, explicit function -- never
-- via direct table access), while everyone else can only ever touch their
-- own row regardless of what they pass in.
CREATE OR REPLACE FUNCTION public.update_own_account_setting(
  p_field TEXT,
  p_bool_value BOOLEAN DEFAULT NULL,
  p_json_value JSONB DEFAULT NULL,
  p_target_email TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_email TEXT := auth.jwt() ->> 'email';
  v_target_email TEXT;
BEGIN
  IF v_caller_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_target_email IS NOT NULL AND v_caller_email = 'admin@bitbeheer.nl' THEN
    v_target_email := p_target_email;
  ELSE
    v_target_email := v_caller_email;
  END IF;

  IF p_field = 'milestones_opt_in' THEN
    UPDATE public.accounts SET milestones_opt_in = p_bool_value, updated_at = now() WHERE email = v_target_email;
  ELSIF p_field = 'ritme_discipline_opt_in' THEN
    UPDATE public.accounts SET ritme_discipline_opt_in = p_bool_value, updated_at = now() WHERE email = v_target_email;
  ELSIF p_field = 'strategy' THEN
    UPDATE public.accounts SET strategy = p_json_value, updated_at = now() WHERE email = v_target_email;
  ELSE
    RAISE EXCEPTION 'Field not allowed: %', p_field;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_own_account_setting(TEXT, BOOLEAN, JSONB, TEXT) TO authenticated;
