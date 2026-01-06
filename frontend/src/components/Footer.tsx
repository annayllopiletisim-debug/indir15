import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-violet-900 via-purple-900 to-violet-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">İndirim Keşfet</h3>
            <p className="text-violet-200 text-sm">
              Türkiye'nin en güncel indirim ve kupon platformu. 
              Binlerce mağazadan en iyi fırsatları keşfedin.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2 text-violet-200">
              <li><Link href="/magazalar" className="hover:text-white transition-colors">Mağazalar</Link></li>
              <li><Link href="/kategoriler" className="hover:text-white transition-colors">Kategoriler</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Kategoriler</h4>
            <ul className="space-y-2 text-violet-200">
              <li><Link href="/kategori/moda" className="hover:text-white transition-colors">Moda</Link></li>
              <li><Link href="/kategori/elektronik" className="hover:text-white transition-colors">Elektronik</Link></li>
              <li><Link href="/kategori/ev-yasam" className="hover:text-white transition-colors">Ev & Yaşam</Link></li>
              <li><Link href="/kategori/spor" className="hover:text-white transition-colors">Spor</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Bülten</h4>
            <p className="text-violet-200 text-sm mb-4">
              En güncel fırsatlardan haberdar olun.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-medium transition-colors"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-violet-300 text-sm">
            © {new Date().getFullYear()} İndirim Keşfet. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-violet-300 text-sm">
            <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
