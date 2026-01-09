import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import { Brand, BlogPost, Category } from '@/lib/models';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indirimkesfet.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  // Get all brands
  const brands = await Brand.find({}).lean();
  const brandUrls = brands.map((brand: any) => ({
    url: `${SITE_URL}/magaza/${brand.slug}`,
    lastModified: brand.created_at || new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Get all categories
  const categories = await Category.find({}).lean();
  const categoryUrls = categories.map((cat: any) => ({
    url: `${SITE_URL}/kategori/${cat.slug}`,
    lastModified: cat.created_at || new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Get all published blog posts
  const blogPosts = await BlogPost.find({ is_published: true }).lean();
  const blogUrls = blogPosts.map((post: any) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at || post.published_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Static pages
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/magazalar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kuponlar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/indirimler`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kategoriler`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/bitmek-uzere`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/gecmis-indirimler`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/son-24-saat`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/gizlilik`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [...staticPages, ...brandUrls, ...categoryUrls, ...blogUrls];
}
