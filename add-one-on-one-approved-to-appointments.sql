-- Add one_on_one_approved field to appointments table
-- This tracks if the admin has approved the 1-on-1 meeting

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS one_on_one_approved BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_appointments_one_on_one_approved ON public.appointments(one_on_one_approved);

-- Add comment for clarity
COMMENT ON COLUMN public.appointments.one_on_one_approved IS 'Indicates if the admin has approved the 1-on-1 meeting and fully activated the user account';

