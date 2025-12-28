import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Twitter, 
  Youtube, 
  Facebook,
  ChevronDown,
  ChevronUp,
  Shield,
  CheckCircle,
  RefreshCw,
  Mail
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API}/categories/with-stats`);
        setCategories(res.data.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Accordion Section Component for Mobile
  const AccordionSection = ({ title, children, id }) => (
    <div className="border-b border-white/10 lg:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full py-4 flex items-center justify-between text-left lg:hidden"
      >
        <span className="font-semibold text-white">{title}</span>
        {expandedSection === id ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {/* Desktop: Always visible, Mobile: Accordion */}
      <div className={`lg:block ${expandedSection === id ? 'block pb-4' : 'hidden'}`}>
        <h4 className="hidden lg:block text-sm font-bold text-white uppercase tracking-wider mb-4">{title}</h4>
        {children}
      </div>
    </div>
  );

  return (
    <footer className="bg-[#0f0a1a] mt-16">
      {/* ══════════════════════════════════════════════════════════════════
          1. PRE-FOOTER CTA - Newsletter Signup
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-500">
        <div className="container mx-auto px-4 py-8 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h3 className="text-xl lg:text-2xl font-bold mb-1">Fırsatları Kaçırma!</h3>
              <p className="text-white/80 text-sm">Günlük en iyi kuponları e-posta ile al</p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="E-posta adresin"
                className="flex-1 lg:w-80 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. MAIN FOOTER - Navigation Links
      ══════════════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 py-10 lg:py-12">
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          
          {/* Brand Column - Desktop Only */}
          <div className="hidden lg:block">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-heading font-bold">
                <span className="text-primary">İndirim</span>
                <span className="text-white">Keşfet</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Türkiye'nin en güncel kupon ve indirim platformu. 500+ aktif kampanya, 120+ marka ile alışverişte tasarruf edin. 2020'den beri güvenilir kaynak.
            </p>
            {/* Social Media - Desktop */}
            <div className="flex gap-3">
              <a href="https://twitter.com/indirimkesfet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5 text-gray-400" />
              </a>
              <a href="https://instagram.com/indirimkesfet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5 text-gray-400" />
              </a>
              <a href="https://youtube.com/@indirimkesfet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5 text-gray-400" />
              </a>
              <a href="https://facebook.com/indirimkesfet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Kategoriler */}
          <AccordionSection title="Kategoriler" id="kategoriler">
            <ul className="space-y-3">
              {categories.length > 0 ? categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/kategori/${cat.slug}`} className="text-gray-400 hover:text-white transition-colors flex items-center justify-between">
                    <span>{cat.name}</span>
                    {cat.total_deals > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-500">{cat.total_deals}</span>
                    )}
                  </Link>
                </li>
              )) : (
                <>
                  <li><Link to="/kategori/market" className="text-gray-400 hover:text-white transition-colors">Market Kuponları</Link></li>
                  <li><Link to="/kategori/giyim" className="text-gray-400 hover:text-white transition-colors">Giyim İndirimleri</Link></li>
                  <li><Link to="/kategori/elektronik" className="text-gray-400 hover:text-white transition-colors">Elektronik</Link></li>
                  <li><Link to="/kategori/kozmetik" className="text-gray-400 hover:text-white transition-colors">Kozmetik</Link></li>
                </>
              )}
              <li>
                <Link to="/kategoriler" className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                  Tüm Kategoriler →
                </Link>
              </li>
            </ul>
          </AccordionSection>

          {/* Popüler Markalar */}
          <AccordionSection title="Popüler Markalar" id="markalar">
            <ul className="space-y-3">
              <li>
                <Link to="/magaza/migros" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
                  Migros
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500 text-white font-bold">HOT</span>
                </Link>
              </li>
              <li><Link to="/magaza/trendyol" className="text-gray-400 hover:text-white transition-colors">Trendyol</Link></li>
              <li><Link to="/magaza/hepsiburada" className="text-gray-400 hover:text-white transition-colors">Hepsiburada</Link></li>
              <li><Link to="/magaza/a101" className="text-gray-400 hover:text-white transition-colors">A101</Link></li>
              <li><Link to="/magaza/bim" className="text-gray-400 hover:text-white transition-colors">BİM</Link></li>
              <li><Link to="/magaza/lcwaikiki" className="text-gray-400 hover:text-white transition-colors">LC Waikiki</Link></li>
              <li>
                <Link to="/magazalar" className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                  Tüm Markalar →
                </Link>
              </li>
            </ul>
          </AccordionSection>

          {/* Kampanya Türleri */}
          <AccordionSection title="Kampanya Türleri" id="kampanyalar">
            <ul className="space-y-3">
              <li><Link to="/kategoriler" className="text-gray-400 hover:text-white transition-colors">İndirim Kodları</Link></li>
              <li><Link to="/kategoriler" className="text-gray-400 hover:text-white transition-colors">Money Kampanyaları</Link></li>
              <li>
                <Link to="/kategoriler" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
                  Çekilişler
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500 text-white font-bold">YENİ</span>
                </Link>
              </li>
              <li><Link to="/kategoriler" className="text-gray-400 hover:text-white transition-colors">Bedava Kargo</Link></li>
              <li><Link to="/kategoriler" className="text-gray-400 hover:text-white transition-colors">Hediyeli Kampanyalar</Link></li>
              <li><Link to="/son-24-saat" className="text-gray-400 hover:text-white transition-colors">Bugün Bitenler</Link></li>
              <li><Link to="/son-24-saat" className="text-gray-400 hover:text-white transition-colors">Bu Hafta Bitenler</Link></li>
            </ul>
          </AccordionSection>

          {/* Kurumsal */}
          <AccordionSection title="Kurumsal" id="kurumsal">
            <ul className="space-y-3">
              <li><Link to="/hakkimizda" className="text-gray-400 hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link to="/nasil-calisir" className="text-gray-400 hover:text-white transition-colors">Nasıl Çalışır?</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/basin" className="text-gray-400 hover:text-white transition-colors">Basın</Link></li>
              <li><Link to="/iletisim" className="text-gray-400 hover:text-white transition-colors">İletişim</Link></li>
              <li><Link to="/marka-is-birligi" className="text-gray-400 hover:text-white transition-colors">Marka İş Birliği</Link></li>
              <li><Link to="/sss" className="text-gray-400 hover:text-white transition-colors">SSS</Link></li>
            </ul>
          </AccordionSection>
        </div>

        {/* Mobile Social Media */}
        <div className="lg:hidden mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Bizi takip edin</p>
          <div className="flex justify-center gap-4">
            <a href="https://twitter.com/indirimkesfet" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Twitter className="w-5 h-5 text-gray-400" />
            </a>
            <a href="https://instagram.com/indirimkesfet" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Instagram className="w-5 h-5 text-gray-400" />
            </a>
            <a href="https://youtube.com/@indirimkesfet" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Youtube className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. TRUST SIGNALS + STATS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          {/* Desktop Trust Signals */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm">SSL Güvenli</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Doğrulanmış Kuponlar</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <RefreshCw className="w-5 h-5 text-primary" />
                <span className="text-sm">Günlük Güncelleme</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-xs text-gray-500">Aktif Kupon</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">120+</p>
                <p className="text-xs text-gray-500">Marka</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-xs text-gray-500">Kullanıcı</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">4.8</p>
                <p className="text-xs text-gray-500">Puan</p>
              </div>
            </div>
          </div>

          {/* Mobile Trust Signals */}
          <div className="lg:hidden">
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-xs">SSL Güvenli</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-xs">Doğrulanmış</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-xs text-gray-500">Kupon</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">120+</p>
                <p className="text-xs text-gray-500">Marka</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-xs text-gray-500">Kullanıcı</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          4. SEO CONTENT
      ══════════════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <h4 className="font-bold text-white mb-3">Kupon ve İndirim Kodları Hakkında</h4>
          <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-4xl">
            İndirim Keşfet, Türkiye'nin önde gelen marka ve mağazalarından güncel kupon kodları, indirim fırsatları ve kampanyaları bir araya getirir. Migros, Trendyol, Hepsiburada, A101, BİM ve yüzlerce markadan tasarruf fırsatlarını kaçırmayın. Market alışverişinden giyime, elektronikten kozmetiğe tüm kategorilerde en iyi indirimleri bulun.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">kupon kodları</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">indirim kodları</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">migros kupon</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">trendyol indirim</span>
            <span className="hidden sm:inline-block px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">hepsiburada kampanya</span>
            <span className="hidden sm:inline-block px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">market indirimleri</span>
            <span className="hidden lg:inline-block px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">online alışveriş</span>
            <span className="hidden lg:inline-block px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">tasarruf</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          5. LEGAL LINKS + COPYRIGHT
      ══════════════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <p className="text-gray-600 text-sm text-center lg:text-left">
              © 2025 İndirim Keşfet. Tüm hakları saklıdır.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-4 lg:gap-6 text-sm">
              <Link to="/gizlilik" className="text-gray-500 hover:text-gray-300 transition-colors">Gizlilik Politikası</Link>
              <Link to="/kullanim-sartlari" className="text-gray-500 hover:text-gray-300 transition-colors">Kullanım Şartları</Link>
              <Link to="/cerez-politikasi" className="text-gray-500 hover:text-gray-300 transition-colors">Çerez Politikası</Link>
              <Link to="/kvkk" className="text-gray-500 hover:text-gray-300 transition-colors">KVKK</Link>
              <Link to="/site-haritasi" className="text-gray-500 hover:text-gray-300 transition-colors">Site Haritası</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "İndirim Keşfet",
          "url": "https://indirimkesfet.com",
          "description": "Türkiye'nin önde gelen kupon ve indirim platformu",
          "sameAs": [
            "https://twitter.com/indirimkesfet",
            "https://instagram.com/indirimkesfet",
            "https://youtube.com/@indirimkesfet"
          ]
        })
      }} />
    </footer>
  );
};

export default Footer;
