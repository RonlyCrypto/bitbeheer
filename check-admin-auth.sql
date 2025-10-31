-- Check if admin account exists in Supabase Auth
-- Run this in Supabase SQL Editor

-- 1. Check if admin exists in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data,
  '✅ Admin exists in auth.users' as status
FROM auth.users 
WHERE email = 'admin@bitbeheer.nl';

-- 2. If no results above, the admin account is NOT in Supabase Auth
-- You need to create it via:
-- - Supabase Dashboard → Authentication → Users → Add user
-- OR
-- - Use Supabase CLI or Admin API

-- 3. Check all auth.users to see what accounts exist
SELECT 
  email,
  email_confirmed_at IS NOT NULL as is_confirmed,
  created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 4. If admin@bitbeheer.nl is NOT in the results above:
-- Go to: Supabase Dashboard → Authentication → Users
-- Click "Add user" → Email: admin@bitbeheer.nl → Password: (your password)
-- ✅ Check "Auto Confirm User" → Create

