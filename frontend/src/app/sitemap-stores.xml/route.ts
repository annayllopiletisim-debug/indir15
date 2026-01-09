import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import { Brand } from '@/lib/models';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  
  const brands = await Brand.find({}).sort({ name: 1 }).lean();
  
  return brands.map((brand: any) => ({
    url: `${SITE_URL}/magaza/${brand.slug}`,
    lastModified: brand.updated_at || brand.created_at || new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));
}
