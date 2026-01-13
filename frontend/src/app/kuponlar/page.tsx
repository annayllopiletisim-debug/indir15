import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import { Brand, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { Gift, Copy, ExternalLink } from 'lucide-react';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: 'Kupon Kodları',
  description: 'En güncel kupon kodları ve indirim fırsatları. Alışverişlerinizde tasarruf edin!',
  alternates: {
    canonical: '/kuponlar',
  },
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ sayfa?: string }>;
}

async function getCoupons(page: number) {
  await connectDB();
  const nowISO = new Date().toISOString();
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const filter = { 
    is_active: true,
    $or: [
      { expiry_date: { $gte: nowISO } },
      { expiry_date: null },
      { expiry_date: { $exists: false } },
      { expiry_date: '' }
    ]
  };
  
  const [coupons, totalCount, brands] = await Promise.all([
    Coupon.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean(),
    Coupon.countDocuments(filter),
    Brand.find({}).lean(),
  ]);
  
  const brandMap = new Map(brands.map((b: any) => [b.id, b]));
  
  return {
    coupons: coupons.map((c: any) => ({
      ...c,
      _id: c._id?.toString(),
      brand: brandMap.get(c.brand_id) || null,
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
  };
}

export default async function CouponsPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.sayfa || '1', 10));
  const { coupons, totalCount, totalPages } = await getCoupons(currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Kupon Kodları</h1>
          </div>
          <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            {totalCount} Kupon
          </span>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Henüz aktif kupon kodu bulunmuyor.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon: any) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              basePath="/kuponlar"
            />
          </>
        )}
      </div>
    </div>
  );
}

function CouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;
  const destinationUrl = coupon.destination_url || brand?.affiliate_url || brand?.website_url;

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 p-6">
      <div className="flex items-center gap-4 mb-4">
        {brand?.logo_url ? (
          <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-2 overflow-hidden relative">
            <Image 
              src={getImageUrl(brand.logo_url)} 
              alt={brand.name} 
              width={48}
              height={48}
              className="object-contain" 
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
            <Gift className="w-7 h-7 text-purple-600" />
          </div>
        )}
        <div>
          <Link href={brand ? `/magaza/${brand.slug}` : '#'} className="font-bold text-gray-800 hover:text-purple-600">
            {brand?.name || 'Mağaza'}
          </Link>
          {coupon.discount_text && (
            <span className="block text-sm text-green-600 font-bold">{coupon.discount_text}</span>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-700 mb-4 line-clamp-2">{coupon.title}</h3>

      <div className="flex items-center gap-2 mb-4">
        <code className="flex-1 px-4 py-3 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl text-center font-mono font-bold text-purple-700 text-lg">
          {coupon.code}
        </code>
        <button className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors" title="Kopyala">
          <Copy className="w-5 h-5" />
        </button>
      </div>

      {destinationUrl && (
        <a
          href={destinationUrl}
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
