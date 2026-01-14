import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Giveaway, Category } from '@/lib/models';
import { getImageUrl, isInternalUpload } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { addUtmParams } from '@/lib/utm';
import { Tag, Ticket, Gift, ExternalLink, TrendingUp } from 'lucide-react';
import DealCard from '@/components/DealCard';
import CouponCard from '@/components/CouponCard';
import BrandDealsFilter from '@/components/BrandDealsFilter';
import FeaturedDealCard from '@/components/FeaturedDealCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const brand = await Brand.findOne({ slug }).lean();
  
  if (!brand) return { title: 'Mağaza Bulunamadı' };
  
  return {
    title: `${(brand as any).name} İndirim ve Kupon Kodları`,
    description: `${(brand as any).name} mağazasının en güncel indirim kampanyaları, kupon kodları ve çekiliş fırsatları. ${(brand as any).description || ''}`,
    alternates: {
      canonical: `/magaza/${slug}`,
    },
    openGraph: {
      title: `${(brand as any).name} İndirim ve Kuponları`,
      description: `${(brand as any).name} - En güncel fırsatları kaçırmayın!`,
      images: (brand as any).logo_url ? [getImageUrl((brand as any).logo_url)] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

async function getBrandData(slug: string) {
  await connectDB();
  
  const brand = await Brand.findOne({ slug }).lean();
  if (!brand) return null;
  
  const brandId = (brand as any).id;
  const categoryIds = (brand as any).category_ids || [];
  
  const now = new Date();
  
  const [discounts, coupons, giveaways] = await Promise.all([
    Discount.find({ 
      brand_id: brandId,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
        { expiry_date: '' }
      ]
    }).sort({ created_at: -1 }).lean(),
    Coupon.find({ 
      brand_id: brandId, 
      is_active: true,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
        { expiry_date: '' }
      ]
    }).sort({ created_at: -1 }).lean(),
    Giveaway.find({ 
      brand_id: brandId,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
        { expiry_date: '' }
      ]
    }).sort({ created_at: -1 }).lean(),
  ]);
  
  // If no deals, get popular deals from same category
  let popularDeals: any[] = [];
  if (discounts.length === 0 && coupons.length === 0 && giveaways.length === 0 && categoryIds.length > 0) {
    // Get brands in same category
    const sameCategoryBrands = await Brand.find({
      category_ids: { $in: categoryIds },
      id: { $ne: brandId }
    }).select('id name slug logo_url').limit(20).lean();
    
    const sameCategoryBrandIds = sameCategoryBrands.map((b: any) => b.id);
    const brandMap = new Map(sameCategoryBrands.map((b: any) => [b.id, b]));
    
    // Get popular discounts from these brands
    const popularDiscounts = await Discount.find({
      brand_id: { $in: sameCategoryBrandIds },
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
        { expiry_date: '' }
      ]
    }).sort({ click_count: -1, created_at: -1 }).limit(8).lean();
    
    popularDeals = popularDiscounts.map((d: any) => ({
      ...d,
      _id: d._id?.toString(),
      brand: brandMap.get(d.brand_id) || null,
    }));
  }
  
  return {
    brand: { ...(brand as any), _id: (brand as any)._id?.toString() },
    discounts: discounts.map((d: any) => ({ ...d, _id: d._id?.toString() })),
    coupons: coupons.map((c: any) => ({ ...c, _id: c._id?.toString() })),
    giveaways: giveaways.map((g: any) => ({ ...g, _id: g._id?.toString() })),
    popularDeals,
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const data = await getBrandData(slug);
  
  if (!data) notFound();
  
  const { brand, discounts, coupons, giveaways, popularDeals } = data;
  const totalDeals = discounts.length + coupons.length + giveaways.length;
  const destinationUrl = brand.affiliate_url || brand.website_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-center p-2 shadow-sm flex-shrink-0 relative">
              {brand.logo_url ? (
                <Image 
                  src={getImageUrl(brand.logo_url)} 
                  alt={brand.name} 
                  fill
                  sizes="96px"
                  className="object-contain p-2" 
                />
              ) : (
                <span className="text-4xl font-bold text-gray-300">{brand.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
              <p className="text-gray-600 mb-3">{brand.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {totalDeals} Aktif Fırsat
                </span>
                {destinationUrl && (
                  <a 
                    href={addUtmParams(destinationUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors text-sm"
                  >
                    Mağazaya Git <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Discounts with Filter */}
        {discounts.length > 0 && (
          <BrandDealsFilter 
            discounts={discounts} 
            coupons={coupons}
            giveaways={giveaways}
            brand={brand} 
          />
        )}

        {totalDeals === 0 && (
          <div className="space-y-8">
            {/* No deals message */}
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-600 text-lg">
                Şu an <strong>{brand.name}</strong> mağazasının aktif indirimi bulunmuyor.
              </p>
              <p className="text-gray-500 mt-2">Benzer kategorideki popüler indirimleri inceleyin.</p>
            </div>

            {/* Popular deals from same category */}
            {popularDeals.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-800">Popüler İndirimler</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {popularDeals.map((deal: any) => {
                    const shortId = getShortId(deal.id);
                    const dealSlug = generateSlug(deal.title);
                    const detailHref = deal.brand?.slug 
                      ? `/magaza/${deal.brand.slug}/indirim/${dealSlug}-${shortId}` 
                      : '#';
                    return (
                      <FeaturedDealCard
                        key={deal.id}
                        deal={deal}
                        detailHref={detailHref}
                      />
                    );
                  })}
                </div>
                <div className="text-center mt-6">
                  <Link
                    href="/en-cok-tiklanan"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Tüm Popüler İndirimleri Gör
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
