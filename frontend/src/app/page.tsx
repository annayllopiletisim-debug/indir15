import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Category } from '@/lib/models';
import { getShortId, generateSlug } from '@/lib/utils';
import { getImageUrl } from '@/lib/image';
import { addUtmParams } from '@/lib/utm';
import { Search, ArrowRight, Calendar, Star, ChevronRight, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İndirim Keşfet - Türkiye\'nin En Güncel Kupon ve İndirim Platformu',
  description: 'Binlerce mağazadan en güncel indirimler, kupon kodları ve çekilişler. İndirim Keşfet ile tasarruf etmeye başlayın!',
};

export const revalidate = 60;

// Category icons and colors
const categoryConfig: Record<string, { icon: string; color: string }> = {
  'spor': { icon: '⚽', color: 'text-green-600' },
  'moda': { icon: '👗', color: 'text-pink-600' },
  'elektronik': { icon: '📱', color: 'text-blue-600' },
  'gida': { icon: '🍴', color: 'text-orange-600' },
  'banka': { icon: '🏛️', color: 'text-purple-600' },
  'saglik': { icon: '💊', color: 'text-red-600' },
  'egitim': { icon: '📚', color: 'text-yellow-600' },
  'seyahat': { icon: '✈️', color: 'text-cyan-600' },
};

async function getHomeData() {
  await connectDB();
  
  // Get all discounts to count per brand
  const allDiscounts = await Discount.find({}).lean();
  
  // Count discounts per brand
  const brandDiscountCount: Record<string, number> = {};
  allDiscounts.forEach((d: any) => {
    if (d.brand_id) {
      brandDiscountCount[d.brand_id] = (brandDiscountCount[d.brand_id] || 0) + 1;
    }
  });

  const [brands, coupons, categories] = await Promise.all([
    Brand.find({}).limit(30).lean(),
    Coupon.find({ is_active: true }).sort({ created_at: -1 }).limit(6).lean(),
    Category.find({}).sort({ order: 1 }).lean(),
  ]);

  // Enrich brands with actual discount count and sort by it
  const enrichedBrands = brands.map((b: any) => ({
    ...b,
    _id: b._id?.toString(),
    deal_count: brandDiscountCount[b.id] || 0,
  })).sort((a: any, b: any) => b.deal_count - a.deal_count);

  const brandMap = new Map(enrichedBrands.map((b: any) => [b.id, b]));
  
  // Get featured discounts
  const discounts = await Discount.find({ is_featured: true }).sort({ created_at: -1 }).limit(12).lean();
  
  // If not enough featured, get latest ones
  let finalDiscounts = discounts;
  if (discounts.length < 6) {
    finalDiscounts = await Discount.find({}).sort({ created_at: -1 }).limit(12).lean();
  }
  
  const enrichedDiscounts = finalDiscounts.map((d: any) => ({
    ...d,
    _id: d._id?.toString(),
    brand: brandMap.get(d.brand_id) || null,
  }));

  const enrichedCoupons = coupons.map((c: any) => ({
    ...c,
    _id: c._id?.toString(),
    brand: brandMap.get(c.brand_id) || null,
  }));

  return {
    brands: enrichedBrands,
    discounts: enrichedDiscounts,
    coupons: enrichedCoupons,
    categories: categories.map((c: any) => ({ ...c, _id: c._id?.toString() })),
  };
}

