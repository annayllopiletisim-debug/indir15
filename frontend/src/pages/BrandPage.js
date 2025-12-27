import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import GiveawayCard from '../components/GiveawayCard';
import BrandLogo from '../components/BrandLogo';
import { Smartphone, Download, Gift } from 'lucide-react';
import { trackClick } from '../utils/helpers';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandPage = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await axios.get(`${API}/brands/${slug}`);
        const brandData = brandRes.data;
        setBrand(brandData);

        const [couponsRes, discountsRes, giveawaysRes] = await Promise.all([
          axios.get(`${API}/coupons?brand_id=${brandData.id}`),
          axios.get(`${API}/discounts?brand_id=${brandData.id}`),
          axios.get(`${API}/giveaways?brand_id=${brandData.id}`),
        ]);

        setCoupons(couponsRes.data);
        setDiscounts(discountsRes.data);
        setGiveaways(giveawaysRes.data);
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

  const allItems = [...coupons, ...discounts, ...giveaways].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const metaTitle = brand.meta_title || `${brand.name} Kupon ve İndirimler - İndirim Keşfet`;
  const metaDescription = brand.meta_description || `${brand.name} için en güncel kupon kodları ve indirimler. Hemen tasarruf etmeye başlayın!`;

  // Calculate tab count: Kuponlar, İndirimler, Çekilişler + App (if enabled)
  const tabCount = 4 + (brand.app_install_enabled ? 1 : 0);

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
          <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="flex items-center space-x-6">
              <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="lg" />
              <div>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold mb-2">{brand.name}</h1>
                {brand.description && (
                  <p className="text-base text-muted-foreground">{brand.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full max-w-3xl mx-auto mb-8`} style={{ gridTemplateColumns: `repeat(${tabCount}, 1fr)` }} data-testid="brand-tabs">
              <TabsTrigger value="all" data-testid="tab-all" className="text-sm font-semibold">
                Tümü <span className="ml-1.5 px-2 py-0.5 rounded-full bg-accent/20 text-xs font-bold">{allItems.length}</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" data-testid="tab-coupons" className="text-sm font-semibold">
                Kuponlar <span className="ml-1.5 px-2 py-0.5 rounded-full bg-neon-purple/20 text-xs font-bold">{coupons.length}</span>
              </TabsTrigger>
              <TabsTrigger value="discounts" data-testid="tab-discounts" className="text-sm font-semibold">
                İndirimler <span className="ml-1.5 px-2 py-0.5 rounded-full bg-neon-blue/20 text-xs font-bold">{discounts.length}</span>
              </TabsTrigger>
              {brand.app_install_enabled && (
                <TabsTrigger value="app" data-testid="tab-app" className="text-sm font-semibold">
                  App
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <h2 className="text-xl font-heading font-bold mb-4">Tüm Teklifler</h2>
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
              <h2 className="text-xl font-heading font-bold mb-4">Kupon Kodları</h2>
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
              <h2 className="text-xl font-heading font-bold mb-4">İndirimler</h2>
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
                  <h2 className="text-xl font-heading font-bold mb-6 text-center">Mobil Uygulamayı İndir</h2>
                  <div className="glass-effect p-8 rounded-3xl">
                    <div className="text-center mb-8">
                      <Smartphone className="w-16 h-16 mx-auto mb-4 text-neon-purple" />
                      <p className="text-base text-muted-foreground">
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
