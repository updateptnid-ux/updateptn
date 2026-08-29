-- supabase/migrations/20260822000000_add_tryout_type.sql
-- Deskripsi: Menambahkan kolom tryout_type ke tabel tryouts untuk membedakan SNBT dan Mandiri

-- ── UP ──────────────────────────────────────────────────────
ALTER TABLE public.tryouts 
  ADD COLUMN IF NOT EXISTS tryout_type TEXT NOT NULL DEFAULT 'snbt' 
  CHECK (tryout_type IN ('snbt', 'mandiri'));

-- Semua tryout yang sudah ada otomatis menjadi 'snbt'
COMMENT ON COLUMN public.tryouts.tryout_type IS 'Tipe try out: snbt atau mandiri';
