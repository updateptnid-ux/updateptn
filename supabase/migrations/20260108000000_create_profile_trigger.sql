-- ============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- Created: 2026-01-08
-- Description: Trigger untuk auto-create profile pas user sign up (email atau OAuth)
-- ============================================

-- Function untuk handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert ke tabel profiles dengan data dari auth.users
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
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'asal_sekolah', ''),
    COALESCE(NEW.raw_user_meta_data->>'target_univ', NEW.raw_user_meta_data->>'target_ptn', ''),
    COALESCE(NEW.raw_user_meta_data->>'target_prodi', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'provinsi', ''),
    0,
    0,
    'student',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Kalau sudah ada, skip (ga overwrite)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Jalankan function di atas setiap ada user baru
-- Drop trigger jika sudah ada (tanpa IF NOT EXISTS)
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Komentar
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-create profile saat user baru sign up (email atau OAuth Google)';
