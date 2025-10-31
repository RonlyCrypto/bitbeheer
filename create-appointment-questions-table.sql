-- Create table to store pre-appointment questions and answers
CREATE TABLE IF NOT EXISTS public.appointment_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  
  -- Questions and answers
  has_bitcoin_experience BOOLEAN,
  knows_hardware_wallet BOOLEAN,
  has_crypto_wallet BOOLEAN,
  investment_experience TEXT, -- beginner, intermediate, advanced
  monthly_investment_budget TEXT, -- < 100, 100-500, 500-1000, > 1000
  main_goal TEXT, -- long_term, trading, dca, education
  questions_or_concerns TEXT, -- Free text
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appointment_questions ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own questions
CREATE POLICY "Users can read their own questions"
  ON public.appointment_questions
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can insert their own questions"
  ON public.appointment_questions
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can update their own questions"
  ON public.appointment_questions
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    user_email = (auth.jwt() ->> 'email')
  );

-- Admin can read all questions
CREATE POLICY "Admin can read all questions"
  ON public.appointment_questions
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'admin@bitbeheer.nl'
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_appointment_questions_appointment_id ON public.appointment_questions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_questions_user_email ON public.appointment_questions(user_email);

