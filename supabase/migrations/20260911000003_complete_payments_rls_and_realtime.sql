-- =====================================================================
-- COMPLETE PAYMENTS RLS, CONSTRAINT & REALTIME PUBLICATION
-- Created: 2026-09-11
-- Description:
-- 1. Updates payments_status_check constraint to allow 'cancelled', 'cancel', etc.
-- 2. Grants SELECT, UPDATE, and DELETE permissions for both Students (own records) and Admins (all records).
-- 3. Enables Supabase Realtime publication and REPLICA IDENTITY FULL for instant UI updates.
-- =====================================================================

-- 1. Update check constraint on status column
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own pending payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own pending payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins can select payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins can delete payments" ON public.payments;

-- 4. SELECT Policy: Students view own payments, Admins view all
CREATE POLICY "Users and admins can select payments"
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

-- 5. UPDATE Policy: Students update own payments, Admins update any
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
  );

-- 6. DELETE Policy: Students delete their own pending/cancelled payments, Admins delete any
CREATE POLICY "Users and admins can delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (
    (
      auth.uid() = payments.user_id 
      AND status IN ('pending', 'cancel', 'cancelled', 'failed', 'expire', 'expired')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.jwt()->>'email' IN ('updateptnid@gmail.com', 'admin@updateptn.id')
  );

-- 7. Enable REPLICA IDENTITY FULL and Realtime publication for instant UI sync
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

-- 8. Reload schema cache
NOTIFY pgrst, 'reload schema';
