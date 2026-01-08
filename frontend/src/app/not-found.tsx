import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-8">
          <span className="text-9xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            404
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Sayfa Bulunamadı
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
          Ana sayfaya dönebilir veya arama yapabilirsiniz.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            data-testid="not-found-home-btn"
          >
            <Home className="w-5 h-5" />
            Ana Sayfa
          </Link>
          
          <Link
            href="/ara"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            data-testid="not-found-search-btn"
          >
            <Search className="w-5 h-5" />
            Arama Yap
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Popüler Sayfalar</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/kuponlar" className="text-purple-600 hover:underline text-sm">
              Kupon Kodları
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/magazalar" className="text-purple-600 hover:underline text-sm">
              Mağazalar
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/kategoriler" className="text-purple-600 hover:underline text-sm">
              Kategoriler
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/bitmek-uzere" className="text-purple-600 hover:underline text-sm">
              Bitmek Üzere
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
