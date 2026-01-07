import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Discount } from '@/lib/models';

// POST /api/admin/sync-brand-images - Sync brand default images from their discounts
export async function POST() {
  try {
    await connectDB();
    
    // Get all brands
    const brands = await Brand.find({}).lean();
    
    let updatedCount = 0;
    const updates: string[] = [];
    
    for (const brand of brands) {
      const brandData = brand as any;
      
      // Skip if brand already has a default_deal_image
      if (brandData.default_deal_image) {
        continue;
      }
      
      // Find a discount with an image for this brand
      const discountWithImage = await Discount.findOne({
        brand_id: brandData.id,
        image_url: { $exists: true, $ne: '', $ne: null }
      }).lean();
      
      if (discountWithImage) {
        const discountData = discountWithImage as any;
        
        // Update brand with the discount's image
        await Brand.updateOne(
          { id: brandData.id },
          { $set: { default_deal_image: discountData.image_url } }
        );
        
        updatedCount++;
        updates.push(`${brandData.name}: ${discountData.image_url}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${updatedCount} mağaza güncellendi`,
      updates
    });
  } catch (error) {
    console.error('Sync brand images error:', error);
    return NextResponse.json({ error: 'Senkronizasyon hatası' }, { status: 500 });
  }
}
