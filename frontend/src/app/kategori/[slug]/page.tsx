import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Category, Brand, Discount, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { Store } from 'lucide-react';
import CategoryDealsFilter from '@/components/CategoryDealsFilter';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const category = await Category.findOne({ slug }).lean();
  
  if (!category) return { title: 'Kategori Bulunamadı' };
  
  return {
    title: `${(category as any).name} İndirimleri ve Kuponları`,
    description: `${(category as any).name} kategorisindeki en güncel indirimler, kupon kodları ve kampanyalar. ${(category as any).description || ''}`,
  };
}

export const revalidate = 60;

async function getCategoryData(slug: string) {
  await connectDB();
  
  const category = await Category.findOne({ slug }).lean();
  if (!category) return null;
  
  const categoryId = (category as any).id;
  
  // Get brands that have this category in their category_ids
  const brands = await Brand.find({ category_ids: categoryId }).lean();
  const brandIds = brands.map((b: any) => b.id);
  
  let discounts: any[] = [];
  let coupons: any[] = [];
  
  if (brandIds.length > 0) {
    // Get deals from these brands
    [discounts, coupons] = await Promise.all([
      Discount.find({ brand_id: { $in: brandIds } }).sort({ created_at: -1 }).limit(20).lean(),
      Coupon.find({ brand_id: { $in: brandIds }, is_active: true }).sort({ created_at: -1 }).limit(20).lean(),
    ]);
  }
  
  // Serialize brands properly
  const serializedBrands = brands.map((b: any) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo_url: b.logo_url || null,
    default_deal_image: b.default_deal_image || null,
  }));
  
  const brandMap = new Map(serializedBrands.map((b: any) => [b.id, b]));
  
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
    click_count: d.click_count || 0,
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
    created_at: c.created_at ? (typeof c.created_at === 'string' ? c.created_at : c.created_at.toISOString()) : null,
    click_count: c.click_count || 0,
    brand: brandMap.get(c.brand_id) || null,
  }));
  
  return {
    category: {
      id: (category as any).id,
      name: (category as any).name,
      slug: (category as any).slug,
      description: (category as any).description || null,
      icon: (category as any).icon || null,
    },
    brands: serializedBrands,
    discounts: enrichedDiscounts,
    coupons: enrichedCoupons,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  
  if (!data) notFound();
  
  const { category, brands, discounts, coupons } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2">
            {category.icon} {category.name}
          </h1>
          <p className="text-violet-100">{category.description}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">{brands.length} Mağaza</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">{discounts.length + coupons.length} Fırsat</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Brands in Category */}
        {brands.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Bu Kategorideki Mağazalar
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {brands.map((brand: any) => (
                <Link
                  key={brand.id}
                  href={`/magaza/${brand.slug}`}
                  className="flex-shrink-0 flex flex-col items-center group"
                >
                  <div className="w-16 h-16 bg-white rounded-xl border flex items-center justify-center p-1.5 group-hover:border-primary/50 group-hover:shadow-lg transition-all">
                    {brand.logo_url ? (
                      <img src={getImageUrl(brand.logo_url)} alt={brand.name} loading="lazy" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xl font-bold text-gray-400">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium mt-1.5 max-w-[64px] truncate">{brand.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Deals with Filter */}
        {(discounts.length > 0 || coupons.length > 0) && (
          <CategoryDealsFilter 
            discounts={discounts} 
            coupons={coupons}
            category={category} 
          />
        )}

        {discounts.length === 0 && coupons.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">Bu kategoride henüz fırsat bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
