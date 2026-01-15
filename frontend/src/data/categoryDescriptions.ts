// Kategori SEO açıklamaları - PDF'den alınan orijinal metinler
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
    description: `Moda indirimleri, Türkiye'deki giyim, ayakkabı ve aksesuar markalarının sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir.

Hangi markalar var?
Zara, H&M, Mango, Koton, LC Waikiki, Trendyol, Boyner, DeFacto, Pull&Bear, Bershka, Massimo Dutti, Network, İpekyol, Vakko ve Beymen gibi Türkiye'nin en popüler moda markalarının kampanyaları bu sayfada yer alıyor. Yerli ve global yüzlerce marka düzenli olarak takip ediliyor.

Hangi kategoriler var?
Kadın giyim, erkek giyim ve çocuk modası ana kategorileri altında elbise, gömlek, pantolon, ceket, mont ve dış giyim ürünleri listeleniyor. Ayakkabı kategorisinde sneaker, topuklu, bot ve sandalet fırsatları; aksesuar kategorisinde çanta, cüzdan, kemer ve takı indirimleri takip ediliyor.

Ne tür fırsatlar sunuluyor?
Sezon içi %20-50, sezon sonu %70'e varan yüzdelik indirimler en yaygın kampanya türü. Bunun yanında sepette geçerli kupon kodları, ücretsiz kargo fırsatları, "3 al 2 öde" kampanyaları ve ilk alışverişe özel hoş geldin indirimleri de düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Ocak ve temmuz sezon sonu satışları en yüksek oranların görüldüğü dönemler. Black Friday ve Cyber Monday online modada yılın zirve kampanyalarını sunuyor. Bunların dışında markaların yıldönümü satışları ve ani flaş indirimler yıl boyunca fırsat yaratıyor.

Nasıl daha fazla tasarruf edilir?
• Acil olmayan alışverişleri sezon sonuna bırak
• Kupon kodunu sepette uygulamayı unutma
• Birden fazla mağazayı karşılaştır
• Markaların uygulamalarında ekstra indirim ara

Moda alışverişinde en güncel fırsatları kaçırmamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'spor': {
    slug: 'spor',
    title: 'Spor İndirimleri',
    icon: '⚽',
    description: `Spor indirimleri, Türkiye'deki spor giyim, spor ayakkabı ve fitness ekipmanları sunan markaların güncel kampanyalarını, kupon kodlarını ve özel fırsatlarını kapsayan bir kategoridir.

Hangi markalar var?
Nike, Adidas, Puma, New Balance, Under Armour, Reebok, Skechers, Converse, Decathlon, Intersport, Sportive, Flo ve Superstep gibi Türkiye'de en çok tercih edilen spor markalarının kampanyaları bu sayfada yer alıyor. Global spor devlerinden yerli perakendecilere kadar onlarca marka düzenli olarak takip ediliyor.

Hangi kategoriler var?
Spor giyim kategorisinde eşofman, tayt, şort, antrenman tişörtü ve rüzgarlık fırsatları listeleniyor. Spor ayakkabı kategorisinde koşu, fitness, basketbol ve günlük sneaker modelleri takip ediliyor. Fitness ekipmanlarında dambıl, yoga matı, direnç bandı gibi ev antrenmanı ürünleri; outdoor kategorisinde kamp malzemeleri ve bisiklet aksesuarları yer alıyor.

Ne tür fırsatlar sunuluyor?
Sezon içi %20-40, sezon geçişlerinde %60'a varan indirimler yaygın kampanya türleri arasında. Outlet ve geçen sezon modellerinde %70'e varan fırsatlar yakalanabiliyor. Kupon kodları, ücretsiz kargo kampanyaları ve "2 al 1 öde" fırsatları da düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Ocak ayı yeni yıl fitness hedefleriyle kampanyaların yoğunlaştığı dönem. Black Friday spor ayakkabıda yılın en derin indirimlerini sunuyor. Yaz başı ve yaz sonu outdoor ürünlerinde avantaj sağlıyor. Büyük spor turnuvaları dönemlerinde markalar özel kampanyalar düzenliyor.

