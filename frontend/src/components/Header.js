import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';

const Header = ({ onSearchClick, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" data-testid="header-logo">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">SS</span>
            </div>
            <span className="text-xl font-heading font-bold text-gradient hidden sm:inline">SavvySaver</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onSearchClick}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              data-testid="header-search-btn"
              aria-label="Ara"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
              data-testid="header-menu-btn"
              aria-label="Menü"
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav className="hidden lg:flex items-center space-x-6">
              <Link to="/magazalar" className="text-sm hover:text-neon-purple transition-colors" data-testid="header-stores-link">
                Mağazalar
              </Link>
              <a href="https://forms.google.com/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-neon-purple transition-colors" data-testid="header-submit-coupon-link">
                Kupon Gönder
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;