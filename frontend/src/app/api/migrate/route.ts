import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Category, Discount } from '@/lib/models';

// Import seed data
import brandsData from '@/data/brands.json';
import categoriesData from '@/data/categories.json';
import discountsData from '@/data/discounts.json';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Secret key must come from environment - no fallbacks
    const MIGRATION_SECRET = process.env.MIGRATION_SECRET;
    if (!MIGRATION_SECRET) {
      console.error('MIGRATION_SECRET environment variable not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Check secret key
    const { secret } = await request.json();
    
    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const results: Record<string, any> = {};
    
    // Check if data already exists
    const existingCategories = await Category.countDocuments();
    const existingBrands = await Brand.countDocuments();
    const existingDiscounts = await Discount.countDocuments();
    
    if (existingCategories > 0 || existingBrands > 0 || existingDiscounts > 0) {
      return NextResponse.json({ 
        message: 'Data already exists in database',
        existing: {
          categories: existingCategories,
          brands: existingBrands,
          discounts: existingDiscounts
        }
      });
    }
    
    // Migrate categories first (brands depend on them)
    console.log('Migrating categories...');
    const categoryResult = await Category.insertMany(categoriesData, { ordered: false });
    results.categories = { inserted: categoryResult.length };
    console.log(`Inserted ${categoryResult.length} categories`);
    
    // Migrate brands
    console.log('Migrating brands...');
    const brandResult = await Brand.insertMany(brandsData, { ordered: false });
    results.brands = { inserted: brandResult.length };
    console.log(`Inserted ${brandResult.length} brands`);
    
    // Migrate discounts
    console.log('Migrating discounts...');
    const discountResult = await Discount.insertMany(discountsData, { ordered: false });
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
