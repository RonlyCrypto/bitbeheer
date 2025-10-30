-- Simplified version: Minimal RLS for quick setup
-- Run this if you encounter issues with the full version

-- Available time slots (set by admin)
CREATE TABLE IF NOT EXISTS public.available_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, start_time)
);

-- Booked appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  slot_id UUID REFERENCES public.available_slots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 20,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_email ON public.appointments(user_email);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_available_slots_date ON public.available_slots(date);

-- Enable RLS but with simple policies
ALTER TABLE public.available_slots DISABLE ROW LEVEL SECURITY; -- Admin only via app
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies using JWT email (no auth.users access needed)
DROP POLICY IF EXISTS "Users can read their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can read all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can update appointments" ON public.appointments;

-- Users can read their own appointments
CREATE POLICY "Users can read their own appointments"
  ON public.appointments
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

-- Users can create their own appointments
CREATE POLICY "Users can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

-- Admin can read all appointments
CREATE POLICY "Admin can read all appointments"
  ON public.appointments
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- Admin can update appointments
CREATE POLICY "Admin can update appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- Grant necessary permissions
GRANT ALL ON public.available_slots TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.available_slots TO anon;
GRANT ALL ON public.appointments TO anon;

