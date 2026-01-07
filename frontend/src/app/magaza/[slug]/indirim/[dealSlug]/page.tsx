import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Brand, Discount } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { ExternalLink, Clock, Tag, ArrowLeft, Share2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string; dealSlug: string }>;
}

function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1] || '';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dealSlug } = await params;
  const shortId = extractIdFromSlug(dealSlug);
  
  await connectDB();
  const discount = await Discount.findOne({ id: { $regex: `^${shortId}` } }).lean();
  
  if (!discount) return { title: 'İndirim Bulunamadı' };
  
  const brand = await Brand.findOne({ id: (discount as any).brand_id }).lean();
  
  return {
    title: `${(discount as any).title} - ${(brand as any)?.name || ''} İndirimi`,
    description: (discount as any).description || `${(brand as any)?.name} mağazasından ${(discount as any).title} fırsatı`,
    openGraph: {
      title: `${(discount as any).title} | İndirim Keşfet`,
      description: (discount as any).description || '',
      images: (discount as any).image_url ? [getImageUrl((discount as any).image_url)] : [],
    },
  };
}

export const revalidate = 60;

async function getDealData(dealSlug: string) {
  const shortId = extractIdFromSlug(dealSlug);
  
  await connectDB();
  const discount = await Discount.findOne({ id: { $regex: `^${shortId}` } }).lean();
  if (!discount) return null;
  
  const brand = await Brand.findOne({ id: (discount as any).brand_id }).lean();
  
  // Get related discounts from same brand
  const relatedDiscounts = await Discount.find({
    brand_id: (discount as any).brand_id,
    id: { $ne: (discount as any).id }
  }).limit(3).lean();
  
  return {
    discount: { ...(discount as any), _id: (discount as any)._id?.toString() },
    brand: brand ? { ...(brand as any), _id: (brand as any)._id?.toString() } : null,
    relatedDiscounts: relatedDiscounts.map((d: any) => ({ ...d, _id: d._id?.toString() })),
  };
}

export default async function DiscountDetailPage({ params }: Props) {
  const { dealSlug } = await params;
  const data = await getDealData(dealSlug);
  
  if (!data) notFound();
  
  const { discount, brand, relatedDiscounts } = data;
  const isExpired = discount.expiry_date && new Date(discount.expiry_date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">Ana Sayfa</Link>
            <span className="text-muted-foreground">/</span>
            {brand && (
              <>
                <Link href={`/magaza/${brand.slug}`} className="text-muted-foreground hover:text-primary">{brand.name}</Link>
                <span className="text-muted-foreground">/</span>
              </>
            )}
            <span className="font-medium truncate">{discount.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Image */}
              {(discount.image_url || brand?.default_deal_image) && (
                <div className="aspect-video bg-violet-50">
                  <img 
                    src={getImageUrl(discount.image_url || brand?.default_deal_image)} 
                    alt={discount.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                {/* Brand */}
                {brand && (
                  <Link href={`/magaza/${brand.slug}`} className="inline-flex items-center gap-2 mb-4 hover:opacity-80">
                    {brand.logo_url && (
                      <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-10 h-10 rounded-lg object-contain border" />
                    )}
                    <span className="font-semibold">{brand.name}</span>
                  </Link>
                )}

                {/* Title & Discount */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl font-bold">{discount.title}</h1>
                  {discount.discount_text && (
                    <span className="flex-shrink-0 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-lg">
                      {discount.discount_text}
                    </span>
                  )}
                </div>

                {/* Status & Date */}
                <div className="flex items-center gap-4 mb-6">
                  {isExpired ? (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                      Süresi Doldu
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                      Aktif
                    </span>
                  )}
                  {discount.expiry_date && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Bitiş: {new Date(discount.expiry_date).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>

                {/* Description */}
                {discount.description && (
                  <div className="prose prose-violet max-w-none mb-6">
                    <p>{discount.description}</p>
                  </div>
                )}

                {/* Long Description */}
                {discount.long_description && (
                  <div className="prose prose-violet max-w-none mb-6">
                    <h3>Detaylar</h3>
                    <div dangerouslySetInnerHTML={{ __html: discount.long_description }} />
                  </div>
                )}

                {/* Terms */}
                {discount.terms_conditions && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold mb-2">Koşullar</h3>
                    <p className="text-sm text-muted-foreground">{discount.terms_conditions}</p>
                  </div>
                )}

                {/* CTA Button */}
                {!isExpired && (brand?.affiliate_url || brand?.website_url || discount.destination_url) && (
                  <a
                    href={discount.destination_url || brand?.affiliate_url || brand?.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Mağazaya Git
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Card */}
            {brand && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Mağaza Hakkında</h3>
                <Link href={`/magaza/${brand.slug}`} className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-white rounded-xl border flex items-center justify-center p-2">
                    {brand.logo_url ? (
                      <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold block">{brand.name}</span>
                    <span className="text-sm text-muted-foreground">{brand.deal_count || 0} fırsat</span>
                  </div>
                </Link>
                <Link
                  href={`/magaza/${brand.slug}`}
                  className="block w-full text-center py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
                >
                  Tüm Fırsatları Gör
                </Link>
              </div>
            )}

            {/* Related Discounts */}
            {relatedDiscounts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Benzer İndirimler</h3>
                <div className="space-y-3">
                  {relatedDiscounts.map((related: any) => (
                    <Link 
                      key={related.id}
                      href={`/magaza/${brand?.slug}/indirim/${related.id.split('-')[0]}`}
                      className="block p-3 rounded-lg border hover:border-primary/50 transition-colors"
                    >
                      <h4 className="font-medium text-sm line-clamp-2">{related.title}</h4>
                      {related.discount_text && (
                        <span className="text-xs text-green-600 font-semibold">{related.discount_text}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
