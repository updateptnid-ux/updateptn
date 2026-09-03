'use client';

import Link from 'next/link';
import { FileQuestion, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary for articles page
 * Mobile-optimized error handling
 */
export default function ArticlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-3 md:p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-4 md:mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4 md:p-6">
            <FileQuestion className="h-12 w-12 md:h-16 md:w-16 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 md:mb-4">
          Terjadi Kesalahan
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8 leading-relaxed">
          Maaf, terjadi kesalahan saat memuat halaman artikel. Silakan coba lagi atau kembali ke beranda.
        </p>

        {/* Error details (only in dev) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs md:text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
          <Button 
            onClick={reset}
            className="gap-2 h-11 md:h-12 text-sm md:text-base bg-blue-600 hover:bg-blue-700 active:bg-blue-800 touch-manipulation"
          >
            <RefreshCcw className="h-4 w-4" />
            Coba Lagi
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
      </div>
    </div>
  );
}
