-- ============================================
-- FIX PROFILES TABLE COLUMNS
-- Created: 2026-01-09
-- Description: Ensure all necessary columns exist in profiles table for OAuth users
-- ============================================

-- Add missing columns if they don't exist
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS asal_sekolah TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_ptn TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_prodi TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS provinsi TEXT DEFAULT '';

-- Backfill missing data from auth.users metadata for existing profiles
UPDATE public.profiles p
SET 
  full_name = COALESCE(
    NULLIF(p.full_name, ''), 
    au.raw_user_meta_data->>'full_name',
    au.email,
    'User'
  ),
  asal_sekolah = COALESCE(
    NULLIF(p.asal_sekolah, ''),
    au.raw_user_meta_data->>'asal_sekolah',
    ''
  ),
  target_ptn = COALESCE(
    NULLIF(p.target_ptn, ''),
    au.raw_user_meta_data->>'target_univ',
    au.raw_user_meta_data->>'target_ptn',
    ''
  ),
  target_prodi = COALESCE(
    NULLIF(p.target_prodi, ''),
    au.raw_user_meta_data->>'target_prodi',
    ''
  ),
  bio = COALESCE(
    NULLIF(p.bio, ''),
    au.raw_user_meta_data->>'bio',
    ''
  ),
  provinsi = COALESCE(
    NULLIF(p.provinsi, ''),
    au.raw_user_meta_data->>'provinsi',
    ''
  ),
  updated_at = NOW()
FROM auth.users au
WHERE p.id = au.id
  AND (
    p.full_name IS NULL OR p.full_name = '' OR
    p.asal_sekolah IS NULL OR
    p.target_ptn IS NULL OR
    p.target_prodi IS NULL OR
    p.bio IS NULL OR
    p.provinsi IS NULL
  );

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.asal_sekolah IS 'Asal sekolah siswa';
COMMENT ON COLUMN public.profiles.target_ptn IS 'Target PTN (Perguruan Tinggi Negeri)';
COMMENT ON COLUMN public.profiles.target_prodi IS 'Target Program Studi';
COMMENT ON COLUMN public.profiles.bio IS 'Bio singkat siswa';
COMMENT ON COLUMN public.profiles.provinsi IS 'Provinsi asal siswa (34 provinsi Indonesia)';

-- Log result
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % profiles with missing data from auth metadata', updated_count;
END $$;
