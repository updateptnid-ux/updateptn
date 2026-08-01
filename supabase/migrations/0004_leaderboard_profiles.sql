-- ============================================================
-- MIGRATION: Leaderboard support
-- Menambahkan kolom profil dan RLS policy untuk leaderboard
-- ============================================================

-- 1. Tambah kolom tambahan ke profiles (jika belum ada)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS asal_sekolah TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_prodi TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 2. Update trigger agar sync metadata baru dari auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, target_ptn, asal_sekolah, target_prodi, bio, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Siswa UpdatePTN'),
    COALESCE(NEW.raw_user_meta_data->>'target_ptn', ''),
    COALESCE(NEW.raw_user_meta_data->>'asal_sekolah', ''),
    COALESCE(NEW.raw_user_meta_data->>'target_prodi', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Policy: semua user authenticated boleh lihat SKOR di leaderboard
--    (tidak expose email/data sensitif, hanya skor + nama profil)
CREATE POLICY IF NOT EXISTS "Authenticated users can view leaderboard"
  ON public.results FOR SELECT
  TO authenticated
  USING (TRUE);

-- 4. View leaderboard: ambil best score per user per tryout
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  r.user_id,
  p.full_name,
  p.asal_sekolah,
  p.target_prodi,
  MAX(r.score) AS best_score,
  COUNT(r.id)  AS total_tryouts,
  t.title AS tryout_title,
  r.tryout_id,
  RANK() OVER (PARTITION BY r.tryout_id ORDER BY MAX(r.score) DESC) AS rank
FROM public.results r
JOIN public.profiles p ON p.id = r.user_id
JOIN public.tryouts t ON t.id = r.tryout_id
GROUP BY r.user_id, p.full_name, p.asal_sekolah, p.target_prodi, r.tryout_id, t.title;

-- 5. Grant read access ke leaderboard view
GRANT SELECT ON public.leaderboard TO authenticated;
