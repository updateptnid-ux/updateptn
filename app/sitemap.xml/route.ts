import { createClient } from '@supabase/supabase-js';

// Force dynamic — WAJIB agar Next.js tidak coba static-render route ini
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Supabase anon client langsung, TANPA cookies, TANPA import dari lib/supabase/server
function getAnonSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://updateptn.com';

  // Static pages
  const staticPages = [
    { url: baseUrl, changefreq: 'daily', priority: '1.0' },
    { url: `${baseUrl}/pricing`, changefreq: 'weekly', priority: '0.9' },
    { url: `${baseUrl}/articles`, changefreq: 'daily', priority: '0.8' },
    { url: `${baseUrl}/direktori-prodi`, changefreq: 'weekly', priority: '0.7' },
    { url: `${baseUrl}/privacy`, changefreq: 'monthly', priority: '0.3' },
    { url: `${baseUrl}/terms`, changefreq: 'monthly', priority: '0.3' },
  ];

  // Dynamic article pages
  let articlePages: { url: string; changefreq: string; priority: string; lastmod?: string }[] = [];
  try {
    const supabase = getAnonSupabase();
    const { data } = await supabase
      .from('articles')
      .select('slug, updated_at, is_featured')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(100);

    if (data && data.length > 0) {
      articlePages = data.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastmod: new Date(article.updated_at).toISOString(),
        changefreq: 'weekly',
        priority: article.is_featured ? '0.9' : '0.6',
      }));
    }
  } catch (error) {
    console.error('Error generating article sitemap:', error);
  }

  const allPages = [...staticPages, ...articlePages];
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${(page as any).lastmod || now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
