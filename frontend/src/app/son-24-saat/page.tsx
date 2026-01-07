import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Giveaway } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { Flame, Clock, Tag, Ticket, Gift } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Son 24 Saat - Bitmek Üzere Olan Fırsatlar',
  description: 'Son 24 saat içinde sona erecek indirimler, kuponlar ve çekilişler. Fırsatları kaçırmayın!',
};

export const revalidate = 300; // 5 minutes

async function getExpiringDeals() {
  await connectDB();
  
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const brands = await Brand.find({}).lean();
  const brandMap = new Map(brands.map((b: any) => [b.id, b]));
  
  const [discounts, coupons, giveaways] = await Promise.all([
    Discount.find({
      expiry_date: { $gte: now, $lte: tomorrow }
    }).sort({ expiry_date: 1 }).lean(),
    Coupon.find({
      expiry_date: { $gte: now, $lte: tomorrow },
      is_active: true
    }).sort({ expiry_date: 1 }).lean(),
    Giveaway.find({
      expiry_date: { $gte: now, $lte: tomorrow }
    }).sort({ expiry_date: 1 }).lean(),
  ]);
  
  const enrichDeals = (deals: any[]) => deals.map((d: any) => ({
    ...d,
    _id: d._id?.toString(),
    brand: brandMap.get(d.brand_id) || null,
  }));
  
  return {
    discounts: enrichDeals(discounts),
    coupons: enrichDeals(coupons),
    giveaways: enrichDeals(giveaways),
  };
}

function getTimeRemaining(expiryDate: Date): string {
  const now = new Date();
  const diff = new Date(expiryDate).getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours} saat ${minutes} dk`;
  return `${minutes} dakika`;
}

export default async function Last24HoursPage() {
  const { discounts, coupons, giveaways } = await getExpiringDeals();
  const totalDeals = discounts.length + coupons.length + giveaways.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Flame className="w-8 h-8" />
            Son 24 Saat
          </h1>
          <p className="text-red-100">Bitmek üzere olan fırsatları kaçırmayın!</p>
          <div className="mt-4">
            <span className="bg-white/20 px-4 py-2 rounded-full">
              {totalDeals} Fırsat Bitmek Üzere
            </span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {totalDeals === 0 ? (
          <div className="text-center py-12">
            <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Bugün biten fırsat yok</h2>
            <p className="text-muted-foreground">24 saat içinde sona erecek fırsat bulunmuyor.</p>
            <Link href="/" className="inline-block mt-4 text-primary hover:underline">
              Tüm fırsatlara göz at
            </Link>
          </div>
        ) : (
          <>
            {/* Discounts */}
            {discounts.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-red-500" />
                  Biten İndirimler ({discounts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discounts.map((discount: any) => (
                    <ExpiringDealCard key={discount.id} deal={discount} type="indirim" />
                  ))}
                </div>
              </section>
            )}

            {/* Coupons */}
            {coupons.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-red-500" />
                  Biten Kuponlar ({coupons.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((coupon: any) => (
                    <ExpiringCouponCard key={coupon.id} coupon={coupon} />
                  ))}
                </div>
              </section>
            )}

            {/* Giveaways */}
            {giveaways.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-red-500" />
                  Biten Çekilişler ({giveaways.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {giveaways.map((giveaway: any) => (
                    <ExpiringDealCard key={giveaway.id} deal={giveaway} type="cekilis" />
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

function ExpiringDealCard({ deal, type }: { deal: any; type: string }) {
  const brand = deal.brand;
  if (!brand) return null;
  
  const shortId = getShortId(deal.id);
  const slug = generateSlug(deal.title);
  const href = `/magaza/${brand.slug}/${type}/${slug}-${shortId}`;
  const timeRemaining = deal.expiry_date ? getTimeRemaining(deal.expiry_date) : '';

  return (
    <Link href={href} className="block">
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border border-red-200 relative overflow-hidden">
        {/* Urgent badge */}
        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
          <Clock className="w-3 h-3 inline mr-1" />
          {timeRemaining}
        </div>
        
        <div className="flex gap-4 mt-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-violet-50 flex-shrink-0">
            {brand.logo_url ? (
              <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain p-1" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-violet-300">
                <Tag className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
            {deal.discount_text && (
              <span className="inline-block ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">
                {deal.discount_text}
              </span>
            )}
            <h3 className="font-semibold text-sm line-clamp-2 mt-1">{deal.title}</h3>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ExpiringCouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;
  const timeRemaining = coupon.expiry_date ? getTimeRemaining(coupon.expiry_date) : '';
  
  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border border-red-200 relative">
      {/* Urgent badge */}
      <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
        <Clock className="w-3 h-3 inline mr-1" />
        {timeRemaining}
      </div>
      
      <div className="flex items-center gap-2 mb-2 mt-4">
        {brand?.logo_url && (
          <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-6 h-6 rounded object-contain" />
        )}
        <span className="text-sm font-medium">{brand?.name}</span>
      </div>
      {coupon.discount_text && (
        <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-2">
          {coupon.discount_text}
        </span>
      )}
      <h3 className="font-semibold text-sm mb-3 line-clamp-2">{coupon.title}</h3>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-violet-50 border border-dashed border-violet-300 rounded-lg text-center font-mono font-bold text-violet-700 text-sm">
          {coupon.code}
        </code>
        <button className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium">
          Kopyala
        </button>
      </div>
    </article>
  );
}
