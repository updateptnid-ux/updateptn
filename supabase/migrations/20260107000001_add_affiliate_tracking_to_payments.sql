-- ============================================
-- ADD AFFILIATE TRACKING TO PAYMENTS TABLE
-- Created: 2026-01-07
-- Description: Add affiliate_id for promo code commission tracking
-- ============================================

-- Add affiliate_id column to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS payments_affiliate_id_idx ON payments(affiliate_id);

-- Add comment
COMMENT ON COLUMN payments.affiliate_id IS 'Affiliate who provided promo code (for commission tracking)';

-- Backfill: Try to match existing voucher_code to affiliate_code
-- This is safe and will only update rows where voucher_code matches an affiliate code
UPDATE payments p
SET affiliate_id = a.id
FROM public.affiliates a
WHERE p.voucher_code = a.affiliate_code
  AND p.affiliate_id IS NULL
  AND a.status = 'active';

