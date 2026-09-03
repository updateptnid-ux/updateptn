-- Create articles table from scratch
-- This must run BEFORE 20260103000000_enhance_articles_table.sql

-- Create or update articles table
-- Safe migration that handles existing table

-- Create articles table if not exists
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if not exists (safe for existing tables)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Umum',
ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Admin',
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Add constraints if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_status_check'
  ) THEN
    ALTER TABLE articles ADD CONSTRAINT articles_status_check 
    CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

-- Set NOT NULL constraints (only if column exists and has no nulls)
DO $$
BEGIN
  -- Check if title column exists and has values
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'articles' AND column_name = 'title') THEN
    -- Only set NOT NULL if there are no NULL values
    IF NOT EXISTS (SELECT 1 FROM articles WHERE title IS NULL) THEN
      ALTER TABLE articles ALTER COLUMN title SET NOT NULL;
    END IF;
  END IF;

  -- Same for content
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'articles' AND column_name = 'content') THEN
    IF NOT EXISTS (SELECT 1 FROM articles WHERE content IS NULL) THEN
      ALTER TABLE articles ALTER COLUMN content SET NOT NULL;
    END IF;
  END IF;

  -- Same for status
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'articles' AND column_name = 'status') THEN
    IF NOT EXISTS (SELECT 1 FROM articles WHERE status IS NULL) THEN
      ALTER TABLE articles ALTER COLUMN status SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Create index for status
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);

-- Create index for category
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);

-- Create index for created_at
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles(created_at DESC);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists, then create
DROP POLICY IF EXISTS "Public read published articles" ON articles;

-- Basic RLS policy for public read
CREATE POLICY "Public read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_updated_at_trigger ON articles;
CREATE TRIGGER articles_updated_at_trigger
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

-- Comment
COMMENT ON TABLE articles IS 'Articles and news content for the platform';
COMMENT ON COLUMN articles.id IS 'Primary key UUID';
COMMENT ON COLUMN articles.title IS 'Article title';
COMMENT ON COLUMN articles.content IS 'Article content in HTML format (sanitized)';
COMMENT ON COLUMN articles.status IS 'Article status: draft, published, or archived';
COMMENT ON COLUMN articles.category IS 'Article category (e.g., Tips SNBT, Berita, Pengumuman)';
COMMENT ON COLUMN articles.author IS 'Author name';
COMMENT ON COLUMN articles.views_count IS 'Number of times the article has been viewed';
COMMENT ON COLUMN articles.published_at IS 'When the article was published (null if draft)';
