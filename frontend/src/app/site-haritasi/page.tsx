import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand, Category, BlogPost, Discount, Coupon } from '@/lib/models';
import { 
  Map, Home, Store, Tag, Ticket, Gift, FileText, Mail, Shield, 
  Clock, History, Flame, Search, ChevronRight, Layers, BookOpen
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Site Haritası',
  description: 'İndirimKeşfet.com site haritası - Tüm sayfalar, kategoriler, mağazalar ve içeriklere hızlı erişim.',
  alternates: {
    canonical: '/site-haritasi',
  },
  openGraph: {
    title: 'Site Haritası | İndirim Keşfet',
    description: 'Tüm sayfalara, kategorilere ve mağazalara hızlı erişim.',
  },
};

export const revalidate = 3600; // Her saat başı yenile

async function getSiteMapData() {
  await connectDB();
  const now = new Date();
  
  const [categories, brands, blogPosts, discountCount, couponCount] = await Promise.all([
    Category.find({}).sort({ order: 1, name: 1 }).lean(),
    Brand.find({}).sort({ name: 1 }).lean(),
    BlogPost.find({ is_published: true }).sort({ published_at: -1 }).select('title slug').lean(),
    Discount.countDocuments({
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } }
      ]
    }),
    Coupon.countDocuments({ 
      is_active: true,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } }
      ]
    }),
  ]);

  return {
    categories: categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
    })),
    brands: brands.map((b: any) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
    })),
    blogPosts: blogPosts.map((p: any) => ({
      title: p.title,
      slug: p.slug,
    })),
    stats: {
      discountCount,
      couponCount,
      brandCount: brands.length,
      categoryCount: categories.length,
      blogCount: blogPosts.length,
    },
  };
}

