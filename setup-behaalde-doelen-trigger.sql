-- Create goals table if it doesn't exist
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  target_amount DECIMAL(15, 2),
  current_amount DECIMAL(15, 2) DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  UNIQUE(user_id, title)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_email ON goals(email);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS goals_select ON goals;
DROP POLICY IF EXISTS goals_insert ON goals;
DROP POLICY IF EXISTS goals_update ON goals;
DROP POLICY IF EXISTS goals_delete ON goals;

-- RLS policies for goals
CREATE POLICY goals_select ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY goals_insert ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY goals_update ON goals
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY goals_delete ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle signup completion and create/update behaalde doelen
CREATE OR REPLACE FUNCTION on_signup_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- When an account is approved (first_appointment_completed = true)
  -- Create a "Behaalde Doelen: Aanmelding Voltooid" goal for the user
  IF NEW.first_appointment_completed = true AND OLD.first_appointment_completed != true THEN
    INSERT INTO goals (user_id, email, title, description, category, status, target_amount, current_amount, target_date)
    VALUES (
      NEW.user_id,
      NEW.email,
      'Aanmelding Voltooid',
      'Je hebt alle stappen van het aanmeldingsproces voltooid!',
      'Aanmelding',
      'completed',
      1,
      1,
      NOW()::date
    )
    ON CONFLICT (user_id, title) 
    DO UPDATE SET 
      status = 'completed',
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE EXCLUDED.status != 'completed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS account_signup_completion_trigger ON accounts;

-- Create trigger on accounts table
CREATE TRIGGER account_signup_completion_trigger
AFTER UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION on_signup_completion();

-- Function to update goals timestamp
CREATE OR REPLACE FUNCTION update_goals_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing timestamp trigger if it exists
DROP TRIGGER IF EXISTS goals_update_timestamp ON goals;

-- Create timestamp trigger for goals
CREATE TRIGGER goals_update_timestamp
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_goals_timestamp();

-- Function to sync user_id with email in goals table
CREATE OR REPLACE FUNCTION sync_goals_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If a goal is created with email but no user_id, try to find the user_id
  IF NEW.user_id IS NULL AND NEW.email IS NOT NULL THEN
    SELECT id INTO NEW.user_id FROM auth.users WHERE email = NEW.email LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing user_id sync trigger if it exists
DROP TRIGGER IF EXISTS goals_sync_user_id ON goals;

-- Create user_id sync trigger
CREATE TRIGGER goals_sync_user_id
BEFORE INSERT ON goals
FOR EACH ROW
EXECUTE FUNCTION sync_goals_user_id();

-- Backfill existing completed accounts with the "Aanmelding Voltooid" goal
INSERT INTO goals (user_id, email, title, description, category, status, target_amount, current_amount, target_date)
SELECT 
  u.id,
  a.email,
  'Aanmelding Voltooid',
  'Je hebt alle stappen van het aanmeldingsproces voltooid!',
  'Aanmelding',
  'completed',
  1,
  1,
  a.updated_at::date
FROM accounts a
LEFT JOIN auth.users u ON u.email = a.email
WHERE a.first_appointment_completed = true
AND NOT EXISTS (
  SELECT 1 FROM goals 
  WHERE email = a.email 
  AND title = 'Aanmelding Voltooid'
)
ON CONFLICT (user_id, title) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON goals TO authenticated;

