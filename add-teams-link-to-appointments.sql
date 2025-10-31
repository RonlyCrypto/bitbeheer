-- Add teams_link column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS teams_link TEXT;

-- Update RLS to allow users to update their own pending appointments (for cancellation)
DROP POLICY IF EXISTS "Users can update their own pending appointments" ON public.appointments;

CREATE POLICY "Users can update their own pending appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email') AND
    status = 'pending'
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

