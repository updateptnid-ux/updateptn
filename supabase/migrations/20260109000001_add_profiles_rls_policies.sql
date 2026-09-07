-- ============================================
-- PROFILES TABLE RLS POLICIES
-- Created: 2026-01-09
-- Description: Ensure users can read and update their own profiles
-- ============================================

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile  
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile (for manual profile creation if trigger fails)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow public read access for leaderboard (optional, can be removed if not needed)
-- Uncomment if you want profiles to be publicly readable for leaderboard
-- CREATE POLICY "Enable read access for all users"
-- ON public.profiles
-- FOR SELECT
-- TO public
-- USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS profiles_full_name_idx ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS profiles_target_ptn_idx ON public.profiles(target_ptn);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profile data with RLS policies for secure access';
