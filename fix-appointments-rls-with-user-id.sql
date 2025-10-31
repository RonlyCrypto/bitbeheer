-- Fix RLS policies for appointments with user ID fallback
-- This ensures admin policies work even if JWT email is not set correctly

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can read all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can update appointments" ON public.appointments;

-- IMPORTANT: Get admin user ID first
-- Run this query to get the admin user ID:
-- SELECT id, email FROM auth.users WHERE email = 'admin@bitbeheer.nl';

-- Replace 'YOUR_ADMIN_USER_ID_HERE' with the actual UUID from the query above
-- Or use this approach with a subquery:

-- 1. Users can read their own appointments (using email OR user ID)
CREATE POLICY "Users can read their own appointments"
  ON public.appointments
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    (
      user_email = (auth.jwt() ->> 'email') OR
      -- Fallback: if email not in JWT, check user ID if appointments table has user_id column
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = appointments.user_email
      )
    )
  );

-- 2. Users can create appointments (using email OR user ID)
CREATE POLICY "Users can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      user_email = (auth.jwt() ->> 'email') OR
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = appointments.user_email
      )
    )
  );

-- 3. Admin can read ALL appointments
-- Check by email first, then by user ID if email doesn't work
CREATE POLICY "Admin can read all appointments"
  ON public.appointments
  FOR SELECT
  USING (
    -- Email check (primary)
    (auth.jwt() ->> 'email') = 'admin@bitbeheer.nl'
    OR
    -- User ID check (fallback - replace with actual admin UUID)
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@bitbeheer.nl'
      AND auth.users.email = (auth.jwt() ->> 'email')
    )
  );

-- 4. Admin can create appointments for any user
CREATE POLICY "Admin can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@bitbeheer.nl'
    OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@bitbeheer.nl'
    )
  );

-- 5. Admin can update any appointment
CREATE POLICY "Admin can update appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') = 'admin@bitbeheer.nl'
    OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@bitbeheer.nl'
    )
  );

-- Verify all policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'appointments'
ORDER BY cmd, policyname;

