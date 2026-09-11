-- =====================================================================
-- RBAC ENHANCEMENT: ADD ROLES (KOL & BA) + MARKETING SPECIAL ACCESS
-- Created: 2026-09-11
-- Description:
-- 1. Adds 'is_marketing' and 'free_access' flags to public.profiles.
-- 2. Enforces allowed roles ('student', 'admin', 'kol', 'ba') via CHECK constraint.
-- 3. Adds indexes for fast role and marketing lookups.
-- 4. Adds security trigger to prevent regular users from elevating their
--    own role or marketing flag via client SDK.
-- =====================================================================

-- 1. Add columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_marketing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS free_access BOOLEAN DEFAULT false;

-- 2. Add comments for documentation
COMMENT ON COLUMN public.profiles.is_marketing IS 'Flag khusus tim marketing: role tetap student untuk UI/UX asli tapi gratis akses semua fitur bimbel (bypass paywall)';
COMMENT ON COLUMN public.profiles.free_access IS 'Flag akses gratis umum (fasilitas / bimbel bypass)';

-- 3. Ensure role has a default of 'student' and enforce allowed roles
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'student';

-- Add check constraint for valid roles if not already present
DO $$
BEGIN
  -- Normalize any existing null roles to 'student'
  UPDATE public.profiles
  SET role = 'student'
  WHERE role IS NULL OR role = '';

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('student', 'admin', 'kol', 'ba'));
  END IF;
END $$;

-- 4. Create indexes for role and marketing flags
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_is_marketing_idx ON public.profiles(is_marketing);
CREATE INDEX IF NOT EXISTS profiles_free_access_idx ON public.profiles(free_access);

-- 5. Security Trigger: Prevent users from modifying their own role or marketing flag via Client SDK
-- Regular users authenticate with 'authenticated' role; only service_role or database admin can update these fields.
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoked by standard client (not service_role)
  IF current_setting('role', true) <> 'service_role' THEN
    -- If user attempts to change role
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      NEW.role := OLD.role;
    END IF;

    -- If user attempts to change is_marketing
    IF NEW.is_marketing IS DISTINCT FROM OLD.is_marketing THEN
      NEW.is_marketing := OLD.is_marketing;
    END IF;

    -- If user attempts to change free_access
    IF NEW.free_access IS DISTINCT FROM OLD.free_access THEN
      NEW.free_access := OLD.free_access;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists then recreate
DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;

CREATE TRIGGER trg_prevent_self_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_escalation();

-- =====================================================================
-- SQL HELPER EXAMPLES FOR ADMIN USAGE:
--
-- 1. Jadikan user sebagai KOL:
--    UPDATE public.profiles SET role = 'kol' WHERE id = '<USER_UUID>';
--    atau WHERE email = 'user@example.com' (jika join dengan auth.users);
--
-- 2. Jadikan user sebagai Brand Ambassador (BA):
--    UPDATE public.profiles SET role = 'ba' WHERE id = '<USER_UUID>';
--
-- 3. Jadikan user sebagai Tim Marketing (role tetap student tapi free access):
--    UPDATE public.profiles SET role = 'student', is_marketing = true WHERE id = '<USER_UUID>';
--
-- 4. Kembalikan ke siswa reguler:
--    UPDATE public.profiles SET role = 'student', is_marketing = false, free_access = false WHERE id = '<USER_UUID>';
-- =====================================================================
