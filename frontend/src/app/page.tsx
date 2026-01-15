import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import { Brand, Discount, Category } from '@/lib/models';
import { getShortId, generateSlug } from '@/lib/utils';
import { getImageUrl, isInternalUpload } from '@/lib/image';
import { ArrowRight, Star } from 'lucide-react';
import FeaturedDealCard from '@/components/FeaturedDealCard';

export const metadata: Metadata = {
  title: 'İndirim Keşfet - Türkiye\'nin En Güncel Kupon ve İndirim Platformu',
  description: 'Binlerce mağazadan en güncel indirimler, kupon kodları ve çekilişler. İndirim Keşfet ile tasarruf etmeye başlayın!',
};

// Force dynamic rendering for homepage - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomeData() {
  try {
    const conn = await connectDB();
    // If connection is null (build phase), return empty data
    if (!conn) {
      return { brands: [], discounts: [], categories: [] };
    }
    const now = new Date();
    
    // Count deals per brand using aggregation (optimized)
    const [discountCounts, couponCounts] = await Promise.all([
      Discount.aggregate([
        { $match: {
          $or: [
            { expiry_date: { $gte: now } },
            { expiry_date: null },
            { expiry_date: { $exists: false } },
            { expiry_date: '' }
          ]
        }},
        { $group: { _id: '$brand_id', count: { $sum: 1 } } }
      ]),
      (await import('@/lib/models')).Coupon.aggregate([
        { $match: { 
          is_active: true,
          $or: [
            { expiry_date: { $gte: now } },
            { expiry_date: null },
            { expiry_date: { $exists: false } },
            { expiry_date: '' }
          ]
        }},
        { $group: { _id: '\$brand_id', count: { $sum: 1 } } }
      ]),
    ]);
    
    // Build count map from aggregation results
    const brandDiscountCount: Record<string, number> = {};
    discountCounts.forEach((d: any) => {
      if (d._id) brandDiscountCount[d._id] = (brandDiscountCount[d._id] || 0) + d.count;
    });
    couponCounts.forEach((c: any) => {
      if (c._id) brandDiscountCount[c._id] = (brandDiscountCount[c._id] || 0) + c.count;
    });

    const [brands, categories] = await Promise.all([
      Brand.find({}).select('id name slug logo_url category_ids deal_count default_deal_image').limit(30).lean(),
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
    
    // Get featured discounts (only active ones)
    const discounts = await Discount.find({ 
      is_featured: true,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
        { expiry_date: '' }
      ]
    }).sort({ created_at: -1 }).limit(12).lean();
    
    // If not enough featured, get latest active ones
    let finalDiscounts = discounts;
    if (discounts.length < 6) {
      finalDiscounts = await Discount.find({
        $or: [
          { expiry_date: { $gte: now } },
          { expiry_date: null },
          { expiry_date: { $exists: false } },
          { expiry_date: '' }
        ]
      }).sort({ created_at: -1 }).limit(12).lean();
    }
    
    const enrichedDiscounts = finalDiscounts.map((d: any) => ({
      ...d,
      _id: d._id?.toString(),
      brand: brandMap.get(d.brand_id) || null,
    }));

    return {
      brands: enrichedBrands,
      discounts: enrichedDiscounts,
      categories: enrichedCategories,
    };
  } catch (error) {
    // Return empty data if DB is not available (during build)
    console.error('Failed to fetch home data:', error);
    return {
      brands: [],
      discounts: [],
      categories: [],
    };
  }
}

export default async function HomePage() {
  const { brands, discounts, categories } = await getHomeData();

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
                <div className="w-[80px] h-[80px] bg-white rounded-full border-2 border-gray-100 flex items-center justify-center p-4 group-hover:border-purple-400 group-hover:shadow-lg transition-all overflow-hidden relative">
                  {brand.logo_url ? (
                    <Image
                      src={getImageUrl(brand.logo_url)}
                      alt={brand?.name || 'Mağaza'}
                      fill
                      sizes="80px"
                      unoptimized={isInternalUpload(brand.logo_url)}
                      className="object-contain p-3"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-purple-400">
                      {brand?.name?.charAt(0) || '?'}
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
                {brand?.name || 'Mağaza'}
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

      {/* Kupon Kodları - REMOVED */}

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
