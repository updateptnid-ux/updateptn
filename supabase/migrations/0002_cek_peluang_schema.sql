-- ========================================================
-- UPDATEPTN CEK PELUANG SCHEMA & SEED DATA
-- ========================================================

-- 1. UNIVERSITIES TABLE
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for universities
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view universities"
  ON public.universities FOR SELECT
  USING (TRUE);


-- 2. MAJORS TABLE
CREATE TABLE IF NOT EXISTS public.majors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  passing_grade NUMERIC(5,2) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for majors
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view majors"
  ON public.majors FOR SELECT
  USING (TRUE);


-- ========================================================
-- SEED DATA: UNIVERSITIES & MAJORS
-- ========================================================

-- Insert Universities
INSERT INTO public.universities (id, name, code, location)
VALUES
  ('22222222-2222-2222-2222-222222222221', 'Universitas Indonesia (UI)', 'UI', 'Depok, Jawa Barat'),
  ('22222222-2222-2222-2222-222222222222', 'Universitas Gadjah Mada (UGM)', 'UGM', 'Sleman, D.I. Yogyakarta'),
  ('22222222-2222-2222-2222-222222222223', 'Institut Teknologi Bandung (ITB)', 'ITB', 'Bandung, Jawa Barat')
ON CONFLICT (name) DO NOTHING;

-- Insert Majors for UI
INSERT INTO public.majors (university_id, name, passing_grade, capacity)
VALUES
  ('22222222-2222-2222-2222-222222222221', 'S1 Ilmu Komputer / Teknik Informatika', 710.00, 60),
  ('22222222-2222-2222-2222-222222222221', 'S1 Kedokteran', 735.00, 75),
  ('22222222-2222-2222-2222-222222222221', 'S1 Ilmu Hukum', 670.00, 90),
  ('22222222-2222-2222-2222-222222222221', 'S1 Manajemen', 685.00, 80)
ON CONFLICT DO NOTHING;

-- Insert Majors for UGM
INSERT INTO public.majors (university_id, name, passing_grade, capacity)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'S1 Teknologi Informasi', 700.00, 55),
  ('22222222-2222-2222-2222-222222222222', 'S1 Kedokteran', 730.00, 70),
  ('22222222-2222-2222-2222-222222222222', 'S1 Psikologi', 665.00, 85),
  ('22222222-2222-2222-2222-222222222222', 'S1 Akuntansi', 680.00, 75)
ON CONFLICT DO NOTHING;

-- Insert Majors for ITB
INSERT INTO public.majors (university_id, name, passing_grade, capacity)
VALUES
  ('22222222-2222-2222-2222-222222222223', 'STEI - Sekolah Teknik Elektro dan Informatika', 725.00, 100),
  ('22222222-2222-2222-2222-222222222223', 'FTI - Fakultas Teknologi Industri', 695.00, 90)
ON CONFLICT DO NOTHING;
