-- ========================================================
-- UPDATEPTN LIVE CLASS SCHEMA & SEED DATA
-- ========================================================

-- 1. LIVE_CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  mentor_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  meeting_url TEXT,
  material_url TEXT,
  replay_url TEXT,
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for live_classes
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live classes"
  ON public.live_classes FOR SELECT
  USING (TRUE);


-- ========================================================
-- SEED DATA: LIVE CLASSES
-- ========================================================

INSERT INTO public.live_classes (id, title, mentor_name, scheduled_at, meeting_url, material_url, replay_url, status)
VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    'Mastery Class: Trik Cepat Penalaran Matematika UTBK',
    'Kak Sarah, M.Sc (Alumni ITB)',
    NOW(),
    'https://zoom.us/j/987654321',
    'https://updateptn.id/materials/penalaran-matematika.pdf',
    NULL,
    'ongoing'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'Bedah Pola Soal Penalaran Umum 2026',
    'Kak Fikri, S.Kom (Alumni UI)',
    NOW() + INTERVAL '1 day',
    'https://zoom.us/j/123456789',
    'https://updateptn.id/materials/penalaran-umum.pdf',
    NULL,
    'upcoming'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Trik Cepat Kuasai Literasi Bahasa Inggris UTBK',
    'Kak Dimas, M.A (Alumni UGM)',
    NOW() - INTERVAL '2 days',
    NULL,
    'https://updateptn.id/materials/literasi-inggris.pdf',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'completed'
  )
ON CONFLICT (id) DO NOTHING;
