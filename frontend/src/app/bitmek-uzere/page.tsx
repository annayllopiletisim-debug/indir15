import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { Clock, Tag, Ticket, AlertTriangle } from 'lucide-react';
import DealCard from '@/components/DealCard';
import CouponCard from '@/components/CouponCard';

export const metadata: Metadata = {
  title: 'Bitmek Üzere Olan İndirimler',
  description: 'Son 7 gün içinde bitecek indirim ve kupon fırsatları. Kaçırmadan yakalayın!',
  alternates: {
    canonical: '/bitmek-uzere',
  },
};

export const dynamic = 'force-dynamic';

async function getExpiringDeals() {
  try {
    const conn = await connectDB();
    if (!conn) return { discounts: [], coupons: [] }; // Build phase
  await connectDB();
  
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const [discounts, coupons, brands] = await Promise.all([
    Discount.find({
      expiry_date: { $gte: now, $lte: weekLater }
    }).sort({ expiry_date: 1 }).lean(),
    Coupon.find({
      is_active: true,
      expiry_date: { $gte: now, $lte: weekLater }
    }).sort({ expiry_date: 1 }).lean(),
    Brand.find({}).lean(),
  ]);
  
  const brandMap = new Map(brands.map((b: any) => [b.id, { ...b, _id: b._id?.toString() }]));
  
  return {
    discounts: discounts.map((d: any) => ({
      ...d,
      _id: d._id?.toString(),
      brand: brandMap.get(d.brand_id) || null,
    })),
    coupons: coupons.map((c: any) => ({
      ...c,
      _id: c._id?.toString(),
      brand: brandMap.get(c.brand_id) || null,
    })),
  };
}

function getDaysRemaining(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getUrgencyColor(days: number): string {
  if (days <= 1) return 'bg-red-100 text-red-700 border-red-200';
  if (days <= 3) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-yellow-100 text-yellow-700 border-yellow-200';
}

export default async function ExpiringDealsPage() {
  const { discounts, coupons } = await getExpiringDeals();
  const totalDeals = discounts.length + coupons.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Clock className="w-8 h-8" />
            Bitmek Üzere
          </h1>
          <p className="text-orange-100">Son 7 gün içinde bitecek fırsatlar - Kaçırmayın!</p>
          <div className="mt-4 flex gap-3">
            <span className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {totalDeals} Fırsat Bitiyor
            </span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Discounts */}
        {discounts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-600" />
              İndirimler ({discounts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((discount: any) => {
                const brand = discount.brand;
                if (!brand) return null;
                
                const shortId = getShortId(discount.id);
                const dealSlug = generateSlug(discount.title);
                const href = `/magaza/${brand.slug}/indirim/${dealSlug}-${shortId}`;
                const daysRemaining = getDaysRemaining(discount.expiry_date);
                
                return (
                  <div key={discount.id} className="relative">
                    {/* Urgency Badge */}
                    <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(daysRemaining)}`}>
                      {daysRemaining <= 1 ? 'Son Gün!' : `${daysRemaining} gün kaldı`}
                    </div>
                    <DealCard deal={discount} brand={brand} href={href} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Coupons */}
        {coupons.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-600" />
              Kuponlar ({coupons.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon: any) => {
                const brand = coupon.brand;
                const daysRemaining = getDaysRemaining(coupon.expiry_date);
                
                return (
                  <div key={coupon.id} className="relative">
                    {/* Urgency Badge */}
                    <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(daysRemaining)}`}>
                      {daysRemaining <= 1 ? 'Son Gün!' : `${daysRemaining} gün kaldı`}
                    </div>
                    <CouponCard coupon={coupon} brand={brand} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {totalDeals === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Şu an bitmek üzere olan fırsat bulunmuyor.</p>
            <Link href="/" className="text-purple-600 hover:underline mt-2 inline-block">
              Tüm fırsatlara göz atın →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
