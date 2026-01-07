import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Category, Brand, Discount, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { Tag, Clock, Store } from 'lucide-react';

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
  
  // Get brands in this category
  const brands = await Brand.find({ category_ids: categoryId }).lean();
  const brandIds = brands.map((b: any) => b.id);
  const brandMap = new Map(brands.map((b: any) => [b.id, b]));
  
  // Get deals from these brands
  const [discounts, coupons] = await Promise.all([
    Discount.find({ brand_id: { $in: brandIds } }).sort({ created_at: -1 }).limit(20).lean(),
    Coupon.find({ brand_id: { $in: brandIds }, is_active: true }).sort({ created_at: -1 }).limit(20).lean(),
  ]);
  
  const enrichedDiscounts = discounts.map((d: any) => ({
    ...d,
    _id: d._id?.toString(),
    brand: brandMap.get(d.brand_id) || null,
  }));
  
  const enrichedCoupons = coupons.map((c: any) => ({
    ...c,
    _id: c._id?.toString(),
    brand: brandMap.get(c.brand_id) || null,
  }));
  
  return {
    category: { ...(category as any), _id: (category as any)._id?.toString() },
    brands: brands.map((b: any) => ({ ...b, _id: b._id?.toString() })),
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
                      <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain" />
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

        {/* Discounts */}
        {discounts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              İndirimler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((discount: any) => (
                <DealCard key={discount.id} deal={discount} type="indirim" />
              ))}
            </div>
          </section>
        )}

        {/* Coupons */}
        {coupons.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Kupon Kodları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon: any) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function DealCard({ deal, type }: { deal: any; type: string }) {
  const brand = deal.brand;
  if (!brand) return null;
  
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
            <div className="flex items-center gap-2 mb-1">
              {brand.logo_url && (
                <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-5 h-5 rounded object-contain" />
              )}
              <span className="text-xs font-medium truncate text-muted-foreground">{brand.name}</span>
            </div>
            {deal.discount_text && (
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-1">
                {deal.discount_text}
              </span>
            )}
            <h3 className="font-semibold text-sm line-clamp-2">{deal.title}</h3>
            {deal.expiry_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
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

function CouponCard({ coupon }: { coupon: any }) {
  const brand = coupon.brand;
  
  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border">
      <div className="flex items-center gap-2 mb-2">
        {brand?.logo_url && (
          <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-6 h-6 rounded object-contain" />
        )}
        <span className="text-sm font-medium">{brand?.name}</span>
      </div>
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
    </article>
  );
}