export default async function HomePage() {
  const { brands, discounts, coupons, categories } = await getHomeData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Section */}
      <section className="bg-white py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Marka ve kampanya ara..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="bg-white py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-medium"
            >
              <span className="text-lg">📦</span>
              Tümü
            </Link>
            {categories.slice(0, 8).map((category: any) => {
              const config = categoryConfig[category.slug] || { icon: '📁', color: 'text-gray-600' };
              return (
                <Link
                  key={category.id}
                  href={`/kategori/${category.slug}`}
                  className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all font-medium"
                >
                  <span className={`text-lg ${config.color}`}>{config.icon}</span>
                  <span>{category.name}</span>
                  <span className="text-gray-400 text-sm">({category.deal_count || 0})</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popüler Mağazalar */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Popüler Mağazalar</h2>
          <Link href="/magazalar" className="text-gray-500 hover:text-purple-600 flex items-center gap-1 font-medium">
            Tümü <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {brands.filter((b: any) => b.deal_count > 0).map((brand: any) => (
            <Link
              key={brand.id}
              href={`/magaza/${brand.slug}`}
              className="flex-shrink-0 flex flex-col items-center group"
            >
              <div className="relative w-20 h-20 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-center p-2 group-hover:border-purple-300 group-hover:shadow-lg transition-all overflow-visible">
                <span className="text-2xl font-bold text-purple-400">
                  {brand.name.charAt(0)}
                </span>
                {brand.deal_count > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[26px] h-[26px] px-1.5 flex items-center justify-center bg-purple-600 text-white text-xs font-bold rounded-full border-2 border-white shadow-md z-10">
                    {brand.deal_count}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-center mt-2 max-w-[80px] truncate text-gray-700 group-hover:text-purple-600">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Öne Çıkanlar */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-800">Öne Çıkanlar</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {discounts.slice(0, 6).map((discount: any) => (
            <FeaturedDealCard key={discount.id} deal={discount} />
          ))}
        </div>
      </section>

      {/* Kupon Kodları */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">🎁 Kupon Kodları</h2>
            <Link href="/kuponlar" className="text-gray-500 hover:text-purple-600 flex items-center gap-1 font-medium">
              Tümü <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon: any) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="prose prose-purple max-w-none">
          <h2 className="text-2xl font-bold mb-4">İndirim Keşfet ile Tasarruf Edin</h2>
          <p className="text-gray-600">
            İndirim Keşfet, Türkiye'nin en kapsamlı indirim ve kupon platformudur. 
            Yüzlerce mağazadan güncel kampanyaları, özel kupon kodlarını ve çekilişleri 
            tek bir yerde bulabilirsiniz. Her gün güncellenen içeriklerimizle alışveriş 
            yaparken tasarruf etmenize yardımcı oluyoruz.
          </p>
        </div>
      </section>
    </div>
  );
}

// Featured Deal Card - Eski tasarımdaki büyük kartlar
function FeaturedDealCard({ deal }: { deal: any }) {
  const brand = deal.brand;
  const shortId = getShortId(deal.id);
  const slug = generateSlug(deal.title);
  const detailHref = brand ? `/magaza/${brand.slug}/indirim/${slug}-${shortId}` : '#';
  const destinationUrl = deal.destination_url || brand?.affiliate_url || brand?.website_url;

  return (
    <article className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="flex">
        {/* Left Image */}
        <Link href={detailHref} className="w-40 h-48 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden group">
          {deal.image_url ? (
            <img
              src={getImageUrl(deal.image_url)}
              alt={deal.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : brand?.logo_url ? (
            <div className="w-full h-full flex items-center justify-center p-6">
              <img
                src={getImageUrl(brand.logo_url)}
                alt={brand.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl text-purple-300">🏷️</span>
            </div>
          )}
        </Link>

        {/* Right Content */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Brand Info */}
          {brand && (
            <div className="flex items-center gap-3 mb-3">
              {brand.logo_url && (
                <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-1 overflow-hidden">
                  <img 
                    src={getImageUrl(brand.logo_url)} 
                    alt={brand.name} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
              )}
              <span className="text-lg font-bold text-gray-800">{brand.name}</span>
            </div>
          )}

          {/* Discount Badge */}
          {deal.discount_text && (
            <span className="inline-flex self-start px-3 py-1 text-sm font-bold rounded-full bg-green-100 text-green-700 mb-3">
              {deal.discount_text}
            </span>
          )}

          {/* Title */}
          <Link href={detailHref}>
            <h3 className="font-bold text-gray-800 line-clamp-2 mb-auto text-base hover:text-purple-600 transition-colors">
              {deal.title}
            </h3>
          </Link>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            {deal.expiry_date ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">BİTİŞ</span>
                <span className="font-semibold text-gray-700">
                  {new Date(deal.expiry_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Süresiz</span>
            )}
            
            {destinationUrl ? (
              <a 
                href={addUtmParams(destinationUrl)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-5 py-2.5 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                Mağazaya Git
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Link 
                href={detailHref}
                className="flex items-center gap-1 px-5 py-2.5 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                Detaylar
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// Coupon Card Component
function CouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        {brand?.logo_url && (
          <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-1 overflow-hidden">
            <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <div>
          <span className="font-bold text-gray-800">{brand?.name}</span>
          {coupon.discount_text && (
            <span className="block text-sm text-green-600 font-semibold">{coupon.discount_text}</span>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-gray-700 mb-4 line-clamp-2">{coupon.title}</h3>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-4 py-3 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl text-center font-mono font-bold text-purple-700">
          {coupon.code}
        </code>
        <button className="px-5 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
          Kopyala
        </button>
      </div>
    </article>
  );
}
