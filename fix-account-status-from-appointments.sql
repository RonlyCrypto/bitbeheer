-- Fix account status based on appointments
-- This script updates first_appointment_completed and account_approved based on confirmed appointments

-- Update accounts table where user has completed appointments
UPDATE accounts a
SET 
  first_appointment_completed = CASE 
    WHEN EXISTS (
      SELECT 1 FROM appointments 
      WHERE user_email = a.email 
      AND status = 'confirmed'
      AND one_on_one_approved = true
      LIMIT 1
    ) THEN true
    ELSE first_appointment_completed
  END,
  account_approved = CASE 
    WHEN EXISTS (
      SELECT 1 FROM appointments 
      WHERE user_email = a.email 
      AND status = 'confirmed'
      AND one_on_one_approved = true
      LIMIT 1
    ) THEN true
    ELSE account_approved
  END,
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE EXISTS (
  SELECT 1 FROM appointments 
  WHERE user_email = a.email 
  AND status = 'confirmed'
  AND one_on_one_approved = true
);

-- Also create trigger to auto-update account status when appointment is confirmed and approved
CREATE OR REPLACE FUNCTION on_appointment_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- When an appointment is confirmed and one_on_one_approved
  IF NEW.status = 'confirmed' AND NEW.one_on_one_approved = true THEN
    -- Update account status for this user
    UPDATE accounts 
    SET 
      first_appointment_completed = true,
      account_approved = true,
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE email = NEW.user_email
    AND (first_appointment_completed = false OR account_approved = false);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS appointment_confirmed_trigger ON appointments;

-- Create trigger
CREATE TRIGGER appointment_confirmed_trigger
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION on_appointment_confirmed();

-- Log the updates
SELECT 
  COUNT(*) as total_updated,
  COUNT(DISTINCT email) as unique_users
FROM (
  SELECT a.email
  FROM accounts a
  WHERE EXISTS (
    SELECT 1 FROM appointments 
    WHERE user_email = a.email 
    AND status = 'confirmed'
    AND one_on_one_approved = true
    LIMIT 1
  )
  AND (a.first_appointment_completed = false OR a.account_approved = false)
) as updated_accounts;

