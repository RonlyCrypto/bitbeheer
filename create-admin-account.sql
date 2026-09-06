-- Create Admin Account in Supabase
-- Execute this in Supabase SQL Editor

-- First, create the admin user in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@bitbeheer.nl',
  crypt('admin20xx', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User", "is_admin": true}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
);

-- Get the user ID for the admin user
WITH admin_user AS (
  SELECT id FROM auth.users WHERE email = 'admin@bitbeheer.nl'
)
-- Create corresponding account in public.accounts table
INSERT INTO public.accounts (
  id,
  email,
  name,
  password_hash,
  category,
  created_at,
  updated_at,
  last_login,
  login_count,
  is_admin,
  is_test,
  bevestigd,
  actief,
  email_verified,
  verified_at
)
SELECT 
  au.id,
  'admin@bitbeheer.nl',
  'Admin User',
  crypt('admin20xx', gen_salt('bf')),
  'admin',
  NOW(),
  NOW(),
  NOW(),
  0,
  true,
  false,
  true,
  true,
  true,
  NOW()
FROM admin_user au;

-- Verify the admin account was created
SELECT 
  a.email, 
  a.name, 
  a.category, 
  a.is_admin,
  a.bevestigd,
  a.actief,
  a.email_verified
FROM public.accounts a 
WHERE a.email = 'admin@bitbeheer.nl';
