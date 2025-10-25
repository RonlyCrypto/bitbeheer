-- Quick fix for users table - add missing columns
-- Run this in Supabase SQL Editor

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration_date VARCHAR(100);

-- Update existing records
UPDATE users 
SET 
  is_admin = FALSE,
  is_test = FALSE,
  login_count = 0
WHERE is_admin IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_category ON users(category);
