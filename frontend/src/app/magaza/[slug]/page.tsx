import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Giveaway } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { Tag, Ticket, Gift, ExternalLink, Clock } from 'lucide-react';

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
    openGraph: {
      title: `${(brand as any).name} İndirim ve Kuponları | İndirim Keşfet`,
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
  
  const [discounts, coupons, giveaways] = await Promise.all([
    Discount.find({ brand_id: brandId }).sort({ created_at: -1 }).lean(),
    Coupon.find({ brand_id: brandId, is_active: true }).sort({ created_at: -1 }).lean(),
    Giveaway.find({ brand_id: brandId }).sort({ created_at: -1 }).lean(),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-center p-2 shadow-sm">
              {brand.logo_url ? (
                <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-4xl font-bold text-gray-300">{brand.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
              <p className="text-muted-foreground mb-3">{brand.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {totalDeals} Aktif Fırsat
                </span>
                {brand.website_url && (
                  <a 
                    href={brand.affiliate_url || brand.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Mağazaya Git <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Discounts */}
        {discounts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              İndirimler ({discounts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((discount: any) => (
                <DealCard key={discount.id} deal={discount} brand={brand} type="indirim" />
              ))}
            </div>
          </section>
        )}

        {/* Coupons */}
        {coupons.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Kupon Kodları ({coupons.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon: any) => (
                <CouponCard key={coupon.id} coupon={coupon} brand={brand} />
              ))}
            </div>
          </section>
        )}

        {/* Giveaways */}
        {giveaways.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Çekilişler ({giveaways.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {giveaways.map((giveaway: any) => (
                <DealCard key={giveaway.id} deal={giveaway} brand={brand} type="cekilis" />
              ))}
            </div>
          </section>
        )}

        {totalDeals === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Bu mağazada henüz aktif fırsat bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DealCard({ deal, brand, type }: { deal: any; brand: any; type: string }) {
  const shortId = getShortId(deal.id);
  const slug = generateSlug(deal.title);
  const href = `/magaza/${brand.slug}/${type}/${slug}-${shortId}`;

  return (
    <Link href={href} className="block">
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border h-full">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-violet-50 flex-shrink-0">
            {deal.image_url || brand.default_deal_image ? (
              <img src={getImageUrl(deal.image_url || brand.default_deal_image)} alt={deal.title} className="w-full h-full object-cover" />
            ) : brand.logo_url ? (
              <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain p-2" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-violet-300">
                <Tag className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {deal.discount_text && (
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-1">
                {deal.discount_text}
              </span>
            )}
            <h3 className="font-semibold text-sm line-clamp-2 mb-2">{deal.title}</h3>
            {deal.expiry_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
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

function CouponCard({ coupon, brand }: { coupon: any; brand: any }) {
  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border">
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
        <button className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
          Kopyala
        </button>
      </div>
      {coupon.expiry_date && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
          <Clock className="w-3 h-3" />
          Son: {new Date(coupon.expiry_date).toLocaleDateString('tr-TR')}
        </div>
      )}
    </article>
  );
}
