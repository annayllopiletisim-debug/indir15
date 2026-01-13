import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { addUtmParams } from '@/lib/utm';
import { ExternalLink, Clock, ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { BreadcrumbSchema, OfferSchema } from '@/components/StructuredData';

interface Props {
  params: Promise<{ slug: string; dealSlug: string }>;
}

function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1] || '';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, dealSlug } = await params;
  const shortId = extractIdFromSlug(dealSlug);
  
  await connectDB();
  
  const discount = await Discount.findOne({ id: { $regex: `^${shortId}` } }).lean();
  if (!discount) return { title: 'İndirim Bulunamadı' };
  
  const brand = await Brand.findOne({ id: (discount as any).brand_id }).lean();
  const discountData = discount as any;
  const brandData = brand as any;
  
  return {
    title: `${discountData.title} - ${brandData?.name || ''} İndirimi`,
    description: discountData.description || `${brandData?.name} mağazasından ${discountData.title} fırsatı`,
    alternates: {
      canonical: `/magaza/${slug}/indirim/${dealSlug}`,
    },
    openGraph: {
      title: `${discountData.title} | ${brandData?.name || 'İndirim Keşfet'}`,
      description: discountData.description || `${brandData?.name} - ${discountData.discount_text || 'Özel Fırsat'}`,
      images: discountData.image_url ? [getImageUrl(discountData.image_url)] : brandData?.logo_url ? [getImageUrl(brandData.logo_url)] : [],
      type: 'website',
    },
  };
}

export const dynamic = 'force-dynamic';

async function getDealData(dealSlug: string, brandSlug: string) {
  const shortId = extractIdFromSlug(dealSlug);
  
  await connectDB();
  
  // First get the discount
  const discount = await Discount.findOne({ id: { $regex: `^${shortId}` } }).lean();
  if (!discount) return null;
  
  // Parallel queries for brand, related discounts, and deal counts
  const now = new Date();
  const [brand, relatedDiscounts, allDiscounts, allCoupons] = await Promise.all([
    Brand.findOne({ id: (discount as any).brand_id }).lean(),
    Discount.find({
      brand_id: (discount as any).brand_id,
      id: { $ne: (discount as any).id },
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
        { expiry_date: '' }
      ]
    }).limit(4).lean(),
    Discount.countDocuments({ 
      brand_id: (discount as any).brand_id,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
        { expiry_date: '' }
      ]
    }),
    Coupon.countDocuments({ 
      brand_id: (discount as any).brand_id, 
      is_active: true,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
        { expiry_date: '' }
      ]
    })
  ]);
  
  const dealCount = allDiscounts + allCoupons;
  const discountData = discount as any;
  const brandData = brand as any;
  
  return {
    discount: { ...discountData, _id: discountData._id?.toString() },
    brand: brandData ? { ...brandData, _id: brandData._id?.toString(), deal_count: dealCount } : null,
    relatedDiscounts: relatedDiscounts.map((d: any) => ({ ...d, _id: d._id?.toString() })),
    brandSlug,
  };
}

