# Database Migrations - UpdatePTN Platform

Jalankan SQL berikut di **Supabase SQL Editor** untuk menambahkan kolom yang diperlukan.

---

## 🔴 CRITICAL: Performance Indexes (PRIORITY 1)

**Tanggal**: 2026-08-19  
**Deskripsi**: Indexes wajib untuk performa optimal (10-50x faster queries)  
**Impact**: Tanpa indexes, platform akan lambat di >50 concurrent users

```sql
-- ========================================
-- CRITICAL INDEXES (RUN IMMEDIATELY)
-- ========================================

-- Results table: user_id queried di setiap dashboard load
CREATE INDEX IF NOT EXISTS idx_results_user_id ON public.results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON public.results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_tryout ON public.results(tryout_id);

-- Subscriptions: composite index untuk active subscription check
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active 
ON public.subscriptions(user_id, status, expires_at DESC);

-- Free access requests: user + tryout combination
CREATE INDEX IF NOT EXISTS idx_requests_user_tryout 
ON public.free_access_requests(user_id, tryout_id, status);

-- Questions: tryout_id queried saat load tryout
CREATE INDEX IF NOT EXISTS idx_questions_tryout ON public.questions(tryout_id);

-- User answers: composite untuk result + question lookup
CREATE INDEX IF NOT EXISTS idx_user_answers_result_question 
ON public.user_answers(result_id, question_id);

-- Tryouts: scheduled date + free status untuk filtering
CREATE INDEX IF NOT EXISTS idx_tryouts_scheduled ON public.tryouts(scheduled_date, is_free);
CREATE INDEX IF NOT EXISTS idx_tryouts_status ON public.tryouts(status);

-- Profiles: email lookup untuk mentor/admin check
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Mentors: email + status untuk auth check
CREATE INDEX IF NOT EXISTS idx_mentors_email_status ON public.mentors(email, status);

-- Moduls: views sorting
CREATE INDEX IF NOT EXISTS idx_moduls_views ON public.moduls(views DESC);

-- Live classes: date filtering
CREATE INDEX IF NOT EXISTS idx_live_classes_date ON public.live_classes(scheduled_date DESC);
```

