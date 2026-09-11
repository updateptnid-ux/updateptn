import { getPublishedArticles } from '@/actions/articles';
import { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Star, TrendingUp, Search, Filter, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Force dynamic rendering to ensure page works even if DB is empty
 * This prevents build-time errors on Vercel
 */
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

/**
 * Mobile-optimized viewport configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3b82f6',
};

/**
 * Static metadata for Articles page
 */
export const metadata: Metadata = {
  title: 'Artikel & Berita SNBT | UpdatePTN',
  description: 'Baca artikel terbaru seputar SNBT, tips lolos PTN favorit, strategi belajar UTBK, berita pendidikan, dan pengumuman terkini dari UpdatePTN.',
  keywords: 'artikel snbt, tips snbt, berita pendidikan, tips utbk, strategi masuk ptn, info snbt 2026',
  
  openGraph: {
    title: 'Artikel & Berita SNBT | UpdatePTN',
    description: 'Info terkini seputar SNBT, tips belajar, berita pendidikan, dan pengumuman platform UpdatePTN',
    type: 'website',
    siteName: 'UpdatePTN',
    locale: 'id_ID',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Artikel & Berita SNBT | UpdatePTN',
    description: 'Info terkini seputar SNBT, tips belajar, berita pendidikan',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function ArticlesPage() {
  // Add logging for debugging on Vercel
  console.log('[Articles Page] Fetching published articles...');
  
  const result = await getPublishedArticles({ limit: 50 });
  
  console.log('[Articles Page] Result:', {
    success: result.success,
    articlesCount: result.data?.articles?.length || 0,
    error: result.error,
  });
  
  // Handle errors gracefully
  if (!result.success || !result.data) {
    console.error('[Articles Page] Failed to load articles:', result.error);
    
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-b border-blue-500/20 safe-top">
          <div className="max-w-7xl mx-auto px-3 md:px-4 py-8 md:py-20">
            <div className="max-w-3xl">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-xs md:text-sm text-blue-100 hover:text-white mb-3 md:mb-4 transition-colors touch-manipulation"
              >
                ← Kembali ke Beranda
              </Link>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
                Artikel & Berita
              </h1>
              <p className="text-sm md:text-lg lg:text-xl text-blue-100">
                Info terkini seputar SNBT, tips belajar, berita pendidikan
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 md:px-4 py-12 md:py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-slate-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
              Belum Ada Artikel
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              Artikel sedang dalam persiapan. Nantikan konten menarik seputar SNBT dan pendidikan!
            </p>
            <Link href="/">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 touch-manipulation">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { articles } = result.data;
  
  // If no articles exist yet
  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-b border-blue-500/20 safe-top">
          <div className="max-w-7xl mx-auto px-3 md:px-4 py-8 md:py-20">
            <div className="max-w-3xl">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-xs md:text-sm text-blue-100 hover:text-white mb-3 md:mb-4 transition-colors touch-manipulation"
              >
                ← Kembali ke Beranda
              </Link>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
                Artikel & Berita
              </h1>
              <p className="text-sm md:text-lg lg:text-xl text-blue-100">
                Info terkini seputar SNBT, tips belajar, berita pendidikan
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 md:px-4 py-12 md:py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
              Belum Ada Artikel Tersedia
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6">
              Kami sedang menyiapkan konten menarik untuk Anda. Nantikan artikel seputar tips SNBT, strategi belajar, dan berita pendidikan terkini!
            </p>
            <Link href="/">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 touch-manipulation h-11 md:h-12">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  const featuredArticles = articles.filter(a => a.is_featured).slice(0, 3);
  const regularArticles = articles.filter(a => !a.is_featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mobile Optimized */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-b border-blue-500/20 safe-top">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-8 md:py-20">
          <div className="max-w-3xl">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-xs md:text-sm text-blue-100 hover:text-white mb-3 md:mb-4 transition-colors touch-manipulation"
            >
              ← Kembali ke Beranda
            </Link>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
              Artikel & Berita
            </h1>
            <p className="text-sm md:text-lg lg:text-xl text-blue-100">
              Info terkini seputar SNBT, tips belajar, berita pendidikan, dan pengumuman platform UpdatePTN
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12">
        {/* Featured Articles - Mobile Optimized */}
        {featuredArticles.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Star className="h-4 w-4 md:h-5 md:w-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900">
                Artikel Unggulan
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group block bg-white border border-slate-200 rounded-lg md:rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 touch-manipulation"
                >
                  {article.featured_image && (
                    <div className="relative h-40 md:h-48 bg-slate-100 overflow-hidden">
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                      />
                      <div className="absolute top-2 md:top-3 right-2 md:right-3">
                        <Badge className="bg-amber-500 text-white border-0 font-bold text-[10px] md:text-xs">
                          UNGGULAN
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <Badge variant="outline" className="text-[10px] md:text-xs">
                        {article.category}
                      </Badge>
                      {Array.isArray(article.tags) && article.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] md:text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {article.excerpt && (
                      <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        {article.published_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(article.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{article.read_time} menit</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Articles - Mobile Optimized */}
        <section>
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900">
              Semua Artikel
            </h2>
          </div>

          {regularArticles.length === 0 ? (
            <div className="text-center py-8 md:py-12 bg-slate-50 rounded-lg">
              <p className="text-sm md:text-base text-slate-600">
                {featuredArticles.length > 0 
                  ? 'Tidak ada artikel lain saat ini' 
                  : 'Belum ada artikel tersedia'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {regularArticles.map((article) => {
                // Defensive checks
                if (!article || !article.id || !article.slug) return null;
                
                return (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group block bg-white border border-slate-200 rounded-lg md:rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 touch-manipulation"
                  >
                    {article.featured_image && (
                      <div className="relative h-36 md:h-40 bg-slate-100 overflow-hidden">
                        <Image
                          src={article.featured_image}
                          alt={article.title || 'Article image'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <Badge variant="outline" className="text-[10px] md:text-xs">
                          {article.category || 'Umum'}
                        </Badge>
                      </div>

                      <h3 className="text-sm md:text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title || 'Untitled'}
                      </h3>

                      {article.excerpt && (
                        <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          {article.published_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(article.published_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.read_time || 5} min</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
