import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import { Smartphone, Download } from 'lucide-react';
import { trackClick } from '../utils/helpers';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandPage = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await axios.get(`${API}/brands/${slug}`);
        const brandData = brandRes.data;
        setBrand(brandData);

        const [couponsRes, discountsRes] = await Promise.all([
          axios.get(`${API}/coupons?brand_id=${brandData.id}`),
          axios.get(`${API}/discounts?brand_id=${brandData.id}`),
        ]);

        setCoupons(couponsRes.data);
        setDiscounts(discountsRes.data);
      } catch (error) {
        console.error('Failed to fetch brand data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleAppClick = (type, url) => {
    if (brand && url) {
      trackClick('app_install', brand.id, brand.id);
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Mağaza bulunamadı</h1>
          <p className="text-muted-foreground">Aradığınız mağaza mevcut değil.</p>
        </div>
      </div>
    );
  }

  const allItems = [...coupons, ...discounts].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const metaTitle = brand.meta_title || `${brand.name} Kupon ve İndirimler - SavvySaver`;
  const metaDescription = brand.meta_description || `${brand.name} için en güncel kupon kodları ve indirimler. Hemen tasarruf etmeye başlayın!`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": brand.name,
            "description": brand.description || metaDescription,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen" data-testid="brand-page">
        <div className="bg-void-paper border-b border-white/5">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center space-x-6">
              {brand.logo_url && (
                <div className="w-24 h-24 rounded-2xl bg-void-subtle p-4 flex items-center justify-center">
                  <img src={brand.logo_url} alt={brand.name} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-2">{brand.name}</h1>
                {brand.description && (
                  <p className="text-lg text-muted-foreground mb-4">{brand.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {coupons.length > 0 && (
                    <div className="px-4 py-2 rounded-full bg-neon-purple/20 border border-neon-purple/50 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium text-neon-purple">{coupons.length} Kupon</span>
                    </div>
                  )}
                  
                  {discounts.length > 0 && (
                    <div className="px-4 py-2 rounded-full bg-neon-blue/20 border border-neon-blue/50 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-neon-blue">{discounts.length} İndirim</span>
                    </div>
                  )}
                  
                  {brand.app_install_enabled && (
                    <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-green-400">Uygulama Var</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto mb-8" data-testid="brand-tabs">
              <TabsTrigger value="all" data-testid="tab-all">
                Tümü <span className="ml-2 text-xs">({allItems.length})</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" data-testid="tab-coupons">
                Kuponlar <span className="ml-2 text-xs">({coupons.length})</span>
              </TabsTrigger>
              <TabsTrigger value="discounts" data-testid="tab-discounts">
                İndirimler <span className="ml-2 text-xs">({discounts.length})</span>
              </TabsTrigger>
              {brand.app_install_enabled && (
                <TabsTrigger value="app" data-testid="tab-app">
                  Uygulama
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <h2 className="text-2xl font-heading font-bold mb-4">Tüm Teklifler</h2>
              {allItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Henüz teklif bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {allItems.map((item) =>
                    item.code ? (
                      <CouponCard key={item.id} coupon={item} brand={brand} />
                    ) : (
                      <DiscountCard key={item.id} discount={item} brand={brand} />
                    )
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="coupons" className="space-y-6">
              <h2 className="text-2xl font-heading font-bold mb-4">Kupon Kodları</h2>
              {coupons.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Henüz kupon bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {coupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} brand={brand} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="discounts" className="space-y-6">
              <h2 className="text-2xl font-heading font-bold mb-4">İndirimler</h2>
              {discounts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Henüz indirim bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discounts.map((discount) => (
                    <DiscountCard key={discount.id} discount={discount} brand={brand} />
                  ))}
                </div>
              )}
            </TabsContent>

            {brand.app_install_enabled && (
              <TabsContent value="app">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-heading font-bold mb-6 text-center">Mobil Uygulamayı İndir</h2>
                  <div className="glass-effect p-8 rounded-3xl">
                    <div className="text-center mb-8">
                      <Smartphone className="w-16 h-16 mx-auto mb-4 text-neon-purple" />
                      <p className="text-lg text-muted-foreground">
                        {brand.name} mobil uygulamasını indirerek özel fırsatlardan yararlanın!
                      </p>
                    </div>
                    <div className="space-y-4">
                      {brand.ios_app_url && (
                        <button
                          onClick={() => handleAppClick('ios', brand.ios_app_url)}
                          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-void-subtle rounded-xl hover:bg-white/5 transition-all"
                          data-testid="ios-app-btn"
                        >
                          <Download className="w-6 h-6" />
                          <div className="text-left">
                            <div className="text-xs text-muted-foreground">iOS için indir</div>
                            <div className="font-medium">App Store</div>
                          </div>
                        </button>
                      )}
                      {brand.android_app_url && (
                        <button
                          onClick={() => handleAppClick('android', brand.android_app_url)}
                          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-void-subtle rounded-xl hover:bg-white/5 transition-all"
                          data-testid="android-app-btn"
                        >
                          <Download className="w-6 h-6" />
                          <div className="text-left">
                            <div className="text-xs text-muted-foreground">Android için indir</div>
                            <div className="font-medium">Google Play</div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default BrandPage;