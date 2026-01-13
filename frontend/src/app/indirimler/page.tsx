import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand, Discount } from '@/lib/models';
import { getShortId, generateSlug } from '@/lib/utils';
import { Tag } from 'lucide-react';
import FeaturedDealCard from '@/components/FeaturedDealCard';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: 'Tüm İndirimler',
  description: 'En güncel indirim kampanyaları ve fırsatları. Binlerce mağazadan en iyi indirimleri keşfedin!',
  alternates: {
    canonical: '/indirimler',
  },
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ sayfa?: string }>;
}

async function getDiscounts(page: number) {
  await connectDB();
  const now = new Date();
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const filter = {
    $or: [
      { expiry_date: { $gte: now } },
      { expiry_date: null },
      { expiry_date: { $exists: false } },
      { expiry_date: '' }
    ]
  };
  
  const [discounts, totalCount, brands] = await Promise.all([
    Discount.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean(),
    Discount.countDocuments(filter),
    Brand.find({}).select('id name slug logo_url default_deal_image').limit(500).lean(),
  ]);
  
  const brandMap = new Map(brands.map((b: any) => [b.id, {
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo_url: b.logo_url || null,
    default_deal_image: b.default_deal_image || null,
  }]));
  
  return {
    discounts: discounts.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description || null,
      discount_text: d.discount_text || null,
      image_url: d.image_url || null,
      expiry_date: d.expiry_date ? (typeof d.expiry_date === 'string' ? d.expiry_date : d.expiry_date.toISOString()) : null,
      destination_url: d.destination_url || null,
      brand_id: d.brand_id,
      brand: brandMap.get(d.brand_id) || null,
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
  };
}

export default async function DiscountsPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.sayfa || '1', 10));
  const { discounts, totalCount, totalPages } = await getDiscounts(currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Tag className="w-8 h-8" />
            Tüm İndirimler
          </h1>
          <p className="text-green-100">En güncel indirim kampanyaları ve fırsatları</p>
          <div className="mt-4">
            <span className="bg-white/20 px-4 py-2 rounded-full">{totalCount} İndirim</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {discounts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Henüz aktif indirim bulunmuyor.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discounts.map((discount: any) => {
                const brand = discount.brand;
                if (!brand) return null;
                
                const shortId = getShortId(discount.id);
                const dealSlug = generateSlug(discount.title);
                const href = `/magaza/${brand.slug}/indirim/${dealSlug}-${shortId}`;
                
                return (
                  <FeaturedDealCard 
                    key={discount.id} 
                    deal={discount} 
                    detailHref={href} 
                    type="discount"
                  />
                );
              })}
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              basePath="/indirimler"
            />
          </>
        )}
      </div>
    </div>
  );
}
