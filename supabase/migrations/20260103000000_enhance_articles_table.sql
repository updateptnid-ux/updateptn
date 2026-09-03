-- Enhancement untuk articles table
-- Menambahkan fields untuk SEO, featured image, dan metadata

-- Add new columns to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Create index for slug (untuk SEO-friendly URLs)
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);

-- Create index for featured articles
CREATE INDEX IF NOT EXISTS articles_featured_idx ON articles(is_featured) WHERE is_featured = true;

-- Create index for tags (GIN index untuk array search)
CREATE INDEX IF NOT EXISTS articles_tags_idx ON articles USING GIN(tags);

-- Create index for published articles
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published_at) WHERE status = 'published';

-- Function untuk auto-generate slug dari title
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Convert title to lowercase, replace spaces with hyphens, remove special chars
    NEW.slug := lower(regexp_replace(
      regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
    
    -- Add random suffix if slug already exists
    IF EXISTS (SELECT 1 FROM articles WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || floor(random() * 10000);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-generate slug
DROP TRIGGER IF EXISTS articles_slug_trigger ON articles;
CREATE TRIGGER articles_slug_trigger
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_from_title();

-- Function untuk auto-increment views_count
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET views_count = views_count + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies (drop existing first to avoid conflicts)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can view all articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON articles;

-- Policy: Everyone can read published articles
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can view all articles (for admin)
CREATE POLICY "Authenticated users can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert articles
CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update articles
CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete articles
CREATE POLICY "Authenticated users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- Comment untuk dokumentasi
COMMENT ON COLUMN articles.slug IS 'SEO-friendly URL slug, auto-generated from title';
COMMENT ON COLUMN articles.excerpt IS 'Short description/preview of the article (max 200 chars)';
COMMENT ON COLUMN articles.featured_image IS 'URL to the article cover/hero image';
COMMENT ON COLUMN articles.seo_title IS 'Custom SEO title (defaults to title if empty)';
COMMENT ON COLUMN articles.seo_description IS 'Custom SEO meta description';
COMMENT ON COLUMN articles.tags IS 'Array of tags for categorization and filtering';
COMMENT ON COLUMN articles.read_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN articles.is_featured IS 'Whether this article is featured on homepage';
COMMENT ON COLUMN articles.author_id IS 'Reference to the user who created the article';
