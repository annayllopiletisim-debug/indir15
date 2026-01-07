import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import CategoryBar from './CategoryBar';

async function getCategories() {
  await connectDB();
  const categories = await Category.find({}).sort({ order: 1 }).lean();
  return categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
  }));
}

export default async function CategoryBarWrapper() {
  const categories = await getCategories();
  return <CategoryBar categories={categories} />;
}
