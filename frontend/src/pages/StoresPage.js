import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Store, ChevronDown, ChevronRight, Package, Star, HelpCircle, Flame, ShoppingBag, ArrowDownAZ, Sparkles, Clock, TrendingUp } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Sort options
const SORT_OPTIONS = [
  { id: 'newest', label: 'Yeni Eklenen', icon: Sparkles },
  { id: 'popular', label: 'Popüler', icon: TrendingUp },
  { id: 'highest', label: 'En Çok İndirim', icon: Star },
  { id: 'ending', label: 'Son Bitenler', icon: Clock },
];

// FAQ data for stores page
const FAQ_DATA = [
  {
    question: 'İndirim Keşfet\'te hangi mağazalar var?',
    answer: 'İndirim Keşfet\'te yüzlerce popüler mağazanın kupon kodları ve indirimleri bulunmaktadır. Trendyol, Hepsiburada, Amazon, Nike, Adidas ve daha birçok marka için güncel fırsatları takip edebilirsiniz.'
  },
  {
    question: 'Mağaza kuponlarını nasıl kullanabilirim?',
    answer: 'Beğendiğiniz mağazaya tıklayın, mevcut kupon kodlarını görüntüleyin ve kopyalayın. Ardından mağazanın web sitesinde alışveriş yaparken ödeme sayfasında kupon kodunu uygulayın.'
  },
  {
    question: 'Kuponlar ne kadar süre geçerli?',
    answer: 'Her kuponun geçerlilik süresi farklıdır. Kupon detaylarında son kullanma tarihi belirtilmektedir. Bitmek üzere olan kuponları "Son 24 Saat" bölümünde görebilirsiniz.'
  },
  {
    question: 'Yeni mağazalar ne zaman ekleniyor?',
    answer: 'Platformumuza sürekli yeni mağazalar eklenmektedir. Güncel kalabilmek için sayfamızı düzenli olarak ziyaret etmenizi öneririz.'
  }
];

