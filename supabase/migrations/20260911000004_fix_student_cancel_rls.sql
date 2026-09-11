-- =====================================================================
-- FIX STUDENT PAYMENT CANCELLATION RLS POLICIES & CONSTRAINT
-- Created: 2026-09-11
-- Description:
-- 1. Updates payments_status_check constraint to allow 'cancelled', 'cancel', 'failed'.
-- 2. Grants UPDATE & DELETE policies for authenticated students on their own payments.
-- 3. Grants DELETE policies for pending subscriptions and related commissions.
-- 4. Reloads PostgREST schema cache.
-- =====================================================================

-- 1. Check Constraint on status column
ALTER TABLE public.payments 
  DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE public.payments 
  ADD CONSTRAINT payments_status_check 
  CHECK (status IN (
    'pending', 
    'settlement', 
    'success', 
    'capture', 
    'cancel', 
    'cancelled', 
    'canceled', 
    'expire', 
    'expired', 
    'deny', 
    'failed', 
    'refund'
  ));

-- 2. Ensure RLS is enabled
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. Clean up older or conflicting policies
DROP POLICY IF EXISTS "System can update payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own pending payments" ON public.payments;

DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own pending payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins can delete payments" ON public.payments;

-- 4. UPDATE Policy: Allow users to update their own payments (and admins to update any)
CREATE POLICY "Users and admins can update payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = payments.user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  )
  WITH CHECK (
    auth.uid() = payments.user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  );

-- 5. DELETE Policy: Allow users to delete their own payments (and admins to delete any)
CREATE POLICY "Users and admins can delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = payments.user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  );

-- 6. Allow users to delete their own pending subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can delete own pending subscriptions" ON public.subscriptions;
CREATE POLICY "Users can delete own pending subscriptions"
  ON public.subscriptions FOR DELETE
  TO authenticated
  USING (
    auth.uid() = subscriptions.user_id
    AND status = 'pending'
  );

-- 7. Allow deletion of commissions associated with user orders
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can delete own order commissions" ON public.commissions;
CREATE POLICY "Users can delete own order commissions"
  ON public.commissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.payments
      WHERE payments.order_id = commissions.order_id
        AND payments.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  );

-- 8. Enable REPLICA IDENTITY FULL and Realtime publication
ALTER TABLE public.payments REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 9. Muat ulang cache schema PostgREST
NOTIFY pgrst, 'reload schema';
