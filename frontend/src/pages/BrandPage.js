import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import GiveawayCard from '../components/GiveawayCard';
import BrandLogo from '../components/BrandLogo';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Share2, 
  ExternalLink,
  Tag,
  Percent,
  Clock,
  Home,
  LayoutGrid,
  Store,
  ShoppingBag,
  HelpCircle,
  Gift,
  Ticket,
  ArrowDownAZ,
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackClick } from '../utils/helpers';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Filter options
const FILTER_OPTIONS = [
  { id: 'all', label: 'Tümü' },
  { id: 'coupons', label: 'Kuponlar' },
  { id: 'discounts', label: 'İndirimler' },
  { id: 'giveaways', label: 'Çekilişler' },
];

// Sort options
const SORT_OPTIONS = [
  { id: 'newest', label: 'Yeni Eklenen', icon: Sparkles },
  { id: 'popular', label: 'Popüler', icon: TrendingUp },
  { id: 'highest', label: 'En Yüksek İndirim', icon: Star },
  { id: 'ending', label: 'Son Bitenler', icon: Clock },
];

// FAQ data (dynamic based on brand)
const getFAQData = (brandName) => [
  {
    question: `${brandName} kupon kodu nasıl kullanılır?`,
    answer: `${brandName} kupon kodunu kullanmak için önce kodu kopyalayın. Ardından ${brandName} web sitesine gidin, ürünlerinizi sepete ekleyin ve ödeme sayfasında kupon kodu alanına yapıştırın. İndirim otomatik olarak uygulanacaktır.`
  },
  {
    question: `${brandName} indirim kuponları ne kadar süre geçerli?`,
    answer: `Her kuponun geçerlilik süresi farklıdır. Kupon detaylarında son kullanma tarihi belirtilmektedir. Süresi dolmadan kullanmanızı öneririz.`
  },
  {
    question: `${brandName}'da birden fazla kupon kullanabilir miyim?`,
    answer: `Genellikle tek seferde bir kupon kodu kullanılabilir. Ancak bazı özel dönemlerde birden fazla indirim birleştirilebilir. Detaylar için kupon koşullarını kontrol edin.`
  },
  {
    question: `${brandName} kuponları tüm ürünlerde geçerli mi?`,
    answer: `Kuponların geçerlilik kapsamı değişkenlik gösterir. Bazı kuponlar tüm ürünlerde, bazıları ise belirli kategorilerde geçerlidir. Her kuponun kullanım koşullarını kontrol edin.`
  }
];

const BrandPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Data states
  const [brand, setBrand] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [giveaways, setGiveaways] = useState([]);
  const [similarBrands, setSimilarBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Also scroll to top when navigating to deal detail
  useEffect(() => {
    // This ensures the page scrolls to top on any navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const brandRes = await axios.get(`${API}/brands/${slug}`);
        const brandData = brandRes.data;
        setBrand(brandData);

        const [couponsRes, discountsRes, giveawaysRes, allBrandsRes] = await Promise.all([
          axios.get(`${API}/coupons?brand_id=${brandData.id}`),
          axios.get(`${API}/discounts?brand_id=${brandData.id}`),
          axios.get(`${API}/giveaways?brand_id=${brandData.id}`),
          axios.get(`${API}/brands?category_id=${brandData.category_id}`)
        ]);

        setCoupons(couponsRes.data.filter(c => c.is_active !== false));
        setDiscounts(discountsRes.data);
        setGiveaways(giveawaysRes.data);
        
        // Get similar brands (same category, exclude current)
        const similar = allBrandsRes.data
          .filter(b => b.id !== brandData.id)
          .slice(0, 10);
        setSimilarBrands(similar);
        
      } catch (error) {
        console.error('Failed to fetch brand data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalDeals = coupons.length + discounts.length + giveaways.length;
    
    // Calculate max discount
    let maxDiscount = 0;
    [...coupons, ...discounts].forEach(deal => {
      const match = deal.discount_text?.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxDiscount && num <= 100) maxDiscount = num;
      }
    });

    // Count deals ending today
    const now = new Date();
    const endingToday = [...coupons, ...discounts, ...giveaways].filter(deal => {
      if (!deal.expiry_date) return false;
      const expiry = new Date(deal.expiry_date);
      return expiry.toDateString() === now.toDateString();
    }).length;

    return { totalDeals, maxDiscount, endingToday };
  }, [coupons, discounts, giveaways]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    switch (activeFilter) {
      case 'coupons':
        return coupons.map(c => ({ ...c, type: 'coupon' }));
      case 'discounts':
        return discounts.map(d => ({ ...d, type: 'discount' }));
      case 'giveaways':
        return giveaways.map(g => ({ ...g, type: 'giveaway' }));
      default:
        return [
          ...coupons.map(c => ({ ...c, type: 'coupon' })),
          ...discounts.map(d => ({ ...d, type: 'discount' })),
          ...giveaways.map(g => ({ ...g, type: 'giveaway' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [coupons, discounts, giveaways, activeFilter]);

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${brand.name} İndirim Kuponları`,
          text: `${brand.name} için en güncel kupon kodları ve indirimler`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  // Handle go to store with UTM
  const handleGoToStore = () => {
    if (brand) {
      trackClick('store_visit', brand.id, brand.id);
      let url = brand.website_url || `https://${brand.slug}.com.tr`;
      
      // Add UTM parameters
      const utmParams = new URLSearchParams({
        utm_source: 'indirim-kesfet',
        utm_medium: 'referral',
        utm_campaign: 'store-visit',
        utm_content: brand.slug
      });
      
      // Append UTM to URL
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}${utmParams.toString()}`;
      
      window.open(url, '_blank');
    }
  };

  // FAQ data
  const faqData = brand ? getFAQData(brand.name) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-4">Mağaza Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Aradığınız mağaza mevcut değil.</p>
          <Link to="/magazalar" className="px-6 py-3 bg-primary text-white rounded-xl font-medium">
            Tüm Mağazalar
          </Link>
        </div>
      </div>
    );
  }

  const metaTitle = brand.meta_title || `${brand.name} Kupon Kodları ve İndirimler 2025 - İndirim Keşfet`;
  const metaDescription = brand.meta_description || `${brand.name} için ${stats.totalDeals} aktif kupon ve indirim. ${stats.maxDiscount > 0 ? `%${stats.maxDiscount}'e varan indirimler.` : ''} Hemen tasarruf edin!`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${brand.name} kupon, ${brand.name} indirim, ${brand.name} kampanya`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": brand.name,
            "description": brand.description || metaDescription,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background pb-20 lg:pb-6" data-testid="brand-page">
        
        {/* ═══════════════════════════════════════════════════════════════
            1. MOBILE HEADER - Geri butonu + Mağaza adı + Paylaş
        ═══════════════════════════════════════════════════════════════ */}
        <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <Link 
              to="/magazalar"
              className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <span className="font-bold text-lg truncate px-4">{brand.name}</span>
            <button 
              onClick={handleShare}
              className="p-2 -mr-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════
            2. BREADCRUMB - Both Mobile and Desktop
        ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-muted-foreground flex items-center gap-1.5 overflow-x-auto">
              <Link to="/" className="hover:text-primary whitespace-nowrap">Ana Sayfa</Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              {brand.category_name && (
                <>
                  <Link to="/kategoriler" className="hover:text-primary whitespace-nowrap">Kategoriler</Link>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  <Link to={`/kategori/${brand.category_slug || ''}`} className="hover:text-primary whitespace-nowrap">{brand.category_name}</Link>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </>
              )}
              <span className="text-foreground whitespace-nowrap">{brand.name}</span>
            </nav>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            3. STORE HERO - Logo (80px) + Ad (H1) + Tagline
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden">
                {brand.logo_url ? (
                  <img 
                    src={brand.logo_url.startsWith('/uploads/') ? `${process.env.REACT_APP_BACKEND_URL}/api${brand.logo_url}` : brand.logo_url} 
                    alt={brand.name} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">{brand.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-heading font-bold truncate">{brand.name}</h1>
                {brand.description ? (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{brand.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.totalDeals} aktif kampanya
                  </p>
                )}
              </div>
              {/* Desktop Share Button */}
              <button 
                onClick={handleShare}
                className="hidden lg:flex p-3 hover:bg-muted rounded-xl transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6">
          {/* ═══════════════════════════════════════════════════════════════
              4. MAIN CTA - Küçültülmüş "Siteye Git" butonu
          ═══════════════════════════════════════════════════════════════ */}
          <button
            onClick={handleGoToStore}
            className="w-full mb-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 border border-border transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            {brand.name}'a Git
          </button>

          {/* ═══════════════════════════════════════════════════════════════
              6. KAMPANYALAR - Filtre pills + Kupon kartları listesi
          ═══════════════════════════════════════════════════════════════ */}
          <section className="mb-8">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {FILTER_OPTIONS.map((filter) => {
                let count = 0;
                if (filter.id === 'all') count = stats.totalDeals;
                else if (filter.id === 'coupons') count = coupons.length;
                else if (filter.id === 'discounts') count = discounts.length;
                else if (filter.id === 'giveaways') count = giveaways.length;
                
                // Skip if no items
                if (count === 0 && filter.id !== 'all') return null;
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      activeFilter === filter.id
                        ? 'bg-primary text-white'
                        : 'bg-card border border-border hover:border-primary/50'
                    }`}
                  >
                    {filter.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeFilter === filter.id 
                        ? 'bg-white/20' 
                        : 'bg-muted'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Deals List */}
            {filteredDeals.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Kampanya Bulunamadı</h3>
                <p className="text-muted-foreground text-sm">Bu kategoride henüz kampanya yok.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDeals.map((deal) => {
                  if (deal.type === 'coupon') {
                    return <CouponCard key={`coupon-${deal.id}`} coupon={deal} brand={brand} />;
                  } else if (deal.type === 'giveaway') {
                    return <GiveawayCard key={`giveaway-${deal.id}`} giveaway={deal} brand={brand} />;
                  } else {
                    return <DiscountCard key={`discount-${deal.id}`} discount={deal} brand={brand} />;
                  }
                })}
              </div>
            )}
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            7. SSS - Accordion sorular (3-5 soru)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-6 border-t border-border" itemScope itemType="https://schema.org/FAQPage">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Sıkça Sorulan Sorular
          </h2>
          
          <div className="space-y-2">
            {faqData.map((faq, index) => (
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
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8. BENZER MAĞAZALAR - Yatay scroll marka kartları
        ═══════════════════════════════════════════════════════════════ */}
        {similarBrands.length > 0 && (
          <section className="container mx-auto px-4 py-6 border-t border-border">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Benzer Mağazalar
            </h2>
            
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {similarBrands.map((b) => (
                <Link
                  key={b.id}
                  to={`/magaza/${b.slug}`}
                  className="flex-shrink-0 w-24 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-2 rounded-xl border border-border bg-card group-hover:border-primary/30 transition-colors overflow-hidden flex items-center justify-center p-2">
                    <BrandLogo logoUrl={b.logo_url} brandName={b.name} size="md" />
                  </div>
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                    {b.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Links */}
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
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            9. BOTTOM NAV - 4 sekme (Mobile Only)
        ═══════════════════════════════════════════════════════════════ */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb z-50">
          <div className="flex items-center justify-around py-2">
            <Link to="/" className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-primary transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Ana Sayfa</span>
            </Link>
            <Link to="/kategoriler" className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-primary transition-colors">
              <LayoutGrid className="w-5 h-5" />
              <span className="text-xs mt-1">Kategoriler</span>
            </Link>
            <Link to="/magazalar" className="flex flex-col items-center py-2 px-4 text-primary">
              <Store className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">Markalar</span>
            </Link>
            <button 
              onClick={handleGoToStore}
              className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="text-xs mt-1">Siteye Git</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default BrandPage;
