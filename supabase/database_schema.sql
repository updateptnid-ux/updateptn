-- ============================================
-- COMPLETE DATABASE SCHEMA FOR UPDATEPTN
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. TRYOUTS TABLE
CREATE TABLE IF NOT EXISTS tryouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  total_questions INTEGER NOT NULL DEFAULT 155,
  scheduled_date DATE NOT NULL,
  is_free BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. QUESTIONS TABLE (Bank Soal)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tryout_id UUID REFERENCES tryouts(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
  explanation TEXT,
  subject TEXT, -- e.g., "Penalaran Umum", "Matematika"
  difficulty TEXT CHECK (difficulty IN ('Mudah', 'Sedang', 'Sulit')),
  irt_discrimination DECIMAL(5,3), -- IRT parameter a
  irt_difficulty DECIMAL(5,3),     -- IRT parameter b
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MODULS TABLE (Video + PDF)
CREATE TABLE IF NOT EXISTS moduls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('video', 'pdf')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  content_url TEXT NOT NULL,
  duration TEXT, -- for video (e.g., "12:45")
  pages INTEGER, -- for PDF
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. LIVE_CLASSES TABLE
CREATE TABLE IF NOT EXISTS live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tutor_name TEXT NOT NULL,
  tutor_avatar_url TEXT,
  category TEXT NOT NULL,
  scheduled_at DATE NOT NULL,
  time TEXT NOT NULL,
  meeting_url TEXT NOT NULL,
  replay_url TEXT,
  material_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PRODI_REFERENCE TABLE (Already exists, but here's the schema)
CREATE TABLE IF NOT EXISTS prodi_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  univ TEXT NOT NULL,
  prodi TEXT NOT NULL,
  jenjang TEXT,
  kelompok TEXT,
  passing_grade_est DECIMAL(6,2),
  keketatan DECIMAL(5,2),
  daya_tampung INTEGER,
  peminat INTEGER,
  ukt_min INTEGER,
  ukt_max INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. RESULTS TABLE (Try Out Results)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_id UUID NOT NULL REFERENCES tryouts(id) ON DELETE CASCADE,
  score DECIMAL(6,2) NOT NULL,
  score_tps DECIMAL(6,2),
  score_literasi DECIMAL(6,2),
  irt_score DECIMAL(6,2),
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  total_unanswered INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. USER_ANSWERS TABLE (Individual answers)
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_id UUID NOT NULL REFERENCES tryouts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT CHECK (answer IN ('A', 'B', 'C', 'D', 'E', NULL)),
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tryout_id, question_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_questions_tryout_id ON questions(tryout_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_tryout_id ON results(tryout_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_tryout ON user_answers(user_id, tryout_id);
CREATE INDEX IF NOT EXISTS idx_moduls_category ON moduls(category);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_prodi_univ ON prodi_reference(univ);
CREATE INDEX IF NOT EXISTS idx_prodi_kelompok ON prodi_reference(kelompok);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE tryouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moduls ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prodi_reference ENABLE ROW LEVEL SECURITY;

-- Public read for tryouts, moduls, live_classes, prodi
CREATE POLICY "Public can view active tryouts"
  ON tryouts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Public can view active moduls"
  ON moduls FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active live_classes"
  ON live_classes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view prodi"
  ON prodi_reference FOR SELECT
  USING (true);

-- Users can only see their own results and answers
CREATE POLICY "Users can view own results"
  ON results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON user_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can do everything
CREATE POLICY "Admins can manage all data"
  ON tryouts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage moduls"
  ON moduls FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage live_classes"
  ON live_classes FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to search prodi
CREATE OR REPLACE FUNCTION search_kampus_pintar(keyword TEXT)
RETURNS SETOF prodi_reference AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM prodi_reference
  WHERE 
    LOWER(univ) LIKE LOWER('%' || keyword || '%') OR
    LOWER(prodi) LIKE LOWER('%' || keyword || '%')
  ORDER BY univ, prodi
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate IRT score (placeholder)
CREATE OR REPLACE FUNCTION calculate_irt_score(
  user_id_param UUID,
  tryout_id_param UUID
)
RETURNS DECIMAL AS $$
DECLARE
  raw_score INTEGER;
  total_questions INTEGER;
  irt_result DECIMAL;
BEGIN
  -- Count correct answers
  SELECT COUNT(*) INTO raw_score
  FROM user_answers
  WHERE user_id = user_id_param 
    AND tryout_id = tryout_id_param 
    AND is_correct = true;
  
  -- Get total questions
  SELECT COUNT(*) INTO total_questions
  FROM questions
  WHERE tryout_id = tryout_id_param;
  
  -- Simple IRT calculation (replace with actual IRT algorithm)
  irt_result := (raw_score::DECIMAL / total_questions::DECIMAL) * 1000;
  
  RETURN irt_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert sample tryout
INSERT INTO tryouts (title, description, duration_minutes, total_questions, scheduled_date, is_free, is_active)
VALUES 
  ('Try Out Nasional UTBK SNBT - Seri 01', 'Simulasi lengkap TPS & Literasi sesuai kisi-kisi terbaru', 120, 155, '2026-08-05', true, true),
  ('Try Out Khusus Saintek - Batch 3', 'Fokus TPS & Penalaran Matematika', 90, 100, '2026-08-08', false, true)
ON CONFLICT (id) DO NOTHING;

-- Verify all tables
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tryouts', 'questions', 'moduls', 'live_classes', 'results', 'user_answers', 'prodi_reference')
ORDER BY tablename;