Nasıl daha fazla tasarruf edilir?
• Geçen sezon modellerini tercih et, performans aynı fiyat düşük
• Markaların mobil uygulamalarında ekstra kupon ara
• Outlet kategorilerini düzenli kontrol et
• Çoklu alım kampanyalarını çorap ve içlikte değerlendir

Spor alışverişinde en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'elektronik': {
    slug: 'elektronik',
    title: 'Elektronik İndirimleri',
    icon: '📱',
    description: `Elektronik indirimleri, Türkiye'deki teknoloji mağazaları ve markaların sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir.

Hangi markalar var?
Apple, Samsung, Xiaomi, Huawei, Sony, LG, Philips, Dyson, MediaMarkt, Teknosa, Vatan Bilgisayar, Hepsiburada, Trendyol ve Amazon gibi Türkiye'nin önde gelen teknoloji markaları ve perakendecilerinin kampanyaları bu sayfada yer alıyor. Küresel teknoloji devlerinden yerli mağazalara kadar onlarca kaynak düzenli olarak takip ediliyor.

Hangi kategoriler var?
Telefon kategorisinde akıllı telefon, tablet ve aksesuar fırsatları listeleniyor. Bilgisayar kategorisinde laptop, masaüstü, monitör ve çevre birimleri takip ediliyor. Ev elektroniği kategorisinde televizyon, ses sistemi, klima ve beyaz eşya kampanyaları; kişisel elektronik kategorisinde kulaklık, akıllı saat, e-kitap okuyucu ve oyun konsolu fırsatları yer alıyor.

Ne tür fırsatlar sunuluyor?
Elektronik kategorisinde %10-30 arası yüzdelik indirimler yaygın kampanya türleri arasında. Lansman dönemlerinde eski modellerde %40'a varan fiyat düşüşleri görülüyor. Taksit kampanyaları, takas indirimleri, kupon kodları ve ücretsiz kurulum fırsatları da düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Black Friday ve Cyber Monday elektronikte yılın en derin indirimlerini sunuyor. Yeni model lansmanları öncesi mevcut modellerde ciddi fiyat düşüşleri yaşanıyor. Yaz sonu okul dönemi laptop ve tablette kampanya yoğunluğu yaratıyor. 11.11 Singles Day özellikle Çin menşeli markalarda avantaj sağlıyor.

Nasıl daha fazla tasarruf edilir?
• Yeni model lansmanını bekle, eski model fiyatı düşer
• Taksit kampanyalarında toplam maliyeti kontrol et
• Takas fırsatlarında eski cihazını değerlendir
• Resmi mağaza yerine yetkili bayi fiyatlarını karşılaştır

Elektronik alışverişinde en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'kozmetik': {
    slug: 'kozmetik',
    title: 'Kozmetik İndirimleri',
    icon: '💄',
    description: `Kozmetik indirimleri, Türkiye'deki güzellik, cilt bakımı ve kişisel bakım markalarının sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir.

Hangi markalar var?
MAC, Estée Lauder, L'Oréal, Maybelline, NYX, Kiehl's, The Body Shop, Sephora, Gratis, Watsons, Rossmann, Flormar, Golden Rose ve Farmasi gibi Türkiye'de en çok tercih edilen kozmetik markaları ve perakendecilerinin kampanyaları bu sayfada yer alıyor. Lüks segmentten uygun fiyatlı markalara kadar geniş bir yelpazeyle takip ediliyor.

Hangi kategoriler var?
Makyaj kategorisinde fondöten, ruj, maskara, far paleti ve allık fırsatları listeleniyor. Cilt bakımı kategorisinde nemlendirici, serum, güneş kremi ve temizleyici kampanyaları takip ediliyor. Saç bakımı kategorisinde şampuan, saç maskesi ve şekillendirici ürünler; parfüm kategorisinde kadın, erkek ve unisex parfümler yer alıyor.

Ne tür fırsatlar sunuluyor?
Kozmetik kategorisinde %20-50 arası yüzdelik indirimler yaygın kampanya türleri arasında. "2 al 1 öde", "3 al 2 öde" gibi çoklu alım kampanyaları oldukça sık görülüyor. Hediye ürün kampanyaları, sadakat puanı çarpanları, ücretsiz numune fırsatları ve özel set indirimleri de düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Black Friday ve Cyber Monday kozmetikte yılın en avantajlı dönemlerini sunuyor. Sevgililer günü ve anneler günü öncesi parfüm ve set kampanyaları yoğunlaşıyor. Yaz başında güneş ürünlerinde, kış başında bakım ürünlerinde sezonsal fırsatlar çıkıyor. Marka özel günleri ve mağaza yıldönümleri de takip edilmesi gereken dönemler.

Nasıl daha fazla tasarruf edilir?
• Çoklu alım kampanyalarını arkadaşınla birleştir
• Sadakat programlarına üye ol, puan kazan
• Set ürünleri tek tek almaktan daha avantajlı
• Seyahat boylarını denemek için kullan, beğenirsen büyük boy al

Kozmetik alışverişinde en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'ayakkabi': {
    slug: 'ayakkabi',
    title: 'Ayakkabı İndirimleri',
    icon: '👟',
    description: `Ayakkabı indirimleri, Türkiye'deki ayakkabı markaları ve perakendecilerinin sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir.

Hangi markalar var?
Nike, Adidas, New Balance, Skechers, Converse, Vans, Puma, Timberland, Hotiç, Derimod, İnci, Kemal Tanca, Aldo, Nine West, Flo, Ayakkabı Dünyası ve Superstep gibi Türkiye'de en çok tercih edilen ayakkabı markaları ve mağazalarının kampanyaları bu sayfada yer alıyor. Spor ayakkabıdan klasik modellere, lüks segmentten uygun fiyatlı markalara kadar geniş bir yelpaze düzenli olarak takip ediliyor.

Hangi kategoriler var?
Kadın ayakkabı kategorisinde topuklu, sneaker, babet, sandalet, bot ve çizme fırsatları listeleniyor. Erkek ayakkabı kategorisinde klasik, günlük, spor ve bot modelleri takip ediliyor. Çocuk ayakkabı kategorisinde okul ayakkabısı, spor ayakkabı ve sandalet kampanyaları; çanta ve aksesuar kategorisinde ayakkabıyla uyumlu ürün fırsatları yer alıyor.

Ne tür fırsatlar sunuluyor?
Sezon içi %20-40, sezon sonu %60'a varan yüzdelik indirimler yaygın kampanya türleri arasında. Geçen sezon modellerinde %70'e varan fırsatlar yakalanabiliyor. "İkinci ürüne %50", takas kampanyaları, kupon kodları ve ücretsiz kargo fırsatları da düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Ocak ve temmuz sezon sonu satışları en yüksek indirim oranlarını sunuyor. Black Friday sneaker modellerinde yılın en derin fiyat düşüşlerini getiriyor. Okul açılışı dönemi çocuk ayakkabısında kampanya yoğunluğu yaratıyor. İlkbahar ve sonbahar geçişlerinde bot ve sandalet stoklarında ciddi indirimler görülüyor.

Nasıl daha fazla tasarruf edilir?
• Sezon sonu satışlarında bir sonraki sezon için stok yap
• Klasik modelleri indirimde al, trend parçaları beklet
• Farklı mağazaların aynı model fiyatlarını karşılaştır
• Takas kampanyalarında eski ayakkabını değerlendir

Ayakkabı alışverişinde en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'ev-dekorasyon': {
    slug: 'ev-dekorasyon',
    title: 'Ev & Dekorasyon İndirimleri',
    icon: '🏠',
    description: `Ev ve dekorasyon indirimleri, Türkiye'deki mobilya, ev tekstili ve dekorasyon markalarının sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir.

Hangi markalar var?
IKEA, Koçtaş, Bauhaus, Kelebek, İstikbal, Bellona, Çilek, English Home, Madame Coco, Karaca, Bernardo, Taç, Yataş, Enza Home ve Vivense gibi Türkiye'nin önde gelen mobilya ve ev dekorasyon markalarının kampanyaları bu sayfada yer alıyor. Büyük mobilya mağazalarından butik dekorasyon markalarına kadar geniş bir yelpaze düzenli olarak takip ediliyor.

Hangi kategoriler var?
Mobilya kategorisinde koltuk, yatak, yemek masası, tv ünitesi ve dolap fırsatları listeleniyor. Ev tekstili kategorisinde nevresim, havlu, perde ve halı kampanyaları takip ediliyor. Mutfak kategorisinde sofra takımı, tencere seti, küçük ev aletleri ve saklama ürünleri; dekorasyon kategorisinde aydınlatma, ayna, tablo ve aksesuar fırsatları yer alıyor.

Ne tür fırsatlar sunuluyor?
Mobilyada %20-40, ev tekstilinde %50'ye varan yüzdelik indirimler yaygın kampanya türleri arasında. Sezon sonu ve stok yenileme dönemlerinde %60'a varan fırsatlar yakalanabiliyor. Taksit kampanyaları, "3 al 2 öde" fırsatları, set indirimleri ve ücretsiz montaj hizmetleri de düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Black Friday mobilya ve ev tekstilinde yılın en avantajlı dönemini sunuyor. Yaz ayları taşınma sezonuyla birlikte kampanya yoğunluğu yaratıyor. Yılbaşı öncesi sofra ve dekorasyon ürünlerinde fırsatlar artıyor. Bahar dönemi bahçe mobilyası ve dış mekan ürünlerinde indirim zamanı.

Nasıl daha fazla tasarruf edilir?
• Büyük mobilyalarda taksit kampanyalarını değerlendir
• Set ürünleri tek tek almaktan her zaman daha avantajlı
• Mağaza montaj ve kargo ücretlerini fiyata dahil et
• Showroom ürünleri ve küçük hasarlı ürünlerde ekstra indirim ara

Ev ve dekorasyon alışverişinde en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'ic-giyim': {
    slug: 'ic-giyim',
    title: 'İç Giyim İndirimleri',
    icon: '👙',
    description: `İç giyim indirimleri, Türkiye'deki iç çamaşırı, pijama ve ev giyim markalarının sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir.

Hangi markalar var?
Penti, Koton İç Giyim, Dagi, Suwen, Victoria's Secret, Intimissimi, Oysho, Pierre Cardin, Calvin Klein, Tommy Hilfiger, Blackspade, Doremi ve Emay gibi Türkiye'de en çok tercih edilen iç giyim markalarının kampanyaları bu sayfada yer alıyor. Günlük kullanımdan premium segmente, yerli üreticilerden global markalara kadar geniş bir yelpaze düzenli olarak takip ediliyor.

Hangi kategoriler var?
Kadın iç giyim kategorisinde sütyen, külot, büstiyer, korse ve takım fırsatları listeleniyor. Erkek iç giyim kategorisinde boxer, slip, atlet ve termal içlik kampanyaları takip ediliyor. Pijama kategorisinde takım, gecelik ve sabahlık ürünleri; çorap kategorisinde günlük, termal ve spor çorap fırsatları yer alıyor.

Ne tür fırsatlar sunuluyor?
İç giyim kategorisinde %20-50 arası yüzdelik indirimler yaygın kampanya türleri arasında. Çoklu alım kampanyaları oldukça sık görülüyor; "5 al 4 öde", "3 al 2 öde" gibi fırsatlar özellikle çorap ve günlük iç çamaşırında avantaj sağlıyor. Kupon kodları, set indirimleri ve ücretsiz kargo fırsatları da düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Black Friday ve Cyber Monday iç giyimde yılın en derin indirimlerini sunuyor. Sevgililer günü öncesi özel koleksiyonlarda kampanyalar yoğunlaşıyor. Sezon geçişlerinde termal ürünlerde ve yazlık koleksiyonlarda stok eritme indirimleri görülüyor. Marka yıldönümleri ve özel satış günleri de avantajlı dönemler arasında.

Nasıl daha fazla tasarruf edilir?
• Çoklu alım kampanyalarını temel parçalar için kullan
• Set ürünleri tekli almaktan daha avantajlı
• Temel renkleri indirimde al, özel parçaları beklet
• Mağaza sadakat programlarına üye ol

İç giyim alışverişinde en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'gida': {
    slug: 'gida',
    title: 'Gıda İndirimleri',
    icon: '🛒',
    description: `Gıda indirimleri, Türkiye'deki market zincirleri, online gıda platformları ve markaların sunduğu güncel kampanyaları, indirim kuponlarını ve özel fırsatları kapsayan bir kategoridir.

Hangi markalar var?
Migros, CarrefourSA, A101, BİM, ŞOK, Getir, Trendyol Yemek, Yemeksepeti Market, Istegelsin, Macrocenter, File ve Metro gibi Türkiye'nin önde gelen market zincirleri ve online gıda platformlarının kampanyaları bu sayfada yer alıyor. Büyük zincir marketlerden hızlı teslimat uygulamalarına kadar geniş bir yelpaze düzenli olarak takip ediliyor.

Hangi kategoriler var?
Temel gıda kategorisinde süt, peynir, yumurta, ekmek ve bakliyat fırsatları listeleniyor. İçecek kategorisinde su, meyve suyu, gazlı içecek ve kahve kampanyaları takip ediliyor. Atıştırmalık kategorisinde çikolata, bisküvi, cips ve kuruyemiş ürünleri; temizlik kategorisinde deterjan, yumuşatıcı ve kağıt ürünleri fırsatları yer alıyor.

Ne tür fırsatlar sunuluyor?
Gıda kategorisinde haftalık aktüel indirimler en yaygın kampanya türü olarak öne çıkıyor. "%50 indirimli ikinci ürün", "3 al 2 öde" gibi çoklu alım kampanyaları sıkça görülüyor. Online market kupon kodları, minimum sepet tutarında ücretsiz teslimat, ilk siparişe özel indirimler ve sadakat kartı avantajları da düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Hafta ortası ve hafta sonu aktüel katalogları en yoğun kampanya dönemlerini sunuyor. Ramazan ayı öncesi temel gıda ürünlerinde indirimler artıyor. Yılbaşı ve bayram dönemleri özel ürün kampanyaları getiriyor. Online marketlerde ilk sipariş kampanyaları yıl boyunca avantaj sağlıyor.

Nasıl daha fazla tasarruf edilir?
• Haftalık aktüel katalogları önceden kontrol et
• Market sadakat kartlarını aktif kullan
• Online marketlerde minimum sepet tutarını tamamla, kargodan kazan
• Uzun raf ömürlü ürünlerde çoklu alım kampanyalarını değerlendir

Gıda alışverişinde en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'banka': {
    slug: 'banka',
    title: 'Banka Kampanyaları',
    icon: '💳',
    description: `Banka indirimleri, Türkiye'deki bankaların kredi kartları, banka kartları ve mobil uygulamaları üzerinden sunduğu güncel kampanyaları, nakit iadeleri ve özel fırsatları kapsayan bir kategoridir.

Hangi bankalar var?
Garanti BBVA, Yapı Kredi, İş Bankası, Akbank, QNB Finansbank, Ziraat Bankası, Halkbank, Vakıfbank, Denizbank, TEB, ING, Enpara, Papara ve Tosla gibi Türkiye'nin önde gelen bankalarının kampanyaları bu sayfada yer alıyor. Geleneksel bankalardan dijital bankalara ve fintech uygulamalarına kadar geniş bir yelpaze düzenli olarak takip ediliyor.

Hangi kategoriler var?
Kredi kartı kampanyaları kategorisinde alışveriş indirimleri, taksit fırsatları ve nakit iade kampanyaları listeleniyor. Banka kartı kampanyaları kategorisinde anlık para iadesi ve sadakat avantajları takip ediliyor. Kredi kampanyaları kategorisinde ihtiyaç kredisi, konut kredisi ve taşıt kredisi fırsatları; yatırım kategorisinde mevduat faizi ve fon kampanyaları yer alıyor.

Ne tür fırsatlar sunuluyor?
Banka kampanyalarında %10-30 arası nakit iade fırsatları yaygın kampanya türleri arasında. Belirli sektörlerde ekstra taksit, market ve akaryakıtta chip-para, restoran ve eğlencede anlık indirimler sıkça görülüyor. Kredi kartı başvuru kampanyaları, hoş geldin bonusları ve arkadaşını getir kampanyaları da düzenli olarak listeleniyor.

En iyi kampanyalar ne zaman çıkar?
Black Friday ve Cyber Monday dönemlerinde bankalar ekstra taksit ve nakit iade oranlarını artırıyor. Yılbaşı ve bayram dönemleri alışveriş kampanyalarında yoğunluk yaratıyor. Yaz tatili sezonu seyahat ve konaklama kampanyaları sunuyor. Okul dönemi teknoloji ve kırtasiye alışverişlerinde avantajlı dönem.

Nasıl daha fazla tasarruf edilir?
• Bankanın hangi sektörlerde ekstra avantaj verdiğini öğren
• Mobil uygulama özel kampanyalarını kontrol et
• Nakit iade ve chip-para kampanyalarını takip et
• Taksitli alışverişlerde toplam maliyeti hesapla

Banka kampanyalarında en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  },
  'saglik': {
    slug: 'saglik',
    title: 'Sağlık İndirimleri',
    icon: '💊',
    description: `Sağlık indirimleri, Türkiye'deki eczaneler, medikal mağazalar, sağlık platformları ve ilgili markaların sunduğu güncel kampanyaları, kupon kodlarını ve özel fırsatları kapsayan bir kategoridir.

Hangi markalar var?
Gratis, Watsons, Rossmann, A101 Sağlık, Migros Sağlık, Dr. Oetker, Eczacıbaşı, Abdi İbrahim, Evony, Molped, Prima, Sleepy ve Chicco gibi Türkiye'de sağlık ve kişisel bakım ürünleri sunan marka ve perakendecilerin kampanyaları bu sayfada yer alıyor. Eczane zincirlerinden online sağlık platformlarına kadar geniş bir yelpaze düzenli olarak takip ediliyor.

Hangi kategoriler var?
Kişisel bakım kategorisinde vitamin, takviye gıda, ağız bakımı ve hijyen ürünleri fırsatları listeleniyor. Anne-bebek kategorisinde bebek bezi, mama, biberon ve bakım ürünleri kampanyaları takip ediliyor. Medikal ürünler kategorisinde tansiyon aleti, şeker ölçüm cihazı ve ortopedik ürünler; cinsel sağlık kategorisinde ilgili ürün fırsatları yer alıyor.

Ne tür fırsatlar sunuluyor?
Sağlık kategorisinde %20-40 arası yüzdelik indirimler yaygın kampanya türleri arasında. Bebek bezi ve hijyen ürünlerinde çoklu alım kampanyaları oldukça sık görülüyor. Vitamin ve takviye gıdalarda "2 al 1 öde" fırsatları, ücretsiz kargo kampanyaları ve sadakat puanı avantajları da düzenli olarak listeleniyor.

En iyi indirimler ne zaman çıkar?
Black Friday sağlık ve kişisel bakım ürünlerinde yılın en avantajlı dönemini sunuyor. Kış ayları vitamin ve bağışıklık ürünlerinde kampanya yoğunluğu yaratıyor. Anne-bebek ürünlerinde yıl boyunca düzenli kampanyalar görülüyor. Marka özel günleri ve eczane zincirlerinin yıldönümleri takip edilmesi gereken dönemler.

Nasıl daha fazla tasarruf edilir?
• Bebek bezi gibi sürekli kullanılan ürünlerde çoklu alım kampanyalarını değerlendir
• Vitamin alımlarını kampanya dönemlerine denk getir
• Sadakat kartlarını aktif kullan, puan biriktir
• Farklı eczane ve mağaza fiyatlarını karşılaştır

Sağlık alışverişinde en güncel fırsatları yakalamak için bu sayfayı düzenli takip edebilirsin.`
  }
};

// Helper function to get description by slug
export function getCategoryDescription(slug: string): CategorySEOContent | null {
  // Normalize slug (handle variations like "ev- dekorasyon" vs "ev-dekorasyon")
  const normalizedSlug = slug.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
  
  // Direct match
  if (categoryDescriptions[normalizedSlug]) {
    return categoryDescriptions[normalizedSlug];
  }
  
  // Try matching with original slug
  if (categoryDescriptions[slug]) {
    return categoryDescriptions[slug];
  }
  
  // Try partial match
  for (const key of Object.keys(categoryDescriptions)) {
    if (normalizedSlug.includes(key) || key.includes(normalizedSlug)) {
      return categoryDescriptions[key];
    }
  }
  
  return null;
}

// Get all category slugs for sitemap
export function getAllCategorySlugs(): string[] {
  return Object.keys(categoryDescriptions);
}
