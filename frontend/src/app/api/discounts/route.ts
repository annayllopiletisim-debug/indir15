import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import { Discount } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

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
    return NextResponse.json({ success: true, discount });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}
