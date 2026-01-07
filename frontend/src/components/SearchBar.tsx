'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Tag, Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/image';

interface SearchResult {
  brands: any[];
  discounts: any[];
  suggestions: string[];
}

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/ara?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Mağaza veya kampanya ara..."
            className={`w-full pl-10 pr-10 border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all ${
              compact ? 'py-2 rounded-xl text-sm' : 'py-3 rounded-2xl'
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {/* Did you mean suggestions */}
          {results.suggestions && results.suggestions.length > 0 && (
            <div className="p-3 border-b bg-purple-50">
              <p className="text-sm text-purple-700">
                <span className="font-medium">Bunu mu demek istediniz?</span>
                {results.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(suggestion)}
                    className="ml-2 text-purple-600 font-semibold hover:underline"
                  >
                    {suggestion}
                  </button>
                ))}
              </p>
            </div>
          )}

          {/* Brands */}
          {results.brands && results.brands.length > 0 && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Store className="w-3 h-3" />
                Mağazalar
              </h3>
              <div className="space-y-1">
                {results.brands.slice(0, 5).map((brand: any) => (
                  <Link
                    key={brand.id}
                    href={`/magaza/${brand.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg border bg-white flex items-center justify-center p-1 overflow-hidden">
                      {brand.logo_url ? (
                        <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-sm font-bold text-gray-400">{brand.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{brand.name}</span>
                      {brand.deal_count > 0 && (
                        <span className="ml-2 text-xs text-purple-600">{brand.deal_count} fırsat</span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Discounts */}
          {results.discounts && results.discounts.length > 0 && (
            <div className="p-3 border-t">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                İndirimler
              </h3>
              <div className="space-y-1">
                {results.discounts.slice(0, 5).map((discount: any) => (
                  <Link
                    key={discount.id}
                    href={`/magaza/${discount.brand?.slug}/indirim/${discount.id.split('-')[0]}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-gray-800 line-clamp-1">{discount.title}</span>
                      <span className="text-xs text-gray-500">{discount.brand?.name}</span>
                    </div>
                    {discount.discount_text && (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        {discount.discount_text}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {results.brands?.length === 0 && results.discounts?.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>"{query}" için sonuç bulunamadı.</p>
              <p className="text-sm mt-1">Farklı bir kelime deneyin.</p>
            </div>
          )}

          {/* View all results */}
          {(results.brands?.length > 0 || results.discounts?.length > 0) && (
            <div className="p-3 bg-gray-50 border-t">
              <Link
                href={`/ara?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 text-purple-600 font-medium hover:text-purple-700"
              >
                Tüm sonuçları gör
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 text-center">
          <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      )}
    </div>
  );
}
