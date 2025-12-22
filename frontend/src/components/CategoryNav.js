import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CategoryNav = () => {
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        const sorted = response.data.sort((a, b) => a.order - b.order);
        setCategories(sorted);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const visibleCategories = categories.slice(0, 6);
  const hiddenCategories = categories.slice(6);

  return (
    <div className="hidden lg:block bg-card border-b border-border sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <nav className="flex items-center space-x-1 py-3">
          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              to={`/kategori/${category.slug}`}
              className="px-4 py-2 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors font-medium text-sm"
              data-testid={`category-nav-${category.slug}`}
            >
              {category.name}
            </Link>
          ))}
          
          {hiddenCategories.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-4 py-2 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors font-medium text-sm flex items-center space-x-1"
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
                    className="absolute top-full left-0 mt-2 w-64 glass-effect rounded-xl p-2 shadow-lg"
                    data-testid="category-dropdown"
                  >
                    {hiddenCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/kategori/${category.slug}`}
                        className="block px-4 py-2 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors text-sm"
                        onClick={() => setShowAll(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
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
