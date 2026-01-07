import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, Category } from '@/lib/models';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

function generateSlug(title: string): string {
  return title
    .replace(/İ/g, 'i').replace(/I/g, 'i')
    .replace(/Ğ/g, 'g').replace(/Ü/g, 'u').replace(/Ş/g, 's')
    .replace(/Ö/g, 'o').replace(/Ç/g, 'c')
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export async function GET() {
  await connectDB();

  const [brands, discounts, coupons, categories] = await Promise.all([
    Brand.find({}).lean(),
    Discount.find({}).lean(),
    Coupon.find({ is_active: true }).lean(),
    Category.find({}).lean(),
  ]);

  const brandMap = new Map(brands.map((b: any) => [b.id, b]));

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/magazalar', priority: '0.9', changefreq: 'daily' },
    { url: '/kategoriler', priority: '0.9', changefreq: 'weekly' },
    { url: '/iletisim', priority: '0.5', changefreq: 'monthly' },
    { url: '/son-24-saat', priority: '0.8', changefreq: 'hourly' },
  ];

  const brandPages = brands.map((brand: any) => ({
    url: `/magaza/${brand.slug}`,
    priority: '0.8',
    changefreq: 'daily',
  }));

  const categoryPages = categories.map((cat: any) => ({
    url: `/kategori/${cat.slug}`,
    priority: '0.8',
    changefreq: 'daily',
  }));

  const discountPages = discounts.map((d: any) => {
    const brand = brandMap.get(d.brand_id);
    const shortId = d.id.split('-')[0];
    const slug = generateSlug(d.title);
    return {
      url: `/magaza/${brand?.slug || 'unknown'}/indirim/${slug}-${shortId}`,
      priority: '0.7',
      changefreq: 'weekly',
    };
  });

  const allUrls = [...staticPages, ...brandPages, ...categoryPages, ...discountPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
