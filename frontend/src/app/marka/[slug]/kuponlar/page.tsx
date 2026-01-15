import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Brand, Coupon } from '@/lib/models';
import { getImageUrl, isInternalUpload } from '@/lib/image';
import { Gift, Copy, ExternalLink, ArrowLeft, Tag } from 'lucide-react';
import { addUtmParams } from '@/lib/utm';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const conn = await connectDB();
  if (!conn) return { title: 'Kuponlar' };
  
  const brand = await Brand.findOne({ slug }).lean();
  
  if (!brand) return { title: 'Marka Bulunamadı' };
  
  const brandName = (brand as any).name;
  
  return {
    title: `${brandName} Kupon Kodları 2026 | Güncel İndirim Kuponları`,
    description: `${brandName} için geçerli tüm kupon kodları ve indirim fırsatları. ${brandName} kuponlarıyla alışverişlerinizde tasarruf edin!`,
    alternates: {
      canonical: `/marka/${slug}/kuponlar`,
    },
    openGraph: {
      title: `${brandName} Kupon Kodları`,
      description: `${brandName} - En güncel kupon kodları ve indirimler`,
      images: (brand as any).logo_url ? [getImageUrl((brand as any).logo_url)] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

async function getBrandCoupons(slug: string) {
  const conn = await connectDB();
  if (!conn) return null;
  
  const brand = await Brand.findOne({ slug }).lean();
  if (!brand) return null;
  
  const brandId = (brand as any).id;
  const now = new Date();
  
  const coupons = await Coupon.find({
    brand_id: brandId,
    is_active: true,
    $or: [
      { expiry_date: { $gte: now } },
      { expiry_date: null },
      { expiry_date: { $exists: false } },
      { expiry_date: '' }
    ]
  }).sort({ created_at: -1 }).lean();
  
  // Also get expired coupons for reference
  const expiredCoupons = await Coupon.find({
    brand_id: brandId,
    expiry_date: { $lt: now }
  }).sort({ expiry_date: -1 }).limit(5).lean();
  
  return {
    brand: {
      ...(brand as any),
      _id: (brand as any)._id?.toString(),
    },
    coupons: coupons.map((c: any) => ({
      ...c,
      _id: c._id?.toString(),
    })),
    expiredCoupons: expiredCoupons.map((c: any) => ({
      ...c,
      _id: c._id?.toString(),
    })),
  };
}

function CouponCard({ coupon, brand }: { coupon: any; brand: any }) {
  const destinationUrl = coupon?.destination_url || brand?.affiliate_url || brand?.website_url;
  
  const handleCopyCode = () => {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code);
    }
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 p-6">
      <div className="flex items-center gap-4 mb-4">
        {brand?.logo_url ? (
          <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-2 overflow-hidden relative">
            <Image 
              src={getImageUrl(brand.logo_url)} 
              alt={brand?.name || 'Mağaza'} 
              width={48}
              height={48}
              unoptimized={isInternalUpload(brand.logo_url)}
              className="object-contain" 
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
            <Gift className="w-7 h-7 text-purple-600" />
          </div>
        )}
        <div>
          <span className="font-bold text-gray-800">{brand?.name || 'Mağaza'}</span>
          {coupon?.discount_text && (
            <span className="block text-sm text-green-600 font-bold">{coupon.discount_text}</span>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-700 mb-4 line-clamp-2">{coupon?.title || ''}</h3>
      
      {coupon?.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{coupon.description}</p>
      )}

      <div className="flex items-center gap-2 mb-4">
        <code className="flex-1 px-4 py-3 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl text-center font-mono font-bold text-purple-700 text-lg">
          {coupon?.code || ''}
        </code>
        <button 
          onClick={handleCopyCode}
          className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors" 
          title="Kopyala"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>

      {coupon?.expiry_date && (
        <p className="text-xs text-gray-400 mb-3">
          Son kullanma: {new Date(coupon.expiry_date).toLocaleDateString('tr-TR')}
        </p>
      )}

      {destinationUrl && (
        <a
          href={addUtmParams(destinationUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
        >
          Mağazaya Git
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </article>
  );
}

export default async function BrandCouponsPage({ params }: Props) {
  const { slug } = await params;
  const data = await getBrandCoupons(slug);
  
  if (!data) {
    notFound();
  }
  
  const { brand, coupons, expiredCoupons } = data;
  
  // JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brand.name} Kupon Kodları`,
    description: `${brand.name} için geçerli kupon kodları`,
    numberOfItems: coupons.length,
    itemListElement: coupons.map((coupon: any, index: number) => ({
      '@type': 'Offer',
      position: index + 1,
      name: coupon.title,
      description: coupon.description || coupon.title,
      seller: {
        '@type': 'Organization',
        name: brand.name,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-purple-600">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/magazalar" className="hover:text-purple-600">Mağazalar</Link>
            <span>/</span>
            <Link href={`/magaza/${brand.slug}`} className="hover:text-purple-600">{brand.name}</Link>
            <span>/</span>
            <span className="text-gray-800">Kuponlar</span>
          </nav>

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-6">
              <Link href={`/magaza/${brand.slug}`} className="text-gray-400 hover:text-purple-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              
              {brand.logo_url ? (
                <div className="w-20 h-20 rounded-2xl border-2 border-gray-100 flex items-center justify-center p-2 bg-white relative">
                  <Image
                    src={getImageUrl(brand.logo_url)}
                    alt={brand.name}
                    fill
                    sizes="80px"
                    unoptimized={isInternalUpload(brand.logo_url)}
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center">
                  <Tag className="w-10 h-10 text-purple-600" />
                </div>
              )}
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {brand.name} Kupon Kodları
                </h1>
                <p className="text-gray-500 mt-1">
                  {coupons.length > 0 
                    ? `${coupons.length} aktif kupon kodu mevcut`
                    : 'Şu an aktif kupon kodu bulunmuyor'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Coupons */}
          {coupons.length > 0 ? (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-600" />
                Aktif Kupon Kodları
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon: any) => (
                  <CouponCard key={coupon.id || coupon._id} coupon={coupon} brand={brand} />
                ))}
              </div>
            </section>
          ) : (
            <section className="mb-12">
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Şu an aktif kupon kodu yok
                </h2>
                <p className="text-gray-500 mb-6">
                  {brand.name} için yeni kupon kodları eklendiğinde burada görünecek.
                </p>
                <Link
                  href={`/magaza/${brand.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Tüm İndirimleri Gör
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </section>
          )}

          {/* Expired Coupons */}
          {expiredCoupons.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-500 mb-6">
                Süresi Dolmuş Kuponlar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {expiredCoupons.map((coupon: any) => (
                  <div key={coupon.id || coupon._id} className="bg-gray-100 rounded-2xl p-6">
                    <p className="font-semibold text-gray-600 mb-2">{coupon.title}</p>
                    <code className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg text-sm line-through">
                      {coupon.code}
                    </code>
                    <p className="text-xs text-gray-400 mt-2">
                      Süresi doldu: {new Date(coupon.expiry_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Back Link */}
          <div className="text-center">
            <Link
              href={`/magaza/${brand.slug}`}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {brand.name} Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
