import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = () => {
    setQuery('');
    setResults(null);
    onClose();
  };

  if (!isOpen) return null;

  const totalResults = results
    ? (results.brands?.length || 0) + (results.coupons?.length || 0) + (results.discounts?.length || 0)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/80 overflow-y-auto"
        onClick={handleClose}
        data-testid="search-modal"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl glass-effect rounded-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-4 p-6 border-b border-white/5">
            <SearchIcon className="w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              placeholder="Mağaza, kupon veya indirim ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-lg focus:outline-none"
              autoFocus
              data-testid="search-input"
            />
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              data-testid="search-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-6">
            {loading && (
              <div className="text-center py-8 text-muted-foreground">Aranıyor...</div>
            )}

            {!loading && query && totalResults === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Sonuç bulunamadı</p>
              </div>
            )}

            {!loading && query && results && (
              <div className="space-y-6">
                {results.categories && results.categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Kategoriler ({results.categories.length})
                    </h3>
                    <div className="space-y-2">
                      {results.categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/kategori/${category.slug}`}
                          onClick={handleClose}
                          className="block p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                          data-testid={`search-category-${category.slug}`}
                        >
                          <div className="font-medium text-accent">{category.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">Kategorideki tüm markaları gör</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.coupons && results.coupons.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Kuponlar ({results.coupons.length})</h3>
                    <div className="space-y-2">
                      {results.coupons.map((coupon) => (
                        <Link
                          key={coupon.id}
                          to={coupon.brand_slug ? `/magaza/${coupon.brand_slug}` : '#'}
                          onClick={handleClose}
                          className="block p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                          data-testid={`search-coupon-${coupon.id}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{coupon.title}</div>
                            <div className="text-xs text-gradient font-bold">{coupon.discount_text}</div>
                          </div>
                          {coupon.brand_name && (
                            <div className="text-xs text-muted-foreground">{coupon.brand_name}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.discounts && results.discounts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">İndirimler ({results.discounts.length})</h3>
                    <div className="space-y-2">
                      {results.discounts.map((discount) => (
                        <Link
                          key={discount.id}
                          to={discount.brand_slug ? `/magaza/${discount.brand_slug}` : '#'}
                          onClick={handleClose}
                          className="block p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                          data-testid={`search-discount-${discount.id}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{discount.title}</div>
                            <div className="text-xs text-gradient font-bold">{discount.discount_text}</div>
                          </div>
                          {discount.brand_name && (
                            <div className="text-xs text-muted-foreground">{discount.brand_name}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.catalogs && results.catalogs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Kataloglar ({results.catalogs.length})</h3>
                    <div className="space-y-2">
                      {results.catalogs.map((catalog) => (
                        <Link
                          key={catalog.id}
                          to={catalog.brand_slug ? `/magaza/${catalog.brand_slug}` : '#'}
                          onClick={handleClose}
                          className="block p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                          data-testid={`search-catalog-${catalog.id}`}
                        >
                          <div className="font-medium mb-1">{catalog.title}</div>
                          {catalog.brand_name && (
                            <div className="text-xs text-muted-foreground">{catalog.brand_name}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {results.brands && results.brands.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Mağazalar ({results.brands.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {results.brands.map((brand) => (
                        <Link
                          key={brand.id}
                          to={`/magaza/${brand.slug}`}
                          onClick={handleClose}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                          data-testid={`search-brand-${brand.slug}`}
                        >
                          {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                              <span className="font-bold">{brand.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{brand.name}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!query && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Mağaza, kupon veya indirim aramaya başlayın</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;
