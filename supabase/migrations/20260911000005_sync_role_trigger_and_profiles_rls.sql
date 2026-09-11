-- =====================================================================
-- AUTOMATIC ROLE SYNCHRONIZATION TRIGGER & PROFILES RLS
-- Created: 2026-09-11
-- Description:
-- 1. Creates a database trigger that automatically syncs profiles.role
--    to auth.users.raw_app_meta_data and raw_user_meta_data whenever
--    profiles.role is inserted or updated.
-- 2. Synchronizes all existing profiles.role into auth.users.
-- 3. Ensures RLS policies on public.profiles allow users and admins
--    to read profiles in real time.
-- =====================================================================

-- 1. Create function to sync profile role to auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS NOT NULL THEN
    UPDATE auth.users
    SET 
      raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role),
      raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on public.profiles
DROP TRIGGER IF EXISTS trg_sync_profile_role ON public.profiles;
CREATE TRIGGER trg_sync_profile_role
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_auth_user();

-- 3. One-time sync for all existing users from profiles to auth.users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, role FROM public.profiles WHERE role IS NOT NULL LOOP
    UPDATE auth.users
    SET 
      raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', r.role),
      raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', r.role)
    WHERE id = r.id;
  END LOOP;
END $$;

-- 4. Ensure RLS on profiles allows reading
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;

CREATE POLICY "Users and admins can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR (auth.jwt()->'app_metadata'->>'role') = 'admin'
    OR (auth.jwt()->>'role') = 'admin'
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
