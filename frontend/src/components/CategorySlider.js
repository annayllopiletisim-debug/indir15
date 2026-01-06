import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  Dumbbell, 
  Landmark, 
  Shirt, 
  Smartphone, 
  Utensils, 
  Home, 
  Car, 
  Plane,
  Sparkles,
  Baby,
  Book,
  Gamepad2,
  Heart,
  LayoutGrid
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Category icon mapping based on slug with colors
const getCategoryIcon = (slug) => {
  const iconMap = {
    'spor': { icon: Dumbbell, color: 'text-orange-500' },
    'moda': { icon: Shirt, color: 'text-pink-500' },
    'elektronik': { icon: Smartphone, color: 'text-blue-500' },
    'banka': { icon: Landmark, color: 'text-emerald-600' },
    'market': { icon: ShoppingBag, color: 'text-violet-500' },
    'yemek': { icon: Utensils, color: 'text-yellow-600' },
    'gida': { icon: Utensils, color: 'text-yellow-600' },
    'ev-yasam': { icon: Home, color: 'text-green-500' },
    'otomotiv': { icon: Car, color: 'text-gray-600' },
    'seyahat': { icon: Plane, color: 'text-sky-500' },
    'kozmetik': { icon: Sparkles, color: 'text-purple-500' },
    'bebek': { icon: Baby, color: 'text-pink-400' },
    'kitap': { icon: Book, color: 'text-amber-600' },
    'oyun': { icon: Gamepad2, color: 'text-indigo-500' },
    'saglik': { icon: Heart, color: 'text-red-500' },
  };
  return iconMap[slug] || { icon: LayoutGrid, color: 'text-primary' };
};

const CategorySlider = () => {
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use categories/with-stats to get deal counts
        const response = await axios.get(`${API}/categories/with-stats`);
        // Filter popular categories for mobile
        const popular = response.data
          .filter(cat => cat.is_popular)
          .sort((a, b) => a.order - b.order);
        
        // If no popular categories, show first 8
        const toShow = popular.length > 0 ? popular : response.data.slice(0, 8);
        setCategories(toShow);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const isAllActive = location.pathname === '/' || location.pathname === '/kategoriler';

  return (
    <div className="lg:hidden bg-card border-b border-border py-3 px-4">
      <div
        ref={scrollRef}
        className="flex items-center space-x-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        data-testid="category-slider"
      >
        {/* Tümü butonu en başta - Tüm Kategoriler sayfasına yönlendir */}
        <Link
          to="/kategoriler"
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            isAllActive
              ? 'bg-primary text-white'
              : 'border border-border bg-muted/30 hover:bg-muted/50'
          }`}
          data-testid="category-all-btn"
        >
          <LayoutGrid className="w-4 h-4" />
          Tümü
        </Link>

        {categories.map((category) => {
          const isActive = location.pathname === `/kategori/${category.slug}`;
          const IconComponent = getCategoryIcon(category.slug);
          return (
            <Link
              key={category.id}
              to={`/kategori/${category.slug}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'border border-border bg-muted/30 hover:bg-muted/50'
              }`}
              data-testid={`category-slide-${category.slug}`}
            >
              <IconComponent className="w-4 h-4" />
              {category.name}
              {/* İndirim sayısı badge */}
              {category.total_deals > 0 && (
                <span className="text-xs text-muted-foreground">({category.total_deals})</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySlider;
