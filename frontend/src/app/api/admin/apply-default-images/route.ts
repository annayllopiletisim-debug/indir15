import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand, Discount } from '@/lib/models';
import { existsSync } from 'fs';

// POST /api/admin/apply-default-images - Apply brand's default_deal_image to discounts without images
export async function POST() {
  try {
    await connectDB();
    
    const updates: string[] = [];
    
    // Get all brands with default_deal_image
    const brands = await Brand.find({ 
      default_deal_image: { $exists: true, $nin: ['', null] } 
    }).lean();
    
    for (const b of brands) {
      const brand = b as any;
      
      // Check if default_deal_image file actually exists
      const imagePath = brand.default_deal_image.replace('/uploads/', '/app/uploads/');
      if (!existsSync(imagePath)) {
        updates.push(`SKIP: ${brand.name} - Varsayılan görsel dosyası mevcut değil: ${brand.default_deal_image}`);
        continue;
      }
      
      // Find discounts for this brand that don't have images or have broken image paths
      const discounts = await Discount.find({ 
        brand_id: brand.id,
        $or: [
          { image_url: { $exists: false } },
          { image_url: null },
          { image_url: '' }
        ]
      }).lean();
      
      for (const d of discounts) {
        const discount = d as any;
        await Discount.updateOne(
          { id: discount.id },
          { $set: { image_url: brand.default_deal_image } }
        );
        updates.push(`✓ "${discount.title}" -> ${brand.default_deal_image}`);
      }
      
      // Also check for discounts with broken image paths (file doesn't exist)
      const allDiscounts = await Discount.find({ 
        brand_id: brand.id,
        image_url: { $exists: true, $nin: ['', null] }
      }).lean();
      
      for (const d of allDiscounts) {
        const discount = d as any;
        const discountImagePath = discount.image_url.replace('/uploads/', '/app/uploads/');
        
        if (!existsSync(discountImagePath)) {
          await Discount.updateOne(
            { id: discount.id },
            { $set: { image_url: brand.default_deal_image } }
          );
          updates.push(`✓ "${discount.title}" (kırık görsel düzeltildi) -> ${brand.default_deal_image}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${updates.filter(u => u.startsWith('✓')).length} indirim güncellendi`,
      updates
    });
  } catch (error) {
    console.error('Apply default images error:', error);
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 });
  }
}
