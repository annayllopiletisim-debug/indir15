import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import BrandLogo from '../components/BrandLogo';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import StickyActionBar from '../components/StickyActionBar';
import AlphabetNav from '../components/AlphabetNav';
import { Search, Check, X, Tag } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [brands, setBrands] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStores, setSelectedStores] = useState(new Set());
  const [showDeals, setShowDeals] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  
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

  // SEO Meta Tags via DOM manipulation
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
      try {
        // Get all categories and find by slug
        const categoriesRes = await axios.get(`${API}/categories`);
        const foundCategory = categoriesRes.data.find(cat => cat.slug === slug);
        
        if (!foundCategory) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Get brands in this category
        const brandsRes = await axios.get(`${API}/brands?category_id=${foundCategory.id}`);
        
        // Get all coupons and discounts
        const [couponsRes, discountsRes] = await Promise.all([
          axios.get(`${API}/coupons`),
          axios.get(`${API}/discounts`)
        ]);
        
        // Filter by brands in this category
        const brandIds = brandsRes.data.map(b => b.id);
        const categoryCoupons = couponsRes.data.filter(c => brandIds.includes(c.brand_id) && c.is_active !== false);
        const categoryDiscounts = discountsRes.data.filter(d => brandIds.includes(d.brand_id));
        
        // Calculate deal counts for each brand
        const brandDealCounts = {};
        categoryCoupons.forEach(c => {
          brandDealCounts[c.brand_id] = (brandDealCounts[c.brand_id] || 0) + 1;
        });
        categoryDiscounts.forEach(d => {
          brandDealCounts[d.brand_id] = (brandDealCounts[d.brand_id] || 0) + 1;
        });

        // Add deal counts to brands and sort alphabetically
        const brandsWithDeals = brandsRes.data.map(b => ({
          ...b,
          deal_count: brandDealCounts[b.id] || 0
        })).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

        setBrands(brandsWithDeals);
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
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by selected letter
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
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedStores(new Set());
    setShowDeals(false);
  };

  // Get selected brand IDs for StickyActionBar
  const selectedBrandIds = useMemo(() => {
    return brands
      .filter(b => selectedStores.has(b.slug))
      .map(b => b.id);
  }, [selectedStores, brands]);

  // Get filtered deals based on selected stores
  const filteredDeals = useMemo(() => {
    if (selectedStores.size === 0) return { coupons: [], discounts: [] };
    
    return {
      coupons: allCoupons.filter(c => selectedBrandIds.includes(c.brand_id)),
      discounts: allDiscounts.filter(d => selectedBrandIds.includes(d.brand_id))
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
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Mağaza ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedLetter(null); // Clear letter filter when searching
                }}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          {/* Alphabet Navigation */}
          {!searchTerm && (
            <AlphabetNav
              letters={availableLetters}
              selectedLetter={selectedLetter}
              onSelect={setSelectedLetter}
            />
          )}

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

          {/* Deals View */}
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
            /* Stores Grid - Compact view */
            <>
              {filteredBrands.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Mağaza bulunamadı.</p>
                </div>
              ) : (
                <>
                  {/* Show letter heading only when letter is selected */}
                  {selectedLetter && (
                    <h2 className="text-2xl font-heading font-bold text-primary mb-4">
                      {selectedLetter}
                    </h2>
                  )}
                  
                  {/* Compact Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {filteredBrands.map((brand) => {
                      const isSelected = selectedStores.has(brand.slug);
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
                          {/* Checkbox indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}

                          {/* Logo */}
                          <div className="flex justify-center mb-2">
                            <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="md" />
                          </div>

                          {/* Info */}
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
