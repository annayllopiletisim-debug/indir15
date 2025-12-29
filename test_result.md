# Blog Feature Test Plan

## Test Scenarios

### Backend API Tests
1. GET /api/blog/categories - Blog kategorilerini getir
2. GET /api/blog/posts - Blog yazılarını getir (pagination ile)
3. POST /api/blog/posts - Yeni blog yazısı oluştur (auth gerekli)
4. PUT /api/blog/posts/:id - Blog yazısı güncelle (auth gerekli)
5. DELETE /api/blog/posts/:id - Blog yazısı sil (auth gerekli)
6. GET /api/blog/posts/:slug - Tekil blog yazısı getir
7. GET /api/blog/posts/popular - Popüler yazıları getir
8. GET /api/blog/tags - Etiketleri getir
9. GET /api/blog/cta-data - CTA için kategori kupon sayılarını getir

### Frontend Tests
1. /blog - Blog ana sayfası yükleniyor mu?
2. Kategori filtreleme çalışıyor mu?
3. Admin /admin/blog sayfası yükleniyor mu?
4. Yeni yazı formu açılıyor mu?
5. Blog kategorileri dropdown'da görünüyor mu?

### Admin Credentials
- Username: admin
- Password: admin123

## Testing Protocol
- Test all API endpoints via curl
- Test frontend pages via screenshot
