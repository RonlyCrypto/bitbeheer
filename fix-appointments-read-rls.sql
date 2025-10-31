-- Fix RLS policies for reading appointments during impersonation
-- This allows admin to read appointments for any user (needed for impersonation)

-- Drop existing admin read policy if it exists
DROP POLICY IF EXISTS "Admin can read all appointments" ON public.appointments;

-- Admin can read all appointments (needed for impersonation support)
CREATE POLICY "Admin can read all appointments"
  ON public.appointments
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- Verify policies exist
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

