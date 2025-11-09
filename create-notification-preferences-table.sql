-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  -- Bear market buys notification
  bear_market_buys_enabled BOOLEAN DEFAULT false,
  bear_market_buys_contact_method TEXT CHECK (bear_market_buys_contact_method IN ('email', 'phone')) DEFAULT 'email',
  
  -- Market alerts
  bear_market_alerts_enabled BOOLEAN DEFAULT false,
  bull_market_alerts_enabled BOOLEAN DEFAULT false,
  
  -- Goal achievements
  goal_achievements_enabled BOOLEAN DEFAULT false,
  
  -- Global settings (admin controlled)
  bear_market_buys_global_enabled BOOLEAN DEFAULT true,
  bear_market_alerts_global_enabled BOOLEAN DEFAULT true,
  bull_market_alerts_global_enabled BOOLEAN DEFAULT true,
  goal_achievements_global_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_email ON notification_preferences(email);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_bear_market_buys ON notification_preferences(bear_market_buys_enabled) WHERE bear_market_buys_enabled = true;

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read and update their own preferences
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all preferences
CREATE POLICY "Admins can view all notification preferences"
  ON notification_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = auth.uid() 
      AND accounts.is_admin = true
    )
  );

-- Policy: Admins can update global settings
CREATE POLICY "Admins can update global notification settings"
  ON notification_preferences FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = auth.uid() 
      AND accounts.is_admin = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

