import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Tag, Store, FolderTree } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
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
        <title>Kategoriler - indirimliMi</title>
        <meta name="description" content="Tüm kategorilerdeki indirimler ve kampanyalar. İstediğiniz kategoride en güncel fırsatları keşfedin!" />
      </Helmet>

      <div className="min-h-screen" data-testid="categories-page">
        {/* Header */}
        <div className="bg-void-paper border-b border-white/5">
          <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                <FolderTree className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold">Kategoriler</h1>
                <p className="text-muted-foreground">Tüm kategorilerde {categories.reduce((sum, c) => sum + c.total_deals, 0)} indirim & kampanya</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/kategori/${category.slug}`}
                  className="block glass-effect rounded-2xl p-6 hover:border-neon-purple/50 transition-all group"
                  data-testid={`category-card-${category.slug}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 flex items-center justify-center group-hover:from-neon-purple/30 group-hover:to-neon-pink/30 transition-all">
                      <FolderTree className="w-6 h-6 text-neon-purple" />
                    </div>
                    {category.is_popular && (
                      <span className="px-2 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-medium">
                        Popüler
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-heading font-bold mb-3 group-hover:text-gradient transition-all">
                    {category.name}
                  </h2>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-neon-pink" />
                      <span className="text-muted-foreground">
                        {category.total_deals > 0 ? (
                          <><span className="text-foreground font-semibold">{category.total_deals}</span> indirim & kampanya</>
                        ) : (
                          <span className="text-muted-foreground/60">Henüz indirim yok</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Store className="w-4 h-4 text-neon-blue" />
                      <span className="text-muted-foreground">
                        {category.store_count > 0 ? (
                          <><span className="text-foreground font-semibold">{category.store_count}</span> mağaza</>
                        ) : (
                          <span className="text-muted-foreground/60">Henüz mağaza yok</span>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16">
              <FolderTree className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-heading font-bold mb-2">Henüz kategori bulunmuyor</h2>
              <p className="text-muted-foreground">Yakında yeni kategoriler eklenecek.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;
