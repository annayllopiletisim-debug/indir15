import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

function formatDate(date: Date | string | null): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

export async function GET() {
  await connectDB();
  
  const categories = await Category.find({}).sort({ order: 1 }).lean();
  
  const urls = categories.map((cat: any) => `
  <url>
    <loc>${SITE_URL}/kategori/${cat.slug}</loc>
    <lastmod>${formatDate(cat.updated_at || cat.created_at)}</lastmod>
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
