import { Metadata } from 'next';
import Link from 'next/link';
import { campaigns, getCurrentCampaigns, getUpcomingCampaigns } from '@/data/campaigns';
import { BreadcrumbSchema, ItemListSchema, FAQSchema } from '@/components/StructuredData';
import { Tag, Calendar, ArrowRight, Clock, Sparkles } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

export const metadata: Metadata = {
  title: 'Kampanyalar | Tüm İndirim Kampanyaları ve Özel Günler',
  description: 'Black Friday, Cyber Monday, 11.11, Yılbaşı, Sevgililer Günü ve daha fazlası! Tüm özel gün kampanyalarını ve indirim dönemlerini keşfedin.',
  keywords: ['kampanyalar', 'indirim kampanyaları', 'black friday', 'cyber monday', '11.11', 'özel günler'],
  alternates: {
    canonical: `${SITE_URL}/kampanyalar`,
  },
  openGraph: {
    title: 'Tüm Kampanyalar | İndirim Keşfet',
    description: 'Black Friday, Cyber Monday, 11.11 ve daha fazlası! Tüm indirim kampanyalarını tek sayfada keşfedin.',
    url: `${SITE_URL}/kampanyalar`,
    type: 'website',
  },
};

// Icon component mapper
function CampaignIcon({ name, className }: { name: string; className?: string }) {
  // Simple colored div as fallback since we can't dynamically import Lucide icons
  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${className}`}>
      <Tag className="w-6 h-6 text-white" />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCampaignStatus(startDate: string, endDate: string): { label: string; color: string } {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now >= start && now <= end) {
    return { label: 'Şu An Aktif', color: 'bg-green-500' };
  } else if (now < start) {
    const days = getDaysUntil(startDate);
    if (days <= 7) {
      return { label: `${days} gün kaldı`, color: 'bg-orange-500' };
    } else if (days <= 30) {
      return { label: 'Yaklaşıyor', color: 'bg-blue-500' };
    }
    return { label: 'Gelecek', color: 'bg-gray-500' };
  }
  return { label: 'Sona Erdi', color: 'bg-gray-400' };
}

export default function KampanyalarPage() {
  const currentCampaigns = getCurrentCampaigns();
  const upcomingCampaigns = getUpcomingCampaigns();
  
  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: SITE_URL },
    { name: 'Kampanyalar', url: `${SITE_URL}/kampanyalar` },
  ];
  
  const itemListItems = campaigns.map((campaign, index) => ({
    name: campaign.title,
    url: `${SITE_URL}/kampanyalar/${campaign.slug}`,
    position: index + 1,
  }));

  // Collect all FAQs
  const allFaqs = [
    {
      question: "Hangi kampanyalar şu an aktif?",
      answer: currentCampaigns.length > 0 
        ? `Şu an ${currentCampaigns.map(c => c.shortTitle).join(', ')} kampanyaları aktif durumda.`
        : "Şu an aktif kampanya bulunmuyor, ancak yaklaşan kampanyaları takip edebilirsiniz."
    },
    {
      question: "İndirim kampanyalarından nasıl haberdar olabilirim?",
      answer: "İndirim Keşfet'e üye olarak tüm kampanyalardan anında haberdar olabilirsiniz. Ayrıca bu sayfayı takip ederek en güncel kampanyaları görebilirsiniz."
    },
    {
      question: "En büyük indirim kampanyaları hangileri?",
      answer: "Black Friday, Cyber Monday ve 11.11 Bekarlar Günü yılın en büyük indirim kampanyalarıdır. Bu dönemlerde %70'e varan indirimler yakalanabilir."
    }
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ItemListSchema 
        name="İndirim Kampanyaları" 
        description="Tüm özel gün kampanyaları ve indirim dönemleri"
        items={itemListItems}
      />
      <FAQSchema faqs={allFaqs} />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            📅 Tüm <span className="text-primary">Kampanyalar</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Black Friday, Cyber Monday, 11.11 ve daha fazlası! Yılın en büyük indirim dönemlerini kaçırmayın.
          </p>
        </div>

        {/* Current Campaigns */}
        {currentCampaigns.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold">Şu An Aktif Kampanyalar</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCampaigns.map((campaign) => (
                <Link 
                  key={campaign.slug}
                  href={`/kampanyalar/${campaign.slug}`}
                  className="group block"
                >
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/30 rounded-2xl p-6 hover:shadow-lg hover:border-green-500/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <CampaignIcon name={campaign.icon} className={campaign.color} />
                      <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                        Aktif
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {campaign.shortTitle}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(campaign.endDate)}'e kadar
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Campaigns Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Tüm Kampanyalar</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {campaigns.map((campaign) => {
              const status = getCampaignStatus(campaign.startDate, campaign.endDate);
              
              return (
                <Link 
                  key={campaign.slug}
                  href={`/kampanyalar/${campaign.slug}`}
                  className="group block"
                  data-testid={`campaign-card-${campaign.slug}`}
                >
                  <div className="bg-card border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <CampaignIcon name={campaign.icon} className={campaign.color} />
                      <span className={`px-3 py-1 ${status.color} text-white text-xs font-medium rounded-full`}>
                        {status.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {campaign.shortTitle}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                      {campaign.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(campaign.startDate)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Sıkça Sorulan Sorular</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {allFaqs.map((faq, index) => (
              <div key={index} className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
