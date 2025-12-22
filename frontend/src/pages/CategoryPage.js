import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import BrandCard from '../components/BrandCard';
import CouponCard from '../components/CouponCard';
import DiscountCard from '../components/DiscountCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [brands, setBrands] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('brands');
  const [notFound, setNotFound] = useState(false);

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
        setBrands(brandsRes.data);

        // Get all coupons and filter by brand_id
        const brandIds = brandsRes.data.map(b => b.id);
        if (brandIds.length > 0) {
          const couponsRes = await axios.get(`${API}/coupons`);
          const discountsRes = await axios.get(`${API}/discounts`);
          
          const categoryCoupons = couponsRes.data.filter(c => brandIds.includes(c.brand_id));
          const categoryDiscounts = discountsRes.data.filter(d => brandIds.includes(d.brand_id));
          
          setCoupons(categoryCoupons);
          setDiscounts(categoryDiscounts);
        }
      } catch (error) {
        console.error('Failed to fetch category data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

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
          <a
            href="/magazalar"
            className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Tüm Mağazalar
          </a>
        </div>
      </div>
    );
  }

  const hasContent = brands.length > 0 || coupons.length > 0 || discounts.length > 0;

  return (
    <>
      <Helmet>
        <title>{category.name} - İndirim Keşfet</title>
        <meta name="description" content={`${category.name} kategorisindeki mağazalar, kuponlar ve indirimler.`} />
      </Helmet>

      <div className="min-h-screen" data-testid="category-page">
        <div className="bg-void-paper dark:bg-void-paper border-b border-white/5">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-4">{category.name}</h1>
            <p className="text-lg text-muted-foreground">
              {brands.length} mağaza, {coupons.length} kupon, {discounts.length} indirim
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {!hasContent ? (
            <div className="text-center py-16">
              <div className="glass-effect p-12 rounded-3xl max-w-2xl mx-auto">
                <h2 className="text-2xl font-heading font-bold mb-4">Henüz İçerik Eklenmedi</h2>
                <p className="text-muted-foreground mb-8">
                  Bu kategoride henüz mağaza veya kampanya bulunmuyor. Yakında eklenecek!
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="/magazalar"
                    className="px-6 py-3 bg-void-subtle rounded-lg hover:bg-white/10 transition-all"
                  >
                    Tüm Mağazalar
                  </a>
                  <a
                    href="/"
                    className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg hover:shadow-lg transition-all"
                  >
                    Anasayfa
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex space-x-2 mb-8 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('brands')}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === 'brands'
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink'
                      : 'bg-void-subtle hover:bg-white/10'
                  }`}
                  data-testid="tab-brands"
                >
                  Mağazalar ({brands.length})
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === 'coupons'
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink'
                      : 'bg-void-subtle hover:bg-white/10'
                  }`}
                  data-testid="tab-coupons"
                >
                  Kuponlar ({coupons.length})
                </button>
                <button
                  onClick={() => setActiveTab('discounts')}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === 'discounts'
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink'
                      : 'bg-void-subtle hover:bg-white/10'
                  }`}
                  data-testid="tab-discounts"
                >
                  İndirimler ({discounts.length})
                </button>
              </div>

              {activeTab === 'brands' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {brands.map((brand, index) => (
                    <BrandCard key={brand.id} brand={brand} index={index} />
                  ))}
                </div>
              )}

              {activeTab === 'coupons' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {coupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} brand={brands.find(b => b.id === coupon.brand_id)} />
                  ))}
                </div>
              )}

              {activeTab === 'discounts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discounts.map((discount) => (
                    <DiscountCard key={discount.id} discount={discount} brand={brands.find(b => b.id === discount.brand_id)} />
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

export default CategoryPage;
