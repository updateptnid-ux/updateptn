-- supabase/migrations/20260825000001_fix_prediction_count_rpc.sql
-- Deskripsi: Buat RPC function untuk increment prediction_count bypass RLS
--            dan pastikan kolom prediction_count ada + RLS policy UPDATE tersedia

-- ── 1. Pastikan kolom prediction_count ada ──────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS prediction_count INTEGER NOT NULL DEFAULT 0;

-- Inisialisasi NULL ke 0 untuk user lama
UPDATE public.profiles
SET prediction_count = 0
WHERE prediction_count IS NULL;

-- ── 2. Buat function increment_prediction_count (SECURITY DEFINER = bypass RLS) ──
CREATE OR REPLACE FUNCTION public.increment_prediction_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE profiles
  SET prediction_count = prediction_count + 1
  WHERE id = p_user_id
  RETURNING prediction_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

-- Grant execute ke authenticated users
GRANT EXECUTE ON FUNCTION public.increment_prediction_count(UUID) TO authenticated;

-- ── 3. Buat function get_prediction_count (SECURITY DEFINER = bypass RLS) ──
CREATE OR REPLACE FUNCTION public.get_prediction_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(prediction_count, 0)
  INTO v_count
  FROM profiles
  WHERE id = p_user_id;

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_prediction_count(UUID) TO authenticated;
