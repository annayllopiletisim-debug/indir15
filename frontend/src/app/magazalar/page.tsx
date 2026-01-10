import { Metadata } from 'next';
import connectDB from '@/lib/db';
import { Brand, Category, Discount, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { Store } from 'lucide-react';
import StoresPageClient from '@/components/StoresPageClient';

export const metadata: Metadata = {
  title: 'Tüm Mağazalar - İndirim ve Kupon Kodları',
  description: 'Tüm mağazaların indirim kampanyaları, kupon kodları ve çekiliş fırsatları. Yüzlerce markadan en iyi fırsatlar.',
  alternates: {
    canonical: '/magazalar',
  },
};

export const revalidate = 60;

async function getAllBrands() {
  await connectDB();
  const now = new Date();
  
  // Get all brands
  const brands = await Brand.find({}).select('id name slug logo_url category_ids').sort({ name: 1 }).limit(500).lean();
  
  // Get deal counts per brand (only active deals)
  const [discountCounts, couponCounts] = await Promise.all([
    Discount.aggregate([
      { $match: {
        $or: [
          { expiry_date: { $gte: now } },
          { expiry_date: null },
          { expiry_date: { $exists: false } }
        ]
      }},
      { $group: { _id: '$brand_id', count: { $sum: 1 } } }
    ]),
    Coupon.aggregate([
      { $match: { 
        is_active: true,
        $or: [
          { expiry_date: { $gte: now } },
          { expiry_date: null },
          { expiry_date: { $exists: false } }
        ]
      }},
      { $group: { _id: '$brand_id', count: { $sum: 1 } } }
    ])
  ]);
  
  const dealCountMap: Record<string, number> = {};
  discountCounts.forEach((d: any) => {
    dealCountMap[d._id] = (dealCountMap[d._id] || 0) + d.count;
  });
  couponCounts.forEach((c: any) => {
    dealCountMap[c._id] = (dealCountMap[c._id] || 0) + c.count;
  });
  
  // Get categories
  const categories = await Category.find({}).sort({ order: 1 }).lean();
  
  return {
    brands: brands.map((b: any) => ({ 
      ...b, 
      _id: b._id?.toString(),
      deal_count: dealCountMap[b.id] || 0
    })).sort((a: any, b: any) => b.deal_count - a.deal_count),
    categories: categories.map((c: any) => ({ ...c, _id: c._id?.toString() }))
  };
}

export default async function StoresPage() {
  const { brands, categories } = await getAllBrands();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Store className="w-8 h-8" />
            Tüm Mağazalar
          </h1>
          <p className="text-violet-100">Yüzlerce markadan en güncel fırsatlar</p>
          <div className="mt-4">
            <span className="bg-white/20 px-4 py-2 rounded-full">{brands.length} Mağaza</span>
          </div>
        </div>
      </section>

      <StoresPageClient brands={brands} categories={categories} />
    </div>
  );
}
