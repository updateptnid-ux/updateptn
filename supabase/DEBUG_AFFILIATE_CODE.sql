-- ============================================
-- DEBUG AFFILIATE CODE DETECTION
-- Check kenapa kode tidak terdeteksi
-- ============================================

-- 1. Check apakah affiliate dengan kode PTN-B17F4D ada
SELECT 
  id,
  user_id,
  full_name,
  email,
  affiliate_code,
  status,
  commission_rate,
  created_at,
  approved_at
FROM public.affiliates
WHERE affiliate_code = 'PTN-B17F4D';

-- 2. Check dengan ILIKE (case insensitive) - ini yang dipakai di code
SELECT 
  id,
  user_id,
  full_name,
  email,
  affiliate_code,
  status,
  commission_rate
FROM public.affiliates
WHERE affiliate_code ILIKE 'PTN-B17F4D';

-- 3. Check semua affiliate active
SELECT 
  id,
  full_name,
  email,
  affiliate_code,
  status
FROM public.affiliates
WHERE status = 'active'
ORDER BY created_at DESC;

-- 4. Check affiliate tanpa code (masih kosong)
SELECT 
  id,
  full_name,
  email,
  affiliate_code,
  status
FROM public.affiliates
WHERE status = 'active' 
  AND (affiliate_code IS NULL OR affiliate_code = '');

-- 5. Check RLS policies untuk table affiliates
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'affiliates';
