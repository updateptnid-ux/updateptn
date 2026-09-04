-- Create payments table for Midtrans integration
-- Safe migration that handles existing table
-- Run this in Supabase SQL Editor

-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if not exists (safe for existing tables)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS amount INTEGER,
ADD COLUMN IF NOT EXISTS original_amount INTEGER,
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS voucher_code TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'midtrans',
ADD COLUMN IF NOT EXISTS payment_type TEXT,
ADD COLUMN IF NOT EXISTS transaction_status TEXT,
ADD COLUMN IF NOT EXISTS fraud_status TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add unique constraint on order_id if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_order_id_key'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);
  END IF;
END $$;

-- Add NOT NULL constraints (only if no NULL values exist)
DO $$
BEGIN
  -- Check user_id
  IF NOT EXISTS (SELECT 1 FROM payments WHERE user_id IS NULL) THEN
    ALTER TABLE payments ALTER COLUMN user_id SET NOT NULL;
  END IF;

  -- Check order_id
  IF NOT EXISTS (SELECT 1 FROM payments WHERE order_id IS NULL) THEN
    ALTER TABLE payments ALTER COLUMN order_id SET NOT NULL;
  END IF;

  -- Check amount
  IF NOT EXISTS (SELECT 1 FROM payments WHERE amount IS NULL) THEN
    ALTER TABLE payments ALTER COLUMN amount SET NOT NULL;
  END IF;

  -- Check status
  IF NOT EXISTS (SELECT 1 FROM payments WHERE status IS NULL) THEN
    ALTER TABLE payments ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "System can insert payments" ON payments;
DROP POLICY IF EXISTS "System can update payments" ON payments;

-- RLS Policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = payments.user_id);

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = payments.user_id);

CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = payments.user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payments_updated_at_trigger ON payments;
CREATE TRIGGER payments_updated_at_trigger
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Comments for documentation
COMMENT ON TABLE payments IS 'Payment transactions for subscription purchases';
COMMENT ON COLUMN payments.order_id IS 'Unique order ID from Midtrans';
COMMENT ON COLUMN payments.amount IS 'Final amount after discount (in IDR)';
COMMENT ON COLUMN payments.original_amount IS 'Original price before discount';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, success, failed';
COMMENT ON COLUMN payments.transaction_status IS 'Midtrans transaction status';
