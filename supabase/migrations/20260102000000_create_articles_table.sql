-- Create articles table from scratch
-- This must run BEFORE 20260103000000_enhance_articles_table.sql

-- Create articles table if not exists
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category TEXT NOT NULL DEFAULT 'Umum',
  author TEXT DEFAULT 'Admin',
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for status
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);

-- Create index for category
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);

-- Create index for created_at
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles(created_at DESC);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy for public read
CREATE POLICY IF NOT EXISTS "Public read published articles"
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
