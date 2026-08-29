-- ============================================
-- ADD is_premium COLUMN TO videos TABLE
-- Copy-paste SQL ini ke Supabase SQL Editor
-- ============================================

-- Add is_premium column to videos table (default false = gratis)
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN videos.is_premium IS 'true = Premium (butuh langganan), false = Gratis untuk semua';

-- Verify column added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'videos' 
  AND column_name = 'is_premium';
