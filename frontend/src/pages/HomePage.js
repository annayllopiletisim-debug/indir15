import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import DealCardCompact from '../components/DealCardCompact';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import BrandLogo from '../components/BrandLogo';
import Newsletter from '../components/Newsletter';
import { trackClick, buildUTMLink } from '../utils/helpers';
import { 
  ChevronRight, 
  Clock, 
  Tag, 
  Store, 
  TrendingUp,
  Search,
  Copy,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Simple modal for coupon code
const CouponModal = ({ coupon, brand, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      trackClick('coupon_copy', coupon.id, coupon.brand_id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-1">{brand?.name}</p>
          <p className="font-heading font-bold text-lg">{coupon.title}</p>
        </div>
        
        <div className="bg-muted rounded-lg p-4 mb-4">
          <p className="text-center font-mono text-xl font-bold tracking-wider">
            {coupon.code}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Kopyalandı
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Kodu Kopyala
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState({ coupons: [], discounts: [], total: 0 });
  const [popularToday, setPopularToday] = useState({ coupons: [], discounts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

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
  ].slice(0, 8);

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

  // Handle card click
  const handleDealClick = (item, brand) => {
    if (item.type === 'coupon') {
      trackClick('coupon_view', item.id, item.brand_id);
      setSelectedCoupon(item);
      setSelectedBrand(brand);
      
      // Open store in new tab
      if (item.destination_url) {
        setTimeout(() => {
          const finalUrl = buildUTMLink(item.destination_url, item.utm_template, item.id);
          window.open(finalUrl, '_blank');
        }, 300);
      }
    } else {
      trackClick('discount_click', item.id, item.brand_id);
      if (item.destination_url) {
        const finalUrl = buildUTMLink(item.destination_url, item.utm_template, item.id);
        window.open(finalUrl, '_blank');
      }
    }
  };

  // Popular searches for SEO
  const popularSearches = [
    { label: 'Nike kuponları', to: '/magaza/nike' },
    { label: 'Adidas indirimleri', to: '/magaza/adidas' },
    { label: 'Spor fırsatları', to: '/kategori/spor' },
    { label: 'Moda indirimleri', to: '/kategori/moda' },
  ];

  return (
    <>
      <Helmet>
        <title>İndirim Keşfet - Kupon ve İndirimler</title>
        <meta name="description" content="Kupon kodları, indirimler ve kampanyaları keşfedin. Yüzlerce marka, binlerce fırsat." />
      </Helmet>

      <div className="min-h-screen" data-testid="home-page">

        {/* ═══════════════════════════════════════════════════════════════
            1️⃣ POPÜLER MAĞAZALAR (Yatay scroll)
        ═══════════════════════════════════════════════════════════════ */}
        {brands.length > 0 && (
          <section className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Popüler Mağazalar</span>
              <Link to="/magazalar" className="text-sm text-muted-foreground hover:text-primary">
                Tümü →
              </Link>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {brands.slice(0, 10).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/magaza/${brand.slug}`}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="xs" />
                  <span className="text-sm whitespace-nowrap">{brand.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            2️⃣ SON 24 SAAT - KOMPAKT KARTLAR
        ═══════════════════════════════════════════════════════════════ */}
        {expiringItems.length > 0 && (
          <section className="container mx-auto px-4 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-time-urgent" />
                <h2 className="text-base font-heading font-semibold">
                  Son 24 Saatte Bitecek
                </h2>
              </div>
              <Link to="/son-24-saat" className="text-sm text-muted-foreground hover:text-primary">
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
                  <DealCardCompact
                    key={`${item.type}-${item.id}`}
                    item={item}
                    brand={brand}
                    type={item.type}
                    onClick={() => handleDealClick(item, brand)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            4️⃣ BUGÜN POPÜLER
        ═══════════════════════════════════════════════════════════════ */}
        {popularItems.length > 0 && (
          <section className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-heading font-bold">Bugün Popüler</h2>
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
        <section className="container mx-auto px-4 py-6 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Popüler Aramalar</span>
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

      {/* Coupon Code Modal */}
      <CouponModal
        coupon={selectedCoupon}
        brand={selectedBrand}
        isOpen={!!selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
      />
    </>
  );
};

export default HomePage;
