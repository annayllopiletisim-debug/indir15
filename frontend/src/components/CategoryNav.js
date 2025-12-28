import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  LayoutGrid,
  Dumbbell, 
  Shirt, 
  Smartphone, 
  Utensils, 
  Home, 
  Car, 
  Plane,
  Sparkles,
  Baby,
  Landmark,
  Gamepad2,
  Heart,
  ShoppingBag
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Category icons mapping
const categoryIcons = {
  'spor': Dumbbell,
  'moda': Shirt,
  'elektronik': Smartphone,
  'gida': Utensils,
  'yemek': Utensils,
  'ev': Home,
  'mobilya': Home,
  'otomotiv': Car,
  'seyahat': Plane,
  'kozmetik': Sparkles,
  'bebek': Baby,
  'banka': Landmark,
  'finans': Landmark,
  'oyun': Gamepad2,
  'saglik': Heart,
  'alisveris': ShoppingBag,
};

const CategoryNav = () => {
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories/with-stats`);
        const sorted = response.data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(sorted);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const visibleCategories = categories.slice(0, 6);
  const hiddenCategories = categories.slice(6);

  // Check if "Tümü" should be active (home page or no category selected)
  const isAllActive = location.pathname === '/' || location.pathname === '/kategoriler';

  // Get icon for category
  const getCategoryIcon = (slug) => {
    const normalizedSlug = slug?.toLowerCase().replace(/[ıİ]/g, 'i').replace(/[şŞ]/g, 's').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c');
    for (const [key, Icon] of Object.entries(categoryIcons)) {
      if (normalizedSlug?.includes(key)) {
        return Icon;
      }
    }
    return ShoppingBag;
  };

  return (
    <div className="hidden lg:block bg-card border-b border-border sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-2 py-3">
          {/* Kategoriler başlığı */}
          <span className="text-sm font-semibold text-muted-foreground mr-2">Kategoriler</span>
          
          {/* Tümü butonu - ikonlu ve çerçeveli */}
          <Link
            to="/kategoriler"
            className={`px-3 py-2 rounded-lg transition-all font-medium text-sm flex items-center gap-2 border ${
              isAllActive 
                ? 'bg-primary text-white border-primary' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            data-testid="category-nav-all"
          >
            <LayoutGrid className="w-4 h-4" />
            Tümü
          </Link>

          {visibleCategories.map((category) => {
            const isActive = location.pathname === `/kategori/${category.slug}`;
            const IconComponent = getCategoryIcon(category.slug);
            return (
              <Link
                key={category.id}
                to={`/kategori/${category.slug}`}
                className={`px-3 py-2 rounded-lg transition-all font-medium text-sm flex items-center gap-2 border ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-primary/30' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                data-testid={`category-nav-${category.slug}`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {category.name}
                {category.total_deals > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {category.total_deals}
                  </span>
                )}
              </Link>
            );
          })}
          
          {hiddenCategories.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-3 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all font-medium text-sm flex items-center gap-2"
                data-testid="category-more-btn"
              >
                <span>Daha Fazla</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showAll && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl p-2 shadow-lg z-50"
                    data-testid="category-dropdown"
                  >
                    {hiddenCategories.map((category) => {
                      const isActive = location.pathname === `/kategori/${category.slug}`;
                      const IconComponent = getCategoryIcon(category.slug);
                      return (
                        <Link
                          key={category.id}
                          to={`/kategori/${category.slug}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                            isActive 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setShowAll(false)}
                        >
                          <IconComponent className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          {category.name}
                          {category.total_deals > 0 && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {category.total_deals}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default CategoryNav;
