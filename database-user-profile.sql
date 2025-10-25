-- Database update for user profile fields
-- Run this in your Supabase SQL editor

-- Add user profile columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS investment_plans TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS expectations TEXT;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Add comments for documentation
COMMENT ON COLUMN users.phone IS 'User phone number from registration form';
COMMENT ON COLUMN users.investment_plans IS 'User investment plans and goals';
COMMENT ON COLUMN users.experience IS 'User experience level with Bitcoin/crypto';
COMMENT ON COLUMN users.motivation IS 'User motivation for investing in Bitcoin';
COMMENT ON COLUMN users.expectations IS 'User expectations from guidance';

-- Update existing users to have default values
UPDATE users 
SET 
  phone = '',
  investment_plans = '',
  experience = '',
  motivation = '',
  expectations = ''
WHERE phone IS NULL;

-- Create a view for user profiles with all data
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  name,
  phone,
  investment_plans,
  experience,
  motivation,
  expectations,
  category,
  email_verified,
  created_at,
  verified_at,
  updated_at
FROM users
WHERE category = 'nieuwe_gebruiker'
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;
