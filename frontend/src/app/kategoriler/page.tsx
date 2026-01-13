import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Category, Brand, Discount, Coupon } from '@/lib/models';
import { LayoutGrid } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tüm Kategoriler - İndirim ve Kuponlar',
  description: 'Tüm kategorilerdeki indirimler, kupon kodları ve kampanyalar. Moda, elektronik, gıda ve daha fazlası.',
  alternates: {
    canonical: '/kategoriler',
  },
};

// Cache for 15 minutes, revalidated on-demand when admin makes changes
export const revalidate = 900;

async function getCategoriesWithStats() {
  try {
    await connectDB();
    const now = new Date();
    
    // Fetch all data in parallel with single queries
    const [categories, brands, discountCounts, couponCounts] = await Promise.all([
      Category.find({}).sort({ order: 1 }).lean(),
      Brand.find({}).select('id category_ids').lean(),
      // Single aggregation for all discounts
      Discount.aggregate([
        { $match: {
          $or: [
            { expiry_date: { $gte: now } },
            { expiry_date: null },
            { expiry_date: { $exists: false } },
            { expiry_date: '' }
          ]
        }},
        { $group: { _id: '$brand_id', count: { $sum: 1 } } }
      ]),
      // Single aggregation for all coupons
      Coupon.aggregate([
        { $match: { 
          is_active: true,
          $or: [
            { expiry_date: { $gte: now } },
            { expiry_date: null },
            { expiry_date: { $exists: false } },
            { expiry_date: '' }
          ]
        }},
        { $group: { _id: '$brand_id', count: { $sum: 1 } } }
      ])
    ]);
    
    // Build brand deal count map
    const brandDealCount: Record<string, number> = {};
    discountCounts.forEach((d: any) => {
      if (d._id) brandDealCount[d._id] = (brandDealCount[d._id] || 0) + d.count;
    });
    couponCounts.forEach((c: any) => {
      if (c._id) brandDealCount[c._id] = (brandDealCount[c._id] || 0) + c.count;
    });
    
    // Build category stats from brand data
    const categoryBrandCount: Record<string, number> = {};
    const categoryDealCount: Record<string, number> = {};
  
  brands.forEach((brand: any) => {
    if (brand.category_ids && Array.isArray(brand.category_ids)) {
      const brandDeals = brandDealCount[brand.id] || 0;
      brand.category_ids.forEach((catId: string) => {
        categoryBrandCount[catId] = (categoryBrandCount[catId] || 0) + 1;
        categoryDealCount[catId] = (categoryDealCount[catId] || 0) + brandDeals;
      });
    }
  });
  
  // Enrich categories with computed stats
  return categories.map((cat: any) => ({
    ...cat,
    _id: cat._id?.toString(),
    brandCount: categoryBrandCount[cat.id] || 0,
    dealCount: categoryDealCount[cat.id] || 0,
  }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8" />
            Tüm Kategoriler
          </h1>
          <p className="text-violet-100">Kategorilere göre fırsatları keşfedin</p>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="bg-white rounded-2xl p-6 border hover:border-primary/50 hover:shadow-xl transition-all group"
            >
              <div className="text-4xl mb-4">{category.icon || '📎'}</div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}
              <div className="flex gap-3 text-sm">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {category.brandCount} mağaza
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {category.dealCount} fırsat
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
