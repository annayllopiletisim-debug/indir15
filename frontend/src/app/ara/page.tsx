import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { getShortId, generateSlug } from '@/lib/utils';
import { Search, Store, Tag } from 'lucide-react';
import FeaturedDealCard from '@/components/FeaturedDealCard';

export const metadata: Metadata = {
  title: 'Arama Sonuçları',
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c');
}

async function getSearchResults(query: string) {
  if (!query || query.length < 2) {
    return { brands: [], discounts: [], coupons: [] };
  }
  
  try {
    const conn = await connectDB();
    if (!conn) return { brands: [], discounts: [], coupons: [] }; // Build phase
    const normalizedQuery = normalizeText(query);
    
    const [allBrands, allDiscounts, allCoupons] = await Promise.all([
      Brand.find({}).lean(),
      Discount.find({}).lean(),
      Coupon.find({ is_active: true }).lean(),
    ]);
    
    const brandDealCount: Record<string, number> = {};
    allDiscounts.forEach((d: any) => {
      if (d.brand_id) brandDealCount[d.brand_id] = (brandDealCount[d.brand_id] || 0) + 1;
    });
    allCoupons.forEach((c: any) => {
      if (c.brand_id) brandDealCount[c.brand_id] = (brandDealCount[c.brand_id] || 0) + 1;
    });
    
    const brands = allBrands
      .filter((b: any) => normalizeText(b.name).includes(normalizedQuery))
      .map((b: any) => ({ ...b, _id: undefined, deal_count: brandDealCount[b.id] || 0 }))
      .sort((a: any, b: any) => (b.deal_count || 0) - (a.deal_count || 0));
    
    const discounts = allDiscounts
      .filter((d: any) => normalizeText(d.title).includes(normalizedQuery))
      .map((d: any) => {
        const brand = allBrands.find((b: any) => b.id === d.brand_id);
        return { ...d, _id: undefined, brand: brand ? { ...brand, _id: undefined } : null };
      });
    
    const coupons = allCoupons
      .filter((c: any) => normalizeText(c.title).includes(normalizedQuery) || normalizeText(c.code).includes(normalizedQuery))
      .map((c: any) => {
        const brand = allBrands.find((b: any) => b.id === c.brand_id);
        return { ...c, _id: undefined, brand: brand ? { ...brand, _id: undefined } : null };
      });
    
    return { brands, discounts, coupons };
  } catch (error) {
    console.error('Search failed:', error);
    return { brands: [], discounts: [], coupons: [] };
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || '';
  const { brands, discounts, coupons } = await getSearchResults(query);
  const totalResults = brands.length + discounts.length + coupons.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {query ? (<>"<span className="text-purple-600">{query}</span>" için arama sonuçları</>) : ('Arama')}
          </h1>
          {query && <p className="text-gray-500">{totalResults} sonuç bulundu</p>}
        </div>

        {!query && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aramak istediğiniz kelimeyi yazın</p>
          </div>
        )}

        {query && totalResults === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-800 text-lg font-medium mb-2">"{query}" için sonuç bulunamadı</p>
            <p className="text-gray-500">Farklı bir kelime deneyin.</p>
          </div>
        )}

        {brands.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-purple-600" /> Mağazalar ({brands.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {brands.slice(0, 12).map((brand: any) => (
                <Link key={brand.id} href={`/magaza/${brand.slug}`} className="relative bg-white rounded-xl p-4 border hover:border-purple-300 hover:shadow-lg transition-all">
                  {brand.deal_count > 0 && (
                    <span className="absolute top-2 right-2 min-w-[24px] h-[24px] px-1.5 flex items-center justify-center bg-purple-600 text-white text-xs font-bold rounded-full">{brand.deal_count}</span>
                  )}
                  <div className="w-full aspect-square bg-white rounded-lg border border-gray-100 flex items-center justify-center p-3 mb-3 relative">
                    {brand.logo_url ? (
                      <Image 
                        src={getImageUrl(brand.logo_url)} 
                        alt={brand.name} 
                        fill
                        sizes="(max-width: 640px) 33vw, 160px"
                        className="object-contain p-2" 
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-300">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-center truncate">{brand.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {discounts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" /> İndirimler ({discounts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.slice(0, 12).map((discount: any) => {
                const brand = discount.brand;
                if (!brand) return null;
                const shortId = getShortId(discount.id);
                const slug = generateSlug(discount.title);
                const href = `/magaza/${brand.slug}/indirim/${slug}-${shortId}`;
                return <FeaturedDealCard key={discount.id} deal={discount} detailHref={href} />;
              })}
            </div>
          </section>
        )}

        {coupons.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">🎁 Kupon Kodları ({coupons.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.slice(0, 12).map((coupon: any) => {
                const brand = coupon.brand;
                return (
                  <article key={coupon.id} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      {brand?.logo_url && (
                        <div className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center p-0.5 overflow-hidden relative">
                          <Image 
                            src={getImageUrl(brand.logo_url)} 
                            alt={brand.name} 
                            width={28}
                            height={28}
                            className="object-contain" 
                          />
                        </div>
                      )}
                      <span className="text-sm font-bold text-gray-800">{brand?.name}</span>
                    </div>
                    {coupon.discount_text && (
                      <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 mb-2">{coupon.discount_text}</span>
                    )}
                    <h3 className="font-medium text-gray-800 text-sm mb-3 line-clamp-2">{coupon.title}</h3>
                    <code className="block w-full px-3 py-2 bg-purple-50 border border-dashed border-purple-300 rounded-lg text-center font-mono font-bold text-purple-700 text-sm">{coupon.code}</code>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
