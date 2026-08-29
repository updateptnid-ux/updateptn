-- supabase/migrations/20260827000000_add_voucher_category.sql
-- Deskripsi: Menambahkan kolom kategori pada tabel vouchers untuk membedakan peruntukan voucher.

ALTER TABLE IF EXISTS public.vouchers 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'universal';
