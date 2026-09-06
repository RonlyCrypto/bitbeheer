-- Simple Admin Account Creation
-- Execute this in Supabase SQL Editor

-- Create admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@bitbeheer.nl',
  crypt('admin20xx', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User", "is_admin": true}'
);

-- Get the admin user ID
WITH admin_user AS (
  SELECT id FROM auth.users WHERE email = 'admin@bitbeheer.nl'
)
-- Create account record
INSERT INTO public.accounts (
  id,
  email,
  name,
  password_hash,
  category,
  is_admin,
  bevestigd,
  actief,
  email_verified
)
SELECT 
  au.id,
  'admin@bitbeheer.nl',
  'Admin User',
  crypt('admin20xx', gen_salt('bf')),
  'admin',
  true,
  true,
  true,
  true
FROM admin_user au;
