import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Discount, Brand } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import { revalidateContent } from '@/lib/revalidate';

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
    
    // Get current discount to find brand slug
    const currentDiscount = await Discount.findOne({ id }).lean();
    const brandId = data.brand_id || (currentDiscount as any)?.brand_id;
    
    const result = await Discount.updateOne({ id }, { $set: data });
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'İndirim bulunamadı' }, { status: 404 });
    }
    
    // Revalidate cached pages
    let brandSlug: string | undefined;
    if (brandId) {
      const brand = await Brand.findOne({ id: brandId }).select('slug').lean();
      brandSlug = (brand as any)?.slug;
    }
    revalidateContent('discounts', brandSlug);
    
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
    
    // Get discount to find brand slug before deleting
    const discount = await Discount.findOne({ id }).lean();
    const brandId = (discount as any)?.brand_id;
    
    const result = await Discount.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'İndirim bulunamadı' }, { status: 404 });
    }
    
    // Revalidate cached pages
    let brandSlug: string | undefined;
    if (brandId) {
      const brand = await Brand.findOne({ id: brandId }).select('slug').lean();
      brandSlug = (brand as any)?.slug;
    }
    revalidateContent('discounts', brandSlug);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}
