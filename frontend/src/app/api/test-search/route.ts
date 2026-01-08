import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand } from '@/lib/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    
    await connectDB();
    
    // Get all brands
    const allBrands = await Brand.find({}).lean();
    
    // Simple search
    const matches = allBrands.filter((brand: any) => {
      return brand.name.toLowerCase().includes(query.toLowerCase());
    });
    
    return NextResponse.json({
      query,
      totalBrands: allBrands.length,
      matches: matches.map((b: any) => ({ id: b.id, name: b.name }))
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}