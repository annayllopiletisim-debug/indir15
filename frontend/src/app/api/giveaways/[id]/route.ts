import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Giveaway } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const giveaway = await Giveaway.findOne({ id }).lean();
    
    if (!giveaway) {
      return NextResponse.json({ error: 'Çekiliş bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ ...(giveaway as any), _id: undefined });
  } catch (error) {
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await verifyAuth();
    if (!authenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const data = await request.json();
    
    const result = await Giveaway.updateOne({ id }, { $set: data });
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Çekiliş bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated } = await verifyAuth();
    if (!authenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const result = await Giveaway.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Çekiliş bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}
