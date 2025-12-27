import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
    <div className="lg:hidden bg-card border-b border-border py-3 px-4 sticky top-16 z-40">
      <div
        ref={scrollRef}
        className="flex items-center space-x-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        data-testid="category-slider"
      >
        {/* Tümü butonu en başta */}
        <Link
          to="/"
          className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            isAllActive
              ? 'bg-primary text-white'
              : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
          }`}
          data-testid="category-all-btn"
        >
          Tümü
        </Link>

        {categories.map((category) => {
          const isActive = location.pathname === `/kategori/${category.slug}`;
          return (
            <Link
              key={category.id}
              to={`/kategori/${category.slug}`}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'bg-accent/10 hover:bg-accent/20'
              }`}
              data-testid={`category-slide-${category.slug}`}
            >
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
