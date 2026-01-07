import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Discount, Coupon, Giveaway, Brand, BlogPost } from '@/lib/models';

// POST /api/admin/fix-image-urls - Fix incorrect image URLs in database
export async function POST() {
  try {
    await connectDB();
    
    const fixes: string[] = [];
    
    // Fix pattern: /api/uploads/images/xxx -> /uploads/xxx
    const fixUrl = (url: string | undefined | null): string | null => {
      if (!url) return null;
      
      // Fix /api/uploads/images/xxx pattern
      if (url.startsWith('/api/uploads/images/')) {
        return url.replace('/api/uploads/images/', '/uploads/');
      }
      
      // Fix /api/uploads/xxx pattern
      if (url.startsWith('/api/uploads/')) {
        return url.replace('/api/uploads/', '/uploads/');
      }
      
      return null; // No fix needed
    };
    
    // Fix Discounts
    const discounts = await Discount.find({}).lean();
    for (const d of discounts) {
      const discount = d as any;
      const fixedUrl = fixUrl(discount.image_url);
      if (fixedUrl) {
        await Discount.updateOne(
          { id: discount.id },
          { $set: { image_url: fixedUrl } }
        );
        fixes.push(`Discount "${discount.title}": ${discount.image_url} -> ${fixedUrl}`);
      }
    }
    
    // Fix Coupons
    const coupons = await Coupon.find({}).lean();
    for (const c of coupons) {
      const coupon = c as any;
      const fixedUrl = fixUrl(coupon.image_url);
      if (fixedUrl) {
        await Coupon.updateOne(
          { id: coupon.id },
          { $set: { image_url: fixedUrl } }
        );
        fixes.push(`Coupon "${coupon.title}": ${coupon.image_url} -> ${fixedUrl}`);
      }
    }
    
    // Fix Giveaways
    const giveaways = await Giveaway.find({}).lean();
    for (const g of giveaways) {
      const giveaway = g as any;
      const fixedUrl = fixUrl(giveaway.image_url);
      if (fixedUrl) {
        await Giveaway.updateOne(
          { id: giveaway.id },
          { $set: { image_url: fixedUrl } }
        );
        fixes.push(`Giveaway "${giveaway.title}": ${giveaway.image_url} -> ${fixedUrl}`);
      }
    }
    
    // Fix Brands (logo_url and default_deal_image)
    const brands = await Brand.find({}).lean();
    for (const b of brands) {
      const brand = b as any;
      const updates: any = {};
      
      const fixedLogo = fixUrl(brand.logo_url);
      if (fixedLogo) {
        updates.logo_url = fixedLogo;
        fixes.push(`Brand "${brand.name}" logo: ${brand.logo_url} -> ${fixedLogo}`);
      }
      
      const fixedDealImage = fixUrl(brand.default_deal_image);
      if (fixedDealImage) {
        updates.default_deal_image = fixedDealImage;
        fixes.push(`Brand "${brand.name}" default_deal_image: ${brand.default_deal_image} -> ${fixedDealImage}`);
      }
      
      if (Object.keys(updates).length > 0) {
        await Brand.updateOne({ id: brand.id }, { $set: updates });
      }
    }
    
    // Fix BlogPosts
    const posts = await BlogPost.find({}).lean();
    for (const p of posts) {
      const post = p as any;
      const fixedUrl = fixUrl(post.featured_image);
      if (fixedUrl) {
        await BlogPost.updateOne(
          { id: post.id },
          { $set: { featured_image: fixedUrl } }
        );
        fixes.push(`BlogPost "${post.title}": ${post.featured_image} -> ${fixedUrl}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${fixes.length} URL düzeltildi`,
      fixes
    });
  } catch (error) {
    console.error('Fix image URLs error:', error);
    return NextResponse.json({ error: 'Düzeltme hatası' }, { status: 500 });
  }
}
