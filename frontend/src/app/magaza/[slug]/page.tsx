import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Giveaway } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { addUtmParams } from '@/lib/utm';
import { Tag, Ticket, Gift, ExternalLink } from 'lucide-react';
import DealCard from '@/components/DealCard';
import CouponCard from '@/components/CouponCard';
import BrandDealsFilter from '@/components/BrandDealsFilter';

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

export const revalidate = 60;

async function getBrandData(slug: string) {
  await connectDB();
  
  const brand = await Brand.findOne({ slug }).lean();
  if (!brand) return null;
  
  const brandId = (brand as any).id;
  
  const now = new Date();
  
  const [discounts, coupons, giveaways] = await Promise.all([
    Discount.find({ 
      brand_id: brandId,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } }
      ]
    }).sort({ created_at: -1 }).lean(),
    Coupon.find({ 
      brand_id: brandId, 
      is_active: true,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } }
      ]
    }).sort({ created_at: -1 }).lean(),
    Giveaway.find({ 
      brand_id: brandId,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } }
      ]
    }).sort({ created_at: -1 }).lean(),
  ]);
  
  return {
    brand: { ...(brand as any), _id: (brand as any)._id?.toString() },
    discounts: discounts.map((d: any) => ({ ...d, _id: d._id?.toString() })),
    coupons: coupons.map((c: any) => ({ ...c, _id: c._id?.toString() })),
    giveaways: giveaways.map((g: any) => ({ ...g, _id: g._id?.toString() })),
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const data = await getBrandData(slug);
  
  if (!data) notFound();
  
  const { brand, discounts, coupons, giveaways } = data;
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
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">Bu mağazada henüz aktif fırsat bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
