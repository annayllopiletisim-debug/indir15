# İndirim Keşfet - Ürün Gereksinimleri Dokümanı (PRD)

## Proje Özeti
İndirim Keşfet, Türkiye'nin en güncel kupon kodları ve indirim fırsatları platformudur. Next.js 14 (App Router) ile SSR destekli, SEO-optimized bir full-stack uygulama.

## Teknik Stack
- **Frontend:** Next.js 14 (App Router), TailwindCSS, shadcn/ui
- **Backend:** Next.js API Routes (App Router)
- **Database:** MongoDB
- **Deployment:** SSR ready, Gzip/Brotli compression enabled

## Temel Özellikler

### 1. Herkese Açık Sayfalar (SSR)
- ✅ Ana Sayfa - Öne çıkan fırsatlar, popüler mağazalar
- ✅ Kuponlar (/kuponlar) - Aktif kupon kodları
- ✅ Mağazalar (/magazalar) - Tüm markalar
- ✅ Kategoriler (/kategoriler) - Kategori listesi
- ✅ Kategori Detay (/kategori/[slug])
- ✅ Mağaza Detay (/magaza/[slug])
- ✅ İndirim Detay (/magaza/[slug]/indirim/[dealSlug])
- ✅ Bitmek Üzere (/bitmek-uzere) - 7 gün içinde bitecek fırsatlar
- ✅ Son 24 Saat (/son-24-saat) - Yeni eklenen fırsatlar
- ✅ **YENİ:** Geçmiş İndirimler (/gecmis-indirimler) - Süresi dolmuş fırsatlar
- ✅ Blog (/blog) ve Blog Detay (/blog/[slug])
- ✅ İletişim (/iletisim)
- ✅ **YENİ:** Özel 404 Sayfası

### 2. Admin Paneli
- ✅ Mağaza Yönetimi (CRUD + Bulk Delete)
- ✅ İndirim Yönetimi (CRUD + Bulk Delete)
- ✅ Kupon Yönetimi (CRUD + Bulk Delete)
- ✅ Çekiliş Yönetimi (CRUD + Bulk Delete)
- ✅ Kategori Yönetimi
- ✅ Blog Yazı Yönetimi (CRUD + Bulk Delete)
- ✅ İletişim Mesajları
- ✅ Google Sheets Import

### 3. SEO & Performance (8 Ocak 2026)
- ✅ **JSON-LD Structured Data:**
  - Organization schema (site geneli)
  - WebSite schema (arama özelliği)
  - Offer schema (indirim detay sayfaları)
  - Article schema (blog detay sayfaları)
  - Breadcrumb schema
- ✅ **Canonical URL'ler:** Tüm sayfalarda
- ✅ **Open Graph & Twitter Cards:** Tüm meta tag'ler
- ✅ **robots.txt:** Crawler yönlendirmeleri
- ✅ **sitemap.xml:** Dinamik, tüm sayfaları içerir
- ✅ **manifest.json:** PWA desteği
- ✅ **Favicon:** SVG icon
- ✅ **Süresi Dolmuş İçerik Filtreleme:**
  - Ana sayfa, kuponlar, kategori, mağaza sayfalarında
  - Sadece aktif ve süresi dolmamış fırsatlar gösterilir
- ✅ **Gzip/Brotli Compression:** Enabled
- ✅ **Next.js Image Component:** Tüm public sayfalarda `<img>` → `<Image>` dönüşümü tamamlandı
  - Otomatik WebP/AVIF optimizasyonu
  - Lazy loading
  - Responsive srcset

