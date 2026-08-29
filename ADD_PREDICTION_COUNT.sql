-- Migration: Add prediction_count column to profiles table
-- Purpose: Track free trial usage for "Cek Peluang PTN" feature
-- Rule: Free users get 2 predictions, Premium/Plus get unlimited

-- Add prediction_count column (default 0)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS prediction_count INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN profiles.prediction_count IS 'Number of times user has used Cek Peluang feature (free limit: 2)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_prediction_count ON profiles(prediction_count);

-- Update existing users to 0 if NULL
UPDATE profiles 
SET prediction_count = 0 
WHERE prediction_count IS NULL;
