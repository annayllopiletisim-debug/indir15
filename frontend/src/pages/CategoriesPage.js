import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  Flame,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  ArrowDownAZ,
  TrendingUp,
  Star,
  Clock
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Sort options
const SORT_OPTIONS = [
  { id: 'newest', label: 'Yeni Eklenen', icon: Sparkles },
  { id: 'popular', label: 'Popüler', icon: TrendingUp },
  { id: 'highest', label: 'En Çok Kampanya', icon: Star },
  { id: 'ending', label: 'Son Bitenler', icon: Clock },
];

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
    'gida': 'text-rose-400 bg-rose-400/10',
    'yemek': 'text-rose-400 bg-rose-400/10',
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

// FAQ data for categories page
const FAQ_DATA = [
  {
    question: 'İndirim Keşfet\'te hangi kategoriler var?',
    answer: 'İndirim Keşfet\'te Spor, Moda, Elektronik, Gıda, Banka ve daha birçok kategoride indirimler bulabilirsiniz. Her kategori düzenli olarak güncellenmektedir.'
  },
  {
    question: 'Kategorilerdeki kuponları nasıl kullanabilirim?',
    answer: 'İlgilendiğiniz kategoriye tıklayın, ardından beğendiğiniz kampanyanın kupon kodunu kopyalayın ve ilgili mağazanın web sitesinde ödeme sırasında kullanın.'
  },
  {
    question: 'En çok indirim hangi kategoride?',
    answer: 'İndirim oranları kategorilere göre değişiklik gösterebilir. Genellikle Moda ve Spor kategorilerinde %50\'ye varan indirimler bulunmaktadır.'
  },
  {
    question: 'Kategoriler ne sıklıkla güncelleniyor?',
    answer: 'Kategorilerdeki kampanyalar günlük olarak güncellenmektedir. Yeni kampanyalardan haberdar olmak için sayfamızı düzenli olarak ziyaret edebilirsiniz.'
  }
];

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [sortBy, setSortBy] = useState('popular');
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, expiringRes] = await Promise.all([
          axios.get(`${API}/categories/with-stats`),
          axios.get(`${API}/expiring-soon`)
        ]);
        setCategories(categoriesRes.data);
        setExpiringSoon(expiringRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sorted categories
  const sortedCategories = useMemo(() => {
    let result = [...categories];
    
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0) || (b.total_deals || 0) - (a.total_deals || 0));
        break;
      case 'highest':
        result.sort((a, b) => (b.total_deals || 0) - (a.total_deals || 0));
        break;
      case 'ending':
        // Sort by categories with most ending deals first
        result.sort((a, b) => (b.total_deals || 0) - (a.total_deals || 0));
        break;
      default:
        result.sort((a, b) => (b.total_deals || 0) - (a.total_deals || 0));
    }
    
    return result;
  }, [categories, sortBy]);

  // Calculate total deals
  const totalDeals = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.total_deals || 0), 0);
  }, [categories]);

  // Total expiring count
  const expiringCount = (expiringSoon.coupons?.length || 0) + (expiringSoon.discounts?.length || 0);

  // Get current sort option
  const currentSortOption = SORT_OPTIONS.find(opt => opt.id === sortBy) || SORT_OPTIONS[0];

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
        <title>Kategoriler - Tüm İndirim ve Kupon Kategorileri 2025 | İndirim Keşfet</title>
        <meta name="description" content={`${categories.length} farklı kategoride ${totalDeals} aktif kampanya. Spor, Moda, Elektronik, Gıda ve daha fazlasında en güncel kupon kodları ve indirimler.`} />
        <meta name="keywords" content="kupon kategorileri, indirim kategorileri, spor indirimleri, moda kuponları, elektronik fırsatları" />
      </Helmet>

      <div className="min-h-screen pb-6" data-testid="categories-page">
        {/* SEO Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            {/* Title & Stats */}
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-heading font-bold">Tüm Kategoriler</h1>
                <p className="text-sm lg:text-base text-muted-foreground">
                  {categories.length} kategori, {totalDeals} kampanya
                </p>
              </div>
            </div>

            {/* SEO Description */}
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              İndirim Keşfet'te {categories.length} farklı kategoride en güncel kupon kodları ve indirim fırsatlarını keşfedin. 
              Spor, Moda, Elektronik, Gıda ve daha birçok kategoride {totalDeals}+ aktif kampanya sizi bekliyor.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Expiring Soon Card - First item */}
          {expiringCount > 0 && (
            <Link
              to="/son-24-saat"
              className="block mb-6 p-4 lg:p-5 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Flame className="w-8 h-8 lg:w-9 lg:h-9 text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold mb-0.5">Bitmek Üzere</h2>
                    <p className="text-white/80 text-sm lg:text-base">{expiringCount} kampanya bugün bitiyor</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Sort Button - Prominent Action Button */}
          <button
            onClick={() => setShowSortModal(true)}
            className="w-full mb-6 p-4 bg-card border-2 border-primary/30 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ArrowDownAZ className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Sıralama</p>
                <p className="font-semibold text-primary">{currentSortOption.label}</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          {/* Categories Grid */}
          {sortedCategories.length === 0 ? (
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

        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-6 border-t border-border">
          <div className="max-w-3xl">
            <h2 className="text-lg lg:text-xl font-bold mb-3">İndirim Kategorileri Hakkında</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              İndirim Keşfet olarak, {categories.length} farklı kategoride en güncel ve doğrulanmış kupon kodlarını 
              sizlerle paylaşıyoruz. Her gün güncellenen kampanyalarımız sayesinde alışverişlerinizde tasarruf edebilirsiniz.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              En popüler kategorilerimiz arasında {categories.filter(c => c.is_popular).map(c => c.name).slice(0, 4).join(', ')} bulunmaktadır. 
              Bu kategorilerde %50'ye varan indirimler ve özel kupon kodları sunulmaktadır.
            </p>
            
            <h3 className="text-base font-semibold mb-2 mt-6">Kategorilerde Nasıl İndirim Bulunur?</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
              <li>İlgilendiğiniz kategoriyi seçin</li>
              <li>Mevcut kampanyaları ve kupon kodlarını inceleyin</li>
              <li>Beğendiğiniz kuponu kopyalayın</li>
              <li>Mağazanın web sitesinde ödeme sırasında uygulayın</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mx-auto px-4 py-6 border-t border-border" itemScope itemType="https://schema.org/FAQPage">
          <div className="max-w-3xl">
            <h2 className="text-lg lg:text-xl font-bold mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Sıkça Sorulan Sorular
            </h2>
            
            <div className="space-y-2">
              {FAQ_DATA.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-card border border-border rounded-xl overflow-hidden"
                  itemScope 
                  itemProp="mainEntity" 
                  itemType="https://schema.org/Question"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-sm pr-4" itemProp="name">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {expandedFAQ === index && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                        itemScope 
                        itemProp="acceptedAnswer" 
                        itemType="https://schema.org/Answer"
                      >
                        <p className="px-4 pb-4 text-sm text-muted-foreground" itemProp="text">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
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