export default async function DiscountDetailPage({ params }: Props) {
  const { slug, dealSlug } = await params;
  const data = await getDealData(dealSlug, slug);
  
  if (!data) notFound();
  
  const { discount, brand, relatedDiscounts } = data;
  const isExpired = discount.expiry_date && new Date(discount.expiry_date) < new Date();
  const destinationUrl = discount.destination_url || brand?.affiliate_url || brand?.website_url;
  
  // Prepare breadcrumb data
  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: 'https://indirimkesfet.com' },
    ...(brand ? [{ name: brand.name, url: `https://indirimkesfet.com/magaza/${brand.slug}` }] : []),
    { name: discount.title, url: `https://indirimkesfet.com/magaza/${slug}/indirim/${dealSlug}` },
  ];
  
  // Prepare offer data for structured data
  const offerData = {
    name: discount.title,
    description: discount.description,
    url: `https://indirimkesfet.com/magaza/${slug}/indirim/${dealSlug}`,
    image: discount.image_url ? getImageUrl(discount.image_url) : undefined,
    brand: brand?.name,
    discount: discount.discount_text,
    validThrough: discount.expiry_date,
    seller: brand?.name,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Structured Data */}
      <BreadcrumbSchema items={breadcrumbItems} />
      <OfferSchema offer={offerData} />
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-purple-600">Ana Sayfa</Link>
            <span className="text-gray-400">/</span>
            {brand && (
              <>
                <Link href={`/magaza/${brand.slug}`} className="text-gray-500 hover:text-purple-600">{brand.name}</Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="font-medium text-gray-800 truncate">{discount.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6">
                {/* Brand Header */}
                {brand && (
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="w-16 h-16 bg-white rounded-xl border-2 border-gray-100 flex items-center justify-center p-2 overflow-hidden relative">
                      {brand.logo_url ? (
                        <Image 
                          src={getImageUrl(brand.logo_url)} 
                          alt={brand.name} 
                          width={56}
                          height={56}
                          className="object-contain" 
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">{brand.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <Link href={`/magaza/${brand.slug}`} className="text-xl font-bold text-gray-800 hover:text-purple-600">
                        {brand.name}
                      </Link>
                      <p className="text-gray-500 text-sm">{brand.deal_count || 0} aktif fırsat</p>
                    </div>
                  </div>
                )}

                {/* Discount Badge */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {discount.discount_text && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-lg">
                      {discount.discount_text}
                    </span>
                  )}
                  {isExpired ? (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                      Süresi Doldu
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Aktif
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{discount.title}</h1>

                {/* Expiry Date */}
                {discount.expiry_date && (
                  <div className="flex items-center gap-2 text-gray-600 mb-6">
                    <Calendar className="w-5 h-5" />
                    <span>Bitiş Tarihi: </span>
                    <span className="font-semibold">
                      {new Date(discount.expiry_date).toLocaleDateString('tr-TR', { 
                        day: 'numeric', month: 'long', year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}

                {/* CTA Button - Prominent */}
                {!isExpired && destinationUrl && (
                  <a
                    href={addUtmParams(destinationUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 mb-6"
                  >
                    Mağazaya Git
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}

                {/* Description */}
                {discount.description && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-gray-800 mb-3">Kampanya Detayları</h3>
                    <p className="text-gray-600 leading-relaxed">{discount.description}</p>
                  </div>
                )}

                {/* Long Description */}
                {discount.long_description && (
                  <div className="mt-6 prose prose-purple max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: discount.long_description }} />
                  </div>
                )}

                {/* Terms */}
                {discount.terms_conditions && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-2">Koşullar</h3>
                    <p className="text-sm text-gray-600">{discount.terms_conditions}</p>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Card with CTA */}
            {brand && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-center p-3 mb-3 overflow-hidden relative">
                    {brand.logo_url ? (
                      <Image 
                        src={getImageUrl(brand.logo_url)} 
                        alt={brand.name} 
                        width={68}
                        height={68}
                        className="object-contain" 
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-400">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800">{brand.name}</h3>
                  <p className="text-sm text-gray-500">{brand.deal_count || 0} aktif fırsat</p>
                </div>

                {/* Sidebar CTA */}
                {!isExpired && destinationUrl && (
                  <a
                    href={addUtmParams(destinationUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors mb-3"
                  >
                    Mağazaya Git
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <Link
                  href={`/magaza/${brand.slug}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                >
                  Tüm Fırsatları Gör
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Related Discounts */}
            {relatedDiscounts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Benzer İndirimler</h3>
                <div className="space-y-3">
                  {relatedDiscounts.map((related: any) => (
                    <Link 
                      key={related.id}
                      href={`/magaza/${brand?.slug}/indirim/${related.id.split('-')[0]}`}
                      className="block p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{related.title}</h4>
                      {related.discount_text && (
                        <span className="text-sm text-green-600 font-bold">{related.discount_text}</span>
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
