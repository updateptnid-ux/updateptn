-- ============================================
-- MANUAL OAUTH PROFILE FIX
-- Run this script if you need to manually fix OAuth user profiles
-- ============================================

-- Step 1: Check profiles table structure
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Add missing columns if needed
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS asal_sekolah TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_ptn TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_prodi TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS provinsi TEXT DEFAULT '';

-- Step 3: Check users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'full_name' AS metadata_name,
  p.id IS NULL AS missing_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 4: Create missing profiles
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
  COALESCE(
    au.raw_user_meta_data->>'target_univ', 
    au.raw_user_meta_data->>'target_ptn', 
    ''
  ) AS target_ptn,
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
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 5: Update existing profiles with missing data from metadata
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

-- Step 6: Verify fix - check profiles with complete data
SELECT 
  p.id,
  p.full_name,
  p.asal_sekolah,
  p.target_ptn,
  p.target_prodi,
  p.provinsi,
  p.bio,
  p.role,
  p.created_at,
  au.email,
  au.raw_user_meta_data->>'provider' AS auth_provider
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC
LIMIT 20;

-- Step 7: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- Step 8: Enable RLS if not enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 9: Drop old policies (if any conflicts)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Step 10: Create fresh RLS policies
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 11: Create performance indexes
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS profiles_full_name_idx ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS profiles_target_ptn_idx ON public.profiles(target_ptn);

-- Step 12: Final verification - count stats
SELECT 
  'Total Auth Users' AS metric,
  COUNT(*) AS count
FROM auth.users
UNION ALL
SELECT 
  'Total Profiles' AS metric,
  COUNT(*) AS count
FROM public.profiles
UNION ALL
SELECT 
  'OAuth Users' AS metric,
  COUNT(*) AS count
FROM auth.users
WHERE raw_user_meta_data->>'provider' IN ('google', 'github', 'facebook')
UNION ALL
SELECT 
  'Profiles with Complete Data' AS metric,
  COUNT(*) AS count
FROM public.profiles
WHERE 
  full_name IS NOT NULL AND full_name != '' AND
  (asal_sekolah IS NOT NULL) AND
  (target_ptn IS NOT NULL) AND
  (target_prodi IS NOT NULL);

-- DONE! OAuth profile fix complete.
-- Users should now be able to:
-- 1. Sign in with Google
-- 2. Access their profile page
-- 3. Update their profile data
-- 4. View dashboard without errors
