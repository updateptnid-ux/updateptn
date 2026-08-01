-- ============================================
-- SETUP ADMIN ACCESS FOR updateptnid@gmail.com
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'tutor')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Users can read their own role
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only service role can insert/update/delete roles
CREATE POLICY "Service role can manage roles"
  ON user_roles FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Insert admin role for updateptnid@gmail.com
-- First, get the user_id from auth.users
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find user_id for updateptnid@gmail.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'updateptnid@gmail.com'
  LIMIT 1;

  -- If user exists, insert admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'admin', updated_at = now();
    
    RAISE NOTICE 'Admin role assigned to updateptnid@gmail.com (user_id: %)', admin_user_id;
  ELSE
    RAISE NOTICE 'User updateptnid@gmail.com not found. Please create account first!';
  END IF;
END $$;

-- 5. Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN user_roles r ON u.id = r.user_id
    WHERE u.email = user_email AND r.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verify setup
SELECT 
  u.email,
  r.role,
  r.created_at
FROM auth.users u
JOIN user_roles r ON u.id = r.user_id
WHERE u.email = 'updateptnid@gmail.com';

-- Expected output: updateptnid@gmail.com | admin | [timestamp]
