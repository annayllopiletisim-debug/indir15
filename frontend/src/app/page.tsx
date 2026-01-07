import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Category } from '@/lib/models';
import { getShortId, generateSlug } from '@/lib/utils';
import { getImageUrl } from '@/lib/image';
import { ArrowRight, Star, Gift, Copy, ExternalLink } from 'lucide-react';
import FeaturedDealCard from '@/components/FeaturedDealCard';
import { addUtmParams } from '@/lib/utm';

export const metadata: Metadata = {
  title: 'İndirim Keşfet - Türkiye\'nin En Güncel Kupon ve İndirim Platformu',
  description: 'Binlerce mağazadan en güncel indirimler, kupon kodları ve çekilişler. İndirim Keşfet ile tasarruf etmeye başlayın!',
};

export const revalidate = 60;

async function getHomeData() {
  await connectDB();
  
  // Get all discounts and coupons to count per brand
  const [allDiscounts, allCoupons] = await Promise.all([
    Discount.find({}).lean(),
    Coupon.find({ is_active: true }).lean(),
  ]);
  
  // Count discounts per brand
  const brandDiscountCount: Record<string, number> = {};
  allDiscounts.forEach((d: any) => {
    if (d.brand_id) {
      brandDiscountCount[d.brand_id] = (brandDiscountCount[d.brand_id] || 0) + 1;
    }
  });
  allCoupons.forEach((c: any) => {
    if (c.brand_id) {
      brandDiscountCount[c.brand_id] = (brandDiscountCount[c.brand_id] || 0) + 1;
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

  // Count deals per category based on brand's category_ids
  const categoryDealCount: Record<string, number> = {};
  const categoryBrandCount: Record<string, number> = {};
  
  enrichedBrands.forEach((brand: any) => {
    if (brand.category_ids && Array.isArray(brand.category_ids)) {
      brand.category_ids.forEach((catId: string) => {
        categoryDealCount[catId] = (categoryDealCount[catId] || 0) + (brand.deal_count || 0);
        categoryBrandCount[catId] = (categoryBrandCount[catId] || 0) + 1;
      });
    }
  });
  
  // Enrich categories with actual deal count from database
  const enrichedCategories = categories.map((c: any) => ({
    ...c,
    _id: c._id?.toString(),
    deal_count: categoryDealCount[c.id] || 0,
    brand_count: categoryBrandCount[c.id] || 0,
  })).filter((c: any) => c.name !== 'Test Kategori');

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
    categories: enrichedCategories,
  };
}

export default async function HomePage() {
  const { brands, discounts, coupons, categories } = await getHomeData();

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="relative mb-2">
                <div className="w-[80px] h-[80px] bg-white rounded-full border-2 border-gray-100 flex items-center justify-center p-4 group-hover:border-purple-400 group-hover:shadow-lg transition-all overflow-hidden">
                  {brand.logo_url ? (
                    <img
                      src={getImageUrl(brand.logo_url)}
                      alt={brand.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-purple-400">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                {brand.deal_count > 0 && (
                  <span className="absolute top-0 right-0 min-w-[24px] h-[24px] px-1.5 flex items-center justify-center bg-purple-600 text-white text-xs font-bold rounded-full border-2 border-white shadow-md">
                    {brand.deal_count}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-center max-w-[80px] truncate text-gray-700 group-hover:text-purple-600">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.slice(0, 9).map((discount: any) => {
            const shortId = getShortId(discount.id);
            const slug = generateSlug(discount.title);
            const detailHref = discount.brand ? `/magaza/${discount.brand.slug}/indirim/${slug}-${shortId}` : '#';
            return (
              <FeaturedDealCard key={discount.id} deal={discount} detailHref={detailHref} />
            );
          })}
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

// Coupon Card Component
function CouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;
  const destinationUrl = coupon.destination_url || brand?.affiliate_url || brand?.website_url;

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        {brand?.logo_url && (
          <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-1 overflow-hidden">
            <img src={getImageUrl(brand.logo_url)} alt={brand.name} loading="lazy" className="max-w-full max-h-full object-contain" />
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
      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 px-4 py-3 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl text-center font-mono font-bold text-purple-700">
          {coupon.code}
        </code>
        <button className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors" title="Kopyala">
          <Copy className="w-5 h-5" />
        </button>
      </div>
      {destinationUrl && (
        <a 
          href={addUtmParams(destinationUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-sm"
        >
          Mağazaya Git
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </article>
  );
}
