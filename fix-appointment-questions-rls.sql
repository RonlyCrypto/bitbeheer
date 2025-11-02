-- Fix RLS policies for appointment_questions table
-- This allows users to save their appointment questions

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can read their own appointment questions" ON public.appointment_questions;
DROP POLICY IF EXISTS "Users can insert their own appointment questions" ON public.appointment_questions;
DROP POLICY IF EXISTS "Users can update their own appointment questions" ON public.appointment_questions;
DROP POLICY IF EXISTS "Admin can read all appointment questions" ON public.appointment_questions;
DROP POLICY IF EXISTS "Admin can update appointment questions" ON public.appointment_questions;

-- Users can read their own appointment questions
CREATE POLICY "Users can read their own appointment questions" ON public.appointment_questions
  FOR SELECT
  USING (
    -- User can see questions where user_email matches their email
    (auth.jwt() ->> 'email')::text = user_email
    OR
    -- User can see questions for their appointments
    appointment_id IN (
      SELECT id FROM public.appointments 
      WHERE user_email = (auth.jwt() ->> 'email')::text
    )
  );

-- Users can insert their own appointment questions
CREATE POLICY "Users can insert their own appointment questions" ON public.appointment_questions
  FOR INSERT
  WITH CHECK (
    -- User can only insert questions with their own email
    (auth.jwt() ->> 'email')::text = user_email
    AND
    -- User can only insert questions for their own appointments
    appointment_id IN (
      SELECT id FROM public.appointments 
      WHERE user_email = (auth.jwt() ->> 'email')::text
    )
  );

-- Users can update their own appointment questions
CREATE POLICY "Users can update their own appointment questions" ON public.appointment_questions
  FOR UPDATE
  USING (
    -- User can only update questions with their own email
    (auth.jwt() ->> 'email')::text = user_email
    AND
    -- User can only update questions for their own appointments
    appointment_id IN (
      SELECT id FROM public.appointments 
      WHERE user_email = (auth.jwt() ->> 'email')::text
    )
  );

-- Admin can read all appointment questions
CREATE POLICY "Admin can read all appointment questions" ON public.appointment_questions
  FOR SELECT
  USING (
    -- Admin email from JWT
    (auth.jwt() ->> 'email')::text = 'admin@bitbeheer.nl'
    OR
    -- Check if user has admin role in metadata
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Admin can update appointment questions
CREATE POLICY "Admin can update appointment questions" ON public.appointment_questions
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'email')::text = 'admin@bitbeheer.nl'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Admin can insert appointment questions (for creating on behalf of users)
CREATE POLICY "Admin can insert appointment questions" ON public.appointment_questions
  FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'email')::text = 'admin@bitbeheer.nl'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

COMMENT ON TABLE public.appointment_questions IS 'Fixed RLS policies to allow users to save their appointment questions';

