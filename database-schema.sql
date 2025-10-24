-- BitBeheer Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for notification requests
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) DEFAULT 'Niet opgegeven',
  message TEXT DEFAULT 'Geen bericht',
  category VARCHAR(100) DEFAULT 'livegang',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_date TIMESTAMP WITH TIME ZONE
);

-- Accounts table for registered users
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'account_aanmelden',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  is_test BOOLEAN DEFAULT FALSE
);

-- Page visibility settings
CREATE TABLE page_visibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name VARCHAR(100) UNIQUE NOT NULL,
  visible_to_public BOOLEAN DEFAULT FALSE,
  visible_to_admin BOOLEAN DEFAULT TRUE,
  visible_to_test BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin and test accounts
INSERT INTO accounts (email, name, password_hash, category, is_admin, is_test) VALUES
('admin@bitbeheer.nl', 'Admin Account', '$2a$10$example_hash_admin', 'admin', TRUE, FALSE),
('test@bitbeheer.nl', 'Test Account', '$2a$10$example_hash_test', 'test', FALSE, TRUE);

-- Insert default page visibility settings
INSERT INTO page_visibility (page_name, visible_to_public, visible_to_admin, visible_to_test) VALUES
('home', FALSE, TRUE, TRUE),
('bitcoin-history', FALSE, TRUE, TRUE),
('market-cap-comparer', FALSE, TRUE, TRUE),
('portfolio', FALSE, TRUE, TRUE),
('aanmelden', TRUE, TRUE, TRUE);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_category ON users(category);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_email_sent ON users(email_sent);

CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_category ON accounts(category);
CREATE INDEX idx_accounts_created_at ON accounts(created_at);
CREATE INDEX idx_accounts_is_admin ON accounts(is_admin);
CREATE INDEX idx_accounts_is_test ON accounts(is_test);

CREATE INDEX idx_page_visibility_page_name ON page_visibility(page_name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_visibility_updated_at BEFORE UPDATE ON page_visibility
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visibility ENABLE ROW LEVEL SECURITY;

-- Allow public access to users table (for notification requests)
CREATE POLICY "Allow public access to users" ON users
    FOR ALL USING (true);

-- Allow public access to accounts table (for registration)
CREATE POLICY "Allow public access to accounts" ON accounts
    FOR ALL USING (true);

-- Allow public access to page_visibility table
CREATE POLICY "Allow public access to page_visibility" ON page_visibility
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
