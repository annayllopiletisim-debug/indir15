import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Category, Discount } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { collection, data } = await request.json();
    
    if (!collection || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    let Model: any;
    switch (collection) {
      case 'brands':
        Model = Brand;
        break;
      case 'categories':
        Model = Category;
        break;
      case 'discounts':
        Model = Discount;
        break;
      default:
        return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });
    }
    
    // Clear existing data
    await Model.deleteMany({});
    
    // Insert new data
    const result = await Model.insertMany(data, { ordered: false });
    
    return NextResponse.json({ 
      success: true, 
      inserted: result.length,
      collection 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
