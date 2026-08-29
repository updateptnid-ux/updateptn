-- supabase/migrations/20260822000002_add_allow_free_claim.sql
-- Deskripsi: Menambahkan kolom allow_free_claim ke tabel tryouts untuk menentukan apakah TO premium bisa diklaim gratis bersyarat

-- ── UP ──────────────────────────────────────────────────────
ALTER TABLE public.tryouts 
  ADD COLUMN IF NOT EXISTS allow_free_claim BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.tryouts.allow_free_claim IS 'Apakah tryout premium ini diperbolehkan untuk diklaim gratis bersyarat (follow sosmed)';
