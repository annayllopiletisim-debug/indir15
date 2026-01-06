import Link from 'next/link';
import { Search, Menu, Flame, Mail } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              İndirim Keşfet
            </span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Mağaza veya kampanya ara..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link
              href="/son-24-saat"
              className="px-3 py-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 transition-all flex items-center gap-2 text-sm font-medium text-red-600"
            >
              <Flame className="w-4 h-4" />
              Son 24 Saat
            </Link>
            <Link
              href="/iletisim"
              className="px-3 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Mail className="w-4 h-4 text-primary" />
              İletişim
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
