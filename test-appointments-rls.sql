-- Test script to check RLS policies and data
-- Run this while logged in as admin in Supabase

-- 1. Check current auth context
SELECT 
  auth.role() as current_role,
  auth.jwt() ->> 'email' as jwt_email,
  auth.uid() as user_id;

-- 2. Check if appointments exist
SELECT COUNT(*) as total_appointments FROM public.appointments;

-- 3. Try to select appointments (this will use RLS)
SELECT id, user_email, date, start_time, status 
FROM public.appointments 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check existing RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'appointments'
ORDER BY cmd, policyname;

-- 5. Check if admin email matches
SELECT 
  CASE 
    WHEN auth.jwt() ->> 'email' = 'admin@bitbeheer.nl' THEN '✅ Admin detected'
    ELSE '❌ Not admin: ' || (auth.jwt() ->> 'email')
  END as admin_check;

