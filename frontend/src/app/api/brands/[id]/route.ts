import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import { revalidateContent } from '@/lib/revalidate';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const brand = await Brand.findOne({ id }).lean();
    
    if (!brand) {
      return NextResponse.json({ error: 'Mağaza bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json({ ...(brand as any), _id: undefined });
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
    
    // Get current brand for slug
    const currentBrand = await Brand.findOne({ id }).select('slug').lean();
    
    const result = await Brand.updateOne({ id }, { $set: data });
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Mağaza bulunamadı' }, { status: 404 });
    }
    
    // Revalidate cached pages
    const brandSlug = data.slug || (currentBrand as any)?.slug;
    revalidateContent('brands', brandSlug);
    
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
    
    // Get brand slug before deleting
    const brand = await Brand.findOne({ id }).select('slug').lean();
    const brandSlug = (brand as any)?.slug;
    
    const result = await Brand.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Mağaza bulunamadı' }, { status: 404 });
    }
    
    // Revalidate cached pages
    revalidateContent('brands', brandSlug);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}
