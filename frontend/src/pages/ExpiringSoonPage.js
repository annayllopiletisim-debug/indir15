import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import { Clock, Flame, AlertCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ExpiringSoonPage = () => {
  const [data, setData] = useState({ coupons: [], discounts: [], total: 0 });
  const [brands, setBrands] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expiringSoonRes, brandsRes] = await Promise.all([
          axios.get(`${API}/expiring-soon`),
          axios.get(`${API}/brands`),
        ]);
        
        setData(expiringSoonRes.data);
        
        // Create brand map for quick lookup
        const brandMap = brandsRes.data.reduce((acc, brand) => {
          acc[brand.id] = brand;
          return acc;
        }, {});
        setBrands(brandMap);
      } catch (error) {
        console.error('Failed to fetch expiring soon data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 5 minutes to keep it updated
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  const allItems = [
    ...data.coupons.map(c => ({ ...c, type: 'coupon' })),
    ...data.discounts.map(d => ({ ...d, type: 'discount' }))
  ].sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

  return (
    <>
      <Helmet>
        <title>Son 24 Saatte Bitecek İndirimler | İndirim Keşfet</title>
        <meta name="description" content="Son 24 saat içinde bitecek kupon kodları, indirimler ve kampanyalar. Kaçırmadan hemen kullanın!" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen" data-testid="expiring-soon-page">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-orange-500/20 animate-pulse">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold flex items-center gap-3">
                  <span className="text-gradient">⏰ Son 24 Saat</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Bu fırsatlar çok yakında bitiyor!
                </p>
              </div>
            </div>
            
            {data.total > 0 && (
              <div className="flex items-center gap-2 mt-6">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-lg">
                  <span className="font-bold text-orange-500">{data.total}</span> fırsat son 24 saat içinde bitiyor
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-12">
          {allItems.length > 0 ? (
            <>
              {/* Countdown Info */}
              <div className="glass-effect rounded-xl p-4 mb-8 flex items-center gap-3 border-l-4 border-orange-500">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Aşağıdaki fırsatlar <span className="text-foreground font-medium">önümüzdeki 24 saat içinde</span> sona erecek. 
                  Kaçırmamak için hemen kullanın!
                </p>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allItems.map((item) => {
                  const brand = brands[item.brand_id] || { 
                    name: item.brand_name, 
                    slug: item.brand_slug,
                    logo_url: item.brand_logo_url
                  };
                  
                  if (item.type === 'coupon') {
                    return (
                      <CouponCard
                        key={`coupon-${item.id}`}
                        coupon={item}
                        brand={brand}
                      />
                    );
                  }
                  return (
                    <DiscountCard
                      key={`discount-${item.id}`}
                      discount={item}
                      brand={brand}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-muted/50 inline-block mb-6">
                <Clock className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-3">
                Şu an acil biten fırsat yok
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Son 24 saat içinde bitecek bir indirim veya kupon bulunmuyor. 
                Yeni fırsatlar için daha sonra tekrar kontrol edin.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpiringSoonPage;
