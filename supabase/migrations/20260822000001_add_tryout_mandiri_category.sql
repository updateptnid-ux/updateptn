-- supabase/migrations/20260822000001_add_tryout_mandiri_category.sql
-- Deskripsi: Menambahkan kolom mandiri_category ke tabel tryouts untuk spesifikasi jenis ujian mandiri

-- ── UP ──────────────────────────────────────────────────────
ALTER TABLE public.tryouts 
  ADD COLUMN IF NOT EXISTS mandiri_category TEXT DEFAULT NULL;

COMMENT ON COLUMN public.tryouts.mandiri_category IS 'Kategori ujian mandiri: SIMAK UI, UM-CBT UGM, SMMPTN-Barat, dll';
