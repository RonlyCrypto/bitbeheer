-- Quick fix script for appointments RLS policies
-- Run this if you're getting "row-level security policy" errors

-- IMPORTANT: Make sure you're running this as the database owner or with proper permissions

-- First, verify RLS is enabled
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can create appointments" ON public.appointments;

-- Users can create their own appointments
CREATE POLICY "Users can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

-- Admin can create appointments for any user (for impersonation support)
-- IMPORTANT: This allows admin to insert with ANY user_email, not just their own
CREATE POLICY "Admin can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- Verify policies exist and show their details
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
ORDER BY policyname;

-- Test query to check current auth context (run while logged in as admin)
-- SELECT 
--   auth.role() as current_role,
--   auth.jwt() ->> 'email' as jwt_email,
--   auth.uid() as user_id;

