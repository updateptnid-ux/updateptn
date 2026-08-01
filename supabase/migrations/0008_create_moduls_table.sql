-- ========================================================
-- UPDATEPTN MIGRATION 0008: CREATE MISSING MODULS TABLE
-- Jalankan file ini di Supabase Dashboard → SQL Editor
-- ========================================================

-- Table: moduls (bahan belajar digital: video, PDF, dll)
CREATE TABLE IF NOT EXISTS public.moduls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'video' CHECK (type IN ('video', 'pdf')),
  subject_name TEXT,
  url TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.moduls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view moduls" ON public.moduls FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify moduls" ON public.moduls FOR ALL USING (TRUE);
