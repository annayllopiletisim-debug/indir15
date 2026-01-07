'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Flame, Mail, Home, Clock, Tag, Gift } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              İndirim Keşfet
            </span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchBar compact />
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            <Link
              href="/bitmek-uzere"
              className="px-3 py-2 rounded-lg border border-orange-300 bg-orange-50 hover:bg-orange-100 transition-all flex items-center gap-2 text-sm font-medium text-orange-600"
            >
              <Clock className="w-4 h-4" />
              Bitmek Üzere
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
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 ml-auto"
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
            <div className="mb-4">
              <SearchBar />
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
              href="/bitmek-uzere"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 text-orange-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Clock className="w-5 h-5" />
              Bitmek Üzere
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
