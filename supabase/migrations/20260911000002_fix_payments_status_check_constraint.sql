-- =====================================================================
-- FIX PAYMENTS_STATUS_CHECK CONSTRAINT
-- Created: 2026-09-11
-- Description: Allow all valid cancellation, gateway, and failure statuses
-- on the public.payments table.
-- =====================================================================

-- 1. Drop existing payments_status_check constraint if it exists
ALTER TABLE public.payments 
  DROP CONSTRAINT IF EXISTS payments_status_check;

-- 2. Add updated constraint that accepts:
--    'pending'     : Waiting for customer payment
--    'settlement'  : Payment successfully settled
--    'success'     : Payment successful
--    'capture'     : Credit card capture successful
--    'cancel'      : Cancelled (Midtrans standard)
--    'cancelled'   : Cancelled (Application standard)
--    'canceled'    : Cancelled (Alternative spelling)
--    'expire'      : Expired (Midtrans standard)
--    'expired'     : Expired (Application standard)
--    'deny'        : Denied by fraud detection or bank
--    'failed'      : Generic failed payment
--    'refund'      : Refunded payment
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

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
