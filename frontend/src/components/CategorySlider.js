import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CategorySlider = () => {
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
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

  return (
    <div className="lg:hidden bg-card border-b border-border py-3 px-4 sticky top-16 z-40">
      <div
        ref={scrollRef}
        className="flex items-center space-x-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        data-testid="category-slider"
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/kategori/${category.slug}`}
            className="flex-shrink-0 px-5 py-2.5 rounded-full bg-accent/10 hover:bg-accent/20 text-sm font-medium whitespace-nowrap transition-colors"
            data-testid={`category-slide-${category.slug}`}
          >
            {category.name}
          </Link>
        ))}
        
        {categories.length > 0 && (
          <Link
            to="/kategoriler"
            className="flex-shrink-0 px-5 py-2.5 rounded-full border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-sm font-medium whitespace-nowrap transition-all"
            data-testid="category-all-btn"
          >
            Tümü
          </Link>
        )}
      </div>
    </div>
  );
};

export default CategorySlider;
