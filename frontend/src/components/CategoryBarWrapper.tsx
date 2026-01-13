import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import CategoryBar from './CategoryBar';

async function getCategories() {
  try {
    const conn = await connectDB();
    // If connection is null (build phase), return empty
    if (!conn) {
      return [];
    }
    const categories = await Category.find({}).sort({ order: 1 }).lean();
    return categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
    }));
  } catch (error) {
    // Return empty array if DB is not available (during build)
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function CategoryBarWrapper() {
  const categories = await getCategories();
  // Don't render if no categories (build time or empty DB)
  if (categories.length === 0) {
    return null;
  }
  return <CategoryBar categories={categories} />;
}
