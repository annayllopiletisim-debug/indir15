import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Discount, Coupon, Brand } from '@/lib/models';
import { BreadcrumbSchema, ItemListSchema } from '@/components/StructuredData';
import { TrendingUp, Eye, ArrowRight, Flame } from 'lucide-react';
import { getImageUrl } from '@/lib/image';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

export const metadata: Metadata = {
  title: 'En Çok Tıklanan İndirimler | Popüler Fırsatlar',
  description: 'En popüler indirimler ve kuponlar! Kullanıcıların en çok ilgi gösterdiği fırsatları keşfedin. Kaçırılmayacak kampanyalar burada.',
  keywords: ['popüler indirimler', 'en çok tıklanan', 'trend indirimler', 'popüler kuponlar', 'en iyi fırsatlar'],
  alternates: {
    canonical: `${SITE_URL}/en-cok-tiklanan`,
  },
  openGraph: {
    title: 'En Çok Tıklanan İndirimler | İndirim Keşfet',
    description: 'Kullanıcıların en çok ilgi gösterdiği indirimler ve kuponlar. Popüler fırsatları kaçırmayın!',
    url: `${SITE_URL}/en-cok-tiklanan`,
    type: 'website',
  },
};

async function getPopularDeals() {
  await connectDB();
  
  const now = new Date();
  
  const [discounts, coupons, brands] = await Promise.all([
    Discount.find({
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
      ],
    })
    .sort({ click_count: -1, created_at: -1 })
    .limit(30)
    .lean(),
    Coupon.find({
      is_active: true,
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
      ],
    })
    .sort({ click_count: -1, created_at: -1 })
    .limit(20)
    .lean(),
    Brand.find({}).lean(),
  ]);

  const brandMap = new Map(brands.map((b: any) => [b.id, b]));

  // Combine and sort by click_count
  const allDeals = [
    ...discounts.map((d: any) => ({ ...d, type: 'discount', brand: brandMap.get(d.brand_id) })),
    ...coupons.map((c: any) => ({ ...c, type: 'coupon', brand: brandMap.get(c.brand_id) })),
  ].sort((a: any, b: any) => (b.click_count || 0) - (a.click_count || 0));

  return allDeals.slice(0, 40);
}

export default async function EnCokTiklananPage() {
  const deals = await getPopularDeals();

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: SITE_URL },
    { name: 'En Çok Tıklanan', url: `${SITE_URL}/en-cok-tiklanan` },
  ];

  const itemListItems = deals.slice(0, 10).map((deal: any, index: number) => ({
    name: deal.title,
    url: `${SITE_URL}/magaza/${deal.brand?.slug || 'marka'}/indirim/${deal.slug || deal.id}`,
    position: index + 1,
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ItemListSchema 
        name="En Çok Tıklanan İndirimler"
        description="Kullanıcıların en çok ilgi gösterdiği popüler indirimler"
        items={itemListItems}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-foreground">En Çok Tıklanan</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            Trend Fırsatlar
          </div>
          <h1 className="text-4xl font-bold mb-4">
            En Çok <span className="text-primary">Tıklanan</span> İndirimler
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kullanıcıların en çok ilgi gösterdiği fırsatlar! Bu indirimler popülerliğine göre sıralanmıştır.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{deals.length}</div>
            <div className="text-sm text-muted-foreground">Popüler Fırsat</div>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {deals.reduce((acc: number, d: any) => acc + (d.click_count || 0), 0).toLocaleString('tr-TR')}
            </div>
            <div className="text-sm text-muted-foreground">Toplam Tıklama</div>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {new Set(deals.map((d: any) => d.brand?.id).filter(Boolean)).size}
            </div>
            <div className="text-sm text-muted-foreground">Farklı Marka</div>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {deals.filter((d: any) => d.type === 'coupon').length}
            </div>
            <div className="text-sm text-muted-foreground">Kupon Kodu</div>
          </div>
        </div>

        {/* Deals List */}
        <div className="space-y-4">
          {deals.map((deal: any, index: number) => (
            <Link
              key={deal.id || deal._id}
              href={`/magaza/${deal.brand?.slug || 'marka'}/indirim/${deal.slug || deal.id}`}
              className="group block"
              data-testid={`popular-deal-${index}`}
            >
              <div className="bg-card border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all flex items-center gap-4">
                {/* Rank */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-amber-600' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>

                {/* Brand Logo */}
                {deal.brand?.logo_url && (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={getImageUrl(deal.brand.logo_url)} 
                      alt={deal.brand.name}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">{deal.brand?.name}</span>
                    {deal.type === 'coupon' && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Kupon</span>
                    )}
                  </div>
                  <h2 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {deal.title}
                  </h2>
                  {deal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {deal.description}
                    </p>
                  )}
                </div>

                {/* Click Count */}
                <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">{(deal.click_count || 0).toLocaleString('tr-TR')}</span>
                </div>

                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {deals.length === 0 && (
          <div className="bg-card border rounded-xl p-12 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Henüz Yeterli Veri Yok</h2>
            <p className="text-muted-foreground">
              Popüler indirimler yakında burada listelenecek.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
