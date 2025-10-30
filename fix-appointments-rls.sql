-- Quick fix script for appointments RLS policies
-- Run this if you're getting "row-level security policy" errors

-- Drop and recreate the admin create policy
DROP POLICY IF EXISTS "Admin can create appointments" ON public.appointments;

CREATE POLICY "Admin can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
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

