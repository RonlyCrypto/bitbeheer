-- Quick fix for user profile fields
-- Run this in your Supabase SQL editor

-- Add user profile columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS investment_plans TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS expectations TEXT;

-- Update existing users to have default values
UPDATE users 
SET 
  phone = COALESCE(phone, ''),
  investment_plans = COALESCE(investment_plans, ''),
  experience = COALESCE(experience, ''),
  motivation = COALESCE(motivation, ''),
  expectations = COALESCE(expectations, '')
WHERE phone IS NULL OR investment_plans IS NULL OR experience IS NULL OR motivation IS NULL OR expectations IS NULL;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Add comments for documentation
COMMENT ON COLUMN users.phone IS 'User phone number from registration form';
COMMENT ON COLUMN users.investment_plans IS 'User investment plans and goals';
COMMENT ON COLUMN users.experience IS 'User experience level with Bitcoin/crypto';
COMMENT ON COLUMN users.motivation IS 'User motivation for investing in Bitcoin';
COMMENT ON COLUMN users.expectations IS 'User expectations from guidance';
