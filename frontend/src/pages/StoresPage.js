import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Tag } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StoresPage = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // Fetch brands
        const brandsRes = await axios.get(`${API}/brands`);
        const brandsList = brandsRes.data;
        
        // Fetch deal counts for each brand
        const brandsWithDeals = await Promise.all(
          brandsList.map(async (brand) => {
            try {
              const [couponsRes, discountsRes] = await Promise.all([
                axios.get(`${API}/coupons?brand_id=${brand.id}`),
                axios.get(`${API}/discounts?brand_id=${brand.id}`)
              ]);
              const activeCoupons = couponsRes.data.filter(c => c.is_active !== false);
              return {
                ...brand,
                deal_count: activeCoupons.length + discountsRes.data.length
              };
            } catch {
              return { ...brand, deal_count: 0 };
            }
          })
        );
        
        const sortedBrands = brandsWithDeals.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        setBrands(sortedBrands);
        setFilteredBrands(sortedBrands);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

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

  const groupedBrands = filteredBrands.reduce((acc, brand) => {
    const firstLetter = brand.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(brand);
    return acc;
  }, {});

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
        <title>Tüm Mağazalar - indirimliMi</title>
        <meta name="description" content="Tüm mağazaları alfabetik sırayla görüntüleyin ve en güncel kupon ve indirimleri keşfedin." />
      </Helmet>

      <div className="min-h-screen" data-testid="stores-page">
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-4">Tüm Mağazalar</h1>
            <p className="text-lg text-muted-foreground">Yüzlerce marka tek bir yerde</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Mağaza ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                data-testid="stores-search-input"
              />
            </div>
          </div>

          {letters.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Mağaza bulunamadı.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {letters.map((letter) => (
                <div key={letter} className="space-y-4">
                  <h2 className="text-3xl font-heading font-bold text-gradient" data-testid={`letter-${letter}`}>
                    {letter}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedBrands[letter].map((brand) => (
                      <Link
                        key={brand.id}
                        to={`/magaza/${brand.slug}`}
                        className="group glass-effect p-5 rounded-xl hover:border-primary/50 transition-all"
                        data-testid={`store-item-${brand.slug}`}
                      >
                        <div className="flex items-center gap-4">
                          <BrandLogo logoUrl={brand.logo_url} brandName={brand.name} size="md" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {brand.name}
                            </h3>
                            {brand.deal_count > 0 ? (
                              <p className="text-sm text-primary flex items-center gap-1 mt-1">
                                <Tag className="w-3.5 h-3.5" />
                                <span>{brand.deal_count} aktif indirim</span>
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">
                                Henüz indirim yok
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StoresPage;
