import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import { Coupon, Brand } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import { revalidateContent } from '@/lib/revalidate';

export async function GET() {
  try {
    await connectDB();
    const coupons = await Coupon.find({}).sort({ created_at: -1 }).limit(500).lean();
    const sanitized = coupons.map((c: any) => ({ ...c, _id: undefined }));
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
    
    const coupon = new Coupon({
      id: uuidv4(),
      ...data,
      is_active: true,
      created_at: new Date(),
    });
    
    await coupon.save();
    
    // Revalidate cached pages
    let brandSlug: string | undefined;
    if (data.brand_id) {
      const brand = await Brand.findOne({ id: data.brand_id }).select('slug').lean();
      brandSlug = (brand as any)?.slug;
    }
    revalidateContent('coupons', brandSlug);
    
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}
