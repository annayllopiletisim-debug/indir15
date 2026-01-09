import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand } from '@/lib/models';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

function formatDate(date: Date | string | null): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

export async function GET() {
  await connectDB();
  
  const brands = await Brand.find({}).sort({ name: 1 }).lean();
  
  const urls = brands.map((brand: any) => `
  <url>
    <loc>${SITE_URL}/magaza/${brand.slug}</loc>
    <lastmod>${formatDate(brand.updated_at || brand.created_at)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

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
}
