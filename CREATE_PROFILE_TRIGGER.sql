-- ============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
-- This trigger automatically creates a profile record 
-- when a new user signs up via Supabase Auth
-- No more "Profile not found" errors!

-- 1. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    subscription_status,
    subscription_tier,
    prediction_count,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'student',
    NULL,
    'Basic',
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Verify trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- BACKFILL: Create profiles for existing users without profile
-- ============================================
-- Run this ONCE to create profiles for users who signed up before the trigger

INSERT INTO public.profiles (
  id,
  email,
  name,
  role,
  subscription_status,
  subscription_tier,
  prediction_count,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  'student',
  NULL,
  'Basic',
  0,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;  -- Only insert if profile doesn't exist

-- Check how many profiles were created
SELECT COUNT(*) as "Profiles Created" FROM public.profiles;

-- ============================================
-- ADMIN SETUP: Set admin role for specific email
-- ============================================
UPDATE public.profiles 
SET role = 'admin',
    subscription_status = 'active',
    subscription_tier = 'Premium'
WHERE email IN ('updateptnid@gmail.com', 'admin@updateptn.id');

-- Verify admin setup
SELECT id, email, role, subscription_tier 
FROM public.profiles 
WHERE role = 'admin';
