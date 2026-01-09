import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import { Giveaway } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const giveaways = await Giveaway.find({}).sort({ created_at: -1 }).limit(200).lean();
    const sanitized = giveaways.map((g: any) => ({ ...g, _id: undefined }));
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
    
    const giveaway = new Giveaway({
      id: uuidv4(),
      ...data,
      created_at: new Date(),
    });
    
    await giveaway.save();
    return NextResponse.json({ success: true, giveaway });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}