**Verification Query:**
```sql
-- Check if indexes exist
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

## Migration: Add Education Column to Mentors Table

**Tanggal**: 2026-08-18  
**Deskripsi**: Menambahkan kolom `education` (JSONB) untuk menyimpan riwayat pendidikan mentor.

```sql
-- Add education column to mentors table
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN public.mentors.education IS 'Array of education history (university, faculty, major, degree, start_year, end_year)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_mentors_education ON public.mentors USING gin(education);
```

## Migration: Add Education Column to Profiles Table

**Tanggal**: 2026-08-18  
**Deskripsi**: Menambahkan kolom `education` (JSONB) untuk menyimpan riwayat pendidikan di tabel profiles (untuk mentor profiles).

```sql
-- Add education column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN public.profiles.education IS 'Array of education history (university, faculty, major, degree, start_year, end_year)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_education ON public.profiles USING gin(education);
```

## Migration: Increment Modul Views Function

**Tanggal**: 2026-08-18  
**Deskripsi**: Menambahkan fungsi untuk increment views counter pada modul video.

```sql
-- Create function to increment views
CREATE OR REPLACE FUNCTION increment_modul_views(modul_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.moduls
  SET views = COALESCE(views, 0) + 1
  WHERE id = modul_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_modul_views(UUID) TO authenticated;
```

## Cara Menjalankan:

1. Buka **Supabase Dashboard** → Project Anda
2. Klik menu **SQL Editor** di sidebar kiri
3. Klik **New Query**
4. Copy-paste SQL di atas
5. Klik **Run** untuk mengeksekusi

## Struktur Data Education:

```json
[
  {
    "id": "1692345678901",
    "degree": "S1",
    "university": "UNIVERSITAS INDONESIA",
    "faculty": "FAKULTAS TEKNIK",
    "major": "TEKNIK INFORMATIKA",
    "start_year": "2018",
    "end_year": "2022"
  },
  {
    "id": "1692345678902",
    "degree": "S2",
    "university": "INSTITUT TEKNOLOGI BANDUNG",
    "faculty": "SEKOLAH TEKNIK ELEKTRO DAN INFORMATIKA",
    "major": "MAGISTER INFORMATIKA",
    "start_year": "2022",
    "end_year": "2024"
  }
]
```

## Degree Options:
- `S1` - Sarjana (Bachelor)
- `S2` - Magister (Master)
- `S3` - Doktor (Doctorate)
- `D3` - Diploma 3
- `D4` - Diploma 4

---

**Note**: Setelah menjalankan migration, jangan lupa refresh schema cache di Supabase dengan cara reload halaman dashboard atau tunggu beberapa detik.


---

## Migration: Auto-Update Subscription Status Trigger

**Tanggal**: 2026-08-19  
**Deskripsi**: Database trigger untuk auto-update subscription status (replace manual update di code)

```sql
-- Function untuk auto-update status berdasarkan expires_at
CREATE OR REPLACE FUNCTION auto_update_subscription_status()
RETURNS trigger AS $$
BEGIN
  -- Auto-set to expired jika expires_at sudah lewat
  IF NEW.expires_at < NOW() AND NEW.status = 'active' THEN
    NEW.status = 'expired';
    NEW.updated_at = NOW();
  END IF;
  
  -- Auto-set to active jika expires_at masih valid
  IF NEW.expires_at > NOW() AND NEW.status = 'expired' THEN
    NEW.status = 'active';
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pada INSERT dan UPDATE
CREATE TRIGGER trigger_auto_update_subscription_status
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_subscription_status();
```

**Benefits:**
- Eliminasi 2 UPDATE queries manual di `actions/subscription.ts`
- Status selalu konsisten di database level
- Reduce server-side logic complexity

---

## Migration: Add RLS Policies for Enhanced Security

**Tanggal**: 2026-08-19  
**Deskripsi**: Row Level Security policies untuk prevent unauthorized access

```sql
-- Enable RLS pada tables yang belum aktif
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_access_requests ENABLE ROW LEVEL SECURITY;

-- Policy: User hanya bisa lihat results mereka sendiri
CREATE POLICY "Users can view own results"
  ON public.results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: User hanya bisa insert results mereka sendiri
CREATE POLICY "Users can insert own results"
  ON public.results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: User hanya bisa lihat answers mereka sendiri
CREATE POLICY "Users can view own answers"
  ON public.user_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.results
      WHERE results.id = user_answers.result_id
        AND results.user_id = auth.uid()
    )
  );

-- Policy: User hanya bisa lihat subscriptions mereka
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: User hanya bisa request akses untuk diri sendiri
CREATE POLICY "Users can view own access requests"
  ON public.free_access_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own access requests"
  ON public.free_access_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin bypass (gunakan service_role key untuk admin operations)
