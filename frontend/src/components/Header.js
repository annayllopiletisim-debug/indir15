import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, FolderTree } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-effect border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2" data-testid="header-logo">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xl">iM</span>
              </div>
              <span className="text-xl font-heading font-bold text-gradient hidden sm:inline">indirimliMi</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                data-testid="header-search-btn"
                aria-label="Ara"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
                data-testid="header-menu-btn"
                aria-label="Menü"
              >
                {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <nav className="hidden lg:flex items-center space-x-6">
                <Link to="/kategoriler" className="text-sm hover:text-neon-purple transition-colors" data-testid="header-categories-link">
                  Kategoriler
                </Link>
                <Link to="/magazalar" className="text-sm hover:text-neon-purple transition-colors" data-testid="header-stores-link">
                  Mağazalar
                </Link>
                <Link to="/iletisim" className="text-sm hover:text-neon-purple transition-colors" data-testid="header-contact-link">
                  İletişim
                </Link>
                <a href="https://forms.google.com/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-neon-purple transition-colors" data-testid="header-submit-coupon-link">
                  Kupon Gönder
                </a>
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
            className="lg:hidden glass-effect border-b border-white/5 overflow-hidden"
            data-testid="mobile-menu"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
              <Link
                to="/kategoriler"
                className="py-3 px-4 rounded-lg hover:bg-white/5 transition-colors text-lg flex items-center gap-3"
                onClick={() => setShowMenu(false)}
                data-testid="mobile-categories-link"
              >
                <FolderTree className="w-5 h-5 text-neon-purple" />
                Kategoriler
              </Link>
              <Link
                to="/magazalar"
                className="py-3 px-4 rounded-lg hover:bg-white/5 transition-colors text-lg"
                onClick={() => setShowMenu(false)}
                data-testid="mobile-stores-link"
              >
                Mağazalar
              </Link>
              <Link
                to="/iletisim"
                className="py-3 px-4 rounded-lg hover:bg-white/5 transition-colors text-lg"
                onClick={() => setShowMenu(false)}
                data-testid="mobile-contact-link"
              >
                İletişim
              </Link>
              <a
                href="https://forms.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-lg hover:bg-white/5 transition-colors text-lg"
                data-testid="mobile-submit-link"
              >
                Kupon Gönder
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default Header;
