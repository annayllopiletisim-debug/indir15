import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import { BlogPost } from '@/lib/models';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  
  const posts = await BlogPost.find({ is_published: true }).sort({ published_at: -1 }).lean();
  
  return posts.map((post: any) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at || post.published_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
}
