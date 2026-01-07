'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, Flame, Mail, Tag, Gift, Home } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              İndirim Keşfet
            </span>
          </Link>

          {/* Search - Desktop (hidden on homepage) */}
          {!isHomePage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Mağaza veya kampanya ara..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link
              href="/magazalar"
              className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <Tag className="w-4 h-4 text-purple-600" />
              Mağazalar
            </Link>
            <Link
              href="/kuponlar"
              className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <Gift className="w-4 h-4 text-purple-600" />
              Kuponlar
            </Link>
            <Link
              href="/son-24-saat"
              className="px-3 py-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 transition-all flex items-center gap-2 text-sm font-medium text-red-600"
            >
              <Flame className="w-4 h-4" />
              Son 24 Saat
            </Link>
            <Link
              href="/iletisim"
              className="px-3 py-2 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Mail className="w-4 h-4 text-purple-600" />
              İletişim
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Mağaza veya kampanya ara..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5 text-purple-600" />
              Ana Sayfa
            </Link>
            <Link
              href="/magazalar"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Tag className="w-5 h-5 text-purple-600" />
              Mağazalar
            </Link>
            <Link
              href="/kuponlar"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Gift className="w-5 h-5 text-purple-600" />
              Kuponlar
            </Link>
            <Link
              href="/son-24-saat"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Flame className="w-5 h-5" />
              Son 24 Saat
            </Link>
            <Link
              href="/iletisim"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Mail className="w-5 h-5 text-purple-600" />
              İletişim
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
