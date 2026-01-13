// Kampanya verileri - Statik JSON yapısı
// Her kampanya için SEO, tarih ve FAQ bilgileri

export interface Campaign {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  startDate: string;
  endDate: string;
  tags: string[]; // Model'deki discount.tags ile eşleşecek
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  faqItems: { question: string; answer: string }[];
  tips: string[];
  isActive: boolean;
}

export const campaigns: Campaign[] = [
  {
    slug: "black-friday",
    title: "Black Friday İndirimleri 2026",
    shortTitle: "Black Friday",
    description: "Yılın en büyük indirim günü! Tüm kategorilerde %70'e varan indirimler.",
    longDescription: "Black Friday, her yıl Kasım ayının son Cuma günü düzenlenen ve dünyanın en büyük alışveriş etkinliğidir. Türkiye'deki tüm büyük markalar ve e-ticaret siteleri bu dönemde çılgın indirimler sunar. Elektronik, moda, kozmetik ve daha birçok kategoride %70'e varan indirimlerden yararlanabilirsiniz.",
    startDate: "2026-11-27",
    endDate: "2026-11-29",
    tags: ["black-friday", "blackfriday", "kara-cuma"],
    icon: "Tag",
    color: "bg-gray-900",
    seoTitle: "Black Friday 2026 İndirimleri | En İyi Fırsatlar ve Kupon Kodları",
    seoDescription: "Black Friday 2026 indirimleri başladı! Tüm markalarda %70'e varan indirimler, kupon kodları ve özel fırsatları kaçırmayın. En güncel Black Friday kampanyaları burada.",
    seoKeywords: ["black friday", "black friday 2026", "black friday indirimleri", "kara cuma", "black friday kupon"],
    faqItems: [
      {
        question: "Black Friday 2026 ne zaman?",
        answer: "Black Friday 2026, 27 Kasım Cuma günü başlayacak ve 29 Kasım Pazar gününe kadar devam edecektir."
      },
      {
        question: "Black Friday'de en çok indirim hangi kategorilerde oluyor?",
        answer: "Elektronik, moda, kozmetik, ev & yaşam ve spor kategorilerinde en yüksek indirimler görülmektedir. Özellikle telefon, bilgisayar ve TV'lerde %50'ye varan indirimler yakalanabilir."
      },
      {
        question: "Black Friday indirimlerinden nasıl haberdar olabilirim?",
        answer: "İndirim Keşfet'e üye olarak tüm Black Friday kampanyalarından anında haberdar olabilirsiniz. Ayrıca bu sayfayı takip ederek en güncel fırsatları görebilirsiniz."
      }
    ],
    tips: [
      "Alışveriş listenizi önceden hazırlayın",
      "Fiyatları önceden karşılaştırın",
      "Kupon kodlarını kontrol etmeyi unutmayın",
      "Kargo sürelerini göz önünde bulundurun"
    ],
    isActive: true
  },
  {
    slug: "cyber-monday",
    title: "Cyber Monday İndirimleri 2026",
    shortTitle: "Cyber Monday",
    description: "Online alışverişin en büyük günü! Teknoloji ve elektronik ürünlerde süper fırsatlar.",
    longDescription: "Cyber Monday, Black Friday'in hemen ardından gelen Pazartesi günü kutlanan ve özellikle online alışveriş odaklı bir indirim günüdür. Teknoloji, elektronik ve yazılım ürünlerinde en iyi fırsatlar bu gün yakalanır.",
    startDate: "2026-11-30",
    endDate: "2026-11-30",
    tags: ["cyber-monday", "cybermonday", "siber-pazartesi"],
    icon: "Monitor",
    color: "bg-blue-600",
    seoTitle: "Cyber Monday 2026 İndirimleri | Teknoloji ve Elektronik Fırsatları",
    seoDescription: "Cyber Monday 2026 kampanyaları! Online alışverişte en büyük indirimler, teknoloji ürünlerinde süper fırsatlar. Laptop, telefon, TV ve daha fazlasında kaçırılmayacak fiyatlar.",
    seoKeywords: ["cyber monday", "cyber monday 2026", "siber pazartesi", "teknoloji indirimleri", "online indirim"],
    faqItems: [
      {
        question: "Cyber Monday 2026 ne zaman?",
        answer: "Cyber Monday 2026, 30 Kasım Pazartesi günü gerçekleşecektir. Black Friday'in hemen ardından gelen bu gün, online alışveriş için en iyi fırsatları sunar."
      },
      {
        question: "Cyber Monday'de hangi ürünlerde indirim var?",
        answer: "Özellikle teknoloji, elektronik, yazılım abonelikleri ve dijital ürünlerde en yüksek indirimler görülür. Laptop, tablet, akıllı saat ve oyun konsolları en popüler kategorilerdir."
      }
    ],
    tips: [
      "İnternet bağlantınızın stabil olduğundan emin olun",
      "Sepetinizi önceden hazırlayın",
      "Birden fazla site karşılaştırın"
    ],
    isActive: true
  },
  {
    slug: "11-11",
    title: "11.11 Bekarlar Günü İndirimleri 2026",
    shortTitle: "11.11 Bekarlar Günü",
    description: "Dünyanın en büyük online alışveriş festivali! Milyarlarca dolarlık indirim.",
    longDescription: "11.11 Bekarlar Günü (Singles' Day), Çin'de başlayan ve tüm dünyaya yayılan en büyük online alışveriş festivalidir. Her yıl 11 Kasım'da düzenlenen bu etkinlikte, başta Trendyol ve Hepsiburada olmak üzere tüm büyük e-ticaret siteleri dev indirimler sunar.",
    startDate: "2026-11-11",
    endDate: "2026-11-11",
    tags: ["11-11", "1111", "bekarlar-gunu", "singles-day"],
    icon: "Heart",
    color: "bg-red-500",
    seoTitle: "11.11 Bekarlar Günü İndirimleri 2026 | Singles Day Kampanyaları",
    seoDescription: "11.11 Bekarlar Günü 2026 indirimleri! Trendyol, Hepsiburada ve tüm e-ticaret sitelerinde dev fırsatlar. Singles Day kampanyalarını kaçırmayın.",
    seoKeywords: ["11.11", "bekarlar günü", "singles day", "11.11 indirimleri", "bekarlar günü kampanyaları"],
    faqItems: [
      {
        question: "11.11 Bekarlar Günü nedir?",
        answer: "11.11 Bekarlar Günü (Singles' Day), 11 Kasım'da düzenlenen dünyanın en büyük online alışveriş festivalidir. Çin'de başlamış ve tüm dünyaya yayılmıştır."
      },
      {
        question: "11.11'de hangi siteler indirim yapıyor?",
        answer: "Trendyol, Hepsiburada, Amazon, n11, GittiGidiyor ve daha birçok e-ticaret sitesi 11.11'de özel indirimler sunar."
      }
    ],
    tips: [
      "Gece yarısı başlayan 'flash sale' fırsatlarını takip edin",
      "Uygulama özel indirimlerini kontrol edin",
      "Kupon biriktirme etkinliklerine katılın"
    ],
    isActive: true
  },
  {
    slug: "yilbasi",
    title: "Yılbaşı İndirimleri 2026",
    shortTitle: "Yılbaşı",
    description: "Yeni yıla indirimlerle girin! Hediye alışverişi için en iyi fırsatlar.",
    longDescription: "Yılbaşı dönemi, hediye alışverişinin en yoğun olduğu zamandır. Aralık ayı boyunca tüm kategorilerde özel indirimler ve kampanyalar düzenlenir. Elektronik, oyuncak, kozmetik ve giyim kategorileri en popüler hediye seçenekleri arasındadır.",
    startDate: "2026-12-15",
    endDate: "2027-01-01",
    tags: ["yilbasi", "yeni-yil", "new-year", "noel"],
    icon: "Gift",
    color: "bg-green-600",
    seoTitle: "Yılbaşı İndirimleri 2026 | Yeni Yıl Kampanyaları ve Hediye Fırsatları",
    seoDescription: "Yılbaşı 2026 indirimleri başladı! Hediye alışverişi için en iyi fırsatlar, yılbaşı kampanyaları ve kupon kodları. Sevdiklerinize en güzel hediyeleri uygun fiyatlarla alın.",
    seoKeywords: ["yılbaşı indirimleri", "yılbaşı kampanyaları", "yeni yıl indirimleri", "yılbaşı hediye", "noel indirimleri"],
    faqItems: [
      {
        question: "Yılbaşı indirimleri ne zaman başlıyor?",
        answer: "Yılbaşı indirimleri genellikle Aralık ayının ortasından itibaren başlar ve 1 Ocak'a kadar devam eder. En yoğun indirimler 25-31 Aralık tarihleri arasında görülür."
      },
      {
        question: "Yılbaşı hediyesi için en popüler kategoriler hangileri?",
        answer: "Elektronik, kozmetik, oyuncak, giyim ve aksesuar en popüler yılbaşı hediyesi kategorileridir. Parfüm setleri, akıllı saatler ve oyun konsolları en çok tercih edilen hediyeler arasında."
      }
    ],
    tips: [
      "Hediye alışverişini erkenden yapın",
      "Kargo yoğunluğunu göz önünde bulundurun",
      "Hediye paketi seçeneklerini kontrol edin"
    ],
    isActive: true
  },
  {
    slug: "sevgililer-gunu",
    title: "Sevgililer Günü İndirimleri 2026",
    shortTitle: "Sevgililer Günü",
    description: "Aşkınıza özel hediyeler! Romantik sürprizler için en iyi fırsatlar.",
    longDescription: "14 Şubat Sevgililer Günü, sevdiklerinize özel hediyeler almanın en güzel zamanı. Takı, parfüm, çiçek, çikolata ve deneyim hediyeleri başta olmak üzere birçok kategoride özel indirimler sunuluyor.",
    startDate: "2026-02-01",
    endDate: "2026-02-14",
    tags: ["sevgililer-gunu", "valentines-day", "14-subat"],
    icon: "HeartHandshake",
    color: "bg-pink-500",
    seoTitle: "Sevgililer Günü İndirimleri 2026 | 14 Şubat Hediye Fırsatları",
    seoDescription: "Sevgililer Günü 2026 indirimleri! Sevgilinize en güzel hediyeleri en uygun fiyatlarla alın. Takı, parfüm, çiçek ve romantik hediye fırsatları.",
    seoKeywords: ["sevgililer günü", "14 şubat", "sevgililer günü hediyesi", "sevgililer günü indirimi", "romantik hediye"],
    faqItems: [
      {
        question: "Sevgililer Günü 2026 ne zaman?",
        answer: "Sevgililer Günü her yıl 14 Şubat'ta kutlanır. 2026 yılında 14 Şubat Cumartesi gününe denk gelmektedir."
      },
      {
        question: "Sevgililer Günü için en iyi hediye önerileri neler?",
        answer: "Takı, parfüm, çiçek, çikolata, romantik akşam yemeği deneyimi ve kişiselleştirilmiş hediyeler en popüler seçeneklerdir."
      }
    ],
    tips: [
      "Kişiselleştirilmiş hediyeler daha anlamlı olur",
      "Çiçek siparişini önceden verin",
      "Restoran rezervasyonunu erkenden yapın"
    ],
    isActive: true
  },
  {
    slug: "anneler-gunu",
    title: "Anneler Günü İndirimleri 2026",
    shortTitle: "Anneler Günü",
    description: "Annenize en güzel hediyeler! Özel indirimler ve kampanyalar.",
    longDescription: "Anneler Günü, Mayıs ayının ikinci Pazar günü kutlanır. Annelerimize sevgimizi göstermek için en güzel hediyeleri alabileceğiniz bu dönemde, kozmetik, takı, ev tekstili ve deneyim hediyeleri başta olmak üzere birçok kategoride indirimler sunuluyor.",
    startDate: "2026-05-01",
    endDate: "2026-05-10",
    tags: ["anneler-gunu", "mothers-day", "anne-hediyesi"],
    icon: "Flower2",
    color: "bg-purple-500",
    seoTitle: "Anneler Günü İndirimleri 2026 | Anne Hediyesi Fırsatları",
    seoDescription: "Anneler Günü 2026 indirimleri! Annenize en güzel hediyeleri uygun fiyatlarla alın. Kozmetik, takı, ev tekstili ve deneyim hediyelerinde özel fırsatlar.",
    seoKeywords: ["anneler günü", "anneler günü hediyesi", "anne hediyesi", "anneler günü indirimi", "mayıs anneler günü"],
    faqItems: [
      {
        question: "Anneler Günü 2026 ne zaman?",
        answer: "Anneler Günü, Mayıs ayının ikinci Pazar günü kutlanır. 2026 yılında 10 Mayıs Pazar gününe denk gelmektedir."
      },
      {
        question: "Anneler Günü için en iyi hediye önerileri neler?",
        answer: "Parfüm, cilt bakım setleri, takı, çiçek, spa deneyimi ve ev tekstili ürünleri en popüler anne hediyeleri arasındadır."
      }
    ],
    tips: [
      "Annenizin ilgi alanlarını düşünün",
      "Deneyim hediyeleri kalıcı anılar bırakır",
      "El yapımı kartlar hediyenizi özelleştirir"
    ],
    isActive: true
  },
  {
    slug: "ramazan",
    title: "Ramazan Kampanyaları 2026",
    shortTitle: "Ramazan",
    description: "Ramazan ayına özel indirimler! Gıda, ev & yaşam ve daha fazlası.",
    longDescription: "Ramazan ayı, paylaşmanın ve dayanışmanın en güzel zamanı. Bu mübarek ayda gıda, ev & yaşam, sofra ürünleri ve bayramlık giyim kategorilerinde özel indirimler sunuluyor. Ayrıca iftar ve sahur alışverişi için de cazip fırsatlar bulabilirsiniz.",
    startDate: "2026-02-17",
    endDate: "2026-03-19",
    tags: ["ramazan", "ramadan", "iftar", "sahur", "bayram"],
    icon: "Moon",
    color: "bg-emerald-600",
    seoTitle: "Ramazan Kampanyaları 2026 | İftar ve Bayram İndirimleri",
    seoDescription: "Ramazan 2026 kampanyaları! Gıda, sofra ürünleri, bayramlık giyim ve ev & yaşam kategorilerinde özel indirimler. İftar alışverişi için en iyi fırsatlar.",
    seoKeywords: ["ramazan indirimleri", "ramazan kampanyaları", "iftar alışverişi", "bayram indirimleri", "ramazan fırsatları"],
    faqItems: [
      {
        question: "Ramazan 2026 ne zaman başlıyor?",
        answer: "2026 yılında Ramazan ayı 17 Şubat'ta başlayacak ve 19 Mart'ta sona erecektir. Ramazan Bayramı ise 20-22 Mart tarihleri arasında kutlanacak."
      },
      {
        question: "Ramazan'da en çok indirim hangi kategorilerde oluyor?",
        answer: "Gıda, içecek, sofra ürünleri, ev tekstili ve bayramlık giyim kategorilerinde en yüksek indirimler görülür. Marketler özellikle iftar ve sahur ürünlerinde kampanyalar düzenler."
      }
    ],
    tips: [
      "Toplu alışverişlerde ekstra indirim yakalayın",
      "Ramazan paketlerini değerlendirin",
      "Bayramlık alışverişi erkenden yapın"
    ],
    isActive: true
  },
  {
    slug: "babalar-gunu",
    title: "Babalar Günü İndirimleri 2026",
    shortTitle: "Babalar Günü",
    description: "Babanıza özel hediyeler! Teknoloji, aksesuar ve daha fazlasında indirimler.",
    longDescription: "Babalar Günü, Haziran ayının üçüncü Pazar günü kutlanır. Babalarımıza sevgimizi göstermek için en güzel hediyeleri alabileceğiniz bu dönemde, teknoloji, aksesuar, giyim ve hobi ürünleri başta olmak üzere birçok kategoride indirimler sunuluyor.",
    startDate: "2026-06-07",
    endDate: "2026-06-21",
    tags: ["babalar-gunu", "fathers-day", "baba-hediyesi"],
    icon: "User",
    color: "bg-indigo-600",
    seoTitle: "Babalar Günü İndirimleri 2026 | Baba Hediyesi Fırsatları",
    seoDescription: "Babalar Günü 2026 indirimleri! Babanıza en güzel hediyeleri uygun fiyatlarla alın. Teknoloji, aksesuar, giyim ve hobi ürünlerinde özel fırsatlar.",
    seoKeywords: ["babalar günü", "babalar günü hediyesi", "baba hediyesi", "babalar günü indirimi", "haziran babalar günü"],
    faqItems: [
      {
        question: "Babalar Günü 2026 ne zaman?",
        answer: "Babalar Günü, Haziran ayının üçüncü Pazar günü kutlanır. 2026 yılında 21 Haziran Pazar gününe denk gelmektedir."
      },
      {
        question: "Babalar Günü için en iyi hediye önerileri neler?",
        answer: "Teknoloji ürünleri, saat, cüzdan, kemer, parfüm ve hobi ürünleri en popüler baba hediyeleri arasındadır."
      }
    ],
    tips: [
      "Babanızın hobilerini düşünün",
      "Teknoloji meraklısı babalar için gadget'lar ideal",
      "Deneyim hediyeleri de güzel bir seçenek"
    ],
    isActive: true
  }
];

// Kampanya slug'ına göre bul
export function getCampaignBySlug(slug: string): Campaign | undefined {
  return campaigns.find(c => c.slug === slug);
}

// Aktif kampanyaları getir
export function getActiveCampaigns(): Campaign[] {
  return campaigns.filter(c => c.isActive);
}

// Yaklaşan kampanyaları getir (30 gün içinde başlayacak)
export function getUpcomingCampaigns(): Campaign[] {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return campaigns.filter(c => {
    const startDate = new Date(c.startDate);
    return startDate > now && startDate <= thirtyDaysLater;
  });
}

// Şu an aktif olan kampanyaları getir (tarih aralığında)
export function getCurrentCampaigns(): Campaign[] {
  const now = new Date();
  
  return campaigns.filter(c => {
    const startDate = new Date(c.startDate);
    const endDate = new Date(c.endDate);
    return now >= startDate && now <= endDate;
  });
}

// Tüm kampanya slug'larını getir (generateStaticParams için)
export function getAllCampaignSlugs(): string[] {
  return campaigns.map(c => c.slug);
}
