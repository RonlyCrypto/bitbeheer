-- Create cycle_advisor_settings table for user preferences
CREATE TABLE IF NOT EXISTS cycle_advisor_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  mode VARCHAR(20) DEFAULT 'balanced' CHECK (mode IN ('conservative', 'balanced', 'aggressive')),
  show_roi_projections BOOLEAN DEFAULT true,
  show_cycle_comparison BOOLEAN DEFAULT true,
  notification_on_buy_signal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  UNIQUE(user_id)
);

-- Create cycle_advisor_log table for tracking advisor recommendations and user actions
CREATE TABLE IF NOT EXISTS cycle_advisor_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_number INT NOT NULL,
  current_phase VARCHAR(20) NOT NULL,
  price_at_time DECIMAL(15, 2) NOT NULL,
  price_position_status VARCHAR(20) NOT NULL,
  recommendation_level VARCHAR(20) NOT NULL,
  investment_amount DECIMAL(15, 2),
  roi_projection JSONB, -- Store all ROI scenarios
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_cycle_advisor_settings_user_id ON cycle_advisor_settings(user_id);
CREATE INDEX idx_cycle_advisor_log_user_id ON cycle_advisor_log(user_id);
CREATE INDEX idx_cycle_advisor_log_created_at ON cycle_advisor_log(created_at);
CREATE INDEX idx_cycle_advisor_log_cycle ON cycle_advisor_log(cycle_number);

-- Enable Row Level Security
ALTER TABLE cycle_advisor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_advisor_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for cycle_advisor_settings
CREATE POLICY cycle_advisor_settings_select ON cycle_advisor_settings
  FOR SELECT USING (auth.uid() = user_id OR (SELECT user_type FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY cycle_advisor_settings_insert ON cycle_advisor_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cycle_advisor_settings_update ON cycle_advisor_settings
  FOR UPDATE USING (auth.uid() = user_id OR (SELECT user_type FROM users WHERE id = auth.uid()) = 'admin')
  WITH CHECK (auth.uid() = user_id OR (SELECT user_type FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY cycle_advisor_settings_delete ON cycle_advisor_settings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for cycle_advisor_log
CREATE POLICY cycle_advisor_log_select ON cycle_advisor_log
  FOR SELECT USING (auth.uid() = user_id OR (SELECT user_type FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY cycle_advisor_log_insert ON cycle_advisor_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cycle_advisor_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cycle_advisor_settings_update_timestamp
BEFORE UPDATE ON cycle_advisor_settings
FOR EACH ROW
EXECUTE FUNCTION update_cycle_advisor_settings_timestamp();

