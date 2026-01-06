import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Category } from '@/lib/models';
import { getShortId, generateSlug } from '@/lib/utils';
import { getImageUrl } from '@/lib/image';
import { Flame, Tag, Gift, ArrowRight, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İndirim Keşfet - Türkiye\'nin En Güncel Kupon ve İndirim Platformu',
  description: 'Binlerce mağazadan en güncel indirimler, kupon kodları ve çekilişler. İndirim Keşfet ile tasarruf etmeye başlayın!',
};

// SSR - Her istekte veritabanından taze veri çek
export const revalidate = 60; // 60 saniyede bir yenile

async function getHomeData() {
  await connectDB();
  
  const [brands, discounts, coupons, categories] = await Promise.all([
    Brand.find({}).sort({ deal_count: -1 }).limit(30).lean(),
    Discount.find({}).sort({ created_at: -1 }).limit(12).lean(),
    Coupon.find({ is_active: true }).sort({ created_at: -1 }).limit(6).lean(),
    Category.find({}).sort({ order: 1 }).lean(),
  ]);

  // Brand bilgilerini discount'lara ekle
  const brandMap = new Map(brands.map((b: any) => [b.id, b]));
  
  const enrichedDiscounts = discounts.map((d: any) => ({
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
    brands: brands.map((b: any) => ({ ...b, _id: b._id?.toString() })),
    discounts: enrichedDiscounts,
    coupons: enrichedCoupons,
    categories: categories.map((c: any) => ({ ...c, _id: c._id?.toString() })),
  };
}

export default async function HomePage() {
  const { brands, discounts, coupons, categories } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Türkiye'nin En Güncel{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              İndirim Platformu
            </span>
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Binlerce mağazadan en iyi fırsatları keşfedin
          </p>
          
          {/* Category Pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.slice(0, 8).map((category: any) => (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="flex-shrink-0 px-4 py-2 rounded-full bg-white border border-border hover:border-primary/50 hover:shadow-md transition-all text-sm font-medium"
              >
                {category.icon} {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popüler Mağazalar */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Popüler Mağazalar</h2>
          <Link href="/magazalar" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            Tümü <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {brands.map((brand: any) => (
            <Link
              key={brand.id}
              href={`/magaza/${brand.slug}`}
              className="flex-shrink-0 flex flex-col items-center group"
            >
              <div className="w-[72px] h-[72px] bg-white rounded-xl border border-gray-200 flex items-center justify-center p-1.5 group-hover:border-primary/50 group-hover:shadow-lg transition-all overflow-hidden relative">
                {brand.logo_url ? (
                  <img
                    src={getImageUrl(brand.logo_url)}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    {brand.name.charAt(0)}
                  </span>
                )}
                {brand.deal_count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full border-2 border-white shadow-sm">
                    {brand.deal_count}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-center mt-1.5 max-w-[72px] truncate">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* İndirimler */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Güncel İndirimler
          </h2>
          <Link href="/indirimler" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            Tümü <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.map((discount: any) => (
            <DealCard key={discount.id} deal={discount} type="indirim" />
          ))}
        </div>
      </section>

      {/* Kupon Kodları */}
      <section className="container mx-auto px-4 py-6 bg-gradient-to-r from-violet-50 to-purple-50 -mx-4 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Kupon Kodları
            </h2>
            <Link href="/kuponlar" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
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
        <div className="prose prose-violet max-w-none">
          <h2 className="text-2xl font-bold mb-4">İndirim Keşfet ile Tasarruf Edin</h2>
          <p className="text-muted-foreground">
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

// Deal Card Component
function DealCard({ deal, type }: { deal: any; type: string }) {
  const brand = deal.brand;
  const shortId = getShortId(deal.id);
  const slug = generateSlug(deal.title);
  const href = `/magaza/${brand?.slug}/${type}/${slug}-${shortId}`;

  return (
    <Link href={href} className="block">
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-border p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-violet-100 flex-shrink-0">
            {deal.image_url || brand?.default_deal_image ? (
              <img
                src={getImageUrl(deal.image_url || brand?.default_deal_image)}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
            ) : brand?.logo_url ? (
              <img
                src={getImageUrl(brand.logo_url)}
                alt={brand.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-violet-400">
                <Tag className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {brand && (
              <div className="flex items-center gap-2 mb-1">
                {brand.logo_url && (
                  <img src={brand.logo_url} alt={brand.name} className="w-6 h-6 rounded object-contain" />
                )}
                <span className="text-sm font-medium truncate">{brand.name}</span>
              </div>
            )}
            {deal.discount_text && (
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-1">
                {deal.discount_text}
              </span>
            )}
            <h3 className="font-semibold text-sm line-clamp-2">{deal.title}</h3>
            {deal.expiry_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Clock className="w-3 h-3" />
                {new Date(deal.expiry_date).toLocaleDateString('tr-TR')}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// Coupon Card Component
function CouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        {brand?.logo_url && (
          <img src={brand.logo_url} alt={brand.name} className="w-10 h-10 rounded-lg object-contain border" />
        )}
        <div>
          <span className="font-medium">{brand?.name}</span>
          {coupon.discount_text && (
            <span className="block text-xs text-green-600 font-semibold">{coupon.discount_text}</span>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-sm mb-3 line-clamp-2">{coupon.title}</h3>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-violet-50 border border-dashed border-violet-300 rounded-lg text-center font-mono font-bold text-violet-700">
          {coupon.code}
        </code>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Kopyala
        </button>
      </div>
    </article>
  );
}
