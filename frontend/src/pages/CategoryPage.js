import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import BrandLogo from '../components/BrandLogo';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import GiveawayCard from '../components/GiveawayCard';
import { 
  ChevronLeft, 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ChevronUp,
  ArrowDownAZ,
  Home,
  LayoutGrid,
  Store,
  Tag,
  ShoppingBag,
  Sparkles,
  Utensils,
  Shirt,
  Gift,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Filter constants
const FILTER_DISCOUNT_RATES = [
  { id: 'all', label: 'Tümü' },
  { id: '10', label: '%10+ İndirim' },
  { id: '20', label: '%20+ İndirim' },
  { id: '30', label: '%30+ İndirim' },
  { id: '50', label: '%50+ İndirim' }
];

const FILTER_EXPIRY = [
  { id: 'all', label: 'Tümü' },
  { id: 'today', label: 'Bugün' },
  { id: 'week', label: 'Bu Hafta' },
  { id: 'month', label: 'Bu Ay' }
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Yeni Eklenen' },
  { id: 'popular', label: 'Popüler' },
  { id: 'highest', label: 'En Yüksek İndirim' },
  { id: 'ending', label: 'Son Bitenler' }
];

// Sub-categories mapping (static for now, can be dynamic from backend)
const SUB_CATEGORIES = {
  'market': ['Gıda', 'Temizlik', 'Kişisel Bakım', 'Ev'],
  'moda': ['Kadın', 'Erkek', 'Çocuk', 'Ayakkabı'],
  'elektronik': ['Telefon', 'Bilgisayar', 'TV', 'Aksesuar'],
  'spor': ['Giyim', 'Ayakkabı', 'Ekipman', 'Outdoor'],
};

// Related categories with icons
const RELATED_CATEGORIES = [
  { slug: '/', label: 'Tüm Kuponlar', icon: '🛒' },
  { slug: '/kategori/moda', label: 'Giyim İndirimleri', icon: '👗' },
  { slug: '/kategori/elektronik', label: 'Teknoloji Fırsatları', icon: '📱' },
  { slug: '/kategori/market', label: 'Market Kuponları', icon: '🛍️' },
];

// FAQ data (dynamic based on category)
const getFAQData = (categoryName) => [
  {
    question: `${categoryName} kuponları nasıl kullanılır?`,
    answer: `${categoryName} kuponlarını kullanmak için önce kupon kodunu kopyalayın, ardından ilgili mağazanın web sitesine gidin ve ödeme sayfasında kupon kodunu uygulayın. İndiriminiz otomatik olarak hesaplanacaktır.`
  },
  {
    question: `${categoryName} indirimlerinden nasıl haberdar olabilirim?`,
    answer: `En güncel ${categoryName} indirimlerinden haberdar olmak için bültenimize abone olabilir veya sayfamızı düzenli olarak ziyaret edebilirsiniz. Ayrıca favori mağazalarınızı takip ederek özel tekliflerden anında haberdar olabilirsiniz.`
  },
  {
    question: 'Kupon kodları ne kadar süre geçerli?',
    answer: 'Kupon kodlarının geçerlilik süreleri farklılık gösterebilir. Her kuponun yanında bitiş tarihi belirtilmektedir. Süresi dolmuş kuponlar otomatik olarak sistemden kaldırılır.'
  },
  {
    question: 'Birden fazla kupon kodu kullanabilir miyim?',
    answer: 'Bu tamamen mağazanın politikasına bağlıdır. Çoğu mağaza tek bir kupon koduna izin verirken, bazıları birden fazla kodu birleştirmenize olanak tanır.'
  }
];

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
  // Data states
  const [category, setCategory] = useState(null);
  const [brands, setBrands] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [allGiveaways, setAllGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // UI states
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);
  const [expandSEO, setExpandSEO] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(10);
  
  // Filter states
  const [filterDiscountRate, setFilterDiscountRate] = useState('all');
  const [filterExpiry, setFilterExpiry] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeFilters, setActiveFilters] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);
      setDisplayCount(10);
      setActiveFilters([]);
      setFilterDiscountRate('all');
      setFilterExpiry('all');
      setSortBy('newest');
      setSelectedSubCategory('all');
      
      try {
        const categoriesRes = await axios.get(`${API}/categories`);
        const foundCategory = categoriesRes.data.find(cat => cat.slug === slug);
        
        if (!foundCategory) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        const brandsRes = await axios.get(`${API}/brands?category_id=${foundCategory.id}`);
        
        const [couponsRes, discountsRes, giveawaysRes] = await Promise.all([
          axios.get(`${API}/coupons`),
          axios.get(`${API}/discounts`),
          axios.get(`${API}/giveaways`).catch(() => ({ data: [] }))
        ]);
        
        const brandIds = brandsRes.data.map(b => b.id);
        const categoryCoupons = couponsRes.data.filter(c => brandIds.includes(c.brand_id) && c.is_active !== false);
        const categoryDiscounts = discountsRes.data.filter(d => brandIds.includes(d.brand_id));
        const categoryGiveaways = giveawaysRes.data.filter(g => brandIds.includes(g.brand_id));
        
        // Calculate deal counts for brands
        const brandDealCounts = {};
        [...categoryCoupons, ...categoryDiscounts, ...categoryGiveaways].forEach(deal => {
          brandDealCounts[deal.brand_id] = (brandDealCounts[deal.brand_id] || 0) + 1;
        });

        const brandsWithDeals = brandsRes.data.map(b => ({
          ...b,
          deal_count: brandDealCounts[b.id] || 0
        })).sort((a, b) => b.deal_count - a.deal_count);

        setBrands(brandsWithDeals);
        setAllCoupons(categoryCoupons);
        setAllDiscounts(categoryDiscounts);
        setAllGiveaways(categoryGiveaways);
      } catch (error) {
        console.error('Failed to fetch category data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = allCoupons.length + allDiscounts.length + allGiveaways.length;
    const brandsCount = brands.filter(b => b.deal_count > 0).length;
    
    // Count deals ending today
    const now = new Date();
    const endingToday = [...allCoupons, ...allDiscounts, ...allGiveaways].filter(deal => {
      if (!deal.expiry_date) return false;
      const expiry = new Date(deal.expiry_date);
      return expiry.toDateString() === now.toDateString();
    }).length;

    // Find max discount
    let maxDiscount = 0;
    [...allCoupons, ...allDiscounts].forEach(deal => {
      const match = deal.discount_text?.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxDiscount && num <= 100) maxDiscount = num;
      }
    });

    return { total, brandsCount, endingToday, maxDiscount };
  }, [allCoupons, allDiscounts, allGiveaways, brands]);

  // Filtered and sorted deals
  const filteredDeals = useMemo(() => {
    let deals = [
      ...allCoupons.map(c => ({ ...c, dealType: 'coupon' })),
      ...allDiscounts.map(d => ({ ...d, dealType: 'discount' })),
      ...allGiveaways.map(g => ({ ...g, dealType: 'giveaway' }))
    ];

    // Apply discount rate filter
    if (filterDiscountRate !== 'all') {
      const minRate = parseInt(filterDiscountRate);
      deals = deals.filter(deal => {
        const match = deal.discount_text?.match(/(\d+)/);
        return match && parseInt(match[1]) >= minRate;
      });
    }

    // Apply expiry filter
    if (filterExpiry !== 'all') {
      const now = new Date();
      deals = deals.filter(deal => {
        if (!deal.expiry_date) return filterExpiry === 'all';
        const expiry = new Date(deal.expiry_date);
        const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        if (filterExpiry === 'today') return diff <= 1;
        if (filterExpiry === 'week') return diff <= 7;
        if (filterExpiry === 'month') return diff <= 30;
        return true;
      });
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      deals = deals.filter(deal => 
        deal.title?.toLowerCase().includes(term) ||
        deal.description?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      deals.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortBy === 'highest') {
      deals.sort((a, b) => {
        const aMatch = a.discount_text?.match(/(\d+)/);
        const bMatch = b.discount_text?.match(/(\d+)/);
        return (bMatch ? parseInt(bMatch[1]) : 0) - (aMatch ? parseInt(aMatch[1]) : 0);
      });
    } else if (sortBy === 'ending') {
      deals.sort((a, b) => {
        const aDate = a.expiry_date ? new Date(a.expiry_date) : new Date('9999-12-31');
        const bDate = b.expiry_date ? new Date(b.expiry_date) : new Date('9999-12-31');
        return aDate - bDate;
      });
    }

    return deals;
  }, [allCoupons, allDiscounts, allGiveaways, filterDiscountRate, filterExpiry, searchTerm, sortBy]);

  // Brand map for card rendering
  const brandMap = useMemo(() => {
    return brands.reduce((acc, brand) => {
      acc[brand.id] = brand;
      return acc;
    }, {});
  }, [brands]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterDiscountRate !== 'all') count++;
    if (filterExpiry !== 'all') count++;
    return count;
  }, [filterDiscountRate, filterExpiry]);

  // Remove filter
  const removeFilter = (type) => {
    if (type === 'discount') setFilterDiscountRate('all');
    if (type === 'expiry') setFilterExpiry('all');
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterDiscountRate('all');
    setFilterExpiry('all');
    setSortBy('newest');
  };

  // Load more
  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  // Sub categories for this category
  const subCategories = SUB_CATEGORIES[slug] || [];

  // Category description
  const categoryDescription = category?.description || 
    `${category?.name} kategorisindeki en güncel indirimler, kupon kodları ve kampanyalar. ${stats.brandsCount} farklı mağazadan ${stats.total} aktif fırsat sizi bekliyor. Money... güncel market kuponları ve indirim fırsatları.`;

  // SEO Content
  const seoContent = {
    title: `${category?.name} Hakkında`,
    content: `${category?.name} kategorisinde ${stats.brandsCount} farklı mağazadan ${stats.total} aktif kampanya bulunmaktadır. En popüler markalar arasında ${brands.slice(0, 3).map(b => b.name).join(', ')} yer almaktadır. Kupon kodlarımız düzenli olarak güncellenmekte ve doğrulanmaktadır.`,
    tips: [
      'Kupon kodunu sepete eklemeyi unutmayın',
      'Bitiş tarihlerini kontrol edin',
      'Minimum sepet tutarını kontrol edin',
      'Birden fazla kupon karşılaştırın'
    ]
  };

  // FAQ data
  const faqData = category ? getFAQData(category.name) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-4">Kategori Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Aradığınız kategori mevcut değil.</p>
          <Link to="/kategoriler" className="px-6 py-3 bg-primary text-white rounded-xl font-medium">
            Tüm Kategoriler
          </Link>
        </div>
      </div>
    );
  }

  const displayedDeals = filteredDeals.slice(0, displayCount);
  const hasMore = displayCount < filteredDeals.length;

  return (
    <>
      <Helmet>
        <title>{category.name} İndirimleri ve Kupon Kodları 2025 - İndirim Keşfet</title>
        <meta name="description" content={categoryDescription.substring(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20 lg:pb-0" data-testid="category-page">
        
        {/* ═══════════════════════════════════════════════════════════════
            1. HEADER - Mobile Only (Simplified - no search/filter icons)
        ═══════════════════════════════════════════════════════════════ */}
        <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border">
          <div className="flex items-center px-4 py-3">
            {/* Left: Back button */}
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Center: Title - takes remaining space */}
            <div className="flex-1 text-center pr-8">
              <h1 className="font-bold text-lg truncate">{category.name} Kuponları</h1>
              <p className="text-xs text-muted-foreground">{stats.total} aktif kampanya</p>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">{category.name} Kuponları</h1>
            <p className="text-muted-foreground">{stats.total} aktif kampanya, {stats.brandsCount} marka</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            2. SEO HERO SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-4 py-4 border-b border-border bg-card/50">
          <h2 className="font-bold text-base mb-2">
            {category.name} İndirimleri ve Kupon Kodları 2025
          </h2>
          <p className={`text-sm text-muted-foreground leading-relaxed ${!expandDescription ? 'line-clamp-2' : ''}`}>
            {categoryDescription}
          </p>
          <button 
            onClick={() => setExpandDescription(!expandDescription)}
            className="text-primary text-sm font-medium mt-2 flex items-center gap-1"
          >
            {expandDescription ? 'Daha az göster' : 'Devamını oku'}
            {expandDescription ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            3. QUICK STATS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-3 border-b border-border overflow-hidden">
          <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide">
            <span className="flex-shrink-0 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium">
              <span className="text-primary font-bold">{stats.total}</span> Kampanya
            </span>
            <span className="flex-shrink-0 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium">
              <span className="text-primary font-bold">{stats.brandsCount}</span> Marka
            </span>
            {stats.endingToday > 0 && (
              <span className="flex-shrink-0 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full text-sm font-medium text-orange-600 dark:text-orange-400">
                <span className="font-bold">{stats.endingToday}</span> Bugün Biten
              </span>
            )}
            {stats.maxDiscount > 0 && (
              <span className="flex-shrink-0 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-sm font-medium text-green-600 dark:text-green-400">
                <span className="font-bold">%{stats.maxDiscount}</span>'e Varan
              </span>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4. SUB-CATEGORIES
        ═══════════════════════════════════════════════════════════════ */}
        {subCategories.length > 0 && (
          <section className="py-3 border-b border-border overflow-hidden">
            <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedSubCategory('all')}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSubCategory === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Tümü
              </button>
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSubCategory === sub 
                      ? 'bg-primary text-white' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            5. FILTER & SORT BAR
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
          {/* Active Filters */}
          <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
            {filterDiscountRate !== 'all' && (
              <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
                {FILTER_DISCOUNT_RATES.find(r => r.id === filterDiscountRate)?.label}
                <button onClick={() => removeFilter('discount')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterExpiry !== 'all' && (
              <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
                {FILTER_EXPIRY.find(e => e.id === filterExpiry)?.label}
                <button onClick={() => removeFilter('expiry')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setShowSortModal(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowDownAZ className="w-4 h-4" />
            Sırala
          </button>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6. BRANDS IN CATEGORY
        ═══════════════════════════════════════════════════════════════ */}
        {brands.length > 0 && (
          <section className="py-4 border-b border-border">
            <div className="px-4 mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Bu Kategorideki Markalar
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {brands.filter(b => b.deal_count > 0).slice(0, 15).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/magaza/${brand.slug}`}
                  className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
                >
                  <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="xs" />
                  <div>
                    <span className="text-sm font-medium block">{brand.name}</span>
                    <span className="text-xs text-muted-foreground">{brand.deal_count} kampanya</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            7. CAMPAIGN LIST
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-4 py-4">
          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-semibold text-foreground">{filteredDeals.length}</span> sonuç bulundu
          </p>

          {filteredDeals.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Sonuç Bulunamadı</h3>
              <p className="text-sm text-muted-foreground mb-4">Filtrelere uygun kampanya yok.</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedDeals.map((deal) => {
                const brand = brandMap[deal.brand_id];
                if (deal.dealType === 'coupon') {
                  return <CouponCard key={`coupon-${deal.id}`} coupon={deal} brand={brand} />;
                } else if (deal.dealType === 'giveaway') {
                  return <GiveawayCard key={`giveaway-${deal.id}`} giveaway={deal} brand={brand} />;
                } else {
                  return <DiscountCard key={`discount-${deal.id}`} discount={deal} brand={brand} />;
                }
              })}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8. LOAD MORE BUTTON
        ═══════════════════════════════════════════════════════════════ */}
        {hasMore && (
          <section className="px-4 pb-6">
            <button
              onClick={loadMore}
              className="w-full py-4 bg-card border border-border rounded-xl font-medium text-center hover:bg-muted transition-colors"
            >
              Daha Fazla Göster ({filteredDeals.length - displayCount})
            </button>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            9. SEO CONTENT SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-4 py-6 bg-card/50 border-t border-border">
          <div className={`${!expandSEO ? 'max-h-40 overflow-hidden relative' : ''}`}>
            <h3 className="font-bold text-lg mb-3">{seoContent.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {seoContent.content}
            </p>
            
            <h4 className="font-semibold text-base mb-2">Nasıl Tasarruf Edebilirsiniz?</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
              {seoContent.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>

            {!expandSEO && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/50 to-transparent" />
            )}
          </div>
          
          <button
            onClick={() => setExpandSEO(!expandSEO)}
            className="text-primary text-sm font-medium flex items-center gap-1 mt-2"
          >
            {expandSEO ? 'Daha az göster' : 'Daha fazla göster'}
            {expandSEO ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            10. FAQ SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-4 py-6 border-t border-border" itemScope itemType="https://schema.org/FAQPage">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Sıkça Sorulan Sorular
          </h3>
          
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
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
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
            11. RELATED CATEGORIES
        ═══════════════════════════════════════════════════════════════ */}
        <section className="px-4 py-6 border-t border-border">
          <h3 className="font-bold text-base mb-4">İlgili Kategoriler</h3>
          <div className="grid grid-cols-2 gap-2">
            {RELATED_CATEGORIES.filter(cat => cat.slug !== `/kategori/${slug}`).map((cat) => (
              <Link
                key={cat.slug}
                to={cat.slug}
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            12. BOTTOM NAVIGATION - Mobile Only
        ═══════════════════════════════════════════════════════════════ */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb z-50">
          <div className="flex items-center justify-around py-2">
            <Link to="/" className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-primary transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Ana Sayfa</span>
            </Link>
            <Link to="/kategoriler" className="flex flex-col items-center py-2 px-4 text-primary">
              <LayoutGrid className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">Kategoriler</span>
            </Link>
            <Link to="/magazalar" className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-primary transition-colors">
              <Store className="w-5 h-5" />
              <span className="text-xs mt-1">Markalar</span>
            </Link>
            <button 
              onClick={() => setShowSearch(true)}
              className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
              <span className="text-xs mt-1">Ara</span>
            </button>
          </div>
        </nav>

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FILTER MODAL
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between">
                <h2 className="font-bold text-lg">Filtrele</h2>
                <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-4 space-y-6">
                {/* İndirim Oranı */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">İndirim Oranı</h3>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_DISCOUNT_RATES.map((rate) => (
                      <button
                        key={rate.id}
                        onClick={() => setFilterDiscountRate(rate.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filterDiscountRate === rate.id
                            ? 'bg-primary text-white'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {rate.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bitiş Süresi */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Bitiş Süresi</h3>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_EXPIRY.map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => setFilterExpiry(exp.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filterExpiry === exp.id
                            ? 'bg-primary text-white'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {exp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border px-4 py-4 flex gap-3 safe-area-pb">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-3 rounded-xl font-medium bg-muted hover:bg-muted/80"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium bg-primary text-white"
                >
                  Uygula ({filteredDeals.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          SORT MODAL
      ═══════════════════════════════════════════════════════════════ */}
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
                <h2 className="font-bold text-lg">Sırala</h2>
              </div>
              <div className="p-2 safe-area-pb">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortModal(false);
                    }}
                    className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                      sortBy === option.id 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryPage;
