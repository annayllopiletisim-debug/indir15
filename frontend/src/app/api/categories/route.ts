import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ order: 1 }).lean();
    const sanitized = categories.map((c: any) => ({ ...c, _id: undefined }));
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
    
    const category = new Category({
      id: uuidv4(),
      ...data,
      created_at: new Date(),
    });
    
    await category.save();
    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}
