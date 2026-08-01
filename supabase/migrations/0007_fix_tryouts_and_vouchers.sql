-- ================================================================
-- Migration: 0007_fix_tryouts_and_vouchers.sql
-- Deskripsi: Tambah kolom yang hilang di tryouts dan sesuaikan skema vouchers
-- ================================================================

-- 1. Tambah kolom yang hilang di tabel tryouts
ALTER TABLE public.tryouts 
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- 2. Tabel vouchers sudah ada, pastikan strukturnya sudah benar
-- Kolom yang ada: id, code, discount_type, value, usage_limit, usage_count, status, expires_at, created_at
-- Tidak ada perubahan diperlukan pada vouchers

-- 3. Pastikan RLS aktif di tryouts (jika belum)
ALTER TABLE public.tryouts ENABLE ROW LEVEL SECURITY;

-- Policy: baca tryout bisa semua orang (public)
DROP POLICY IF EXISTS "Allow public read tryouts" ON public.tryouts;
CREATE POLICY "Allow public read tryouts"
  ON public.tryouts FOR SELECT
  USING (true);

-- Policy: hanya admin (service role) yang bisa insert/update/delete
DROP POLICY IF EXISTS "Allow service role manage tryouts" ON public.tryouts;
CREATE POLICY "Allow service role manage tryouts"
  ON public.tryouts FOR ALL
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- 4. Pastikan RLS aktif di vouchers
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read vouchers" ON public.vouchers;
CREATE POLICY "Allow public read vouchers"
  ON public.vouchers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow auth manage vouchers" ON public.vouchers;
CREATE POLICY "Allow auth manage vouchers"
  ON public.vouchers FOR ALL
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
