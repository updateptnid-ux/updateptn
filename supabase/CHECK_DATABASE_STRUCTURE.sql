-- ============================================================================
-- CHECK DATABASE STRUCTURE - COMPREHENSIVE
-- Jalankan ini untuk cek struktur database yang ada
-- ============================================================================

-- 1. CEK SEMUA TABEL YANG ADA (PUBLIC SCHEMA)
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CEK KOLOM DI TABEL PAYMENTS (kalau ada)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'payments'
ORDER BY ordinal_position;

-- 3. CEK KOLOM DI TABEL PROFILES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. CEK KOLOM DI TABEL SUBSCRIPTIONS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 5. CEK KOLOM DI TABEL SUBSCRIPTION_PLANS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'subscription_plans'
ORDER BY ordinal_position;

-- 6. CEK AUTH USERS (dari auth schema)
SELECT 
    id,
    email,
    created_at
FROM auth.users
LIMIT 5;

-- 7. CEK JUMLAH DATA DI SETIAP TABEL
SELECT 
    'payments' AS table_name,
    COUNT(*) AS row_count
FROM payments
UNION ALL
SELECT 
    'profiles' AS table_name,
    COUNT(*) AS row_count
FROM profiles
UNION ALL
SELECT 
    'subscriptions' AS table_name,
    COUNT(*) AS row_count
FROM subscriptions
UNION ALL
SELECT 
    'subscription_plans' AS table_name,
    COUNT(*) AS row_count
FROM subscription_plans
UNION ALL
SELECT 
    'auth.users' AS table_name,
    COUNT(*) AS row_count
FROM auth.users;

-- 8. CEK FOREIGN KEY RELATIONSHIPS
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('payments', 'subscriptions', 'profiles')
ORDER BY tc.table_name, kcu.column_name;
