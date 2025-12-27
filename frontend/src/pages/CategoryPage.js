import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import BrandLogo from '../components/BrandLogo';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import GiveawayCard from '../components/GiveawayCard';
import StickyActionBar from '../components/StickyActionBar';
import { Search, Check, X, Tag, Package, TrendingUp, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Filter options
const FILTER_DISCOUNT_RATES = [
  { id: 'all', name: 'Tümü' },
  { id: '10', name: '%10+' },
  { id: '20', name: '%20+' },
  { id: '30', name: '%30+' },
  { id: '50', name: '%50+' }
];

const FILTER_CAMPAIGN_TYPES = [
  { id: 'all', name: 'Tümü' },
  { id: 'discount', name: 'İndirim' },
  { id: 'coupon', name: 'Kupon' },
  { id: 'giveaway', name: 'Çekiliş' }
];

const FILTER_EXPIRY = [
  { id: 'all', name: 'Tümü' },
  { id: 'today', name: 'Bugün' },
  { id: 'week', name: 'Bu Hafta' },
  { id: 'month', name: 'Bu Ay' }
];

const FILTER_SORT = [
  { id: 'newest', name: 'Yeni Eklenen' },
  { id: 'popular', name: 'Popüler' },
  { id: 'highest', name: 'En Yüksek İndirim' },
  { id: 'ending', name: 'Son Bitenler' }
];

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [brands, setBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [allGiveaways, setAllGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStores, setSelectedStores] = useState(new Set());
  const [showDeals, setShowDeals] = useState(false);
  
  // Description expand state (mobile)
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Scroll state for mobile header
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef(null);
  
  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter values
  const [filterDiscountRate, setFilterDiscountRate] = useState('all');
  const [filterCampaignType, setFilterCampaignType] = useState('all');
  const [filterExpiry, setFilterExpiry] = useState('all');
  const [filterSort, setFilterSort] = useState('newest');
  
  // Site settings for sticky bar
  const [siteSettings, setSiteSettings] = useState({ sticky_cta_enabled: true, sticky_cta_variant: "A" });

  // Handle scroll for mobile header hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;
      
      if (!isMobile) {
        setHideHeader(false);
        return;
      }
      
      // Hide header when scrolling down past 100px, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHideHeader(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHideHeader(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch site settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/site-settings`);
        setSiteSettings(res.data);
      } catch (error) {
        console.log('Using default site settings');
      }
    };
    fetchSettings();
  }, []);

  // SEO Meta Tags
  useEffect(() => {
    if (category) {
      document.title = `${category.name} - İndirim Keşfet`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', category.description || `${category.name} kategorisindeki mağazalar, kuponlar ve indirimler.`);
    }
    
    return () => {
      document.title = 'İndirim Keşfet - Kupon Kodları ve İndirim Fırsatları';
    };
  }, [category]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);
      setSelectedStores(new Set());
      setShowDeals(false);
      setSearchTerm('');
      setShowFullDescription(false);
      resetFilters();
      
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
        
        const brandDealCounts = {};
        categoryCoupons.forEach(c => {
          brandDealCounts[c.brand_id] = (brandDealCounts[c.brand_id] || 0) + 1;
        });
        categoryDiscounts.forEach(d => {
          brandDealCounts[d.brand_id] = (brandDealCounts[d.brand_id] || 0) + 1;
        });
        categoryGiveaways.forEach(g => {
          brandDealCounts[g.brand_id] = (brandDealCounts[g.brand_id] || 0) + 1;
        });

        const brandsWithDeals = brandsRes.data.map(b => ({
          ...b,
          deal_count: brandDealCounts[b.id] || 0
        })).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

        setBrands(brandsWithDeals);
        setAllBrands(brandsWithDeals);
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

  // Reset all filters
  const resetFilters = () => {
    setFilterDiscountRate('all');
    setFilterCampaignType('all');
    setFilterExpiry('all');
    setFilterSort('newest');
    setSelectedStores(new Set());
  };

  // Check if any filter is active
  const hasActiveFilters = filterDiscountRate !== 'all' || 
    filterCampaignType !== 'all' || 
    filterExpiry !== 'all' ||
    selectedStores.size > 0;

  // Count active filters
  const activeFilterCount = [
    filterDiscountRate !== 'all',
    filterCampaignType !== 'all',
    filterExpiry !== 'all',
    selectedStores.size > 0
  ].filter(Boolean).length;

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands;
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, brands]);

  // Popular brands in this category
  const popularBrands = useMemo(() => {
    return [...allBrands]
      .filter(b => b.deal_count > 0)
      .sort((a, b) => b.deal_count - a.deal_count)
      .slice(0, 8);
  }, [allBrands]);

  // Top 3 campaigns for category
  const topCampaigns = useMemo(() => {
    const allDeals = [
      ...allCoupons.map(c => ({ ...c, type: 'coupon' })),
      ...allDiscounts.map(d => ({ ...d, type: 'discount' })),
      ...allGiveaways.map(g => ({ ...g, type: 'giveaway' }))
    ];
    return allDeals.slice(0, 3);
  }, [allCoupons, allDiscounts, allGiveaways]);

  // Helper functions for filtering
  const getDiscountNumber = (discountText) => {
    if (!discountText) return 0;
    const match = discountText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return Infinity;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Get filtered and sorted deals
  const filteredDeals = useMemo(() => {
    let coupons = [...allCoupons];
    let discounts = [...allDiscounts];
    let giveaways = [...allGiveaways];

    // Filter by selected stores
    if (selectedStores.size > 0) {
      const selectedBrandIdSet = new Set(
        brands.filter(b => selectedStores.has(b.slug)).map(b => b.id)
      );
      coupons = coupons.filter(c => selectedBrandIdSet.has(c.brand_id));
      discounts = discounts.filter(d => selectedBrandIdSet.has(d.brand_id));
      giveaways = giveaways.filter(g => selectedBrandIdSet.has(g.brand_id));
    }

    // Filter by discount rate
    if (filterDiscountRate !== 'all') {
      const minRate = parseInt(filterDiscountRate);
      coupons = coupons.filter(c => getDiscountNumber(c.discount_text) >= minRate);
      discounts = discounts.filter(d => getDiscountNumber(d.discount_text) >= minRate);
    }

    // Filter by expiry
    if (filterExpiry !== 'all') {
      const filterByExpiry = (items) => {
        return items.filter(item => {
          const days = getDaysUntilExpiry(item.expiry_date);
          if (filterExpiry === 'today') return days <= 1;
          if (filterExpiry === 'week') return days <= 7;
          if (filterExpiry === 'month') return days <= 30;
          return true;
        });
      };
      coupons = filterByExpiry(coupons);
      discounts = filterByExpiry(discounts);
      giveaways = filterByExpiry(giveaways);
    }

    // Filter by campaign type
    if (filterCampaignType !== 'all') {
      if (filterCampaignType === 'coupon') {
        discounts = [];
        giveaways = [];
      } else if (filterCampaignType === 'discount') {
        coupons = [];
        giveaways = [];
      } else if (filterCampaignType === 'giveaway') {
        coupons = [];
        discounts = [];
      }
    }

    // Combine all deals for sorting
    let allDeals = [
      ...coupons.map(c => ({ ...c, dealType: 'coupon' })),
      ...discounts.map(d => ({ ...d, dealType: 'discount' })),
      ...giveaways.map(g => ({ ...g, dealType: 'giveaway' }))
    ];

    // Sort
    if (filterSort === 'newest') {
      allDeals.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (filterSort === 'highest') {
      allDeals.sort((a, b) => getDiscountNumber(b.discount_text || b.prize_text) - getDiscountNumber(a.discount_text || a.prize_text));
    } else if (filterSort === 'ending') {
      allDeals.sort((a, b) => getDaysUntilExpiry(a.expiry_date) - getDaysUntilExpiry(b.expiry_date));
    }

    return allDeals;
  }, [allCoupons, allDiscounts, allGiveaways, selectedStores, brands, filterDiscountRate, filterExpiry, filterCampaignType, filterSort]);

  // Toggle store selection
  const toggleStore = (brandSlug) => {
    const newSelected = new Set(selectedStores);
    if (newSelected.has(brandSlug)) {
      newSelected.delete(brandSlug);
    } else {
      newSelected.add(brandSlug);
    }
    setSelectedStores(newSelected);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedStores(new Set());
    setShowDeals(false);
    resetFilters();
  };

  // Get selected brand IDs
  const selectedBrandIds = useMemo(() => {
    return brands
      .filter(b => selectedStores.has(b.slug))
      .map(b => b.id);
  }, [selectedStores, brands]);

  // Brand map
  const brandMap = useMemo(() => {
    return brands.reduce((acc, brand) => {
      acc[brand.id] = brand;
      return acc;
    }, {});
  }, [brands]);

  // Generate deal URL
  const getDealUrl = (deal, type) => {
    const brand = brandMap[deal.brand_id];
    if (!brand) return '#';
    const slug = deal.title?.toLowerCase()
      .replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u')
      .replace(/[şŞ]/g, 's').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-')
      .substring(0, 50) || 'deal';
    const typeSlug = type === 'coupon' ? 'kupon' : type === 'giveaway' ? 'cekilis' : 'indirim';
    return `/magaza/${brand.slug}/${typeSlug}/${slug}-${deal.id}`;
  };

  // Truncate text
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Get category description (default if not set)
  const categoryDescription = category?.description || 
    `${category?.name} kategorisindeki en güncel indirimler, kupon kodları ve kampanyalar. ${brands.length} farklı mağazadan ${allCoupons.length + allDiscounts.length + allGiveaways.length} aktif fırsat sizi bekliyor.`;

  // Truncated description for mobile
  const truncatedDescription = categoryDescription.length > 150 
    ? categoryDescription.substring(0, 150) + '...' 
    : categoryDescription;

  // Apply filters and show deals
  const applyFilters = () => {
    setShowDeals(true);
    setShowFilterModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">Kategori Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">Aradığınız kategori mevcut değil.</p>
          <Link
            to="/magazalar"
            className="px-6 py-3 bg-gradient-to-r from-primary to-pink-500 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Tüm Mağazalar
          </Link>
        </div>
      </div>
    );
  }

  const totalDeals = allCoupons.length + allDiscounts.length + allGiveaways.length;

  return (
    <>
      <div className="min-h-screen pb-20" data-testid="category-page">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-6 md:py-8">
            {/* Desktop: Two columns / Mobile: Single column */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8">
              {/* Left: Category info & description */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">{category.name}</h1>
                <p className="text-sm text-muted-foreground mb-3">
                  {brands.length} mağaza, {totalDeals} aktif indirim
                </p>
                
                {/* Description - Mobile: collapsible / Desktop: full */}
                <div className="hidden md:block">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {categoryDescription}
                  </p>
                </div>
                
                {/* Mobile description with expand */}
                <div className="md:hidden">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {showFullDescription ? categoryDescription : truncatedDescription}
                  </p>
                  {categoryDescription.length > 150 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary text-sm font-medium mt-1 flex items-center gap-1"
                    >
                      {showFullDescription ? 'Daha az göster' : 'Devamını oku'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Top campaigns (Desktop only) */}
              {topCampaigns.length > 0 && (
                <div className="hidden md:block w-80 flex-shrink-0">
                  <span className="text-sm font-medium text-muted-foreground mb-3 block">Öne Çıkan Kampanyalar</span>
                  <div className="flex flex-col gap-2">
                    {topCampaigns.map((deal) => (
                      <Link
                        key={deal.id}
                        to={getDealUrl(deal, deal.type)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg text-sm transition-colors group"
                      >
                        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground group-hover:text-primary transition-colors truncate">
                          {truncateText(deal.title, 40)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Brands Bar - Sticky on mobile when scrolling */}
        {popularBrands.length > 0 && !showDeals && (
          <div className="bg-muted/50 dark:bg-muted/30 border-b border-border sticky top-0 z-30 md:relative md:z-auto backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">Popüler Mağazalar:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {popularBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/magaza/${brand.slug}`}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-card border border-border hover:border-primary/50 hover:bg-primary/5"
                  >
                    <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="sm" />
                    <span className="text-sm font-medium whitespace-nowrap">{brand.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {brand.deal_count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          {/* Search & Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Mağaza ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                hasActiveFilters
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border hover:border-primary/50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filtrele</span>
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filterCampaignType !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  {FILTER_CAMPAIGN_TYPES.find(t => t.id === filterCampaignType)?.name}
                  <button onClick={() => setFilterCampaignType('all')}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {filterDiscountRate !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  {FILTER_DISCOUNT_RATES.find(r => r.id === filterDiscountRate)?.name}
                  <button onClick={() => setFilterDiscountRate('all')}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {filterExpiry !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  {FILTER_EXPIRY.find(e => e.id === filterExpiry)?.name}
                  <button onClick={() => setFilterExpiry('all')}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              {selectedStores.size > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                  {selectedStores.size} mağaza
                  <button onClick={() => setSelectedStores(new Set())}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              <button
                onClick={clearSelection}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Tümünü Temizle
              </button>
            </div>
          )}

          {/* Deals View */}
          {showDeals || hasActiveFilters ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold">
                  {hasActiveFilters ? 'Filtrelenmiş' : 'Tüm'} İndirimler ({filteredDeals.length})
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Filtreleri Temizle
                  </button>
                )}
              </div>

              {filteredDeals.length === 0 ? (
                <div className="text-center py-16 glass-effect rounded-2xl">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Sonuç Bulunamadı</h3>
                  <p className="text-muted-foreground mb-4">Filtrelere uygun indirim bulunamadı.</p>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDeals.map(deal => {
                    if (deal.dealType === 'coupon') {
                      return <CouponCard key={deal.id} coupon={deal} brand={brandMap[deal.brand_id]} />;
                    } else if (deal.dealType === 'giveaway') {
                      return <GiveawayCard key={deal.id} giveaway={deal} brand={brandMap[deal.brand_id]} />;
                    } else {
                      return <DiscountCard key={deal.id} discount={deal} brand={brandMap[deal.brand_id]} />;
                    }
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Stores Grid - Bigger logos and text */
            <>
              {filteredBrands.length === 0 ? (
                <div className="text-center py-16 glass-effect rounded-2xl">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Mağaza Bulunamadı</h3>
                  <p className="text-muted-foreground">Arama kriterlerinize uygun mağaza yok.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredBrands.map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/magaza/${brand.slug}`}
                      className="group p-4 rounded-xl text-center transition-all glass-effect hover:border-primary/30 hover:shadow-lg"
                    >
                      {/* Bigger logo */}
                      <div className="flex justify-center mb-3">
                        <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="lg" />
                      </div>
                      {/* Bigger brand name */}
                      <h3 className="font-semibold text-base truncate mb-1.5">{brand.name}</h3>
                      {/* Bigger deal count */}
                      {brand.deal_count > 0 ? (
                        <p className="text-sm font-medium text-primary">{brand.deal_count} indirim</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">-</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Filtrele</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4 space-y-6">
                {/* Kampanya Tipi */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Kampanya Tipi</h3>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_CAMPAIGN_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFilterCampaignType(type.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filterCampaignType === type.id
                            ? 'bg-primary text-white'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

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
                        {rate.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bitiş Süresi */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Bitiş Süresi</h3>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_EXPIRY.map((expiry) => (
                      <button
                        key={expiry.id}
                        onClick={() => setFilterExpiry(expiry.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filterExpiry === expiry.id
                            ? 'bg-primary text-white'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {expiry.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sıralama */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Sıralama</h3>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_SORT.map((sort) => (
                      <button
                        key={sort.id}
                        onClick={() => setFilterSort(sort.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filterSort === sort.id
                            ? 'bg-primary text-white'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {sort.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mağaza Seçimi */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Mağaza Seç ({selectedStores.size} seçili)
                  </h3>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {brands.slice(0, 20).map((brand) => {
                      const isSelected = selectedStores.has(brand.slug);
                      return (
                        <button
                          key={brand.id}
                          onClick={() => toggleStore(brand.slug)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            isSelected
                              ? 'bg-primary/10 border border-primary text-primary'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                          <span className="truncate">{brand.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border px-4 py-4 flex gap-3">
                <button
                  onClick={() => {
                    resetFilters();
                    setShowFilterModal(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-medium bg-muted hover:bg-muted/80 transition-colors"
                >
                  Temizle
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-3 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Uygula ({filteredDeals.length} sonuç)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Action Bar */}
      {!showDeals && selectedStores.size > 0 && (
        <StickyActionBar
          selectedCount={selectedStores.size}
          selectedBrandIds={selectedBrandIds}
          categoryId={category?.id}
          onShowDeals={() => setShowDeals(true)}
          onClear={clearSelection}
          variant={siteSettings.sticky_cta_variant}
          isEnabled={siteSettings.sticky_cta_enabled}
        />
      )}
    </>
  );
};

export default CategoryPage;