-- Service role key automatically bypasses RLS
```

---

## Migration: Add Audit Log Table

**Tanggal**: 2026-08-19  
**Deskripsi**: Tracking critical operations untuk security monitoring

```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'login', 'tryout_submit', 'subscription_create', etc.
  entity_type VARCHAR(50), -- 'user', 'tryout', 'subscription', etc.
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk fast queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Function untuk auto-log login attempts
CREATE OR REPLACE FUNCTION log_auth_event()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, metadata)
  VALUES (NEW.id, 'user_login', jsonb_build_object('email', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (requires superuser, run via Supabase Dashboard)
-- Note: This trigger works on auth.users which is Supabase internal
-- Alternative: Log from application code (recommended)
```

**Usage Example (in actions):**
```typescript
// actions/audit.ts
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, any> = {}
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}
```

---

## Migration: Add Performance Monitoring View

**Tanggal**: 2026-08-19  
**Deskripsi**: View untuk monitoring query performance dan bottlenecks

```sql
-- View: Slow queries monitoring (requires pg_stat_statements extension)
-- Enable extension first: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View: Popular tryouts
CREATE OR REPLACE VIEW popular_tryouts AS
SELECT 
  t.id,
  t.title,
  COUNT(DISTINCT r.user_id) as unique_participants,
  COUNT(r.id) as total_attempts,
  AVG(r.total_score) as avg_score,
  MAX(r.created_at) as last_attempt
FROM public.tryouts t
LEFT JOIN public.results r ON r.tryout_id = t.id
GROUP BY t.id, t.title
ORDER BY total_attempts DESC;

-- View: User subscription status summary
CREATE OR REPLACE VIEW user_subscription_summary AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  s.status as subscription_status,
  s.tier as subscription_tier,
  s.expires_at,
  CASE 
    WHEN s.expires_at > NOW() THEN 'active'
    WHEN s.expires_at IS NULL THEN 'never_subscribed'
    ELSE 'expired'
  END as computed_status
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id
  AND s.id = (
    SELECT id FROM public.subscriptions
    WHERE user_id = p.id
    ORDER BY created_at DESC
    LIMIT 1
  );

-- View: Mentor performance metrics
CREATE OR REPLACE VIEW mentor_performance AS
SELECT 
  m.id,
  m.name,
  COUNT(DISTINCT mo.id) as total_moduls,
  COUNT(DISTINCT lc.id) as total_live_classes,
  COALESCE(SUM(mo.views), 0) as total_views
FROM public.mentors m
LEFT JOIN public.moduls mo ON mo.mentor_id = m.id
LEFT JOIN public.live_classes lc ON lc.mentor_id = m.id
GROUP BY m.id, m.name
ORDER BY total_views DESC;
```

---

## Rollback Commands (Emergency)

```sql
-- Rollback indexes (jika ada issue)
DROP INDEX IF EXISTS idx_results_user_id;
DROP INDEX IF EXISTS idx_subscriptions_user_active;
DROP INDEX IF EXISTS idx_requests_user_tryout;
DROP INDEX IF EXISTS idx_questions_tryout;
DROP INDEX IF EXISTS idx_user_answers_result_question;
DROP INDEX IF EXISTS idx_tryouts_scheduled;

-- Rollback trigger
DROP TRIGGER IF EXISTS trigger_auto_update_subscription_status ON public.subscriptions;
DROP FUNCTION IF EXISTS auto_update_subscription_status();

-- Rollback RLS policies
DROP POLICY IF EXISTS "Users can view own results" ON public.results;
DROP POLICY IF EXISTS "Users can insert own results" ON public.results;
DROP POLICY IF EXISTS "Users can view own answers" ON public.user_answers;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- Rollback audit logs
DROP TABLE IF EXISTS public.audit_logs CASCADE;
```

---

## Performance Testing Queries

**Before vs After Indexes:**
```sql
-- Test query performance (run EXPLAIN ANALYZE)
EXPLAIN ANALYZE
SELECT r.*, t.title
FROM public.results r
JOIN public.tryouts t ON t.id = r.tryout_id
WHERE r.user_id = 'USER_UUID_HERE'
ORDER BY r.created_at DESC
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```


---

## Migration: Add Payment Fields to Subscriptions Table

**Tanggal**: 2026-08-19  
**Deskripsi**: Menambahkan kolom untuk tracking payment method, proof, dan rejection reason

```sql
-- Add payment tracking columns
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_proof TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comments
COMMENT ON COLUMN public.subscriptions.payment_method IS 'Payment method used (gopay, dana, ovo, bca, mandiri)';
COMMENT ON COLUMN public.subscriptions.payment_proof IS 'URL or reference to payment proof/screenshot';
COMMENT ON COLUMN public.subscriptions.rejection_reason IS 'Reason for rejection if status is rejected';

-- Update status to support 'pending' and 'rejected'
-- Note: If using ENUM type, you need to alter the type
-- Otherwise, if using VARCHAR, just add check constraint

-- Drop existing constraint if exists
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- Add new check constraint for status
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('pending', 'active', 'expired', 'rejected'));

-- Create index for admin to quickly find pending subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Create composite index for user's active subscriptions query
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_expires 
ON public.subscriptions(user_id, status, expires_at DESC);
```

**Usage in Admin Panel:**
```sql
-- Get all pending subscriptions for admin review
SELECT 
  s.*,
  p.email,
  p.full_name
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.user_id
WHERE s.status = 'pending'
ORDER BY s.created_at ASC;
```
