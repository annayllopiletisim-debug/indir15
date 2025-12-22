import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import { Search, Tag, ChevronRight, Clock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * ProgrammaticSeoPage - Tek template ile 1000+ SEO sayfası
 * 
 * URL Patterns:
 * - /{category}-indirimleri
 * - /{brand}-indirimleri
 * - /{keyword}-indirimleri
 * - /son-24-saat
 */
const ProgrammaticSeoPage = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if this is a programmatic SEO slug (ends with -indirimleri)
        if (!slug?.endsWith('-indirimleri') && slug !== 'son-24-saat') {
          // Not a programmatic SEO page, show error
          setError('Sayfa bulunamadı');
          setLoading(false);
          return;
        }
        
        // Clean slug - remove -indirimleri suffix for API call
        const cleanSlug = slug?.replace(/-indirimleri$/, '') || 'son-24-saat';
        const response = await axios.get(`${API}/seo-page/${cleanSlug}`);
        setPageData(response.data);
      } catch (err) {
        console.error('Failed to fetch SEO page:', err);
        setError('Sayfa yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Sayfa bulunamadı'}</p>
          <Link to="/" className="text-primary hover:underline">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  const { 
    page_type, 
    seo_meta, 
    h1, 
    short_description, 
    items, 
    total_items, 
    structured_data,
    related_pages,
    canonical_url
  } = pageData;

  // Separate coupons and discounts
  const coupons = items.filter(i => i.item_type === 'coupon');
  const discounts = items.filter(i => i.item_type === 'discount');

  // Get base URL for canonical and OG tags
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indirimkestet.com';
  const fullCanonicalUrl = `${baseUrl}${canonical_url}`;

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{seo_meta.title}</title>
        <meta name="description" content={seo_meta.description} />
        <meta name="robots" content={seo_meta.robots || 'index, follow'} />
        <link rel="canonical" href={fullCanonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seo_meta.title} />
        <meta property="og:description" content={seo_meta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={fullCanonicalUrl} />
        <meta property="og:site_name" content="İndirim Keşfet" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seo_meta.title} />
        <meta name="twitter:description" content={seo_meta.description} />
      </Helmet>
      
      {/* Structured Data - Outside Helmet for proper rendering */}
      {structured_data && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structured_data) }}
        />
      )}

      <div className="min-h-screen" data-testid="programmatic-seo-page">
        {/* Header Section */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8 lg:py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">Ana Sayfa</Link>
              <ChevronRight className="w-4 h-4" />
              {page_type === 'category' && (
                <Link to="/kategoriler" className="hover:text-primary">Kategoriler</Link>
              )}
              {page_type === 'brand' && (
                <Link to="/magazalar" className="hover:text-primary">Mağazalar</Link>
              )}
              {page_type === 'time' && (
                <span>Son 24 Saat</span>
              )}
              {page_type === 'keyword' && (
                <span>Arama</span>
              )}
            </nav>

            {/* H1 */}
            <h1 className="text-3xl lg:text-4xl font-heading font-bold mb-3">
              {page_type === 'time' && <Clock className="inline w-8 h-8 mr-2 text-orange-500" />}
              {h1}
            </h1>
            
            {/* Short Description */}
            <p className="text-lg text-muted-foreground max-w-2xl">
              {short_description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-sm">
                <Tag className="w-4 h-4 text-primary" />
                <span className="font-medium">{total_items}</span> aktif indirim
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {total_items === 0 ? (
            /* Empty State */
            <div className="text-center py-16 glass-effect rounded-2xl">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-heading font-bold mb-2">Henüz İndirim Yok</h2>
              <p className="text-muted-foreground mb-6">
                Bu sayfa için aktif indirim bulunmuyor. Yakında yeni fırsatlar eklenecek.
              </p>
              <Link 
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          ) : (
            <>
              {/* Coupons Section */}
              {coupons.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-heading font-bold mb-4">
                    Kupon Kodları ({coupons.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                      <CouponCard 
                        key={coupon.id} 
                        coupon={coupon}
                        brand={{
                          name: coupon.brand_name,
                          slug: coupon.brand_slug,
                          logo_url: coupon.brand_logo_url
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Discounts Section */}
              {discounts.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-heading font-bold mb-4">
                    İndirimler ({discounts.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discounts.map((discount) => (
                      <DiscountCard 
                        key={discount.id} 
                        discount={discount}
                        brand={{
                          name: discount.brand_name,
                          slug: discount.brand_slug,
                          logo_url: discount.brand_logo_url
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Related Pages */}
          {related_pages && related_pages.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h3 className="text-lg font-heading font-bold mb-4">İlgili Sayfalar</h3>
              <div className="flex flex-wrap gap-2">
                {related_pages.map((page, index) => (
                  <Link
                    key={index}
                    to={`/${page.slug}`}
                    className="px-4 py-2 bg-muted/50 hover:bg-muted rounded-lg text-sm hover:text-primary transition-colors"
                  >
                    {page.name} İndirimleri
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default ProgrammaticSeoPage;
