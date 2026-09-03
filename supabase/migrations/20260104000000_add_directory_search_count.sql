-- Add directory_search_count column to profiles table
-- This tracks how many times users search in the directory (free users limited to 3)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS directory_search_count INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS profiles_directory_search_count_idx 
ON profiles(directory_search_count);

-- Comment for documentation
COMMENT ON COLUMN profiles.directory_search_count IS 
'Number of directory searches performed (free users limited to 3, premium unlimited)';

-- Optional: Reset existing users to 0 if column already existed
UPDATE profiles 
SET directory_search_count = 0 
WHERE directory_search_count IS NULL;
