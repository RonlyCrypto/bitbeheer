-- Fix ALL RLS policies for appointments to ensure admin can read/write everything
-- This script replaces all existing policies with correct ones

-- First, disable RLS temporarily to ensure policies are correct
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for clean setup
DROP POLICY IF EXISTS "Users can read their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can read all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can update appointments" ON public.appointments;

-- 1. Users can read their own appointments
CREATE POLICY "Users can read their own appointments"
  ON public.appointments
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

-- 2. Users can create their own appointments
CREATE POLICY "Users can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

-- 3. Admin can read ALL appointments (crucial for admin dashboard and impersonation)
CREATE POLICY "Admin can read all appointments"
  ON public.appointments
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- 4. Admin can create appointments for any user (for impersonation support)
CREATE POLICY "Admin can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- 5. Admin can update any appointment
CREATE POLICY "Admin can update appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- IMPORTANT: Make sure the admin policy is permissive (allows OR with user policy)
-- RLS policies are OR-ed together, so admin policy should work even if user policy doesn't match

-- Verify all policies exist
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

-- Test query (run while logged in as admin)
-- This should return all appointments if admin policy works
-- SELECT COUNT(*) FROM public.appointments;

