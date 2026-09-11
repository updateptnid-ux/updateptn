-- =====================================================================
-- RLS POLICIES FOR PAYMENTS: ADMIN ACCESS & MANAGEMENT
-- Created: 2026-09-11
-- Description: Allow admin users to view, update, and delete all payment records.
-- =====================================================================

-- 1. Enable RLS on payments table if not already enabled
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing admin policies to ensure idempotency
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payments" ON public.payments;

-- 3. Policy: Select payments (users view own, admins view all)
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = payments.user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  );

-- 4. Policy: Update payments (users update own, admins update all)
CREATE POLICY "System can update payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = payments.user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  );

-- 5. Policy: Delete payments (admins can delete payments)
CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  );

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
