import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Check, X, Tag, Filter, ChevronDown, Package } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import StickyActionBar from '../components/StickyActionBar';
import AlphabetNav from '../components/AlphabetNav';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StoresPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [brands, setBrands] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStores, setSelectedStores] = useState(new Set());
  const [showDeals, setShowDeals] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showFilters, setShowFilters] = useState(false); // #4 - Filter toggle
  
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
    document.title = 'Mağazalar - İndirim Keşfet';
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Tüm mağazaları görüntüleyin ve kupon ile indirimleri keşfedin.');
    
    return () => {
      document.title = 'İndirim Keşfet - Kupon Kodları ve İndirim Fırsatları';
    };
  }, []);

  // Parse initial selection from URL
  useEffect(() => {
    const storesParam = searchParams.get('stores');
    if (storesParam) {
      const storeIds = storesParam.split(',');
      setSelectedStores(new Set(storeIds));
      setShowDeals(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, couponsRes, discountsRes] = await Promise.all([
          axios.get(`${API}/brands`),
          axios.get(`${API}/coupons`),
          axios.get(`${API}/discounts`)
        ]);
        
        // Calculate deal counts for each brand
        const brandDealCounts = {};
        couponsRes.data.forEach(c => {
          if (c.is_active !== false) {
            brandDealCounts[c.brand_id] = (brandDealCounts[c.brand_id] || 0) + 1;
          }
        });
        discountsRes.data.forEach(d => {
          brandDealCounts[d.brand_id] = (brandDealCounts[d.brand_id] || 0) + 1;
        });

        const brandsWithDeals = brandsRes.data.map(b => ({
          ...b,
          deal_count: brandDealCounts[b.id] || 0
        })).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

        setBrands(brandsWithDeals);
        setAllCoupons(couponsRes.data.filter(c => c.is_active !== false));
        setAllDiscounts(discountsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get available letters from brands
  const availableLetters = useMemo(() => {
    const letters = new Set();
    brands.forEach(brand => {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      letters.add(firstLetter);
    });
    return Array.from(letters).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [brands]);

  // Filter brands by search term and selected letter
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

  // Toggle store selection
  const toggleStore = (brandSlug) => {
    const newSelected = new Set(selectedStores);
    if (newSelected.has(brandSlug)) {
      newSelected.delete(brandSlug);
    } else {
      newSelected.add(brandSlug);
    }
    setSelectedStores(newSelected);
    
    // Update URL
    if (newSelected.size > 0) {
      setSearchParams({ stores: Array.from(newSelected).join(',') });
    } else {
      setSearchParams({});
    }
  };

  // Clear all selections - #1 Bug fix
  const clearSelection = () => {
    setSelectedStores(new Set());
    setShowDeals(false);
    setSearchParams({});
  };

  // Get selected brand IDs for StickyActionBar
  const selectedBrandIds = useMemo(() => {
    return brands
      .filter(b => selectedStores.has(b.slug))
      .map(b => b.id);
  }, [selectedStores, brands]);

  // Get filtered deals based on selected stores - #1 Bug fix: Always recalculate
  const filteredDeals = useMemo(() => {
    if (selectedStores.size === 0) return { coupons: [], discounts: [] };
    
    const selectedBrandIdSet = new Set(selectedBrandIds);
    
    return {
      coupons: allCoupons.filter(c => selectedBrandIdSet.has(c.brand_id)),
      discounts: allDiscounts.filter(d => selectedBrandIdSet.has(d.brand_id))
    };
  }, [selectedStores, selectedBrandIds, allCoupons, allDiscounts]);

  // Brand map for cards
  const brandMap = useMemo(() => {
    return brands.reduce((acc, brand) => {
      acc[brand.id] = brand;
      return acc;
    }, {});
  }, [brands]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-20" data-testid="stores-page">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Mağazalar</h1>
            <p className="text-muted-foreground">Birden fazla mağaza seçerek indirimleri karşılaştırın</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Search & Filter Toggle - #4 */}
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

            {/* #4 - Filtrele butonu */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                showFilters || selectedLetter
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filtrele</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* #4 - Collapsible Alphabet Filter */}
          <AnimatePresence>
            {(showFilters || selectedLetter) && !searchTerm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <AlphabetNav
                  letters={availableLetters}
                  selectedLetter={selectedLetter}
                  onSelect={(letter) => {
                    setSelectedLetter(letter);
                    if (!letter) setShowFilters(false);
                  }}
                />
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

          {/* Deals View - #1 Bug fix: Proper state management */}
          {showDeals && selectedStores.size > 0 ? (
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

              {/* #1 - Empty state with message */}
              {filteredDeals.coupons.length === 0 && filteredDeals.discounts.length === 0 ? (
                <div className="text-center py-16 glass-effect rounded-2xl">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Sonuç Bulunamadı</h3>
                  <p className="text-muted-foreground mb-4">Seçili mağazalarda aktif indirim bulunamadı.</p>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Filreleri Temizle
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
                      
                      // Filtrele aktif değilse, mağaza sayfasına git
                      if (!showFilters) {
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
                      }
                      
                      // Filtrele aktifse, checkbox seçimi
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
                          {/* Checkbox her zaman görünür - seçilmemişse border, seçilmişse tick */}
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
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      {!showDeals && (
        <StickyActionBar
          selectedCount={selectedStores.size}
          selectedBrandIds={selectedBrandIds}
          onShowDeals={() => setShowDeals(true)}
          onClear={clearSelection}
          variant={siteSettings.sticky_cta_variant}
          isEnabled={siteSettings.sticky_cta_enabled}
        />
      )}
    </>
  );
};

export default StoresPage;
