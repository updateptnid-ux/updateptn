-- ============================================================================
-- CEK LENGKAP SEMUA TABEL DAN STRUKTUR DATABASE
-- Jalankan ini dulu sebelum migration apapun
-- ============================================================================

-- 1. CEK SEMUA TABEL DI PUBLIC SCHEMA
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CEK SEMUA KOLOM DI SEMUA TABEL PUBLIC
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. CEK FOREIGN KEY CONSTRAINTS
SELECT
    tc.table_name, 
    kcu.column_name,
    tc.constraint_name,
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
ORDER BY tc.table_name, kcu.column_name;

-- 4. CEK UNIQUE CONSTRAINTS
SELECT
    tc.table_name, 
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. CEK INDEXES
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. CEK RLS POLICIES
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. CEK ROW COUNT SETIAP TABEL (dynamic query)
DO $$
DECLARE
    tbl_name TEXT;
    row_count BIGINT;
BEGIN
    RAISE NOTICE 'TABLE ROW COUNTS:';
    RAISE NOTICE '==================';
    
    FOR tbl_name IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(tbl_name) INTO row_count;
        RAISE NOTICE '% : % rows', tbl_name, row_count;
    END LOOP;
END $$;

-- 8. CEK AUTH.USERS (first 5)
SELECT 
    id,
    email,
    created_at,
    confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 9. CEK APAKAH TABEL-TABEL PENTING SUDAH ADA
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') 
        THEN '✓ profiles EXISTS'
        ELSE '✗ profiles MISSING'
    END AS profiles_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') 
        THEN '✓ payments EXISTS'
        ELSE '✗ payments MISSING'
    END AS payments_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') 
        THEN '✓ subscriptions EXISTS'
        ELSE '✗ subscriptions MISSING'
    END AS subscriptions_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_plans') 
        THEN '✓ subscription_plans EXISTS'
        ELSE '✗ subscription_plans MISSING'
    END AS subscription_plans_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'articles') 
        THEN '✓ articles EXISTS'
        ELSE '✗ articles MISSING'
    END AS articles_status;

-- ============================================================================
-- SELESAI - Review output di atas untuk tahu struktur database saat ini
-- ============================================================================
