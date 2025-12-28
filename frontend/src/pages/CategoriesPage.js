import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Search,
  LayoutGrid,
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
  ShoppingBag,
  Tag
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Category icon mapping based on slug
const getCategoryIcon = (slug) => {
  const iconMap = {
    'spor': Dumbbell,
    'moda': Shirt,
    'elektronik': Smartphone,
    'banka': Landmark,
    'market': ShoppingBag,
    'gida': Utensils,
    'yemek': Utensils,
    'ev-yasam': Home,
    'otomotiv': Car,
    'seyahat': Plane,
    'kozmetik': Sparkles,
    'bebek': Baby,
    'kitap': Book,
    'oyun': Gamepad2,
    'saglik': Heart,
  };
  return iconMap[slug] || LayoutGrid;
};

// Category color mapping for icons
const getCategoryColor = (slug) => {
  const colorMap = {
    'spor': 'text-orange-500 bg-orange-500/10',
    'moda': 'text-pink-500 bg-pink-500/10',
    'elektronik': 'text-blue-500 bg-blue-500/10',
    'banka': 'text-green-500 bg-green-500/10',
    'market': 'text-amber-500 bg-amber-500/10',
    'gida': 'text-red-500 bg-red-500/10',
    'yemek': 'text-red-500 bg-red-500/10',
    'ev-yasam': 'text-teal-500 bg-teal-500/10',
    'otomotiv': 'text-gray-500 bg-gray-500/10',
    'seyahat': 'text-cyan-500 bg-cyan-500/10',
    'kozmetik': 'text-purple-500 bg-purple-500/10',
    'bebek': 'text-rose-400 bg-rose-400/10',
    'kitap': 'text-indigo-500 bg-indigo-500/10',
    'oyun': 'text-violet-500 bg-violet-500/10',
    'saglik': 'text-emerald-500 bg-emerald-500/10',
  };
  return colorMap[slug] || 'text-primary bg-primary/10';
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API}/categories/with-stats`);
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Calculate total deals
  const totalDeals = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.total_deals || 0), 0);
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Kategoriler - İndirim Keşfet</title>
        <meta name="description" content="Tüm kategorilerdeki indirimler ve kampanyalar. İstediğiniz kategoride en güncel fırsatları keşfedin!" />
      </Helmet>

      <div className="min-h-screen pb-6" data-testid="categories-page">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-heading font-bold">Kategoriler</h1>
                <p className="text-sm lg:text-base text-muted-foreground">
                  {categories.length} kategori, {totalDeals} kampanya
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-4 py-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Kategori Bulunamadı</h3>
              <p className="text-muted-foreground">Arama kriterlerinize uygun kategori yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
              {filteredCategories.map((category, index) => {
                const IconComponent = getCategoryIcon(category.slug);
                const colorClass = getCategoryColor(category.slug);
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      to={`/kategori/${category.slug}`}
                      className="group block p-4 lg:p-5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all text-center"
                      data-testid={`category-card-${category.slug}`}
                    >
                      {/* Icon */}
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 mx-auto rounded-xl ${colorClass} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 lg:w-7 lg:h-7" />
                      </div>

                      {/* Name */}
                      <h2 className="font-semibold text-sm lg:text-base truncate mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>

                      {/* Deal count */}
                      {category.total_deals > 0 ? (
                        <p className="text-xs lg:text-sm text-primary font-medium">
                          {category.total_deals} kampanya
                        </p>
                      ) : (
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          Yakında
                        </p>
                      )}

                      {/* Popular badge */}
                      {category.is_popular && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] lg:text-xs font-medium">
                          Popüler
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links Section */}
        <div className="container mx-auto px-4 py-6 border-t border-border">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Hızlı Bağlantılar
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/magazalar"
              className="px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium transition-colors"
            >
              Tüm Mağazalar
            </Link>
            <Link
              to="/son-24-saat"
              className="px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium transition-colors"
            >
              Son 24 Saat
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium transition-colors"
            >
              Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;
