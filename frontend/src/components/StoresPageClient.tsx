'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, X } from 'lucide-react';
import { getImageUrl } from '@/lib/image';

interface StoresPageClientProps {
  brands: any[];
  categories: any[];
}

export default function StoresPageClient({ brands, categories }: StoresPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'deals'>('deals');

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    // Search filter
    if (searchTerm) {
      result = result.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(b => 
        b.category_ids?.includes(selectedCategory)
      );
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => (b.deal_count || 0) - (a.deal_count || 0));
    }

    return result;
  }, [brands, searchTerm, selectedCategory, sortBy]);

  // Group by letter
  const grouped = filteredBrands.reduce((acc: any, brand: any) => {
    const letter = brand.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('deals');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || sortBy !== 'deals';

  return (
    <>
      {/* Filters */}
      <div className="sticky top-16 bg-white border-b z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Mağaza ara..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.filter(c => c.name !== 'Test Kategori').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium"
            >
              <option value="deals">Fırsat Sayısına Göre</option>
              <option value="name">Ada Göre</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Alphabet Navigation */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide mt-3 pt-3 border-t">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="px-3 py-1 text-sm font-medium rounded-lg hover:bg-purple-100 hover:text-purple-600 transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-2">{filteredBrands.length} mağaza listeleniyor</p>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 py-8">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-purple-600">{letter}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {grouped[letter].map((brand: any) => (
                <Link
                  key={brand.id}
                  href={`/magaza/${brand.slug}`}
                  className="relative bg-white rounded-xl p-4 border hover:border-purple-300 hover:shadow-lg transition-all group"
                >
                  {/* Deal Count Badge */}
                  {brand.deal_count > 0 && (
                    <span className="absolute top-2 right-2 min-w-[24px] h-[24px] px-1.5 flex items-center justify-center bg-purple-600 text-white text-xs font-bold rounded-full">
                      {brand.deal_count}
                    </span>
                  )}
                  
                  {/* Logo with white background */}
                  <div className="w-full aspect-square bg-white rounded-lg border border-gray-100 flex items-center justify-center p-3 mb-3 group-hover:border-purple-200 transition-colors">
                    {brand.logo_url ? (
                      <img src={getImageUrl(brand.logo_url)} alt={brand.name} loading="lazy" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-3xl font-bold text-gray-300">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-center truncate">{brand.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aramanıza uygun mağaza bulunamadı.</p>
          </div>
        )}
      </div>
    </>
  );
}
