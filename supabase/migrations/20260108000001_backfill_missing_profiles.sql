-- ============================================
-- BACKFILL MISSING PROFILES
-- Created: 2026-01-08
-- Description: Create profiles untuk users yang belum punya (OAuth users)
-- ============================================

-- Insert missing profiles untuk user yang belum punya
INSERT INTO public.profiles (
  id, 
  full_name, 
  asal_sekolah,
  target_ptn,
  target_prodi,
  bio,
  provinsi,
  prediction_count, 
  directory_search_count, 
  role, 
  created_at, 
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'User') AS full_name,
  COALESCE(au.raw_user_meta_data->>'asal_sekolah', '') AS asal_sekolah,
  COALESCE(au.raw_user_meta_data->>'target_univ', au.raw_user_meta_data->>'target_ptn', '') AS target_ptn,
  COALESCE(au.raw_user_meta_data->>'target_prodi', '') AS target_prodi,
  COALESCE(au.raw_user_meta_data->>'bio', '') AS bio,
  COALESCE(au.raw_user_meta_data->>'provinsi', '') AS provinsi,
  0 AS prediction_count,
  0 AS directory_search_count,
  'student' AS role,
  NOW() AS created_at,
  NOW() AS updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL; -- Cuma user yang belum punya profile

-- Log result
DO $$
DECLARE
  inserted_count INTEGER;
BEGIN
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RAISE NOTICE 'Created % missing profiles', inserted_count;
END $$;
