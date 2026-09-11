import { notFound } from 'next/navigation';
import { Metadata, Viewport } from 'next';
import { getArticleBySlug, getRelatedArticles, incrementArticleViews } from '@/actions/articles';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Clock, Eye, Share2, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Mobile-optimized viewport configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
};

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return {
      title: 'Artikel Tidak Ditemukan | UpdatePTN',
      description: 'Artikel yang Anda cari tidak tersedia atau telah dihapus.',
    };
  }

  const result = await getArticleBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: 'Artikel Tidak Ditemukan | UpdatePTN',
      description: 'Artikel yang Anda cari tidak tersedia atau telah dihapus.',
    };
  }

  const article = result.data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://updateptn.com';
  const articleUrl = `${siteUrl}/articles/${article.slug}`;
  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || article.title;

  return {
    title: `${title} | UpdatePTN`,
    description,
    keywords: Array.isArray(article.tags) ? article.tags.join(', ') : article.category,
    authors: article.author ? [{ name: article.author }] : undefined,
    
    openGraph: {
      type: 'article',
      title,
      description,
      url: articleUrl,
      siteName: 'UpdatePTN',
      locale: 'id_ID',
      images: article.featured_image ? [{
        url: article.featured_image,
        width: 1200,
        height: 630,
        alt: title,
      }] : undefined,
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at,
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featured_image ? [article.featured_image] : undefined,
    },

    robots: {
      index: article.status === 'published',
      follow: article.status === 'published',
    },

    alternates: {
      canonical: articleUrl,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  let result;
  
  try {
    result = await getArticleBySlug(slug);
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }

  if (!result || !result.success || !result.data) {
    notFound();
  }

  const article = result.data;

  // Increment view count (fire-and-forget, ignore errors)
  try {
    incrementArticleViews(article.id).catch(() => {});
  } catch (e) {
    // Silent fail
  }

  // Get related articles (ignore errors)
  let relatedArticles: any[] = [];
  try {
    const relatedResult = await getRelatedArticles(
      article.id,
      article.category,
      article.tags,
      3
    );
    relatedArticles = relatedResult.success ? relatedResult.data || [] : [];
  } catch (e) {
    console.error('Error fetching related articles:', e);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt || article.title,
            image: article.featured_image || undefined,
            author: {
              '@type': 'Person',
              name: article.author || 'UpdatePTN',
            },
            publisher: {
              '@type': 'Organization',
              name: 'UpdatePTN',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://updateptn.com'}/logo.png`,
              },
            },
            datePublished: article.published_at,
            dateModified: article.updated_at,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://updateptn.com'}/articles/${article.slug}`,
            },
          }),
        }}
      />

      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 safe-top">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Artikel</span>
            <span className="sm:hidden">Kembali</span>
          </Link>

          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 touch-manipulation"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: article.title,
                  text: article.excerpt || article.title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link artikel telah disalin!');
              }
            }}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Bagikan</span>
          </Button>
        </div>
      </header>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-12">
        {/* Category & Tags - Mobile Optimized */}
        <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] md:text-xs">
            {article.category}
          </Badge>
          {Array.isArray(article.tags) && article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] md:text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title - Mobile Optimized */}
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 md:mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt - Mobile Optimized */}
        {article.excerpt && (
          <p className="text-base md:text-lg lg:text-xl text-slate-600 mb-4 md:mb-8 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Meta Info - Mobile Optimized */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500 mb-4 md:mb-8 pb-4 md:pb-8 border-b border-slate-200">
          {article.author && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="font-medium">{article.author}</span>
            </div>
          )}
          {article.published_at && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time>
                {new Date(article.published_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{article.read_time || 5} menit baca</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{(article.views_count || 0).toLocaleString()} views</span>
          </div>
        </div>

        {/* Featured Image - Mobile Optimized */}
        {article.featured_image && (
          <div className="relative w-full h-48 md:h-80 lg:h-96 rounded-lg md:rounded-xl overflow-hidden mb-6 md:mb-12 bg-slate-100">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              unoptimized
            />
          </div>
        )}

        {/* Content - Mobile Optimized Typography */}
        <div
          className="prose prose-slate max-w-none 
            prose-headings:font-bold prose-headings:text-slate-900 
            prose-h1:text-xl prose-h1:md:text-3xl
            prose-h2:text-lg prose-h2:md:text-2xl
            prose-h3:text-base prose-h3:md:text-xl
            prose-p:text-sm prose-p:md:text-base prose-p:text-slate-700 prose-p:leading-relaxed 
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline 
            prose-img:rounded-lg prose-img:md:rounded-xl prose-img:shadow-md 
            prose-li:text-sm prose-li:md:text-base prose-li:text-slate-700
            prose-strong:text-slate-900 prose-strong:font-bold
            prose-code:text-xs prose-code:md:text-sm prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-4 prose-blockquote:py-2"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Social Share - Mobile Optimized */}
        <div className="mt-8 md:mt-16 pt-6 md:pt-8 border-t border-slate-200">
          <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3 md:mb-4">
            Bagikan Artikel Ini
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-10 md:h-11 touch-manipulation bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-blue-600 text-xs md:text-sm"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                  '_blank',
                  'width=600,height=400'
                );
              }}
            >
              <Share2 className="w-3 h-3 md:w-4 md:h-4" />
              <span>Facebook</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-10 md:h-11 touch-manipulation bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white border-sky-500 text-xs md:text-sm"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(article.title);
                window.open(
                  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                  '_blank',
                  'width=600,height=400'
                );
              }}
            >
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span>Twitter</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-10 md:h-11 touch-manipulation bg-green-600 hover:bg-green-700 active:bg-green-800 text-white border-green-600 text-xs md:text-sm"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(article.title);
                window.open(
                  `https://wa.me/?text=${text}%20${url}`,
                  '_blank'
                );
              }}
            >
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span>WhatsApp</span>
            </Button>
          </div>
        </div>
      </article>

      {/* Related Articles - Mobile Optimized */}
      {relatedArticles.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200 py-8 md:py-16 safe-bottom">
          <div className="max-w-6xl mx-auto px-3 md:px-4">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
              Artikel Terkait
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/articles/${related.slug}`}
                  className="group block bg-white border border-slate-200 rounded-lg md:rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all touch-manipulation"
                >
                  {related.featured_image && (
                    <div className="relative h-32 md:h-40 bg-slate-100 overflow-hidden">
                      <Image
                        src={related.featured_image}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="p-3 md:p-5">
                    <Badge variant="outline" className="text-[10px] md:text-xs mb-2 md:mb-3">
                      {related.category}
                    </Badge>

                    <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {related.title}
                    </h3>

                    {related.excerpt && (
                      <p className="text-xs md:text-sm text-slate-600 line-clamp-2">
                        {related.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
