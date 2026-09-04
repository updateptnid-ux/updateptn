-- ============================================================================
-- MIDTRANS COMPLETE SETUP - ALL TABLES
-- Jalankan ini sekali untuk setup semua yang dibutuhkan Midtrans
-- Aman dijalankan berkali-kali (idempotent)
-- ============================================================================

-- 1. CREATE SUBSCRIPTION_PLANS TABLE
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'pending',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADD MISSING COLUMNS TO PAYMENTS (safe)
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

-- 4. ADD INDEXES
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- 5. ADD UNIQUE CONSTRAINT
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_order_id_key'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);
  END IF;
END $$;

-- 6. ENABLE RLS ON ALL TABLES
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 7. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "Public can view active plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "System can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "System can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "System can insert payments" ON payments;
DROP POLICY IF EXISTS "System can update payments" ON payments;

-- 8. CREATE RLS POLICIES
-- Subscription plans (public read)
CREATE POLICY "Public can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Subscriptions (user can only see their own)
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = subscriptions.user_id);

CREATE POLICY "System can insert subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = subscriptions.user_id);

CREATE POLICY "System can update subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = subscriptions.user_id);

-- Payments (user can only see their own)
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

-- 9. INSERT DEFAULT SUBSCRIPTION PLANS (only if empty)
INSERT INTO subscription_plans (name, description, price, duration_days, features, sort_order)
SELECT * FROM (VALUES
  (
    'Paket Basic',
    'Akses tryout SNBT dan materi dasar',
    99000,
    30,
    '{"tryouts": 5, "predictions": 10, "live_classes": false, "modules": "basic"}'::jsonb,
    1
  ),
  (
    'Paket Premium',
    'Akses lengkap semua fitur UpdatePTN',
    199000,
    90,
    '{"tryouts": "unlimited", "predictions": "unlimited", "live_classes": true, "modules": "all", "mentor": true}'::jsonb,
    2
  ),
  (
    'Paket Pro',
    'Premium + konsultasi intensif mentor',
    299000,
    180,
    '{"tryouts": "unlimited", "predictions": "unlimited", "live_classes": true, "modules": "all", "mentor": true, "consultation": "unlimited"}'::jsonb,
    3
  )
) AS new_plans(name, description, price, duration_days, features, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans LIMIT 1);

-- ============================================================================
-- SETUP COMPLETE!
-- Sekarang siap untuk integrasi Midtrans
-- ============================================================================
