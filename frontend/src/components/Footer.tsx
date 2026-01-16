'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Shield, Award, Users, Tag, Store, Gift, Mail, CheckCircle } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left font-semibold text-gray-800 hover:text-purple-600 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Bir hata oluştu');
      }
    } catch {
      setStatus('error');
      setMessage('Bir hata oluştu');
    }
    
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 3000);
  };

  const categories = [
    { name: 'Market Kuponları', count: 86, slug: 'market' },
    { name: 'Giyim İndirimleri', count: 54, slug: 'moda' },
    { name: 'Elektronik', count: 32, slug: 'elektronik' },
    { name: 'Kozmetik', count: 28, slug: 'kozmetik' },
  ];

  const popularBrands = [
    { name: 'Trendyol', slug: 'trendyol' },
    { name: 'Hepsiburada', slug: 'hepsiburada' },
    { name: 'Migros', slug: 'migros' },
    { name: 'Karaca', slug: 'karaca' },
    { name: 'LC Waikiki', slug: 'lc-waikiki' },
  ];

  const campaignTypes = [
    { name: 'Kupon Kodları', href: '/kuponlar' },
    { name: 'Ücretsiz Kargo', href: '/ucretsiz-kargo' },
    { name: 'İndirimler', href: '/indirimler' },
    { name: 'Çekilişler', href: '/cekilisler' },
    { name: 'Bitmek Üzere', href: '/bitmek-uzere' },
    { name: 'Geçmiş İndirimler', href: '/gecmis-indirimler' },
  ];

  const corporateLinks = [
    { name: 'İletişim', href: '/iletisim' },
    { name: 'Blog', href: '/blog' },
    { name: 'Reklam Ver', href: '/reklam' },
  ];

  const tags = ['kupon kodları', 'indirim kodları', 'migros kupon', 'trendyol indirim', 'hepsiburada kupon', 'ücretsiz kargo', 'kampanya'];

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Stats Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                <Tag className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">500+</div>
                <div className="text-gray-500 text-sm">Aktif Kupon</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                <Store className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">120+</div>
                <div className="text-gray-500 text-sm">Marka</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">50K+</div>
                <div className="text-gray-500 text-sm">Kullanıcı</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Categories Accordion */}
          <div>
            <Accordion title="Kategoriler" defaultOpen={true}>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link 
                      href={`/kategori/${cat.slug}`}
                      className="flex items-center justify-between text-gray-600 hover:text-purple-600 transition-colors py-1"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link 
                href="/kategoriler" 
                className="inline-flex items-center gap-1 text-purple-600 font-medium mt-3 hover:gap-2 transition-all"
              >
                Tüm Kategoriler <ChevronRight className="w-4 h-4" />
              </Link>
            </Accordion>
          </div>

          {/* Popular Brands Accordion */}
          <div>
            <Accordion title="Popüler Markalar">
              <ul className="space-y-2">
                {popularBrands.map((brand) => (
                  <li key={brand.slug}>
                    <Link 
                      href={`/magaza/${brand.slug}`}
                      className="text-gray-600 hover:text-purple-600 transition-colors py-1 block"
                    >
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link 
                href="/magazalar" 
                className="inline-flex items-center gap-1 text-purple-600 font-medium mt-3 hover:gap-2 transition-all"
              >
                Tüm Mağazalar <ChevronRight className="w-4 h-4" />
              </Link>
            </Accordion>
          </div>

          {/* Campaign Types Accordion */}
          <div>
            <Accordion title="Kampanya Türleri">
              <ul className="space-y-2">
                {campaignTypes.map((type) => (
                  <li key={type.href}>
                    <Link 
                      href={type.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors py-1 block"
                    >
                      {type.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Accordion>
            
            <Accordion title="Kurumsal">
              <ul className="space-y-2">
                {corporateLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors py-1 block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Accordion>
          </div>

          {/* Newsletter & Trust */}
          <div>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">E-Bülten</h4>
              <p className="text-gray-500 text-sm mb-4">
                En güncel kupon ve indirimleri kaçırmayın!
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Gönderiliyor...' : 'Abone Ol'}
                </button>
                {message && (
                  <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                  </p>
                )}
              </form>
            </div>

            {/* Trust Badges */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                <Shield className="w-5 h-5" />
                <span>Güvenli Alışveriş</span>
              </div>
              <ul className="space-y-1.5 text-sm text-green-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>%100 Doğrulanmış Kuponlar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Günlük Güncelleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ücretsiz Kullanım</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600 text-sm max-w-3xl">
            İndirim Keşfet, Türkiye'nin en kapsamlı indirim, kampanya ve kupon kodu platformlarından biridir. Yüzlerce online mağazaya ait güncel indirimler, özel kuponlar, sezonluk kampanyalar ve kaçırılmayacak fırsatlar tek bir adreste toplanır. Her gün düzenli olarak güncellenen içeriklerimiz sayesinde online alışveriş yaparken en avantajlı fiyatlara ulaşabilir, bütçenizi koruyarak tasarruf edebilirsiniz. Trendyol, Hepsiburada, Migros, LC Waikiki ve daha birçok popüler markanın en yeni indirimlerini, kampanya detaylarını ve kupon kodlarını İndirim Keşfet üzerinden güvenle keşfedin.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                İndirim Keşfet
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <Link href="/gizlilik" className="hover:text-purple-600 transition-colors">Gizlilik</Link>
              <span className="text-gray-300">|</span>
              <Link href="/kullanim-kosullari" className="hover:text-purple-600 transition-colors">Kullanım Koşulları</Link>
              <span className="text-gray-300">|</span>
              <Link href="/kvkk" className="hover:text-purple-600 transition-colors">KVKK</Link>
              <span className="text-gray-300">|</span>
              <Link href="/site-haritasi" className="hover:text-purple-600 transition-colors">Site Haritası</Link>
            </div>
            
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} İndirim Keşfet. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
