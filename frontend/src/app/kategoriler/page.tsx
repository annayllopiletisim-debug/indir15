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

export const dynamic = 'force-dynamic';

async function getCategoriesWithStats() {
  await connectDB();
  const now = new Date();
  
  const categories = await Category.find({}).sort({ order: 1 }).lean();
  const brands = await Brand.find({}).lean();
  
  // Calculate deal counts per category (only active deals)
  const categoryStats = await Promise.all(
    categories.map(async (cat: any) => {
      const categoryBrands = brands.filter((b: any) => b.category_ids?.includes(cat.id));
      const brandIds = categoryBrands.map((b: any) => b.id);
      
      const [discountCount, couponCount] = await Promise.all([
        Discount.countDocuments({ 
          brand_id: { $in: brandIds },
          $or: [
            { expiry_date: { $gte: now } },
            { expiry_date: null },
            { expiry_date: { $exists: false } }
          ]
        }),
        Coupon.countDocuments({ 
          brand_id: { $in: brandIds }, 
          is_active: true,
          $or: [
            { expiry_date: { $gte: now } },
            { expiry_date: null },
            { expiry_date: { $exists: false } }
          ]
        }),
      ]);
      
      return {
        ...cat,
        _id: cat._id?.toString(),
        brandCount: categoryBrands.length,
        dealCount: discountCount + couponCount,
      };
    })
  );
  
  return categoryStats;
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
