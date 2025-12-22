import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StoresPage = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${API}/brands`);
        const sortedBrands = response.data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
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
        <title>Tüm Mağazalar - SavvySaver</title>
        <meta name="description" content="Tüm mağazaları alfabetik sırayla görüntüleyin ve en güncel kupon ve indirimleri keşfedin." />
      </Helmet>

      <div className="min-h-screen" data-testid="stores-page">
        <div className="bg-void-paper border-b border-white/5">
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
                className="w-full pl-12 pr-4 py-4 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-purple"
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
                        className="group glass-effect p-6 rounded-xl hover:border-neon-purple/50 transition-all"
                        data-testid={`store-item-${brand.slug}`}
                      >
                        <div className="flex items-center space-x-4">
                          {brand.logo_url ? (
                            <div className="w-12 h-12 rounded-lg bg-void-subtle p-2 flex items-center justify-center flex-shrink-0">
                              <img src={brand.logo_url} alt={brand.name} className="max-w-full max-h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-heading font-bold">
                                {brand.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium group-hover:text-gradient transition-all">{brand.name}</h3>
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