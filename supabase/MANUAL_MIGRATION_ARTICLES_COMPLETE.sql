-- ============================================================================
-- MANUAL MIGRATION: Complete Articles Table Setup
-- Aman dijalankan berkali-kali (idempotent)
-- Jalankan di Supabase SQL Editor
-- ============================================================================

-- Step 1: Create base articles table if not exists
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add all required columns (safe if already exists)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Umum',
ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Admin',
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Step 3: Add constraints
DO $$ 
BEGIN
  -- Status check constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_status_check'
  ) THEN
    ALTER TABLE articles ADD CONSTRAINT articles_status_check 
    CHECK (status IN ('draft', 'published', 'archived'));
  END IF;

  -- Slug unique constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_slug_key'
  ) THEN
    ALTER TABLE articles ADD CONSTRAINT articles_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Step 4: Create all indexes
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
CREATE INDEX IF NOT EXISTS articles_featured_idx ON articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS articles_tags_idx ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published_at) WHERE status = 'published';

-- Step 5: Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Public read published articles" ON articles;
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can view all articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON articles;

-- Step 7: Create RLS policies
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- Step 8: Create or replace functions
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(
      regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
    
    IF EXISTS (SELECT 1 FROM articles WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || floor(random() * 10000);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET views_count = views_count + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create or replace triggers
DROP TRIGGER IF EXISTS articles_updated_at_trigger ON articles;
CREATE TRIGGER articles_updated_at_trigger
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

DROP TRIGGER IF EXISTS articles_slug_trigger ON articles;
CREATE TRIGGER articles_slug_trigger
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_from_title();

-- ============================================================================
-- Migration Complete!
-- You can now use the articles system
-- ============================================================================
