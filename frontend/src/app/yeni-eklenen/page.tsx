import { Metadata } from 'next';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Discount, Coupon, Brand } from '@/lib/models';
import { BreadcrumbSchema, ItemListSchema } from '@/components/StructuredData';
import { Clock, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { getImageUrl } from '@/lib/image';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Revalidate every 30 minutes

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

export const metadata: Metadata = {
  title: 'Yeni Eklenen İndirimler | Son 24 Saat',
  description: 'Son 24 saatte eklenen en yeni indirimler ve kuponlar! Taze fırsatları ilk siz keşfedin. Güncel kampanyalar burada.',
  keywords: ['yeni indirimler', 'son eklenen', 'güncel indirimler', 'yeni kuponlar', 'taze fırsatlar'],
  alternates: {
    canonical: `${SITE_URL}/yeni-eklenen`,
  },
  openGraph: {
    title: 'Yeni Eklenen İndirimler | İndirim Keşfet',
    description: 'Son 24 saatte eklenen en yeni indirimler. Taze fırsatları kaçırmayın!',
    url: `${SITE_URL}/yeni-eklenen`,
    type: 'website',
  },
};

async function getNewDeals() {
  await connectDB();
  
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const [discounts, coupons, brands] = await Promise.all([
    Discount.find({
      created_at: { $gte: oneWeekAgo },
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
      ],
    })
    .sort({ created_at: -1 })
    .limit(50)
    .lean(),
    Coupon.find({
      is_active: true,
      created_at: { $gte: oneWeekAgo },
      $or: [
        { expiry_date: { $gte: now } },
        { expiry_date: null },
        { expiry_date: { $exists: false } },
      ],
    })
    .sort({ created_at: -1 })
    .limit(30)
    .lean(),
    Brand.find({}).lean(),
  ]);

  const brandMap = new Map(brands.map((b: any) => [b.id, b]));

  // Combine and sort by created_at
  const allDeals = [
    ...discounts.map((d: any) => ({ 
      ...d, 
      type: 'discount', 
      brand: brandMap.get(d.brand_id),
      isNew: new Date(d.created_at) >= twentyFourHoursAgo,
      isRecent: new Date(d.created_at) >= fortyEightHoursAgo,
    })),
    ...coupons.map((c: any) => ({ 
      ...c, 
      type: 'coupon', 
      brand: brandMap.get(c.brand_id),
      isNew: new Date(c.created_at) >= twentyFourHoursAgo,
      isRecent: new Date(c.created_at) >= fortyEightHoursAgo,
    })),
  ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return allDeals;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} dakika önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else {
    return `${diffDays} gün önce`;
  }
}

export default async function YeniEklenenPage() {
  const deals = await getNewDeals();
  
  const last24h = deals.filter((d: any) => d.isNew);
  const last48h = deals.filter((d: any) => d.isRecent && !d.isNew);
  const older = deals.filter((d: any) => !d.isRecent);

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: SITE_URL },
    { name: 'Yeni Eklenen', url: `${SITE_URL}/yeni-eklenen` },
  ];

  const itemListItems = deals.slice(0, 10).map((deal: any, index: number) => ({
    name: deal.title,
    url: `${SITE_URL}/magaza/${deal.brand?.slug || 'marka'}/indirim/${deal.slug || deal.id}`,
    position: index + 1,
  }));

  const DealCard = ({ deal, showBadge = true }: { deal: any; showBadge?: boolean }) => (
    <Link
      href={`/magaza/${deal.brand?.slug || 'marka'}/indirim/${deal.slug || deal.id}`}
      className="group block"
      data-testid={`new-deal-${deal.id}`}
    >
      <div className="bg-card border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all flex items-center gap-4">
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm text-muted-foreground">{deal.brand?.name}</span>
            {showBadge && deal.isNew && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Yeni
              </span>
            )}
            {deal.type === 'coupon' && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Kupon</span>
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

        {/* Time */}
        <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
          <Clock className="w-4 h-4" />
          <span className="text-xs">{formatTimeAgo(deal.created_at)}</span>
        </div>

        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </Link>
  );

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ItemListSchema 
        name="Yeni Eklenen İndirimler"
        description="Son 24 saatte eklenen en yeni indirimler ve kuponlar"
        items={itemListItems}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-foreground">Yeni Eklenen</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Taze Fırsatlar
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-primary">Yeni Eklenen</span> İndirimler
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En son eklenen fırsatları ilk siz keşfedin! Bu sayfada son bir hafta içinde eklenen tüm indirimler yer alıyor.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{last24h.length}</div>
            <div className="text-sm text-green-700">Son 24 Saat</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{last48h.length}</div>
            <div className="text-sm text-blue-700">24-48 Saat</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{older.length}</div>
            <div className="text-sm text-gray-700">Bu Hafta</div>
          </div>
        </div>

        {/* Last 24 Hours */}
        {last24h.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold">Son 24 Saat</h2>
              <span className="text-sm text-muted-foreground">({last24h.length} fırsat)</span>
            </div>
            <div className="space-y-3">
              {last24h.map((deal: any) => (
                <DealCard key={deal.id || deal._id} deal={deal} />
              ))}
            </div>
          </section>
        )}

        {/* Last 48 Hours */}
        {last48h.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold">24-48 Saat Önce</h2>
              <span className="text-sm text-muted-foreground">({last48h.length} fırsat)</span>
            </div>
            <div className="space-y-3">
              {last48h.map((deal: any) => (
                <DealCard key={deal.id || deal._id} deal={deal} showBadge={false} />
              ))}
            </div>
          </section>
        )}

        {/* This Week */}
        {older.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-bold">Bu Hafta</h2>
              <span className="text-sm text-muted-foreground">({older.length} fırsat)</span>
            </div>
            <div className="space-y-3">
              {older.map((deal: any) => (
                <DealCard key={deal.id || deal._id} deal={deal} showBadge={false} />
              ))}
            </div>
          </section>
        )}

        {deals.length === 0 && (
          <div className="bg-card border rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Henüz Yeni İndirim Yok</h2>
            <p className="text-muted-foreground">
              Son bir hafta içinde eklenen indirim bulunmuyor. Yakında yeni fırsatlar eklenecek!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