### 4. UI/UX
- ✅ Global Arama (Header'da açık search bar)
- ✅ "Did you mean" önerili fuzzy search
- ✅ Global Kategori Barı (Ana sayfada tam, diğer sayfalarda kompakt)
- ✅ Tutarlı Deal Card tasarımı (FeaturedDealCard)
- ✅ Çok bölümlü Footer (İstatistikler, Newsletter, SSS)
- ✅ Newsletter Abonelik formu (Footer'da çalışır durumda)
- ✅ Mobil uyumlu Header ve Menu

## Bekleyen Görevler

### P1 - Yüksek Öncelik
- [ ] Open Graph (og:image) dinamik görsel ekleme
- [ ] Google Sheets Import uçtan uca test

### P2 - Orta Öncelik
- [ ] Brevo Email Entegrasyonu
- [ ] Admin Aboneler Sayfası
- [ ] Çerez Onay Bildirimi

### P3 - Düşük Öncelik
- [ ] One-off script'lerin temizlenmesi (migration API'leri)
- [ ] Google AdSense entegrasyonu

## API Endpoints

### Public
- `GET /api/search?q={query}` - Fuzzy search
- `POST /api/newsletter` - Newsletter subscription
- `POST /api/contact` - Contact form
- `GET /api/track/click` - Click tracking

### Admin (Auth required)
- `/api/brands`, `/api/discounts`, `/api/coupons`, `/api/giveaways`
- `/api/categories`, `/api/blog`, `/api/contact`
- `/api/import/sheets` - Google Sheets import

## Veritabanı Modelleri
- Brand, Discount, Coupon, Giveaway, Category
- BlogPost, ContactMessage, Newsletter (subscribers)

## Dosya Yapısı
```
/app/frontend/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin panel
│   │   ├── gecmis-indirimler/  # YENİ
│   │   ├── not-found.tsx       # YENİ
│   │   ├── sitemap.ts          # Dinamik sitemap
│   │   └── ...
│   ├── components/
│   │   ├── StructuredData.tsx  # JSON-LD
│   │   └── ...
│   └── lib/
├── public/
│   ├── robots.txt
│   ├── manifest.json
│   └── icon.svg
└── next.config.ts
```

## Son Güncelleme: 13 Ocak 2026

### Kritik Bug Fix: Tarih Filtreleme Sorunu (13 Ocak 2026)
- ✅ **DÜZELTILDI: İndirimler Görünmüyor Hatası:** Veritabanında `expiry_date` alanları string olarak saklanıyordu, Date olarak değil. Bu nedenle MongoDB sorguları (`$gte: now`) çalışmıyordu.
- ✅ **Çözüm:** 57 discount kaydının tarih formatı string'den Date nesnesine dönüştürüldü (migration script)
- ✅ **Etkilenen Sayfalar:** Ana sayfa, mağaza detay, kategori, kuponlar, indirimler, bitmek üzere, site haritası - tümü düzeltildi

### Performans ve Hata Düzeltmeleri (13 Ocak 2026)
- ✅ **Resim 400 Hataları Düzeltildi:** Backend proxy'de HEAD method desteği eklendi
- ✅ **Hop-by-hop Header Sorunu:** Proxy response header'larında filtreleme eklendi
- ✅ **Favicon Düzeltildi:** Boş favicon.ico dosyası düzgün 1234 byte ICO ile değiştirildi
- ✅ **og-image.png Eklendi:** Open Graph görsel dosyası oluşturuldu
- ✅ **Admin Şifresi:** `Muzafferadmin*` olarak güncellendi ve çalışıyor
- ✅ **Test:** 15/15 backend testi başarılı, frontend %100 çalışıyor

### Önceki Güncellemeler (9 Ocak 2026)
- **Admin login düzeltildi:** bcrypt hash escape sorunu giderildi (.env.local'da `$` karakteri escape edildi)
- **Admin form validasyonu test edildi:** `/uploads/` path'li görseller sorunsuz kaydediliyor - bug kapalı
- **Build başarılı:** Tüm sayfa tipleri doğru render ediliyor (Static/Dynamic)
- SEO ve deploy hazırlık görevleri tamamlandı
- JSON-LD structured data entegrasyonu
- Canonical URL'ler
- Süresi dolmuş içerik filtreleme
- Geçmiş İndirimler sayfası
- 404 sayfası
- robots.txt, sitemap.xml, manifest.json
- **`<img>` → Next.js `<Image>` dönüşümü tamamlandı** (Performans iyileştirmesi)
- **Pagination eklendi:** /kuponlar, /indirimler sayfalarında sayfalama mevcut
- **Yeni sayfa:** /indirimler - Tüm indirimler sayfası
- **Kategori/Marka Migration:** Admin panelinde otomatik kategori atama aracı eklendi
