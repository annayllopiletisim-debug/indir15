import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Brand } from '@/lib/models';
import { getImageUrl } from '@/lib/image';
import { Store, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tüm Mağazalar - İndirim ve Kupon Kodları',
  description: 'Tüm mağazaların indirim kampanyaları, kupon kodları ve çekiliş fırsatları. Yüzlerce markadan en iyi fırsatlar.',
};

export const revalidate = 60;

async function getAllBrands() {
  await connectDB();
  const brands = await Brand.find({}).sort({ deal_count: -1, name: 1 }).lean();
  return brands.map((b: any) => ({ ...b, _id: b._id?.toString() }));
}

export default async function StoresPage() {
  const brands = await getAllBrands();

  // Group brands by first letter
  const grouped = brands.reduce((acc: any, brand: any) => {
    const letter = brand.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

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

      {/* Alphabet Navigation */}
      <div className="sticky top-16 bg-white border-b z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="px-3 py-1 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 py-8">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-primary">{letter}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {grouped[letter].map((brand: any) => (
                <Link
                  key={brand.id}
                  href={`/magaza/${brand.slug}`}
                  className="bg-white rounded-xl p-4 border hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-3 mb-3 group-hover:bg-violet-50 transition-colors">
                    {brand.logo_url ? (
                      <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-3xl font-bold text-gray-300">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-center truncate">{brand.name}</h3>
                  {brand.deal_count > 0 && (
                    <p className="text-xs text-center text-muted-foreground mt-1">{brand.deal_count} fırsat</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
