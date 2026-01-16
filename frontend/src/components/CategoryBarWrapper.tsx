import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import CategoryBar from './CategoryBar';

const getCategories = unstable_cache(
  async () => {
    try {
      const conn = await connectDB();
      if (!conn) return [];
      const categories = await Category.find({}).sort({ order: 1 }).lean();
      return categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
      }));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },
  ['categories-bar'],
  { revalidate: 3600 } // 1 saat cache
);

export default async function CategoryBarWrapper() {
  const categories = await getCategories();
  // Don't render if no categories (build time or empty DB)
  if (categories.length === 0) {
    return null;
  }
  return <CategoryBar categories={categories} />;
}
