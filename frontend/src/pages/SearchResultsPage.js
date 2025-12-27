import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Search, TrendingUp, Tag, Package, Gift } from 'lucide-react';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import GiveawayCard from '../components/GiveawayCard';
import BrandLogo from '../components/BrandLogo';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Create brand map for cards
  const brandMap = results?.brands?.reduce((acc, brand) => {
    acc[brand.id] = brand;
    return acc;
  }, {}) || {};

  // Enrich coupons and discounts with brand info from the map
  const enrichedCoupons = results?.coupons?.map(coupon => ({
    ...coupon,
    brand: brandMap[coupon.brand_id] || { name: coupon.brand_name, slug: coupon.brand_slug }
  })) || [];

  const enrichedDiscounts = results?.discounts?.map(discount => ({
    ...discount,
    brand: brandMap[discount.brand_id] || { name: discount.brand_name, slug: discount.brand_slug }
  })) || [];

  const totalResults = results
    ? (results.brands?.length || 0) + 
      (results.coupons?.length || 0) + 
      (results.discounts?.length || 0) +
      (results.categories?.length || 0)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Aranıyor...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" için arama sonuçları` : 'Arama'} - İndirim Keşfet</title>
        <meta name="description" content={`${query} araması için bulunan kuponlar, indirimler ve mağazalar.`} />
      </Helmet>

      <div className="min-h-screen" data-testid="search-results-page">
        <div className="container mx-auto px-4 py-6">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-heading font-bold">
                {query ? `"${query}" için sonuçlar` : 'Arama'}
              </h1>
            </div>
            {query && (
              <p className="text-muted-foreground">
                {totalResults > 0 ? `${totalResults} sonuç bulundu` : 'Sonuç bulunamadı'}
              </p>
            )}
          </div>

          {!query && (
            <div className="text-center py-16 glass-effect rounded-2xl">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-medium mb-2">Aramak için bir şeyler yazın</h2>
              <p className="text-muted-foreground">Mağaza, kupon veya indirim arayabilirsiniz</p>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="text-center py-16 glass-effect rounded-2xl">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-medium mb-2">Sonuç bulunamadı</h2>
              <p className="text-muted-foreground mb-4">"{query}" için eşleşen sonuç yok</p>
              <Link
                to="/magazalar"
                className="inline-flex px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Tüm Mağazalar
              </Link>
            </div>
          )}

          {results && totalResults > 0 && (
            <div className="space-y-10">
              {/* Categories */}
              {results.categories && results.categories.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-heading font-bold">Kategoriler ({results.categories.length})</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {results.categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/kategori/${category.slug}`}
                        className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Brands */}
              {results.brands && results.brands.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-heading font-bold">Mağazalar ({results.brands.length})</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.brands.map((brand) => (
                      <Link
                        key={brand.id}
                        to={`/magaza/${brand.slug}`}
                        className="flex flex-col items-center p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-center"
                      >
                        <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="lg" />
                        <span className="mt-2 font-medium text-sm">{brand.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Coupons */}
              {enrichedCoupons.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-heading font-bold">Kuponlar ({enrichedCoupons.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrichedCoupons.map((coupon) => (
                      <CouponCard key={coupon.id} coupon={coupon} brand={coupon.brand} />
                    ))}
                  </div>
                </section>
              )}

              {/* Discounts */}
              {enrichedDiscounts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-heading font-bold">İndirimler ({enrichedDiscounts.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrichedDiscounts.map((discount) => (
                      <DiscountCard key={discount.id} discount={discount} brand={discount.brand} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResultsPage;