// JSON-LD for SiteNavigationElement
function SiteNavigationSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      'position': index + 1,
      'name': item.name,
      'url': item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function SiteMapPage() {
  const { categories, brands, blogPosts, stats } = await getSiteMapData();

  // Ana sayfa navigasyon öğeleri
  const mainNavItems = [
    { name: 'Ana Sayfa', url: 'https://indirimkesfet.com/' },
    { name: 'İndirimler', url: 'https://indirimkesfet.com/indirimler' },
    { name: 'Kuponlar', url: 'https://indirimkesfet.com/kuponlar' },
    { name: 'Mağazalar', url: 'https://indirimkesfet.com/magazalar' },
    { name: 'Kategoriler', url: 'https://indirimkesfet.com/kategoriler' },
    { name: 'Blog', url: 'https://indirimkesfet.com/blog' },
    ...categories.map((c: any) => ({ name: c.name, url: `https://indirimkesfet.com/kategori/${c.slug}` })),
  ];

  // Alfabetik marka grupları
  const brandsByLetter = brands.reduce((acc: Record<string, typeof brands>, brand) => {
    const letter = brand.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {});

  const alphabet = Object.keys(brandsByLetter).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Structured Data */}
      <SiteNavigationSchema items={mainNavItems} />

      {/* Header */}
      <section className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Map className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Site Haritası</h1>
          </div>
          <p className="text-purple-200">
            Tüm sayfalara, kategorilere ve mağazalara hızlı erişim
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {stats.brandCount} Mağaza
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {stats.categoryCount} Kategori
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {stats.discountCount} İndirim
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {stats.couponCount} Kupon
            </span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Kolon - Ana Sayfalar */}
          <div className="space-y-6">
            {/* Ana Sayfalar */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-600" />
                Ana Sayfalar
              </h2>
              <nav aria-label="Ana sayfalar">
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <ChevronRight className="w-4 h-4" />
                      Ana Sayfa
                    </Link>
                  </li>
                  <li>
                    <Link href="/indirimler" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <ChevronRight className="w-4 h-4" />
                      Tüm İndirimler
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{stats.discountCount}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/kuponlar" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <ChevronRight className="w-4 h-4" />
                      Kupon Kodları
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{stats.couponCount}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/magazalar" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <ChevronRight className="w-4 h-4" />
                      Tüm Mağazalar
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{stats.brandCount}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/kategoriler" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <ChevronRight className="w-4 h-4" />
                      Kategoriler
                    </Link>
                  </li>
                </ul>
              </nav>
            </section>

            {/* Özel Sayfalar */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Özel Sayfalar
              </h2>
              <nav aria-label="Özel sayfalar">
                <ul className="space-y-2">
                  <li>
                    <Link href="/bitmek-uzere" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <Clock className="w-4 h-4 text-red-500" />
                      Bitmek Üzere Olan Fırsatlar
                    </Link>
                  </li>
                  <li>
                    <Link href="/son-24-saat" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Son 24 Saat
                    </Link>
                  </li>
                  <li>
                    <Link href="/gecmis-indirimler" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <History className="w-4 h-4 text-gray-500" />
                      Geçmiş İndirimler
                    </Link>
                  </li>
                  <li>
                    <Link href="/ara" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <Search className="w-4 h-4 text-blue-500" />
                      Arama
                    </Link>
                  </li>
                </ul>
              </nav>
            </section>

            {/* Bilgi Sayfaları */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Bilgi Sayfaları
              </h2>
              <nav aria-label="Bilgi sayfaları">
                <ul className="space-y-2">
                  <li>
                    <Link href="/blog" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <BookOpen className="w-4 h-4" />
                      Blog
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{stats.blogCount}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/iletisim" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <Mail className="w-4 h-4" />
                      İletişim
                    </Link>
                  </li>
                  <li>
                    <Link href="/gizlilik" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <Shield className="w-4 h-4" />
                      Gizlilik Politikası
                    </Link>
                  </li>
                  <li>
                    <Link href="/kvkk" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1">
                      <Shield className="w-4 h-4" />
                      KVKK Aydınlatma Metni
                    </Link>
                  </li>
                </ul>
              </nav>
            </section>

            {/* Kategoriler */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Kategoriler ({stats.categoryCount})
              </h2>
              <nav aria-label="Kategoriler">
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link 
                        href={`/kategori/${category.slug}`} 
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors py-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </section>
          </div>

          {/* Sağ Kolon - Mağazalar (A-Z) */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                Tüm Mağazalar (A-Z)
              </h2>
              
              {/* Alfabe Navigasyonu */}
              <div className="flex flex-wrap gap-1 mb-6 pb-4 border-b border-gray-100">
                {alphabet.map((letter) => (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-purple-100 hover:text-purple-600 text-gray-600 font-medium text-sm transition-colors"
                  >
                    {letter}
                  </a>
                ))}
              </div>

              {/* Mağaza Listesi */}
              <nav aria-label="Mağazalar">
                <div className="space-y-6">
                  {alphabet.map((letter) => (
                    <div key={letter} id={`letter-${letter}`} className="scroll-mt-4">
                      <h3 className="text-xl font-bold text-purple-600 mb-3 pb-2 border-b border-purple-100">
                        {letter}
                      </h3>
                      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {brandsByLetter[letter].map((brand) => (
                          <li key={brand.id}>
                            <Link
                              href={`/magaza/${brand.slug}`}
                              className="text-gray-600 hover:text-purple-600 transition-colors text-sm py-1 block truncate"
                            >
                              {brand.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </nav>
            </section>

            {/* Blog Yazıları */}
            {blogPosts.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Blog Yazıları ({stats.blogCount})
                </h2>
                <nav aria-label="Blog yazıları">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {blogPosts.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-gray-600 hover:text-purple-600 transition-colors text-sm py-1 block"
                        >
                          <ChevronRight className="w-4 h-4 inline mr-1" />
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </section>
            )}
          </div>
        </div>

        {/* XML Sitemap Link */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Arama motorları için XML site haritası:{' '}
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              className="text-purple-600 hover:underline"
            >
              sitemap.xml
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
