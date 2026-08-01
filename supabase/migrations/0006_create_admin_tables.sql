-- ========================================================
-- UPDATEPTN MIGRATION 0006: HQ CORE SUPPORTING TABLES
-- Jalankan file ini di Supabase Dashboard → SQL Editor
-- ========================================================

-- 1. MENTORS TABLE
CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  specialization TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mentors" ON public.mentors FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify mentors" ON public.mentors FOR ALL USING (TRUE);

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
  expires_at TIMESTAMPTZ NOT NULL,
  price_paid TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subscriptions" ON public.subscriptions FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify subscriptions" ON public.subscriptions FOR ALL USING (TRUE);

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no TEXT NOT NULL UNIQUE,
  user_name TEXT,
  user_email TEXT,
  amount TEXT NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('success', 'pending', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify payments" ON public.payments FOR ALL USING (TRUE);

-- 4. VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value TEXT NOT NULL,
  usage_limit INTEGER NOT NULL DEFAULT 100,
  usage_count INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view vouchers" ON public.vouchers FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify vouchers" ON public.vouchers FOR ALL USING (TRUE);

-- 5. FACULTIES TABLE
CREATE TABLE IF NOT EXISTS public.faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view faculties" ON public.faculties FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify faculties" ON public.faculties FOR ALL USING (TRUE);

-- 6. QUOTAS TABLE
CREATE TABLE IF NOT EXISTS public.quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id UUID REFERENCES public.majors(id) ON DELETE CASCADE,
  major_name TEXT,
  university_name TEXT,
  quota_snbt INTEGER NOT NULL,
  applicants_last_year INTEGER NOT NULL,
  keketatan_percentage TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view quotas" ON public.quotas FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify quotas" ON public.quotas FOR ALL USING (TRUE);

-- 7. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('TPS', 'LITERASI')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify subjects" ON public.subjects FOR ALL USING (TRUE);

-- 8. CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  subject_name TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify chapters" ON public.chapters FOR ALL USING (TRUE);

-- 9. SUBCHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.subchapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  chapter_name TEXT,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.subchapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subchapters" ON public.subchapters FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify subchapters" ON public.subchapters FOR ALL USING (TRUE);

-- 10. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  views_count INTEGER NOT NULL DEFAULT 0,
  duration TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify videos" ON public.videos FOR ALL USING (TRUE);

-- 11. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  views_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view articles" ON public.articles FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify articles" ON public.articles FOR ALL USING (TRUE);

-- 12. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_link TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view banners" ON public.banners FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify banners" ON public.banners FOR ALL USING (TRUE);

-- 13. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view faqs" ON public.faqs FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify faqs" ON public.faqs FOR ALL USING (TRUE);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('sent', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify notifications" ON public.notifications FOR ALL USING (TRUE);

-- 15. MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view media" ON public.media FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify media" ON public.media FOR ALL USING (TRUE);

-- 16. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit_logs" ON public.audit_logs FOR SELECT USING (TRUE);
CREATE POLICY "Admins can modify audit_logs" ON public.audit_logs FOR ALL USING (TRUE);
