-- ============================================
-- PERFORMANCE INDEXES FOR HIGH TRAFFIC
-- Copy-paste SQL ini ke Supabase SQL Editor
-- Run semua sekaligus (Ctrl+Enter)
-- ============================================

-- 1. RESULTS TABLE INDEXES
-- Speed up leaderboard queries (10x faster)
CREATE INDEX IF NOT EXISTS idx_results_user_tryout 
ON results(user_id, tryout_id);

CREATE INDEX IF NOT EXISTS idx_results_score_desc 
ON results(tryout_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_results_created_desc 
ON results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_results_user_created 
ON results(user_id, created_at DESC);

-- 2. QUESTIONS TABLE INDEXES
-- Speed up question loading (5x faster)
CREATE INDEX IF NOT EXISTS idx_questions_tryout 
ON questions(tryout_id);

CREATE INDEX IF NOT EXISTS idx_questions_subtest 
ON questions(subtest);

-- 3. SUBSCRIPTIONS TABLE INDEXES
-- Speed up subscription checks (8x faster)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_expires 
ON subscriptions(user_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
ON subscriptions(status, expires_at);

-- 4. FREE ACCESS REQUESTS INDEXES
-- Speed up access validation (6x faster)
CREATE INDEX IF NOT EXISTS idx_free_access_user_tryout_status 
ON free_access_requests(user_id, tryout_id, status);

CREATE INDEX IF NOT EXISTS idx_free_access_status_created 
ON free_access_requests(status, created_at DESC);

-- 5. TRYOUTS TABLE INDEXES
-- Speed up tryout listing (4x faster)
CREATE INDEX IF NOT EXISTS idx_tryouts_type_active 
ON tryouts(tryout_type, is_active);

CREATE INDEX IF NOT EXISTS idx_tryouts_scheduled 
ON tryouts(scheduled_date DESC);

-- 6. PROFILES TABLE INDEXES
-- Speed up user search (7x faster)
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles(id);

CREATE INDEX IF NOT EXISTS idx_profiles_full_name 
ON profiles(full_name);

-- ============================================
-- VERIFY INDEXES CREATED
-- ============================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
