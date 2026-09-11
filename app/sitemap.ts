import { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';

// Force dynamic agar tidak di-render statis saat build,
// sekaligus menghindari error "Dynamic server usage: cookies()"
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://updateptn.com';

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/direktori-prodi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic article pages — query langsung tanpa melalui 'use server' actions
  // agar tidak ada cookies() yang ikut ter-import saat build.
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('articles')
      .select('slug, updated_at, is_featured')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(100);

    if (data && data.length > 0) {
      articlePages = data.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'weekly' as const,
        priority: article.is_featured ? 0.9 : 0.6,
      }));
    }
  } catch (error) {
    console.error('Error generating article sitemap:', error);
  }

  return [...staticPages, ...articlePages];
}
