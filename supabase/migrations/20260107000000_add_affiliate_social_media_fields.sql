-- ============================================
-- ADD SOCIAL MEDIA INFO TO AFFILIATES
-- Created: 2026-01-07
-- Description: Tambah kolom untuk info media sosial affiliate
-- ============================================

-- Tambah kolom social_media_info ke tabel affiliates
ALTER TABLE public.affiliates
  ADD COLUMN IF NOT EXISTS social_media_info TEXT;

-- Tambah index untuk search
CREATE INDEX IF NOT EXISTS idx_affiliates_social_media ON public.affiliates(social_media_info) WHERE social_media_info IS NOT NULL;

-- Komentar untuk dokumentasi
COMMENT ON COLUMN public.affiliates.social_media_info IS 'Info media sosial affiliate (format: platform:username, contoh: instagram:@username)';
