import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import BrandLogo from '../components/BrandLogo';
import Newsletter from '../components/Newsletter';
import { 
  ChevronRight, 
  Flame, 
  Tag, 
  Store, 
  Zap,
  TrendingUp,
  Shirt,
  Smartphone,
  ShoppingCart,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState({ coupons: [], discounts: [], total: 0 });
  const [popularToday, setPopularToday] = useState({ coupons: [], discounts: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, categoriesRes, expiringSoonRes, popularRes] = await Promise.all([
          axios.get(`${API}/homepage-brands`),
          axios.get(`${API}/categories/with-stats`),
          axios.get(`${API}/expiring-soon`),
          axios.get(`${API}/popular-today`),
        ]);
        
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
        setExpiringSoon(expiringSoonRes.data);
        setPopularToday(popularRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  // Get brand map for quick lookup
  const brandMap = brands.reduce((acc, brand) => {
    acc[brand.id] = brand;
    return acc;
  }, {});

  // Combine expiring soon items
  const expiringItems = [
    ...expiringSoon.coupons.map(c => ({ ...c, type: 'coupon' })),
    ...expiringSoon.discounts.map(d => ({ ...d, type: 'discount' }))
  ].slice(0, 6);

  // Combine popular items
  const popularItems = [
    ...popularToday.coupons.map(c => ({ ...c, type: 'coupon' })),
    ...popularToday.discounts.map(d => ({ ...d, type: 'discount' }))
  ].slice(0, 6);

  // Sort categories - those with deals first
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.total_deals > 0 && b.total_deals === 0) return -1;
    if (a.total_deals === 0 && b.total_deals > 0) return 1;
    return b.total_deals - a.total_deals;
  });

  // Quick action buttons config
  const quickActions = [
    { icon: Flame, label: 'Acil Fırsatlar', to: '/son-24-saat', color: 'from-orange-500 to-red-500' },
    { icon: Shirt, label: 'Moda', to: '/kategori/moda', color: 'from-pink-500 to-purple-500' },
    { icon: Smartphone, label: 'Elektronik', to: '/kategori/elektronik', color: 'from-blue-500 to-cyan-500' },
    { icon: ShoppingCart, label: 'Market', to: '/kategori/gida', color: 'from-green-500 to-emerald-500' },
  ];

  // Popular searches for SEO
  const popularSearches = [
    { label: 'Ayakkabı indirimleri', to: '/arama?q=ayakkabı' },
    { label: 'Nike kupon kodları', to: '/magaza/nike' },
    { label: 'Adidas kampanyaları', to: '/magaza/adidas' },
    { label: 'Spor giyim fırsatları', to: '/kategori/spor' },
    { label: 'Moda indirimleri', to: '/kategori/moda' },
    { label: 'Elektronik fırsatları', to: '/kategori/elektronik' },
  ];

  return (
    <>
      <Helmet>
        <title>indirimliMi - En Güncel Kupon ve İndirimler</title>
        <meta name="description" content="Son 24 saatte bitecek indirimler, kupon kodları ve kampanyalar. Yüzlerce marka, binlerce fırsat tek bir yerde!" />
      </Helmet>

      <div className="min-h-screen" data-testid="home-page">
        
        {/* ═══════════════════════════════════════════════════════════════
            1️⃣ HERO AREA = SON 24 SAAT (ZORUNLU - EN ÜST)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent">
          <div className="container mx-auto px-4 py-8 lg:py-12">
            {/* Hero Header */}
            <div className="text-center mb-6 lg:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full mb-4">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="text-orange-400 font-medium text-sm">Acele edin!</span>
              </div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-heading font-bold mb-3">
                🔥 Son 24 Saatte Bitecek İndirimler
              </h1>
              <p className="text-muted-foreground text-lg">
                Kaçıran üzülür, bugün bitiyor!
              </p>
            </div>

            {/* Expiring Soon Cards - Horizontal Scroll */}
            {expiringItems.length > 0 ? (
              <>
                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                    {expiringItems.map((item) => {
                      const brand = brandMap[item.brand_id] || { 
                        name: item.brand_name, 
                        slug: item.brand_slug,
                        logo_url: item.brand_logo_url
                      };
                      
                      return (
                        <div 
                          key={`${item.type}-${item.id}`} 
                          className="flex-shrink-0 w-[320px] md:w-[360px] snap-start"
                        >
                          {item.type === 'coupon' ? (
                            <CouponCard coupon={item} brand={brand} />
                          ) : (
                            <DiscountCard discount={item} brand={brand} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center mt-6">
                  <Link
                    to="/son-24-saat"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                    data-testid="view-all-expiring-link"
                  >
                    <span>Tüm Son 24 Saat Fırsatlarını Gör</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-8 glass-effect rounded-2xl">
                <Flame className="w-12 h-12 text-orange-500/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Şu an acil biten fırsat yok. Yeni fırsatlar için takipte kalın!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            2️⃣ HIZLI KARAR ALANI
        ═══════════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-8 lg:py-10">
          <div className="text-center mb-6">
            <h2 className="text-xl lg:text-2xl font-heading font-bold mb-2">
              Ne yapmak istiyorsun?
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium hover:scale-105 hover:shadow-lg transition-all`}
                data-testid={`quick-action-${index}`}
              >
                <action.icon className="w-5 h-5" />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            3️⃣ KATEGORİLER (İSTATİSTİKLİ)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl font-heading font-bold">
              Kategoriler
            </h2>
            <Link
              to="/kategoriler"
              className="flex items-center gap-1 text-neon-purple hover:text-neon-pink transition-colors text-sm"
              data-testid="view-all-categories-link"
            >
              <span>Tümü</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {sortedCategories.slice(0, 8).map((category) => {
              const hasDeals = category.total_deals > 0;
              
              return (
                <Link
                  key={category.id}
                  to={`/kategori/${category.slug}`}
                  className={`group p-4 lg:p-5 rounded-2xl transition-all ${
                    hasDeals 
                      ? 'glass-effect hover:border-neon-purple/50' 
                      : 'bg-muted/30 opacity-60 hover:opacity-80'
                  }`}
                  data-testid={`category-card-${category.slug}`}
                >
                  <h3 className={`text-base lg:text-lg font-heading font-bold mb-2 ${
                    hasDeals ? 'group-hover:text-gradient' : 'text-muted-foreground'
                  }`}>
                    {category.name}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className={`w-3.5 h-3.5 ${hasDeals ? 'text-neon-pink' : 'text-muted-foreground/50'}`} />
                      <span className={hasDeals ? 'text-foreground' : 'text-muted-foreground/60'}>
                        {hasDeals ? (
                          <><span className="font-medium">{category.total_deals}</span> indirim</>
                        ) : (
                          <span className="text-xs">Henüz indirim yok</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Store className={`w-3.5 h-3.5 ${category.store_count > 0 ? 'text-neon-blue' : 'text-muted-foreground/50'}`} />
                      <span className={category.store_count > 0 ? 'text-foreground' : 'text-muted-foreground/60'}>
                        {category.store_count > 0 ? (
                          <><span className="font-medium">{category.store_count}</span> mağaza</>
                        ) : (
                          <span className="text-xs">Henüz mağaza yok</span>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4️⃣ BUGÜN POPÜLER BÖLÜMÜ
        ═══════════════════════════════════════════════════════════════ */}
        {popularItems.length > 0 && (
          <section className="container mx-auto px-4 py-8 lg:py-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-neon-purple/20">
                <TrendingUp className="w-6 h-6 text-neon-purple" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-heading font-bold">
                  Bugün En Çok Tıklananlar
                </h2>
                <p className="text-muted-foreground text-sm">
                  indirimliMi kullanıcılarına göre
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {popularItems.map((item) => {
                const brand = brandMap[item.brand_id] || { 
                  name: item.brand_name, 
                  slug: item.brand_slug,
                  logo_url: item.brand_logo_url
                };
                
                return item.type === 'coupon' ? (
                  <CouponCard key={`popular-coupon-${item.id}`} coupon={item} brand={brand} />
                ) : (
                  <DiscountCard key={`popular-discount-${item.id}`} discount={item} brand={brand} />
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            5️⃣ SIK TERCİH EDİLEN MAĞAZALAR (AŞAĞI TAŞINDI)
        ═══════════════════════════════════════════════════════════════ */}
        {brands.length > 0 && (
          <section className="container mx-auto px-4 py-8 lg:py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-1">
                  Sık Tercih Edilen Mağazalar
                </h2>
                <p className="text-muted-foreground text-sm">En çok ziyaret edilen markalar</p>
              </div>
              <Link
                to="/magazalar"
                className="flex items-center gap-1 text-neon-purple hover:text-neon-pink transition-colors text-sm"
                data-testid="view-all-stores-link"
              >
                <span>Tümü</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
              {brands.slice(0, 12).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/magaza/${brand.slug}`}
                  className="group glass-effect p-4 rounded-xl hover:border-neon-purple/50 transition-all text-center"
                  data-testid={`brand-card-${brand.slug}`}
                >
                  <div className="mb-3 flex justify-center">
                    <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="md" />
                  </div>
                  <h3 className="font-medium text-sm group-hover:text-neon-purple transition-colors mb-1">
                    {brand.name}
                  </h3>
                  {brand.active_deal_count > 0 && (
                    <p className="text-xs text-neon-pink">
                      {brand.active_deal_count} aktif indirim
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            6️⃣ SEO / KEŞİF ALANI (EN ALT)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-8 lg:py-12 border-t border-border">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-heading font-bold text-muted-foreground">
              Popüler Aramalar
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <Link
                key={index}
                to={search.to}
                className="px-4 py-2 bg-muted hover:bg-primary/10 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`popular-search-${index}`}
              >
                {search.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7️⃣ NEWSLETTER ALANI
        ═══════════════════════════════════════════════════════════════ */}
        <Newsletter />

        {/* Submit Coupon CTA */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-2xl mx-auto glass-effect p-6 lg:p-10 rounded-3xl text-center">
            <h2 className="text-xl lg:text-2xl font-heading font-bold mb-3 text-gradient">
              Kuponunuz mu Var?
            </h2>
            <p className="text-muted-foreground mb-6 text-sm lg:text-base">
              Paylaşın, diğer kullanıcılar da faydalanıp tasarruf etsin!
            </p>
            <a
              href="https://forms.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
              data-testid="submit-coupon-cta"
            >
              Kupon Gönder
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
