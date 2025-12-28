import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, FolderTree, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header id="main-header" className="sticky top-0 z-50 w-full glass-effect border-b border-border transition-transform duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 lg:h-16 gap-2 sm:gap-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex-shrink-0"
              data-testid="header-logo"
            >
              <span className="text-lg font-heading font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                İndirim Keşfet
              </span>
            </Link>
            
            {/* Desktop Search Bar - Hidden on mobile */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.elements.search.value;
                if (query.trim()) {
                  navigate(`/arama?q=${encodeURIComponent(query.trim())}`);
                  e.target.elements.search.value = '';
                }
              }} 
              className="hidden lg:block flex-1 max-w-md"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="search"
                  type="text"
                  placeholder="Marka veya kupon ara..."
                  className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  data-testid="header-search-input"
                />
              </div>
            </form>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
                data-testid="header-menu-btn"
                aria-label="Menü"
              >
                {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <nav className="hidden lg:flex items-center space-x-6">
                <Link to="/son-24-saat" className="text-sm hover:text-primary transition-colors flex items-center gap-1.5 text-orange-500" data-testid="header-expiring-link">
                  <Flame className="w-4 h-4" />
                  Son 24 Saat
                </Link>
                <Link to="/kategoriler" className="text-sm hover:text-primary transition-colors" data-testid="header-categories-link">
                  Kategoriler
                </Link>
                <Link to="/magazalar" className="text-sm hover:text-primary transition-colors" data-testid="header-stores-link">
                  Mağazalar
                </Link>
                <Link to="/iletisim" className="text-sm hover:text-primary transition-colors" data-testid="header-contact-link">
                  İletişim
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-effect border-b border-border overflow-hidden"
            data-testid="mobile-menu"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-2">
              <Link
                to="/son-24-saat"
                className="py-3 px-4 rounded-lg hover:bg-muted transition-colors flex items-center gap-3 text-orange-500"
                onClick={() => setShowMenu(false)}
                data-testid="mobile-expiring-link"
              >
                <Flame className="w-5 h-5" />
                Son 24 Saat
              </Link>
              <Link
                to="/kategoriler"
                className="py-3 px-4 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                onClick={() => setShowMenu(false)}
                data-testid="mobile-categories-link"
              >
                <FolderTree className="w-5 h-5 text-primary" />
                Kategoriler
              </Link>
              <Link
                to="/magazalar"
                className="py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setShowMenu(false)}
                data-testid="mobile-stores-link"
              >
                Mağazalar
              </Link>
              <Link
                to="/iletisim"
                className="py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setShowMenu(false)}
                data-testid="mobile-contact-link"
              >
                İletişim
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
