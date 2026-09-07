-- ============================================
-- FIX MISSING AFFILIATE CODES
-- Generate affiliate codes for existing active affiliates
-- ============================================

-- Update affiliates yang sudah active tapi belum punya code
UPDATE public.affiliates
SET 
  affiliate_code = generate_affiliate_code(),
  updated_at = NOW()
WHERE 
  status = 'active' 
  AND (affiliate_code IS NULL OR affiliate_code = '');

-- Verify results
SELECT 
  id,
  full_name,
  email,
  affiliate_code,
  status,
  approved_at
FROM public.affiliates
WHERE status = 'active'
ORDER BY approved_at DESC;
