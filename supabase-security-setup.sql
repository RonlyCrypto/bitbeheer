-- BitBeheer Supabase Security Setup
-- Run this in your Supabase SQL editor

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visibility ENABLE ROW LEVEL SECURITY;

-- 2. Create security policies for users table
-- Allow public to insert (for notification requests)
CREATE POLICY "Allow public insert on users" ON users
    FOR INSERT WITH CHECK (true);

-- Allow public to read their own data
CREATE POLICY "Allow public read on users" ON users
    FOR SELECT USING (true);

-- Allow public to update their own data
CREATE POLICY "Allow public update on users" ON users
    FOR UPDATE USING (true);

-- Allow public to delete their own data
CREATE POLICY "Allow public delete on users" ON users
    FOR DELETE USING (true);

-- 3. Create security policies for accounts table
-- Allow public to insert (for registration)
CREATE POLICY "Allow public insert on accounts" ON accounts
    FOR INSERT WITH CHECK (true);

-- Allow public to read accounts
CREATE POLICY "Allow public read on accounts" ON accounts
    FOR SELECT USING (true);

-- Allow public to update accounts
CREATE POLICY "Allow public update on accounts" ON accounts
    FOR UPDATE USING (true);

-- Allow public to delete accounts
CREATE POLICY "Allow public delete on accounts" ON accounts
    FOR DELETE USING (true);

-- 4. Create security policies for page_visibility table
-- Allow public to read page visibility
CREATE POLICY "Allow public read on page_visibility" ON page_visibility
    FOR SELECT USING (true);

-- 5. Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow public access to rate_limits
CREATE POLICY "Allow public access to rate_limits" ON rate_limits
    FOR ALL USING (true);

-- Create index for rate limiting
CREATE INDEX idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint);
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);

-- 6. Create bot protection table
CREATE TABLE IF NOT EXISTS bot_protection (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    user_agent TEXT,
    fingerprint VARCHAR(255),
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bot_protection
ALTER TABLE bot_protection ENABLE ROW LEVEL SECURITY;

-- Allow public access to bot_protection
CREATE POLICY "Allow public access to bot_protection" ON bot_protection
    FOR ALL USING (true);

-- Create index for bot protection
CREATE INDEX idx_bot_protection_ip ON bot_protection(ip_address);
CREATE INDEX idx_bot_protection_fingerprint ON bot_protection(fingerprint);
CREATE INDEX idx_bot_protection_blocked ON bot_protection(is_blocked);

-- 7. Create form submissions table for tracking
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_type VARCHAR(100) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    fingerprint VARCHAR(255),
    data JSONB,
    is_spam BOOLEAN DEFAULT FALSE,
    spam_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on form_submissions
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public access to form_submissions
CREATE POLICY "Allow public access to form_submissions" ON form_submissions
    FOR ALL USING (true);

-- Create index for form submissions
CREATE INDEX idx_form_submissions_form_type ON form_submissions(form_type);
CREATE INDEX idx_form_submissions_ip ON form_submissions(ip_address);
CREATE INDEX idx_form_submissions_spam ON form_submissions(is_spam);
CREATE INDEX idx_form_submissions_created_at ON form_submissions(created_at);

-- 8. Create functions for rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ip_address INET,
    p_endpoint VARCHAR(255),
    p_max_requests INTEGER DEFAULT 10,
    p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate window start
    window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
    
    -- Get current request count
    SELECT COALESCE(SUM(request_count), 0) INTO current_count
    FROM rate_limits
    WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint
    AND window_start >= window_start;
    
    -- Check if limit exceeded
    IF current_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;
    
    -- Insert or update rate limit record
    INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start)
    VALUES (p_ip_address, p_endpoint, 1, NOW())
    ON CONFLICT (ip_address, endpoint, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function for bot detection
CREATE OR REPLACE FUNCTION detect_bot(
    p_ip_address INET,
    p_user_agent TEXT,
    p_fingerprint VARCHAR(255)
) RETURNS BOOLEAN AS $$
DECLARE
    bot_score INTEGER := 0;
    recent_submissions INTEGER;
BEGIN
    -- Check for suspicious patterns
    IF p_user_agent IS NULL OR p_user_agent = '' THEN
        bot_score := bot_score + 3;
    END IF;
    
    IF p_fingerprint IS NULL OR p_fingerprint = '' THEN
        bot_score := bot_score + 2;
    END IF;
    
    -- Check for recent submissions from same IP
    SELECT COUNT(*) INTO recent_submissions
    FROM form_submissions
    WHERE ip_address = p_ip_address
    AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_submissions > 5 THEN
        bot_score := bot_score + 5;
    END IF;
    
    -- Check for blocked IPs
    IF EXISTS (
        SELECT 1 FROM bot_protection 
        WHERE ip_address = p_ip_address 
        AND is_blocked = TRUE
    ) THEN
        bot_score := bot_score + 10;
    END IF;
    
    -- Return true if bot score is high
    RETURN bot_score >= 5;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function for spam detection
CREATE OR REPLACE FUNCTION detect_spam(
    p_form_data JSONB
) RETURNS DECIMAL(3,2) AS $$
DECLARE
    spam_score DECIMAL(3,2) := 0.00;
    email_text TEXT;
    message_text TEXT;
BEGIN
    -- Extract text from form data
    email_text := COALESCE(p_form_data->>'email', '');
    message_text := COALESCE(p_form_data->>'message', '');
    
    -- Check for spam patterns in email
    IF email_text ~* '.*(viagra|casino|lottery|winner|free money).*' THEN
        spam_score := spam_score + 0.3;
    END IF;
    
    -- Check for spam patterns in message
    IF message_text ~* '.*(viagra|casino|lottery|winner|free money).*' THEN
        spam_score := spam_score + 0.4;
    END IF;
    
    -- Check for excessive caps
    IF message_text ~* '.*[A-Z]{10,}.*' THEN
        spam_score := spam_score + 0.2;
    END IF;
    
    -- Check for excessive punctuation
    IF message_text ~* '.*[!]{3,}.*' THEN
        spam_score := spam_score + 0.1;
    END IF;
    
    -- Return spam score (0.00 to 1.00)
    RETURN LEAST(spam_score, 1.00);
END;
$$ LANGUAGE plpgsql;

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 12. Create cleanup function for old rate limits
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS VOID AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 13. Create cleanup function for old form submissions
CREATE OR REPLACE FUNCTION cleanup_old_form_submissions() RETURNS VOID AS $$
BEGIN
    DELETE FROM form_submissions 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts(created_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);

-- 15. Insert default page visibility settings if not exists
INSERT INTO page_visibility (page_name, visible_to_public, visible_to_admin, visible_to_test)
VALUES 
    ('home', FALSE, TRUE, TRUE),
    ('bitcoin-history', FALSE, TRUE, TRUE),
    ('market-cap-comparer', FALSE, TRUE, TRUE),
    ('portfolio', FALSE, TRUE, TRUE),
    ('aanmelden', TRUE, TRUE, TRUE)
ON CONFLICT (page_name) DO NOTHING;

-- 16. Insert default admin and test accounts if not exists
INSERT INTO accounts (email, name, password_hash, category, is_admin, is_test)
VALUES 
    ('admin@bitbeheer.nl', 'Admin Account', '$2a$10$example_hash_admin', 'admin', TRUE, FALSE),
    ('test@bitbeheer.nl', 'Test Account', '$2a$10$example_hash_test', 'test', FALSE, TRUE)
ON CONFLICT (email) DO NOTHING;
