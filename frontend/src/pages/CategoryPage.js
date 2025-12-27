import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import BrandLogo from '../components/BrandLogo';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import StickyActionBar from '../components/StickyActionBar';
import AlphabetNav from '../components/AlphabetNav';
import { Search, Check, X, Tag, Filter, ChevronDown, Package, Percent, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [brands, setBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStores, setSelectedStores] = useState(new Set());
  const [showDeals, setShowDeals] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // New filter options
  const [filterHighDiscount, setFilterHighDiscount] = useState(false);
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false);
  
  // Site settings for sticky bar
  const [siteSettings, setSiteSettings] = useState({ sticky_cta_enabled: true, sticky_cta_variant: "A" });

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
      metaDesc.setAttribute('content', `${category.name} kategorisindeki mağazalar, kuponlar ve indirimler.`);
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
      setSelectedLetter(null);
      setFilterHighDiscount(false);
      setFilterExpiringSoon(false);
      
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
        
        const [couponsRes, discountsRes] = await Promise.all([
          axios.get(`${API}/coupons`),
          axios.get(`${API}/discounts`)
        ]);
        
        const brandIds = brandsRes.data.map(b => b.id);
        const categoryCoupons = couponsRes.data.filter(c => brandIds.includes(c.brand_id) && c.is_active !== false);
        const categoryDiscounts = discountsRes.data.filter(d => brandIds.includes(d.brand_id));
        
        const brandDealCounts = {};
        categoryCoupons.forEach(c => {
          brandDealCounts[c.brand_id] = (brandDealCounts[c.brand_id] || 0) + 1;
        });
        categoryDiscounts.forEach(d => {
          brandDealCounts[d.brand_id] = (brandDealCounts[d.brand_id] || 0) + 1;
        });

        const brandsWithDeals = brandsRes.data.map(b => ({
          ...b,
          deal_count: brandDealCounts[b.id] || 0
        })).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

        setBrands(brandsWithDeals);
        setAllBrands(brandsWithDeals);
        setAllCoupons(categoryCoupons);
        setAllDiscounts(categoryDiscounts);
      } catch (error) {
        console.error('Failed to fetch category data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Get available letters
  const availableLetters = useMemo(() => {
    const letters = new Set();
    brands.forEach(brand => {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      letters.add(firstLetter);
    });
    return Array.from(letters).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [brands]);

  // Filter brands
  const filteredBrands = useMemo(() => {
    let result = brands;
    
    if (searchTerm) {
      result = result.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedLetter) {
      result = result.filter(brand =>
        brand.name.charAt(0).toUpperCase() === selectedLetter
      );
    }
    
    return result;
  }, [searchTerm, selectedLetter, brands]);

  // Popular brands in this category (sorted by deal count)
  const popularBrands = useMemo(() => {
    return [...allBrands]
      .filter(b => b.deal_count > 0)
      .sort((a, b) => b.deal_count - a.deal_count)
      .slice(0, 8);
  }, [allBrands]);

  // Top 3 campaigns for category (most recent or could be by views)
  const topCampaigns = useMemo(() => {
    const allDeals = [
      ...allCoupons.map(c => ({ ...c, type: 'coupon' })),
      ...allDiscounts.map(d => ({ ...d, type: 'discount' }))
    ];
    // Sort by created_at desc or just take first 3
    return allDeals.slice(0, 3);
  }, [allCoupons, allDiscounts]);

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
    setFilterHighDiscount(false);
    setFilterExpiringSoon(false);
  };

  // Get selected brand IDs
  const selectedBrandIds = useMemo(() => {
    return brands
      .filter(b => selectedStores.has(b.slug))
      .map(b => b.id);
  }, [selectedStores, brands]);

  // Helper to check if deal is expiring soon (within 3 days)
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  };

  // Helper to check if high discount (contains %20 or higher)
  const isHighDiscount = (discountText) => {
    if (!discountText) return false;
    const match = discountText.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      return num >= 20;
    }
    return false;
  };

  // Get filtered deals
  const filteredDeals = useMemo(() => {
    let coupons = allCoupons;
    let discounts = allDiscounts;

    // Filter by selected stores
    if (selectedStores.size > 0) {
      const selectedBrandIdSet = new Set(selectedBrandIds);
      coupons = coupons.filter(c => selectedBrandIdSet.has(c.brand_id));
      discounts = discounts.filter(d => selectedBrandIdSet.has(d.brand_id));
    }

    // Filter by high discount
    if (filterHighDiscount) {
      coupons = coupons.filter(c => isHighDiscount(c.discount_text));
      discounts = discounts.filter(d => isHighDiscount(d.discount_text));
    }

    // Filter by expiring soon
    if (filterExpiringSoon) {
      coupons = coupons.filter(c => isExpiringSoon(c.expiry_date));
      discounts = discounts.filter(d => isExpiringSoon(d.expiry_date));
    }
    
    return { coupons, discounts };
  }, [selectedStores, selectedBrandIds, allCoupons, allDiscounts, filterHighDiscount, filterExpiringSoon]);

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
    return `/magaza/${brand.slug}/${type === 'coupon' ? 'kupon' : 'indirim'}/${slug}-${deal.id}`;
  };

  // Check if any filter is active
  const hasActiveFilters = selectedStores.size > 0 || filterHighDiscount || filterExpiringSoon;

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

  const totalDeals = allCoupons.length + allDiscounts.length;

  return (
    <>
      <div className="min-h-screen pb-20" data-testid="category-page">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-heading font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground">
              {brands.length} mağaza, {totalDeals} aktif indirim
            </p>
            
            {/* Top Campaigns Tags */}
            {topCampaigns.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Öne Çıkanlar:</span>
                {topCampaigns.map((deal) => (
                  <Link
                    key={deal.id}
                    to={getDealUrl(deal, deal.type)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm transition-colors"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{deal.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Brands Bar - Direct links, NOT filter mode */}
        {popularBrands.length > 0 && !showDeals && (
          <div className="bg-muted/30 border-b border-border">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Popüler Mağazalar:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {popularBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/magaza/${brand.slug}`}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-card border border-border hover:border-primary/50 hover:bg-primary/5"
                  >
                    <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="xs" />
                    <span className="text-sm whitespace-nowrap">{brand.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
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
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Mağaza ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedLetter(null);
                }}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Filtrele butonu */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtrele</span>
              {hasActiveFilters && (
                <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {(selectedStores.size > 0 ? 1 : 0) + (filterHighDiscount ? 1 : 0) + (filterExpiringSoon ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filter Area */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="p-4 bg-card border border-border rounded-xl space-y-4">
                  {/* Filter Options */}
                  <div className="flex flex-wrap gap-3">
                    {/* Multiple Store Selection */}
                    <button
                      onClick={() => {
                        if (selectedStores.size > 0) {
                          setSelectedStores(new Set());
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        selectedStores.size > 0
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Çoklu Seçim</span>
                      {selectedStores.size > 0 && (
                        <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                          {selectedStores.size}
                        </span>
                      )}
                    </button>

                    {/* High Discount Filter */}
                    <button
                      onClick={() => setFilterHighDiscount(!filterHighDiscount)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        filterHighDiscount
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      <span>Yüksek İndirim (%20+)</span>
                    </button>

                    {/* Expiring Soon Filter */}
                    <button
                      onClick={() => setFilterExpiringSoon(!filterExpiringSoon)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        filterExpiringSoon
                          ? 'bg-orange-500 text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Süresi Bitmek Üzere</span>
                    </button>
                  </div>

                  {/* Alphabet Filter */}
                  {!searchTerm && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Harfe Göre:</p>
                      <AlphabetNav
                        letters={availableLetters}
                        selectedLetter={selectedLetter}
                        onSelect={(letter) => setSelectedLetter(letter)}
                      />
                    </div>
                  )}

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearSelection}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Filtreleri Temizle
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Stores Pills */}
          {selectedStores.size > 0 && !showDeals && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-muted-foreground py-1">Seçili:</span>
              {Array.from(selectedStores).map(slug => {
                const brand = brands.find(b => b.slug === slug);
                return brand ? (
                  <button
                    key={slug}
                    onClick={() => toggleStore(slug)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                  >
                    {brand.name}
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null;
              })}
            </div>
          )}

          {/* Deals View - Show when filters are active */}
          {(showDeals || (hasActiveFilters && (filterHighDiscount || filterExpiringSoon))) && (filteredDeals.coupons.length > 0 || filteredDeals.discounts.length > 0) ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold">
                  Filtrelenmiş İndirimler ({filteredDeals.coupons.length + filteredDeals.discounts.length})
                </h2>
                <button
                  onClick={clearSelection}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Filtreleri Temizle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDeals.coupons.map(coupon => (
                  <CouponCard 
                    key={coupon.id} 
                    coupon={coupon} 
                    brand={brandMap[coupon.brand_id]} 
                  />
                ))}
                {filteredDeals.discounts.map(discount => (
                  <DiscountCard 
                    key={discount.id} 
                    discount={discount} 
                    brand={brandMap[discount.brand_id]} 
                  />
                ))}
              </div>
            </div>
          ) : showDeals && selectedStores.size > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold">
                  Seçili Mağazaların İndirimleri ({filteredDeals.coupons.length + filteredDeals.discounts.length})
                </h2>
                <button
                  onClick={() => setShowDeals(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Mağazalara dön
                </button>
              </div>

              {/* Empty state */}
              {filteredDeals.coupons.length === 0 && filteredDeals.discounts.length === 0 ? (
                <div className="text-center py-16 glass-effect rounded-2xl">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Sonuç Bulunamadı</h3>
                  <p className="text-muted-foreground mb-4">Seçili mağazalarda aktif indirim bulunamadı.</p>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDeals.coupons.map(coupon => (
                    <CouponCard 
                      key={coupon.id} 
                      coupon={coupon} 
                      brand={brandMap[coupon.brand_id]} 
                    />
                  ))}
                  {filteredDeals.discounts.map(discount => (
                    <DiscountCard 
                      key={discount.id} 
                      discount={discount} 
                      brand={brandMap[discount.brand_id]} 
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Stores Grid */
            <>
              {filteredBrands.length === 0 ? (
                <div className="text-center py-16 glass-effect rounded-2xl">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Mağaza Bulunamadı</h3>
                  <p className="text-muted-foreground">Arama kriterlerinize uygun mağaza yok.</p>
                </div>
              ) : (
                <>
                  {selectedLetter && (
                    <h2 className="text-2xl font-heading font-bold text-primary mb-4">
                      {selectedLetter}
                    </h2>
                  )}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {filteredBrands.map((brand) => {
                      const isSelected = selectedStores.has(brand.slug);
                      
                      // If filter mode is active, show checkboxes
                      if (showFilters) {
                        return (
                          <button
                            key={brand.id}
                            onClick={() => toggleStore(brand.slug)}
                            className={`group p-3 rounded-xl text-center transition-all relative ${
                              isSelected 
                                ? 'bg-primary/10 border-2 border-primary' 
                                : 'glass-effect hover:border-primary/30'
                            }`}
                          >
                            {/* Checkbox */}
                            <div className={`absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-primary' 
                                : 'border-2 border-muted-foreground/30'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>

                            <div className="flex justify-center mb-2">
                              <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="md" />
                            </div>

                            <h3 className="font-medium text-sm truncate mb-1">{brand.name}</h3>
                            {brand.deal_count > 0 ? (
                              <p className="text-xs text-primary">{brand.deal_count} indirim</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">-</p>
                            )}
                          </button>
                        );
                      }
                      
                      // Default: direct link to store page
                      return (
                        <Link
                          key={brand.id}
                          to={`/magaza/${brand.slug}`}
                          className="group p-3 rounded-xl text-center transition-all glass-effect hover:border-primary/30"
                        >
                          <div className="flex justify-center mb-2">
                            <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="md" />
                          </div>
                          <h3 className="font-medium text-sm truncate mb-1">{brand.name}</h3>
                          {brand.deal_count > 0 ? (
                            <p className="text-xs text-primary">{brand.deal_count} indirim</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">-</p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

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
