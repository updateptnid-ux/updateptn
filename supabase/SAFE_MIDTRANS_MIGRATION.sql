-- ============================================================================
-- SAFE MIDTRANS MIGRATION - CEK DULU SEBELUM CREATE/ALTER
-- Jalankan ini setelah menjalankan CHECK_ALL_TABLES_FULL.sql
-- File ini AMAN dijalankan berkali-kali (idempotent)
-- ============================================================================

-- PART 1: CREATE SUBSCRIPTION_PLANS TABLE (kalau belum ada)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription_plans'
    ) THEN
        CREATE TABLE subscription_plans (
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
        
        RAISE NOTICE 'Created table: subscription_plans';
    ELSE
        RAISE NOTICE 'Table subscription_plans already exists, skipping creation';
    END IF;
END $$;

-- PART 2: CREATE SUBSCRIPTIONS TABLE (kalau belum ada)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
    ) THEN
        CREATE TABLE subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            plan_id UUID NOT NULL REFERENCES subscription_plans(id),
            status TEXT NOT NULL DEFAULT 'pending',
            start_date TIMESTAMPTZ,
            end_date TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created table: subscriptions';
    ELSE
        RAISE NOTICE 'Table subscriptions already exists, skipping creation';
    END IF;
END $$;

-- PART 3: CREATE PAYMENTS TABLE (kalau belum ada)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
    ) THEN
        CREATE TABLE payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            subscription_id UUID REFERENCES subscriptions(id),
            order_id TEXT UNIQUE,
            amount INTEGER NOT NULL,
            original_amount INTEGER,
            discount_amount INTEGER DEFAULT 0,
            voucher_code TEXT,
            status TEXT DEFAULT 'pending',
            payment_method TEXT DEFAULT 'midtrans',
            payment_type TEXT,
            transaction_status TEXT,
            fraud_status TEXT,
            metadata JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created table: payments';
    ELSE
        RAISE NOTICE 'Table payments already exists, will add missing columns if any';
    END IF;
END $$;

-- PART 4: ADD MISSING COLUMNS TO EXISTING PAYMENTS TABLE
-- ============================================================================
-- user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added column: payments.user_id';
    ELSE
        RAISE NOTICE 'Column payments.user_id already exists';
    END IF;
END $$;

-- subscription_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'subscription_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
        RAISE NOTICE 'Added column: payments.subscription_id';
    ELSE
        RAISE NOTICE 'Column payments.subscription_id already exists';
    END IF;
END $$;

-- order_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'order_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN order_id TEXT;
        RAISE NOTICE 'Added column: payments.order_id';
    ELSE
        RAISE NOTICE 'Column payments.order_id already exists';
    END IF;
END $$;

-- amount
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'amount'
    ) THEN
        ALTER TABLE payments ADD COLUMN amount INTEGER;
        RAISE NOTICE 'Added column: payments.amount';
    ELSE
        RAISE NOTICE 'Column payments.amount already exists';
    END IF;
END $$;

-- original_amount
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'original_amount'
    ) THEN
        ALTER TABLE payments ADD COLUMN original_amount INTEGER;
        RAISE NOTICE 'Added column: payments.original_amount';
    ELSE
        RAISE NOTICE 'Column payments.original_amount already exists';
    END IF;
END $$;

-- discount_amount
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE payments ADD COLUMN discount_amount INTEGER DEFAULT 0;
        RAISE NOTICE 'Added column: payments.discount_amount';
    ELSE
        RAISE NOTICE 'Column payments.discount_amount already exists';
    END IF;
END $$;

-- voucher_code
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'voucher_code'
    ) THEN
        ALTER TABLE payments ADD COLUMN voucher_code TEXT;
        RAISE NOTICE 'Added column: payments.voucher_code';
    ELSE
        RAISE NOTICE 'Column payments.voucher_code already exists';
    END IF;
END $$;

-- status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE payments ADD COLUMN status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Added column: payments.status';
    ELSE
        RAISE NOTICE 'Column payments.status already exists';
    END IF;
END $$;

-- payment_method
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE payments ADD COLUMN payment_method TEXT DEFAULT 'midtrans';
        RAISE NOTICE 'Added column: payments.payment_method';
    ELSE
        RAISE NOTICE 'Column payments.payment_method already exists';
    END IF;
END $$;

-- payment_type
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'payment_type'
    ) THEN
        ALTER TABLE payments ADD COLUMN payment_type TEXT;
        RAISE NOTICE 'Added column: payments.payment_type';
    ELSE
        RAISE NOTICE 'Column payments.payment_type already exists';
    END IF;
END $$;

-- transaction_status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'transaction_status'
    ) THEN
        ALTER TABLE payments ADD COLUMN transaction_status TEXT;
        RAISE NOTICE 'Added column: payments.transaction_status';
    ELSE
        RAISE NOTICE 'Column payments.transaction_status already exists';
    END IF;
END $$;

-- fraud_status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'fraud_status'
    ) THEN
        ALTER TABLE payments ADD COLUMN fraud_status TEXT;
        RAISE NOTICE 'Added column: payments.fraud_status';
    ELSE
        RAISE NOTICE 'Column payments.fraud_status already exists';
    END IF;
END $$;

-- metadata
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE payments ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added column: payments.metadata';
    ELSE
        RAISE NOTICE 'Column payments.metadata already exists';
    END IF;
END $$;

-- created_at
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE payments ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added column: payments.created_at';
    ELSE
        RAISE NOTICE 'Column payments.created_at already exists';
    END IF;
END $$;

-- updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE payments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added column: payments.updated_at';
    ELSE
        RAISE NOTICE 'Column payments.updated_at already exists';
    END IF;
END $$;

-- PART 5: ADD INDEXES (kalau belum ada)
-- ============================================================================
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscription_plans_is_active_idx ON subscription_plans(is_active);

-- PART 6: ADD UNIQUE CONSTRAINT ON order_id (kalau belum ada)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payments_order_id_key'
    ) THEN
        ALTER TABLE payments ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);
        RAISE NOTICE 'Added unique constraint: payments_order_id_key';
    ELSE
        RAISE NOTICE 'Unique constraint payments_order_id_key already exists';
    END IF;
END $$;

-- PART 7: ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- PART 8: DROP EXISTING POLICIES (untuk re-create yang baru)
-- ============================================================================
DROP POLICY IF EXISTS "Public can view active plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "System can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "System can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "System can insert payments" ON payments;
DROP POLICY IF EXISTS "System can update payments" ON payments;

-- PART 9: CREATE RLS POLICIES
-- ============================================================================

-- Subscription plans (public read untuk active plans)
CREATE POLICY "Public can view active plans"
    ON subscription_plans FOR SELECT
    USING (is_active = true);

-- Subscriptions (user hanya bisa lihat milik sendiri)
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions"
    ON subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update subscriptions"
    ON subscriptions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Payments (user hanya bisa lihat milik sendiri)
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert payments"
    ON payments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments"
    ON payments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- PART 10: INSERT DEFAULT SUBSCRIPTION PLANS (hanya kalau belum ada data)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM subscription_plans LIMIT 1) THEN
        INSERT INTO subscription_plans (name, description, price, duration_days, features, sort_order)
        VALUES
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
        );
        
        RAISE NOTICE 'Inserted 3 default subscription plans';
    ELSE
        RAISE NOTICE 'Subscription plans already exist, skipping insert';
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE!
-- 
-- Langkah selanjutnya:
-- 1. Verify semua tabel dan kolom created dengan query CHECK_ALL_TABLES_FULL.sql
-- 2. Add environment variables untuk Midtrans
-- 3. Test payment flow
-- ============================================================================
