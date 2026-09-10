-- Migration: Auto-expire subscriptions when expires_at is in the past
-- This prevents the issue of active subscriptions showing past their expiry date

-- Create a function to auto-expire subscriptions
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- If the subscription is being marked as active but expires_at is in the past
  IF NEW.status = 'active' AND NEW.expires_at < NOW() THEN
    NEW.status = 'expired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_check_subscription_expiry ON subscriptions;
CREATE TRIGGER trigger_check_subscription_expiry
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_expiry();

-- Fix existing expired subscriptions
UPDATE subscriptions
SET 
  status = 'expired',
  updated_at = NOW()
WHERE 
  status = 'active' 
  AND expires_at < NOW();

-- Add helpful comment
COMMENT ON FUNCTION check_subscription_expiry() IS 
  'Automatically sets subscription status to expired if expires_at is in the past. Prevents active subscriptions from showing beyond their expiry date.';
