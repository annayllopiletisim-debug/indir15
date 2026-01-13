import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import { Discount, Brand } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import { revalidateContent } from '@/lib/revalidate';

export async function GET() {
  try {
    await connectDB();
    const discounts = await Discount.find({}).sort({ created_at: -1 }).limit(500).lean();
    const sanitized = discounts.map((d: any) => ({ ...d, _id: undefined }));
    return NextResponse.json(sanitized);
  } catch (error) {
    return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authenticated } = await verifyAuth();
    if (!authenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    const discount = new Discount({
      id: uuidv4(),
      ...data,
      created_at: new Date(),
    });
    
    await discount.save();
    
    // Revalidate cached pages - get brand slug for specific page revalidation
    let brandSlug: string | undefined;
    if (data.brand_id) {
      const brand = await Brand.findOne({ id: data.brand_id }).select('slug').lean();
      brandSlug = (brand as any)?.slug;
    }
    revalidateContent('discounts', brandSlug);
    
    return NextResponse.json({ success: true, discount });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}
