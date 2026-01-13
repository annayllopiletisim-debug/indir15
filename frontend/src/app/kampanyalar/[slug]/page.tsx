import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCampaignBySlug, getAllCampaignSlugs, Campaign } from '@/data/campaigns';
import { BreadcrumbSchema, FAQSchema, ItemListSchema } from '@/components/StructuredData';
import connectDB from '@/lib/db';
import { Discount, Coupon, Brand } from '@/lib/models';
import { Calendar, Tag, Clock, ArrowRight, ExternalLink, Lightbulb } from 'lucide-react';
import { getImageUrl } from '@/lib/image';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

interface Props {
  params: Promise<{ slug: string }>;
}

// Static params for build time generation
export async function generateStaticParams() {
  const slugs = getAllCampaignSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);
  
  if (!campaign) {
    return {
      title: 'Kampanya Bulunamadı',
    };
  }

  return {
    title: campaign.seoTitle,
    description: campaign.seoDescription,
    keywords: campaign.seoKeywords,
    alternates: {
      canonical: `${SITE_URL}/kampanyalar/${slug}`,
    },
    openGraph: {
      title: campaign.seoTitle,
      description: campaign.seoDescription,
      url: `${SITE_URL}/kampanyalar/${slug}`,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: campaign.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.seoTitle,
      description: campaign.seoDescription,
    },
  };
}

// Get discounts with matching tags
async function getCampaignDeals(campaign: Campaign) {
  try {
    const conn = await connectDB();
    if (!conn) return { discounts: [], coupons: [] }; // Build phase
    
    const now = new Date();
    
    // Find discounts with matching tags
    const [discounts, coupons, brands] = await Promise.all([
      Discount.find({
        tags: { $in: campaign.tags },
        $or: [
          { expiry_date: { $gte: now } },
          { expiry_date: null },
          { expiry_date: { $exists: false } },
        ],
      }).sort({ created_at: -1 }).limit(20).lean(),
      Coupon.find({
        tags: { $in: campaign.tags },
        is_active: true,
        $or: [
          { expiry_date: { $gte: now } },
          { expiry_date: null },
          { expiry_date: { $exists: false } },
        ],
      }).sort({ created_at: -1 }).limit(20).lean(),
      Brand.find({}).lean(),
    ]);

    const brandMap = new Map(brands.map((b: any) => [b.id, b]));

    return {
      discounts: discounts.map((d: any) => ({
        ...d,
        _id: d._id?.toString(),
        brand: brandMap.get(d.brand_id) || null,
      })),
      coupons: coupons.map((c: any) => ({
        ...c,
        _id: c._id?.toString(),
        brand: brandMap.get(c.brand_id) || null,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch campaign deals:', error);
    return { discounts: [], coupons: [] };
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getCampaignStatus(startDate: string, endDate: string): { label: string; color: string; isActive: boolean } {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now >= start && now <= end) {
    return { label: 'Şu An Aktif', color: 'bg-green-500', isActive: true };
  } else if (now < start) {
    const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { label: `${days} gün sonra başlayacak`, color: 'bg-blue-500', isActive: false };
  }
  return { label: 'Sona Erdi', color: 'bg-gray-400', isActive: false };
}

// Event Schema for campaigns
function EventSchema({ campaign }: { campaign: Campaign }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": campaign.title,
    "description": campaign.description,
    "startDate": campaign.startDate,
    "endDate": campaign.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": `${SITE_URL}/kampanyalar/${campaign.slug}`
    },
    "organizer": {
      "@type": "Organization",
      "name": "İndirim Keşfet",
      "url": SITE_URL
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/kampanyalar/${campaign.slug}`,
      "price": "0",
      "priceCurrency": "TRY",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);
  
  if (!campaign) {
    notFound();
  }

  const { discounts, coupons } = await getCampaignDeals(campaign);
  const allDeals = [...discounts, ...coupons];
  const status = getCampaignStatus(campaign.startDate, campaign.endDate);

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: SITE_URL },
    { name: 'Kampanyalar', url: `${SITE_URL}/kampanyalar` },
    { name: campaign.shortTitle, url: `${SITE_URL}/kampanyalar/${slug}` },
  ];

  const itemListItems = allDeals.slice(0, 10).map((deal: any, index: number) => ({
    name: deal.title,
    url: `${SITE_URL}/magaza/${deal.brand?.slug || 'marka'}/indirim/${deal.slug || deal.id}`,
    position: index + 1,
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <EventSchema campaign={campaign} />
      <FAQSchema faqs={campaign.faqItems} />
      {itemListItems.length > 0 && (
        <ItemListSchema 
          name={`${campaign.shortTitle} İndirimleri`}
          description={`${campaign.title} kapsamındaki tüm indirimler`}
          items={itemListItems}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/kampanyalar" className="hover:text-primary">Kampanyalar</Link>
          <span>/</span>
          <span className="text-foreground">{campaign.shortTitle}</span>
        </nav>

        {/* Hero Section */}
        <div className={`${campaign.color} rounded-3xl p-8 md:p-12 text-white mb-8`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-2 ${status.isActive ? 'bg-white/20' : 'bg-black/20'} rounded-full text-sm font-medium`}>
              {status.label}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {campaign.title}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mb-6">
            {campaign.description}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Başlangıç: {formatDate(campaign.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Bitiş: {formatDate(campaign.endDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              <span>{allDeals.length} Aktif Fırsat</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <section className="bg-card border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{campaign.shortTitle} Hakkında</h2>
              <p className="text-muted-foreground leading-relaxed">
                {campaign.longDescription}
              </p>
            </section>

            {/* Deals Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {campaign.shortTitle} İndirimleri ({allDeals.length})
                </h2>
              </div>

              {allDeals.length > 0 ? (
                <div className="grid gap-4">
                  {allDeals.map((deal: any) => (
                    <Link
                      key={deal.id || deal._id}
                      href={`/magaza/${deal.brand?.slug || 'marka'}/indirim/${deal.slug || deal.id}`}
                      className="group block"
                      data-testid={`deal-card-${deal.id}`}
                    >
                      <div className="bg-card border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all flex items-center gap-4">
                        {deal.brand?.logo_url && (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img 
                              src={getImageUrl(deal.brand.logo_url)} 
                              alt={deal.brand.name}
                              className="w-12 h-12 object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <div className="text-sm text-muted-foreground mb-1">
                            {deal.brand?.name}
                          </div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {deal.title}
                          </h3>
                          {deal.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {deal.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-card border rounded-xl p-8 text-center">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Henüz İndirim Eklenmemiş</h3>
                  <p className="text-muted-foreground text-sm">
                    {campaign.shortTitle} indirimleri yakında eklenecek. Bu sayfayı takip etmeye devam edin!
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Tips */}
            <div className="bg-card border rounded-2xl p-6 mb-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold">İpuçları</h3>
              </div>
              <ul className="space-y-3">
                {campaign.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div className="bg-card border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Sıkça Sorulan Sorular</h3>
              <div className="space-y-4">
                {campaign.faqItems.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="cursor-pointer font-medium text-sm list-none flex items-center justify-between">
                      {faq.question}
                      <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground pl-0">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
