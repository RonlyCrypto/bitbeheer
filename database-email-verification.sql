-- Database update for email verification system
-- Run this in your Supabase SQL editor

-- Add email verification columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_created TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for verification token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Update existing users to have email_verified = true (they were created before verification system)
UPDATE users 
SET email_verified = TRUE, verified_at = created_at
WHERE email_verified IS NULL;

-- Create a function to clean up expired verification tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete users who haven't verified their email within 5 days
  DELETE FROM users 
  WHERE email_verified = FALSE 
    AND verification_token_created IS NOT NULL 
    AND verification_token_created < NOW() - INTERVAL '5 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup daily (if you have pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-verifications', '0 2 * * *', 'SELECT cleanup_expired_verifications();');

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_verifications() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_verifications() TO anon;

-- Add RLS policies for verification
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy for users to update their own verification status
CREATE POLICY "Users can update own verification" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Policy for service role to manage all users
CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN users.verification_token IS 'Unique token for email verification';
COMMENT ON COLUMN users.verification_token_created IS 'When the verification token was created';
COMMENT ON COLUMN users.verified_at IS 'When the email was verified';

-- Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW user_verification_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email_verified = TRUE) as verified_users,
  COUNT(*) FILTER (WHERE email_verified = FALSE AND verification_token_created IS NOT NULL) as pending_verification,
  COUNT(*) FILTER (WHERE email_verified = FALSE AND verification_token_created < NOW() - INTERVAL '5 days') as expired_verification,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_today,
  COUNT(*) FILTER (WHERE verified_at >= CURRENT_DATE) as verified_today
FROM users;

-- Grant access to the view
GRANT SELECT ON user_verification_stats TO authenticated;
GRANT SELECT ON user_verification_stats TO anon;
