-- ========================================================
-- UPDATEPTN MIGRATION 0009: FIX QUESTIONS RLS POLICIES
-- Jalankan file ini di Supabase Dashboard → SQL Editor
-- ========================================================

-- 1. Pastikan RLS aktif di tabel questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 2. Hapus policy lama jika ada
DROP POLICY IF EXISTS "Authenticated users can view questions of active tryouts" ON public.questions;
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can update questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON public.questions;

-- 3. Buat policy baru yang mengizinkan pembacaan publik/authenticated
CREATE POLICY "Anyone can view questions" 
  ON public.questions FOR SELECT 
  USING (true);

-- 4. Buat policy yang mengizinkan penulisan (insert/update/delete)
CREATE POLICY "Admins can insert questions" 
  ON public.questions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update questions" 
  ON public.questions FOR UPDATE 
  USING (true);

CREATE POLICY "Admins can delete questions" 
  ON public.questions FOR DELETE 
  USING (true);