const StoresPage = () => {
  const [brands, setBrands] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [sortBy, setSortBy] = useState('popular');
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, couponsRes, discountsRes, expiringRes] = await Promise.all([
          axios.get(`${API}/brands`),
          axios.get(`${API}/coupons`),
          axios.get(`${API}/discounts`),
          axios.get(`${API}/expiring-soon`)
        ]);
        
        // Calculate deal counts for each brand
        const brandDealCounts = {};
        const brandEndingSoon = {};
        
        couponsRes.data.forEach(c => {
          if (c.is_active !== false) {
            brandDealCounts[c.brand_id] = (brandDealCounts[c.brand_id] || 0) + 1;
            // Check if ending today
            if (c.expiry_date) {
              const expiry = new Date(c.expiry_date);
              const now = new Date();
              if (expiry.toDateString() === now.toDateString()) {
                brandEndingSoon[c.brand_id] = (brandEndingSoon[c.brand_id] || 0) + 1;
              }
            }
          }
        });
        discountsRes.data.forEach(d => {
          brandDealCounts[d.brand_id] = (brandDealCounts[d.brand_id] || 0) + 1;
          if (d.expiry_date) {
            const expiry = new Date(d.expiry_date);
            const now = new Date();
            if (expiry.toDateString() === now.toDateString()) {
              brandEndingSoon[d.brand_id] = (brandEndingSoon[d.brand_id] || 0) + 1;
            }
          }
        });

        const brandsWithDeals = brandsRes.data.map(b => ({
          ...b,
          deal_count: brandDealCounts[b.id] || 0,
          ending_soon: brandEndingSoon[b.id] || 0
        }));

        setBrands(brandsWithDeals);
        setExpiringSoon(expiringRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sorted and filtered brands
  const sortedBrands = useMemo(() => {
    let result = [...brands];
    
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'popular':
        result.sort((a, b) => b.deal_count - a.deal_count);
        break;
      case 'highest':
        result.sort((a, b) => b.deal_count - a.deal_count);
        break;
      case 'ending':
        result.sort((a, b) => b.ending_soon - a.ending_soon);
        break;
      default:
        result.sort((a, b) => b.deal_count - a.deal_count);
    }
    
    return result;
  }, [brands, sortBy]);

  // Popular brands (ones with most deals)
  const popularBrands = useMemo(() => {
    return [...brands]
      .filter(b => b.deal_count > 0)
      .sort((a, b) => b.deal_count - a.deal_count)
      .slice(0, 8);
  }, [brands]);

  // Calculate totals
  const totalDeals = useMemo(() => {
    return brands.reduce((sum, b) => sum + (b.deal_count || 0), 0);
  }, [brands]);

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
        <title>Mağazalar - Tüm Kupon ve İndirim Mağazaları 2025 | İndirim Keşfet</title>
        <meta name="description" content={`${brands.length} mağazada ${totalDeals} aktif kampanya. Trendyol, Hepsiburada, Amazon ve daha fazlasında en güncel kupon kodları ve indirimler.`} />
        <meta name="keywords" content="mağaza kuponları, indirim kodları, trendyol kupon, hepsiburada indirim, amazon kupon kodu" />
      </Helmet>

      <div className="min-h-screen pb-6" data-testid="stores-page">
        {/* SEO Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            {/* Title & Stats */}
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                <Store className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-heading font-bold">Tüm Mağazalar</h1>
                <p className="text-sm lg:text-base text-muted-foreground">
                  {brands.length} mağaza, {totalDeals} kampanya
                </p>
              </div>
            </div>

            {/* SEO Description */}
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              İndirim Keşfet'te {brands.length} mağazanın en güncel kupon kodları ve indirim fırsatlarını keşfedin. 
              Favori markalarınızda {totalDeals}+ aktif kampanya ile alışverişlerinizde tasarruf edin.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Expiring Soon Card */}
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

          {/* Popular Stores Section */}
          {popularBrands.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg lg:text-xl font-bold">Popüler Mağazalar</h2>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {popularBrands.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      to={`/magaza/${brand.slug}`}
                      className="group block p-3 lg:p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all text-center"
                    >
                      <div className="flex justify-center mb-2">
                        <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="md" />
                      </div>
                      <h3 className="font-medium text-xs lg:text-sm truncate mb-1 group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-[10px] lg:text-xs text-primary font-medium">
                        {brand.deal_count} indirim
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Stores Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Tüm Mağazalar
              </h2>
              <span className="text-sm text-muted-foreground">{sortedBrands.length} mağaza</span>
            </div>

            {sortedBrands.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Mağaza Bulunamadı</h3>
                <p className="text-muted-foreground">Arama kriterlerinize uygun mağaza yok.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                {sortedBrands.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  >
                    <Link
                      to={`/magaza/${brand.slug}`}
                      className="group block p-4 lg:p-5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all text-center"
                      data-testid={`store-card-${brand.slug}`}
                    >
                      <div className="flex justify-center mb-3">
                        <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="md" />
                      </div>
                      <h3 className="font-semibold text-sm lg:text-base truncate mb-1 group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>
                      {brand.deal_count > 0 ? (
                        <p className="text-xs lg:text-sm text-primary font-medium">
                          {brand.deal_count} kampanya
                        </p>
                      ) : (
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          Yakında
                        </p>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-6 border-t border-border">
          <div className="max-w-3xl">
            <h2 className="text-lg lg:text-xl font-bold mb-3">Mağaza İndirimleri Hakkında</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              İndirim Keşfet olarak, {brands.length} farklı mağazanın en güncel ve doğrulanmış kupon kodlarını 
              sizlerle paylaşıyoruz. Her gün güncellenen kampanyalarımız sayesinde alışverişlerinizde tasarruf edebilirsiniz.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              En popüler mağazalarımız arasında {popularBrands.slice(0, 4).map(b => b.name).join(', ')} bulunmaktadır. 
              Bu mağazalarda %50'ye varan indirimler ve özel kupon kodları sunulmaktadır.
            </p>
            
            <h3 className="text-base font-semibold mb-2 mt-6">Mağaza Kuponlarını Nasıl Kullanırım?</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
              <li>Alışveriş yapmak istediğiniz mağazayı seçin</li>
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
              to="/kategoriler"
              className="px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium transition-colors"
            >
              Tüm Kategoriler
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

      {/* Sort Modal */}
      <AnimatePresence>
        {showSortModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={() => setShowSortModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border">
                <h2 className="font-bold text-lg">Sıralama</h2>
              </div>
              <div className="p-2 pb-8">
                {SORT_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setShowSortModal(false);
                      }}
                      className={`w-full px-4 py-4 text-left rounded-xl transition-colors flex items-center gap-3 ${
                        sortBy === option.id 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        sortBy === option.id ? 'bg-primary text-white' : 'bg-muted'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoresPage;
