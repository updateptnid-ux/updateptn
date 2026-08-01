-- ========================================================
-- UPDATEPTN MVP INITIAL DATABASE MIGRATION
-- ========================================================

-- 1. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  target_ptn TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, target_ptn, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Siswa UpdatePTN'),
    COALESCE(NEW.raw_user_meta_data->>'target_ptn', 'Universitas Indonesia'),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. TRYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.tryouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tryouts
ALTER TABLE public.tryouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tryouts"
  ON public.tryouts FOR SELECT
  USING (is_active = TRUE);


-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tryout_id UUID NOT NULL REFERENCES public.tryouts(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view questions of active tryouts"
  ON public.questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tryouts t
      WHERE t.id = questions.tryout_id AND t.is_active = TRUE
    )
  );


-- 4. RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tryout_id UUID NOT NULL REFERENCES public.tryouts(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for results
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tryout results"
  ON public.results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tryout results"
  ON public.results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- SAMPLE SEED DATA FOR DEMO TRYOUT
-- ========================================================

INSERT INTO public.tryouts (id, title, description, duration_minutes, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Try Out SNBT 2026 - Episode 1',
  'Simulasi lengkap UTBK SNBT dengan 150+ soal TPS, Literasi Bahasa Indonesia, Literasi Bahasa Inggris, dan Penalaran Matematika standar IRT BPPP.',
  120,
  TRUE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (tryout_id, text, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Jika p -> q bernilai salah, manakah dari pernyataan berikut yang pasti bernilai benar?',
  'p bernilai salah dan q bernilai benar',
  'p bernilai benar dan q bernilai salah',
  'p bernilai benar dan q bernilai benar',
  'p bernilai salah dan q bernilai salah',
  'Tidak dapat ditentukan nilai kebenarannya',
  'B',
  'Implikasi p -> q hanya bernilai salah jika anteseden (p) bernilai benar dan konsekuen (q) bernilai salah (B -> S = S).'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Suatu barisan aritmatika memiliki suku ke-3 sama dengan 11 dan suku ke-7 sama dengan 27. Berapakah suku ke-10 barisan tersebut?',
  '35',
  '37',
  '39',
  '41',
  '43',
  'C',
  'Diketahui U3 = a + 2b = 11 dan U7 = a + 6b = 27. Kurangkan kedua persamaan: 4b = 16 => b = 4. Substitusi b=4: a + 8 = 11 => a = 3. Maka U10 = a + 9b = 3 + 9(4) = 39.'
) ON CONFLICT DO NOTHING;
