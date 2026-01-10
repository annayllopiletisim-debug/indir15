import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Category, Discount } from '@/lib/models';

// Import seed data
import brandsData from '@/data/brands.json';
import categoriesData from '@/data/categories.json';
import discountsData from '@/data/discounts.json';

export const dynamic = 'force-dynamic';

// Secret key to protect the endpoint
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'migrate-indirimkesfet-2026';

export async function POST(request: Request) {
  try {
    // Check secret key
    const { secret } = await request.json();
    
    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const results: Record<string, any> = {};
    
    // Migrate categories first (brands depend on them)
    console.log('Migrating categories...');
    await Category.deleteMany({});
    const categoryResult = await Category.insertMany(categoriesData);
    results.categories = { inserted: categoryResult.length };
    console.log(`Inserted ${categoryResult.length} categories`);
    
    // Migrate brands
    console.log('Migrating brands...');
    await Brand.deleteMany({});
    const brandResult = await Brand.insertMany(brandsData);
    results.brands = { inserted: brandResult.length };
    console.log(`Inserted ${brandResult.length} brands`);
    
    // Migrate discounts
    console.log('Migrating discounts...');
    await Discount.deleteMany({});
    const discountResult = await Discount.insertMany(discountsData);
    results.discounts = { inserted: discountResult.length };
    console.log(`Inserted ${discountResult.length} discounts`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully!',
      results 
    });
    
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Migration endpoint ready. Send POST request with { "secret": "your-secret" } to migrate data.',
    dataReady: {
      brands: brandsData.length,
      categories: categoriesData.length,
      discounts: discountsData.length
    }
  });
}
