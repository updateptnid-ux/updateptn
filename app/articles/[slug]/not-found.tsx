import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-6 rounded-full">
            <FileQuestion className="h-16 w-16 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Artikel Tidak Ditemukan
        </h1>
        
        <p className="text-slate-600 mb-8">
          Maaf, artikel yang Anda cari tidak ditemukan atau mungkin telah dihapus.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/articles">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white touch-manipulation">
              Lihat Semua Artikel
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto touch-manipulation">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
