export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Discount, Brand } from '@/lib/models';
import { getShortId, generateSlug } from '@/lib/utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

function formatDate(date: Date | string | null): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

export async function GET() {
  try {
    const conn = await connectDB();
    if (!conn) {
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }
    const now = new Date();
    
    // Get active discounts only
    const [discounts, brands] = await Promise.all([
      Discount.find({
        $or: [
          { expiry_date: { $gte: now } },
          { expiry_date: null },
          { expiry_date: { $exists: false } },
          { expiry_date: '' }
        ]
      }).sort({ created_at: -1 }).limit(1000).lean(),
      Brand.find({}).lean(),
    ]);
    
    const brandMap = new Map(brands.map((b: any) => [b.id, b]));
    
    const urls = discounts.map((discount: any) => {
      const brand = brandMap.get(discount.brand_id);
      if (!brand) return '';
      
      const shortId = getShortId(discount.id);
      const dealSlug = generateSlug(discount.title);
      const url = `${SITE_URL}/magaza/${(brand as any).slug}/indirim/${dealSlug}-${shortId}`;
      
      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${formatDate(discount.updated_at || discount.created_at)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).filter(Boolean).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap deals error:', error);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
