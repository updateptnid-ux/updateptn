-- ============================================
-- ALLOW PUBLIC READ AFFILIATE CODE FOR VALIDATION
-- Everyone can read affiliate codes (for promo code validation)
-- ============================================

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own affiliate account" ON public.affiliates;

-- Create new policy: Users can view their OWN affiliate account
CREATE POLICY "Users can view their own affiliate account"
  ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);

-- Create new policy: Anyone can read affiliate codes for validation (PUBLIC)
CREATE POLICY "Public can read affiliate codes for validation"
  ON public.affiliates FOR SELECT
  USING (true);  -- Anyone can SELECT

-- Note: The most permissive policy wins, so users can:
-- 1. View their own affiliate account (full data)
-- 2. View all affiliate codes (for promo validation)

COMMENT ON POLICY "Public can read affiliate codes for validation" ON public.affiliates IS 
'Allows anyone to read affiliate data for promo code validation at checkout';
