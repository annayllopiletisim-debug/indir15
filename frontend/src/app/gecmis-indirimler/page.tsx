import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { History, Tag, Ticket, Clock } from 'lucide-react';
import FeaturedDealCard from '@/components/FeaturedDealCard';

export const metadata: Metadata = {
  title: 'Geçmiş İndirimler ve Süresi Dolan Kuponlar',
  description: 'Süresi dolmuş indirim kampanyaları ve kupon kodları. Geçmiş fırsatları inceleyin, benzer kampanyalar için takipte kalın!',
  alternates: {
    canonical: '/gecmis-indirimler',
  },
};

export const revalidate = 300; // 5 dakikada bir revalidate

async function getExpiredDeals() {
  await connectDB();
  
  const now = new Date();
  
  const [discounts, coupons, brands] = await Promise.all([
    Discount.find({
      expiry_date: { $lt: now }
    }).sort({ expiry_date: -1 }).limit(50).lean(),
    Coupon.find({
      $or: [
        { expiry_date: { $lt: now } },
        { is_active: false }
      ]
    }).sort({ expiry_date: -1 }).limit(50).lean(),
    Brand.find({}).lean(),
  ]);
  
  const brandMap = new Map(brands.map((b: any) => [b.id, { 
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo_url: b.logo_url || null,
    default_deal_image: b.default_deal_image || null,
  }]));
  
  const enrichedDiscounts = discounts.map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description || null,
    discount_text: d.discount_text || null,
    image_url: d.image_url || null,
    expiry_date: d.expiry_date ? (typeof d.expiry_date === 'string' ? d.expiry_date : d.expiry_date.toISOString()) : null,
    destination_url: d.destination_url || null,
    brand_id: d.brand_id,
    created_at: d.created_at ? (typeof d.created_at === 'string' ? d.created_at : d.created_at.toISOString()) : null,
    brand: brandMap.get(d.brand_id) || null,
  }));
  
  const enrichedCoupons = coupons.map((c: any) => ({
    id: c.id,
    title: c.title,
    code: c.code,
    description: c.description || null,
    discount_text: c.discount_text || null,
    expiry_date: c.expiry_date ? (typeof c.expiry_date === 'string' ? c.expiry_date : c.expiry_date.toISOString()) : null,
    brand_id: c.brand_id,
    is_active: c.is_active,
    brand: brandMap.get(c.brand_id) || null,
  }));
  
  return {
    discounts: enrichedDiscounts,
    coupons: enrichedCoupons,
  };
}

function formatExpiredDate(dateStr: string | null): string {
  if (!dateStr) return 'Bilinmiyor';
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

export default async function ExpiredDealsPage() {
  const { discounts, coupons } = await getExpiredDeals();
  const totalDeals = discounts.length + coupons.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <History className="w-8 h-8" />
            Geçmiş İndirimler
          </h1>
          <p className="text-gray-200">Süresi dolmuş kampanyalar - Benzer fırsatlar için takipte kalın!</p>
          <div className="mt-4 flex gap-3">
            <span className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {totalDeals} Geçmiş Fırsat
            </span>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-xl">⚠️</span>
          <div>
            <p className="text-amber-800 font-medium">Bu sayfadaki fırsatların süresi dolmuştur.</p>
            <p className="text-amber-700 text-sm mt-1">
              Güncel fırsatlar için{' '}
              <Link href="/" className="underline font-semibold">ana sayfaya</Link>
              {' '}veya{' '}
              <Link href="/bitmek-uzere" className="underline font-semibold">bitmek üzere olan fırsatlara</Link>
              {' '}göz atabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Expired Discounts */}
        {discounts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-600" />
              Süresi Dolan İndirimler ({discounts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((discount: any) => {
                const brand = discount.brand;
                if (!brand) return null;
                
                const shortId = getShortId(discount.id);
                const dealSlug = generateSlug(discount.title);
                const href = `/magaza/${brand.slug}/indirim/${dealSlug}-${shortId}`;
                
                return (
                  <div key={discount.id} className="relative opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    {/* Expired Badge */}
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold bg-gray-800 text-white">
                      Süresi Doldu: {formatExpiredDate(discount.expiry_date)}
                    </div>
                    <FeaturedDealCard deal={discount} detailHref={href} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Expired Coupons */}
        {coupons.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-gray-600" />
              Süresi Dolan Kuponlar ({coupons.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon: any) => {
                const brand = coupon.brand;
                if (!brand) return null;
                
                return (
                  <div key={coupon.id} className="relative opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    {/* Expired/Inactive Badge */}
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold bg-gray-800 text-white">
                      {!coupon.is_active ? 'Devre Dışı' : `Süresi Doldu: ${formatExpiredDate(coupon.expiry_date)}`}
                    </div>
                    <article className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 overflow-hidden rounded-xl flex items-center justify-center p-2">
                          {brand.logo_url ? (
                            <img
                              src={getImageUrl(brand.logo_url)}
                              alt={brand.name}
                              loading="lazy"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-xl text-gray-400">{brand.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold text-gray-800">{brand.name}</span>
                          {coupon.discount_text && (
                            <span className="block text-xs text-gray-500 line-through">{coupon.discount_text}</span>
                          )}
                          <h3 className="font-medium text-gray-600 line-clamp-2 text-sm mt-1">
                            {coupon.title}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <code className="block px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-center font-mono text-sm line-through">
                          {coupon.code}
                        </code>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {totalDeals === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Geçmiş fırsat bulunmuyor.</p>
            <Link href="/" className="text-purple-600 hover:underline mt-2 inline-block">
              Güncel fırsatlara göz atın →
            </Link>
          </div>
        )}

        {/* SEO Content */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="prose prose-purple max-w-none">
            <h2 className="text-xl font-bold mb-4">Geçmiş Kampanyalar Hakkında</h2>
            <p className="text-gray-600">
              Bu sayfada süresi dolmuş indirim kampanyaları ve kupon kodlarını bulabilirsiniz. 
              Bu fırsatlar artık geçerli olmasa da, benzer kampanyaların gelecekte tekrar 
              sunulma ihtimali yüksektir. Favori markanızın geçmiş kampanyalarını inceleyerek 
              gelecek fırsatları kaçırmamak için takipte kalabilirsiniz.
            </p>
            <p className="text-gray-600 mt-2">
              Güncel ve aktif fırsatlar için <Link href="/" className="text-purple-600 hover:underline">ana sayfamızı</Link> ziyaret edin.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
