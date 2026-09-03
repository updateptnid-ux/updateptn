import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Mobile-optimized 404 page for articles
 */
export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-3 md:p-4 safe-top safe-bottom">
      <div className="max-w-md w-full text-center">
        {/* Icon - Mobile Optimized */}
        <div className="mb-4 md:mb-6 flex justify-center">
          <div className="rounded-full bg-blue-100 p-4 md:p-6">
            <FileQuestion className="h-12 w-12 md:h-16 md:w-16 text-blue-600" />
          </div>
        </div>

        {/* Title - Mobile Optimized */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 md:mb-4">
          Artikel Tidak Ditemukan
        </h1>

        {/* Description - Mobile Optimized */}
        <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8 leading-relaxed">
          Maaf, artikel yang Anda cari tidak ditemukan atau mungkin telah dihapus.
        </p>

        {/* Suggestions */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 text-left">
          <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600" />
            Saran untuk Anda:
          </h2>
          <ul className="text-xs md:text-sm text-slate-600 space-y-2">
            <li>• Periksa kembali URL yang Anda masukkan</li>
            <li>• Cari artikel lain yang mungkin Anda cari</li>
            <li>• Kembali ke halaman artikel untuk melihat konten terbaru</li>
          </ul>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
          <Button 
            asChild 
            className="gap-2 h-11 md:h-12 text-sm md:text-base bg-blue-600 hover:bg-blue-700 active:bg-blue-800 touch-manipulation"
          >
            <Link href="/articles">
              <ArrowLeft className="h-4 w-4" />
              Lihat Semua Artikel
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="gap-2 h-11 md:h-12 text-sm md:text-base touch-manipulation"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] md:text-xs text-slate-400 mt-8">
          Jika Anda yakin ini adalah kesalahan, silakan hubungi tim kami.
        </p>
      </div>
    </div>
  );
}
