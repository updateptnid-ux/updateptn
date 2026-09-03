/**
 * Dynamic Metadata Generation for Article Pages
 * Provides SEO-optimized metadata with Open Graph and Twitter Cards
 */

import { Metadata } from 'next';
import { getArticleBySlug } from '@/actions/articles';

interface MetadataProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const result = await getArticleBySlug(params.slug);

  // Fallback metadata if article not found
  if (!result.success || !result.data) {
    return {
      title: 'Artikel Tidak Ditemukan | UpdatePTN',
      description: 'Artikel yang Anda cari tidak tersedia atau telah dihapus.',
    };
  }

  const article = result.data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://updateptn.com';
  const articleUrl = `${siteUrl}/articles/${article.slug}`;

  // Use SEO-optimized title and description
  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || article.title;

  return {
    title: `${title} | UpdatePTN`,
    description,
    keywords: article.tags?.join(', ') || article.category,
    authors: article.author ? [{ name: article.author }] : undefined,
    
    // Open Graph metadata for Facebook, WhatsApp, etc.
    openGraph: {
      type: 'article',
      title,
      description,
      url: articleUrl,
      siteName: 'UpdatePTN',
      locale: 'id_ID',
      images: article.featured_image ? [
        {
          url: article.featured_image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ] : undefined,
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at,
      tags: article.tags || undefined,
    },

    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featured_image ? [article.featured_image] : undefined,
      creator: '@updateptn',
    },

    // Structured data for Google Rich Results
    other: {
      'article:published_time': article.published_at || '',
      'article:modified_time': article.updated_at,
      'article:author': article.author || 'UpdatePTN',
      'article:section': article.category,
      'article:tag': article.tags?.join(', ') || '',
    },

    // Robots meta
    robots: {
      index: article.status === 'published',
      follow: article.status === 'published',
      googleBot: {
        index: article.status === 'published',
        follow: article.status === 'published',
      },
    },

    // Canonical URL
    alternates: {
      canonical: articleUrl,
    },
  };
}
