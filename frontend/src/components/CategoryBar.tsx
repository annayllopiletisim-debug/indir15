'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoryBarProps {
  categories: Category[];
}

const categoryConfig: Record<string, { icon: string; color: string }> = {
  'spor': { icon: '⚽', color: 'text-green-600' },
  'moda': { icon: '👗', color: 'text-pink-600' },
  'elektronik': { icon: '📱', color: 'text-blue-600' },
  'gida': { icon: '🍴', color: 'text-orange-600' },
  'banka': { icon: '🏛️', color: 'text-purple-600' },
  'saglik': { icon: '💊', color: 'text-red-600' },
  'egitim': { icon: '📚', color: 'text-yellow-600' },
  'seyahat': { icon: '✈️', color: 'text-cyan-600' },
};

export default function CategoryBar({ categories }: CategoryBarProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const currentCategory = pathname.startsWith('/kategori/') ? pathname.split('/')[2] : null;

  return (
    <section className={`bg-white border-b ${isHomePage ? 'py-4' : 'py-2'}`}>
      <div className="container mx-auto px-4">
        <div className={`flex gap-2 overflow-x-auto scrollbar-hide ${isHomePage ? 'gap-3 pb-2' : 'gap-2 pb-1'}`}>
          <Link
            href="/"
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full font-medium transition-all ${
              isHomePage 
                ? 'px-5 py-2.5 bg-purple-600 text-white' 
                : pathname === '/'
                  ? 'px-3 py-1.5 text-sm bg-purple-600 text-white'
                  : 'px-3 py-1.5 text-sm bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
            }`}
          >
            <span className={isHomePage ? 'text-lg' : 'text-base'}>📦</span>
            <span>Tümü</span>
          </Link>
          {categories.slice(0, 8).map((category: Category) => {
            const config = categoryConfig[category.slug] || { icon: '📁', color: 'text-gray-600' };
            const isActive = currentCategory === category.slug;
            return (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full font-medium transition-all ${
                  isHomePage
                    ? `px-5 py-2.5 ${isActive ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md'}`
                    : `px-3 py-1.5 text-sm ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'}`
                }`}
              >
                <span className={`${isHomePage ? 'text-lg' : 'text-base'} ${isActive ? '' : config.color}`}>{config.icon}</span>
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
