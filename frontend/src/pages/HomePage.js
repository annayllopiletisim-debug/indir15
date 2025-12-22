import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import HeroSlider from '../components/HeroSlider';
import BrandCard from '../components/BrandCard';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';
import { ChevronRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const [slides, setSlides] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState({ coupons: [], discounts: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, brandsRes, categoriesRes, expiringSoonRes] = await Promise.all([
          axios.get(`${API}/hero-slides`),
          axios.get(`${API}/brands`),
          axios.get(`${API}/categories`),
          axios.get(`${API}/expiring-soon`),
        ]);
        
        setSlides(slidesRes.data);
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
        setExpiringSoon(expiringSoonRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  // Get brand map for quick lookup
  const brandMap = brands.reduce((acc, brand) => {
    acc[brand.id] = brand;
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>SavvySaver - En Güncel Kupon ve İndirimler</title>
        <meta name="description" content="En güncel kupon kodları ve indirimlerle tasarruf edin. Yüzlerce marka ve binlerce kampanya tek bir yerde!" />
      </Helmet>

      <div className="min-h-screen" data-testid="home-page">
        <HeroSlider slides={slides} />

        {/* Expiring Soon Section */}
        {expiringSoon.total > 0 && (
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-orange-500/20">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-heading font-bold flex items-center gap-2">
                  🔥 Son 24 Saat!
                </h2>
                <p className="text-muted-foreground text-sm">Kaçırmayın, süresi dolmak üzere!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiringSoon.coupons.slice(0, 3).map((coupon) => (
                <CouponCard 
                  key={coupon.id} 
                  coupon={coupon} 
                  brand={brandMap[coupon.brand_id] || { name: coupon.brand_name, slug: coupon.brand_slug }} 
                />
              ))}
              {expiringSoon.discounts.slice(0, 3).map((discount) => (
                <DiscountCard 
                  key={discount.id} 
                  discount={discount} 
                  brand={brandMap[discount.brand_id] || { name: discount.brand_name, slug: discount.brand_slug }} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Popular Stores */}
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-2">Popüler Mağazalar</h2>
              <p className="text-muted-foreground text-sm">En çok tercih edilen markalar</p>
            </div>
            <Link
              to="/magazalar"
              className="flex items-center space-x-2 text-neon-purple hover:text-neon-pink transition-colors"
              data-testid="view-all-stores-link"
            >
              <span>Tümünü Gör</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.slice(0, 12).map((brand, index) => (
              <BrandCard key={brand.id} brand={brand} index={index} />
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-8">Kategoriler</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/kategori/${category.slug}`}
                  className="group p-6 glass-effect rounded-2xl hover:border-neon-purple/50 transition-all"
                  data-testid={`category-card-${category.slug}`}
                >
                  <h3 className="text-lg font-heading font-bold group-hover:text-gradient transition-all">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Submit Coupon CTA */}
        <div className="container mx-auto px-4 py-12 lg:py-16 text-center">
          <div className="max-w-2xl mx-auto glass-effect p-8 lg:p-12 rounded-3xl">
            <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-4 text-gradient">
              Kuponunuz mu Var?
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              Paylaşın, diğer kullanıcılar da faydalanıp tasarruf etsin!
            </p>
            <a
              href="https://forms.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium text-base hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
              data-testid="submit-coupon-cta"
            >
              Kupon Gönder
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
