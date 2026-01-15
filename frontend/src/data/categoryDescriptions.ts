// Kategori SEO açıklamaları
// Her kategori için detaylı açıklama metni

export interface CategorySEOContent {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export const categoryDescriptions: Record<string, CategorySEOContent> = {
  'moda': {
    slug: 'moda',
    title: 'Moda İndirimleri',
    icon: '👗',
    description: `Moda indirimleri, Türkiye'deki giyim, ayakkabı ve aksesuar markalarının sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir. Zara, H&M, Mango, LC Waikiki, Koton, DeFacto, Boyner, Trendyol ve daha birçok marka bu kategoride yer almaktadır. Kadın giyim, erkek giyim, çocuk giyim, ayakkabı, çanta ve aksesuar gibi alt kategorilerde yüzlerce indirim fırsatı bulabilirsiniz. Sezon sonu indirimleri, Black Friday, Cyber Monday ve özel gün kampanyalarında %70'e varan indirimler sunulmaktadır. Kupon kodları ile sepette ekstra indirim, ücretsiz kargo ve hediye ürün fırsatlarından yararlanabilirsiniz.`
  },
  'spor': {
    slug: 'spor',
    title: 'Spor İndirimleri',
    icon: '⚽',
    description: `Spor indirimleri, Türkiye'deki spor giyim, spor ayakkabı ve fitness ekipmanları sunan markaların güncel kampanyalarını, kupon kodlarını ve özel fırsatlarını kapsayan bir kategoridir. Nike, Adidas, Puma, Under Armour, New Balance, Skechers, Decathlon, Intersport ve daha birçok marka bu kategoride yer almaktadır. Koşu ayakkabıları, antrenman kıyafetleri, fitness ekipmanları, outdoor ürünleri ve spor aksesuarları gibi alt kategorilerde çeşitli indirim fırsatları sunulmaktadır. Yeni sezon ürünlerinde %30'a varan indirimler, outlet ürünlerinde ise %70'e varan fırsatlar bulunmaktadır.`
  },
  'elektronik': {
    slug: 'elektronik',
    title: 'Elektronik İndirimleri',
    icon: '📱',
    description: `Elektronik indirimleri, Türkiye'deki teknoloji mağazaları ve markaların sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir. MediaMarkt, Teknosa, Vatan Bilgisayar, Hepsiburada, Trendyol, Amazon Türkiye ve daha birçok mağaza bu kategoride yer almaktadır. Akıllı telefonlar, bilgisayarlar, tabletler, televizyonlar, kulaklıklar, akıllı saatler ve ev elektroniği gibi alt kategorilerde binlerce ürün için indirim fırsatları sunulmaktadır. Yeni model çıkışlarında eski modellerde %40'a varan indirimler, Black Friday'de ise %60'a varan fırsatlar yakalanabilir.`
  },
  'kozmetik': {
    slug: 'kozmetik',
    title: 'Kozmetik İndirimleri',
    icon: '💄',
    description: `Kozmetik indirimleri, Türkiye'deki güzellik, cilt bakımı ve kişisel bakım markalarının sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir. Sephora, Watsons, Gratis, Rossmann, MAC, L'Oreal, Estee Lauder ve daha birçok marka bu kategoride yer almaktadır. Makyaj ürünleri, cilt bakımı, saç bakımı, parfüm ve kişisel bakım ürünleri gibi alt kategorilerde çeşitli indirim fırsatları bulunmaktadır. 2 al 1 öde kampanyaları, set indirimleri ve sadakat programı avantajlarıyla ekstra tasarruf sağlanabilir.`
  },
  'ayakkabi': {
    slug: 'ayakkabi',
    title: 'Ayakkabı İndirimleri',
    icon: '👟',
    description: `Ayakkabı indirimleri, Türkiye'deki ayakkabı markaları ve perakendecilerinin sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir. FLO, Ayakkabı Dünyası, Hotiç, İnci, Kemal Tanca, Nike, Adidas, Converse ve daha birçok marka bu kategoride yer almaktadır. Kadın ayakkabıları, erkek ayakkabıları, çocuk ayakkabıları, spor ayakkabılar ve çantalar gibi alt kategorilerde yüzlerce indirim fırsatı bulunmaktadır. Sezon sonu satışlarında %70'e varan indirimler, yeni sezon ürünlerinde ise %30'a varan fırsatlar sunulmaktadır.`
  },
  'ev-dekorasyon': {
    slug: 'ev-dekorasyon',
    title: 'Ev & Dekorasyon İndirimleri',
    icon: '🏠',
    description: `Ev ve dekorasyon indirimleri, Türkiye'deki mobilya, ev tekstili ve dekorasyon markalarının sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir. IKEA, Koçtaş, Karaca, English Home, Madame Coco, Yataş, İstikbal ve daha birçok marka bu kategoride yer almaktadır. Mobilya, ev tekstili, mutfak ürünleri, aydınlatma, dekoratif ürünler ve bahçe mobilyaları gibi alt kategorilerde çeşitli indirim fırsatları sunulmaktadır. Sezonluk ev tekstili indirimlerinde %50'ye varan fırsatlar bulunmaktadır.`
  },
  'ic-giyim': {
    slug: 'ic-giyim',
    title: 'İç Giyim İndirimleri',
    icon: '👙',
    description: `İç giyim indirimleri, Türkiye'deki iç çamaşırı, pijama ve ev giyim markalarının sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir. Penti, Suwen, Dagi, Pierre Cardin, Calvin Klein, Victoria's Secret ve daha birçok marka bu kategoride yer almaktadır. Kadın iç giyim, erkek iç giyim, pijama takımları, çorap ve ev giyim gibi alt kategorilerde çeşitli indirim fırsatları bulunmaktadır. 3 al 2 öde kampanyaları ve sezon sonu indirimlerinde %60'a varan fırsatlar yakalanabilir.`
  },
  'gida': {
    slug: 'gida',
    title: 'Gıda İndirimleri',
    icon: '🛒',
    description: `Gıda indirimleri, Türkiye'deki market zincirleri, online gıda platformları ve markaların sunduğu güncel kampanyaları, indirim kuponlarını ve özel fırsatları kapsayan bir kategoridir. Migros, CarrefourSA, A101, BİM, ŞOK, Getir, Yemeksepeti Market ve daha birçok mağaza bu kategoride yer almaktadır. Temel gıda ürünleri, içecekler, atıştırmalıklar, organik ürünler ve hazır yemekler gibi alt kategorilerde haftalık aktüel ürün indirimleri ve özel kampanyalar sunulmaktadır. Market sadakat kartları ile ekstra indirimler ve puanlar kazanılabilir.`
  },
  'banka': {
    slug: 'banka',
    title: 'Banka Kampanyaları',
    icon: '💳',
    description: `Banka indirimleri, Türkiye'deki bankaların kredi kartları, banka kartları ve mobil uygulamaları üzerinden sunduğu güncel kampanyaları, nakit iadeleri ve özel fırsatları kapsayan bir kategoridir. Garanti BBVA, İş Bankası, Yapı Kredi, Akbank, QNB Finansbank, Ziraat Bankası ve daha birçok banka bu kategoride yer almaktadır. Alışveriş kampanyaları, taksit fırsatları, nakit iadeler, bonus puanlar ve özel gün indirimleri gibi çeşitli avantajlar sunulmaktadır. Kart başına değişen kampanyalarla market, akaryakıt, restoran ve online alışverişlerde tasarruf sağlanabilir.`
  },
  'saglik': {
    slug: 'saglik',
    title: 'Sağlık İndirimleri',
    icon: '💊',
    description: `Sağlık indirimleri, Türkiye'deki eczaneler, medikal mağazalar, sağlık platformları ve ilgili markaların sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir. Eczaneler, vitamin ve takviye gıda markaları, medikal ürün satıcıları ve sağlık platformları bu kategoride yer almaktadır. Vitaminler, takviye gıdalar, medikal cihazlar, kişisel sağlık ürünleri ve optik ürünler gibi alt kategorilerde çeşitli indirim fırsatları bulunmaktadır. Online eczanelerde ilk alışverişe özel kuponlar ve düzenli kampanyalar sunulmaktadır.`
  }
};

// Helper function to get description by slug
export function getCategoryDescription(slug: string): CategorySEOContent | null {
  // Normalize slug (handle variations like "ev- dekorasyon" vs "ev-dekorasyon")
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/--+/g, '-');
  
  return categoryDescriptions[normalizedSlug] || null;
}

// Get all category slugs for sitemap
export function getAllCategorySlugs(): string[] {
  return Object.keys(categoryDescriptions);
}
