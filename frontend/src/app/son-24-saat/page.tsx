import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { Flame, Clock, ExternalLink, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Son 24 Saat',
  description: 'Son 24 saat içinde eklenen en yeni indirimler ve kuponlar.',
  alternates: {
    canonical: '/son-24-saat',
  },
};

export const dynamic = 'force-dynamic';

async function getLast24HoursDeals() {
  await connectDB();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const [discounts, coupons, brands] = await Promise.all([
    Discount.find({ created_at: { $gte: yesterday } }).sort({ created_at: -1 }).lean(),
    Coupon.find({ created_at: { $gte: yesterday }, is_active: true }).sort({ created_at: -1 }).lean(),
    Brand.find({}).lean(),
  ]);
  
  const brandMap = new Map(brands.map((b: any) => [b.id, b]));
  
  return {
    discounts: discounts.map((d: any) => ({ ...d, _id: d._id?.toString(), brand: brandMap.get(d.brand_id) })),
    coupons: coupons.map((c: any) => ({ ...c, _id: c._id?.toString(), brand: brandMap.get(c.brand_id) })),
  };
}

export default async function Last24HoursPage() {
  const { discounts, coupons } = await getLast24HoursDeals();
  const totalDeals = discounts.length + coupons.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-10 h-10 text-white" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Son 24 Saat</h1>
          </div>
          <p className="text-white/90 text-lg">Son 24 saat içinde eklenen {totalDeals} yeni fırsat!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {totalDeals === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Son 24 saat içinde yeni fırsat eklenmedi.</p>
          </div>
        ) : (
          <>
            {discounts.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Yeni İndirimler ({discounts.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {discounts.map((discount: any) => (
                    <DealCard key={discount.id} deal={discount} />
                  ))}
                </div>
              </section>
            )}

            {coupons.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Yeni Kuponlar ({coupons.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coupons.map((coupon: any) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DealCard({ deal }: { deal: any }) {
  const brand = deal.brand;
  const shortId = getShortId(deal.id);
  const slug = generateSlug(deal.title);
  const detailHref = brand ? `/magaza/${brand.slug}/indirim/${slug}-${shortId}` : '#';
  const destinationUrl = deal.destination_url || brand?.affiliate_url || brand?.website_url;

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-5 border border-gray-100">
      <div className="flex items-start gap-4">
        {brand?.logo_url && (
          <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-2 overflow-hidden flex-shrink-0 relative">
            <Image 
              src={getImageUrl(brand.logo_url)} 
              alt={brand.name} 
              width={48}
              height={48}
              className="object-contain" 
            />
          </div>
        )}
        <div className="flex-1">
          <Link href={brand ? `/magaza/${brand.slug}` : '#'} className="font-bold text-gray-800 hover:text-purple-600">
            {brand?.name}
          </Link>
          {deal.discount_text && (
            <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">
              {deal.discount_text}
            </span>
          )}
          <Link href={detailHref}>
            <h3 className="font-semibold text-gray-700 mt-1 line-clamp-2 hover:text-purple-600">{deal.title}</h3>
          </Link>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(deal.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {destinationUrl && (
              <a href={destinationUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                Mağazaya Git <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function CouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;

  return (
    <article className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        {brand?.logo_url && (
          <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-1 overflow-hidden relative">
            <Image 
              src={getImageUrl(brand.logo_url)} 
              alt={brand.name} 
              width={36}
              height={36}
              className="object-contain" 
            />
          </div>
        )}
        <span className="font-bold text-gray-800">{brand?.name}</span>
      </div>
      <h3 className="font-medium text-gray-700 text-sm mb-3 line-clamp-2">{coupon.title}</h3>
      <code className="block w-full px-3 py-2 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg text-center font-mono font-bold text-purple-700">
        {coupon.code}
      </code>
    </article>
  );
}
