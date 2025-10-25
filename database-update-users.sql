-- Update users table to add missing columns
-- Run this in your Supabase SQL editor

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date VARCHAR(100),
ADD COLUMN IF NOT EXISTS timestamp VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_login VARCHAR(100),
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS registration_date VARCHAR(100);

-- Update existing records to have proper values
UPDATE users 
SET 
  date = TO_CHAR(created_at, 'DD-MM-YYYY, HH24:MI:SS'),
  timestamp = created_at::text,
  registration_date = TO_CHAR(created_at, 'YYYY-MM-DD')
WHERE date IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_category ON users(category);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (for now)
CREATE POLICY "Allow public access to users" ON users
FOR ALL USING (true);

-- Update the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
