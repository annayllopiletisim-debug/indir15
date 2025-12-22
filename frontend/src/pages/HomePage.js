import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import BrandLogo from '../components/BrandLogo';
import Newsletter from '../components/Newsletter';
import { 
  ChevronRight, 
  Clock, 
  Tag, 
  Store, 
  TrendingUp,
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
        <title>İndirim Keşfet - Kupon ve İndirimler</title>
        <meta name="description" content="Kupon kodları, indirimler ve kampanyaları keşfedin. Yüzlerce marka, binlerce fırsat." />
      </Helmet>

      <div className="min-h-screen" data-testid="home-page">

        {/* ═══════════════════════════════════════════════════════════════
            1️⃣ SIK TERCİH EDİLEN MAĞAZALAR
        ═══════════════════════════════════════════════════════════════ */}
        {brands.length > 0 && (
          <section className="container mx-auto px-4 py-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-heading font-bold text-muted-foreground">
                Popüler Mağazalar
              </h2>
              <Link
                to="/magazalar"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Tümü →
              </Link>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {brands.slice(0, 10).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/magaza/${brand.slug}`}
                  className="flex-shrink-0 glass-effect px-3 py-2 rounded-lg hover:border-primary/30 transition-all flex items-center gap-2"
                >
                  <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="xs" />
                  <span className="text-sm font-medium whitespace-nowrap">{brand.name}</span>
                  {brand.active_deal_count > 0 && (
                    <span className="text-xs text-primary">({brand.active_deal_count})</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            2️⃣ SON 24 SAAT - KOMPAKT VERSİYON
        ═══════════════════════════════════════════════════════════════ */}
        {expiringItems.length > 0 && (
          <section className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <h2 className="text-base font-heading font-bold">
                  Son 24 Saatte Bitecek Fırsatlar
                </h2>
              </div>
              <Link
                to="/son-24-saat"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Tümünü gör →
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {expiringItems.map((item) => {
                const brand = brandMap[item.brand_id] || { 
                  name: item.brand_name, 
                  slug: item.brand_slug,
                  logo_url: item.brand_logo_url
                };
                
                return (
                  <div 
                    key={`${item.type}-${item.id}`} 
                    className="flex-shrink-0 w-[280px] sm:w-[300px]"
                  >
                    {item.type === 'coupon' ? (
                      <CouponCard coupon={item} brand={brand} compact />
                    ) : (
                      <DiscountCard discount={item} brand={brand} compact />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            3️⃣ KATEGORİLER (ANA YÖNLENDİRİCİ)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-heading font-bold">
              Kategoriler
            </h2>
            <Link
              to="/kategoriler"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Tümü →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedCategories.slice(0, 8).map((category) => {
              const hasDeals = category.total_deals > 0;
              
              return (
                <Link
                  key={category.id}
                  to={`/kategori/${category.slug}`}
                  className={`group p-4 rounded-xl transition-all ${
                    hasDeals 
                      ? 'glass-effect hover:border-primary/30' 
                      : 'bg-muted/20 opacity-50'
                  }`}
                >
                  <h3 className={`text-base font-heading font-semibold mb-2 ${
                    hasDeals ? 'group-hover:text-primary' : 'text-muted-foreground'
                  }`}>
                    {category.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Tag className={`w-3 h-3 ${hasDeals ? 'text-pink-500' : 'text-muted-foreground/40'}`} />
                      <span className={hasDeals ? 'text-muted-foreground' : 'text-muted-foreground/40'}>
                        {category.total_deals || 0} indirim
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Store className={`w-3 h-3 ${category.store_count > 0 ? 'text-blue-500' : 'text-muted-foreground/40'}`} />
                      <span className={category.store_count > 0 ? 'text-muted-foreground' : 'text-muted-foreground/40'}>
                        {category.store_count || 0} mağaza
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4️⃣ BUGÜN POPÜLER
        ═══════════════════════════════════════════════════════════════ */}
        {popularItems.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-bold">
                Bugün Popüler
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            5️⃣ POPÜLER ARAMALAR (SEO)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-heading text-muted-foreground">
              Popüler Aramalar
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <Link
                key={index}
                to={search.to}
                className="px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {search.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6️⃣ NEWSLETTER
        ═══════════════════════════════════════════════════════════════ */}
        <Newsletter />

      </div>
    </>
  );
};

export default HomePage;
