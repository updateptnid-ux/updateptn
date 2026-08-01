-- ============================================================
-- MIGRATION 0005: Fix missing columns & leaderboard view
-- Jalankan file ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tambah kolom tambahan ke profiles (jika belum ada)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS asal_sekolah TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_prodi TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 2. Tambah kolom total_questions ke tryouts (jika belum ada)
ALTER TABLE public.tryouts
  ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;

-- Update existing tryout dengan jumlah soal aktual
UPDATE public.tryouts t
SET total_questions = (
  SELECT COUNT(*) FROM public.questions q WHERE q.tryout_id = t.id
);

-- 3. Update trigger agar sync metadata baru dari auth
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

-- 4. Policy: semua user authenticated boleh lihat SKOR di leaderboard
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'results'
    AND policyname = 'Authenticated users can view leaderboard'
  ) THEN
    CREATE POLICY "Authenticated users can view leaderboard"
      ON public.results FOR SELECT
      TO authenticated
      USING (TRUE);
  END IF;
END $$;

-- 5. Drop dan recreate view leaderboard
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard AS
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

-- 6. Grant read access ke leaderboard view
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.leaderboard TO anon;

-- 7. Policy agar semua authenticated bisa baca profiles (untuk leaderboard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Authenticated users can view all profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view all profiles"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (TRUE);
  END IF;
END $$;
