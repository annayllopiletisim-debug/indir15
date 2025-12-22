import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Check, X, Filter, ChevronRight, Tag } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StoresPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [brands, setBrands] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStores, setSelectedStores] = useState(new Set());
  const [showDeals, setShowDeals] = useState(false);

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
        setFilteredBrands(brandsWithDeals);
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

  // Filter brands by search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(brands);
    }
  }, [searchTerm, brands]);

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

  // Clear all selections
  const clearSelection = () => {
    setSelectedStores(new Set());
    setShowDeals(false);
    setSearchParams({});
  };

  // Get filtered deals based on selected stores
  const filteredDeals = useMemo(() => {
    if (selectedStores.size === 0) return { coupons: [], discounts: [] };
    
    const selectedBrandIds = brands
      .filter(b => selectedStores.has(b.slug))
      .map(b => b.id);
    
    return {
      coupons: allCoupons.filter(c => selectedBrandIds.includes(c.brand_id)),
      discounts: allDiscounts.filter(d => selectedBrandIds.includes(d.brand_id))
    };
  }, [selectedStores, brands, allCoupons, allDiscounts]);

  // Brand map for cards
  const brandMap = useMemo(() => {
    return brands.reduce((acc, brand) => {
      acc[brand.id] = brand;
      return acc;
    }, {});
  }, [brands]);

  // Group brands alphabetically
  const groupedBrands = useMemo(() => {
    return filteredBrands.reduce((acc, brand) => {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(brand);
      return acc;
    }, {});
  }, [filteredBrands]);

  const letters = Object.keys(groupedBrands).sort();

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
        <title>Mağazalar - İndirim Keşfet</title>
        <meta name="description" content="Tüm mağazaları görüntüleyin ve kupon ile indirimleri keşfedin." />
      </Helmet>

      <div className="min-h-screen" data-testid="stores-page">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Mağazalar</h1>
            <p className="text-muted-foreground">Birden fazla mağaza seçerek indirimleri karşılaştırın</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Search & Selection Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
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

            {/* Selection Actions */}
            {selectedStores.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeals(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>İndirimleri Göster ({selectedStores.size})</span>
                </button>
                <button
                  onClick={clearSelection}
                  className="p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                  title="Seçimi temizle"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Selected Stores Pills */}
          {selectedStores.size > 0 && (
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

          {/* Deals View */}
          {showDeals && selectedStores.size > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold">
                  Seçili Mağazaların İndirimleri
                </h2>
                <button
                  onClick={() => setShowDeals(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Mağazalara dön
                </button>
              </div>

              {filteredDeals.coupons.length === 0 && filteredDeals.discounts.length === 0 ? (
                <div className="text-center py-16 glass-effect rounded-2xl">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Seçili mağazalarda aktif indirim bulunamadı.</p>
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
              {letters.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Mağaza bulunamadı.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {letters.map((letter) => (
                    <div key={letter}>
                      <h2 className="text-2xl font-heading font-bold text-primary mb-4">
                        {letter}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {groupedBrands[letter].map((brand) => {
                          const isSelected = selectedStores.has(brand.slug);
                          return (
                            <button
                              key={brand.id}
                              onClick={() => toggleStore(brand.slug)}
                              className={`group p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                                isSelected 
                                  ? 'bg-primary/10 border-2 border-primary' 
                                  : 'glass-effect hover:border-primary/30'
                              }`}
                            >
                              {/* Checkbox */}
                              <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                                isSelected 
                                  ? 'bg-primary border-primary' 
                                  : 'border-muted-foreground/30'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>

                              {/* Logo */}
                              <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="sm" />

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{brand.name}</h3>
                                {brand.deal_count > 0 ? (
                                  <p className="text-sm text-primary">{brand.deal_count} indirim</p>
                                ) : (
                                  <p className="text-xs text-muted-foreground">İndirim yok</p>
                                )}
                              </div>

                              {/* Arrow */}
                              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                                isSelected ? 'rotate-90' : ''
                              }`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StoresPage;
