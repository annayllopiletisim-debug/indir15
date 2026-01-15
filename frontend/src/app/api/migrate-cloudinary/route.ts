import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/db';
import { Brand, Discount, Coupon, BlogPost } from '@/lib/models';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const UPLOAD_DIR = '/app/uploads';

async function uploadToCloudinary(localPath: string, folder: string): Promise<string | null> {
  try {
    // Extract filename from path
    const filename = localPath.replace('/uploads/', '').replace('/api/uploads/', '');
    const filepath = join(UPLOAD_DIR, filename);
    
    if (!existsSync(filepath)) {
      console.log(`File not found: ${filepath}`);
      return null;
    }
    
    const fileBuffer = await readFile(filepath);
    const base64 = `data:image/png;base64,${fileBuffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64, {
      folder: `indirimkesfet/${folder}`,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:`, error);
    return null;
  }
}

function isLocalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('/uploads/') || url.startsWith('/api/uploads/');
}

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    
    if (secret !== process.env.MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const results = {
      brands: { processed: 0, migrated: 0, failed: 0 },
      discounts: { processed: 0, migrated: 0, failed: 0 },
      coupons: { processed: 0, migrated: 0, failed: 0 },
      blog: { processed: 0, migrated: 0, failed: 0 },
    };
    
    // Migrate Brand images
    const brands = await Brand.find({}).lean();
    for (const brand of brands) {
      results.brands.processed++;
      let updated = false;
      const updateData: any = {};
      
      if (isLocalUrl(brand.logo_url)) {
        const newUrl = await uploadToCloudinary(brand.logo_url, 'brands');
        if (newUrl) {
          updateData.logo_url = newUrl;
          updated = true;
        } else {
          results.brands.failed++;
        }
      }
      
      if (isLocalUrl(brand.default_deal_image)) {
        const newUrl = await uploadToCloudinary(brand.default_deal_image, 'brands');
        if (newUrl) {
          updateData.default_deal_image = newUrl;
          updated = true;
        } else {
          results.brands.failed++;
        }
      }
      
      if (updated) {
        await Brand.updateOne({ _id: brand._id }, { $set: updateData });
        results.brands.migrated++;
      }
    }
    
    // Migrate Discount images
    const discounts = await Discount.find({}).lean();
    for (const discount of discounts) {
      results.discounts.processed++;
      
      if (isLocalUrl(discount.image_url)) {
        const newUrl = await uploadToCloudinary(discount.image_url, 'deals');
        if (newUrl) {
          await Discount.updateOne({ _id: discount._id }, { $set: { image_url: newUrl } });
          results.discounts.migrated++;
        } else {
          results.discounts.failed++;
        }
      }
    }
    
    // Migrate Coupon images
    const coupons = await Coupon.find({}).lean();
    for (const coupon of coupons) {
      results.coupons.processed++;
      
      if (isLocalUrl(coupon.image_url)) {
        const newUrl = await uploadToCloudinary(coupon.image_url, 'deals');
        if (newUrl) {
          await Coupon.updateOne({ _id: coupon._id }, { $set: { image_url: newUrl } });
          results.coupons.migrated++;
        } else {
          results.coupons.failed++;
        }
      }
    }
    
    // Migrate Blog images
    const posts = await BlogPost.find({}).lean();
    for (const post of posts) {
      results.blog.processed++;
      
      if (isLocalUrl(post.cover_image)) {
        const newUrl = await uploadToCloudinary(post.cover_image, 'blog');
        if (newUrl) {
          await BlogPost.updateOne({ _id: post._id }, { $set: { cover_image: newUrl } });
          results.blog.migrated++;
        } else {
          results.blog.failed++;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
