import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  
  const categories = await Category.find({}).sort({ order: 1 }).lean();
  
  return categories.map((cat: any) => ({
    url: `${SITE_URL}/kategori/${cat.slug}`,
    lastModified: cat.updated_at || cat.created_at || new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));
}
