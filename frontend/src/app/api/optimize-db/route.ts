import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    const expectedSecret = process.env.OPTIMIZE_DB_SECRET;
    
    // Require environment variable for secret - no hardcoded values
    if (!expectedSecret) {
      console.error('OPTIMIZE_DB_SECRET environment variable not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const results: string[] = [];

    // Create indexes for discounts collection
    try {
      await db.collection('discounts').createIndex({ brand_id: 1 });
      results.push('discounts.brand_id index created');
    } catch (e: any) {
      results.push(`discounts.brand_id: ${e.message}`);
    }

    try {
      await db.collection('discounts').createIndex({ expiry_date: 1 });
      results.push('discounts.expiry_date index created');
    } catch (e: any) {
      results.push(`discounts.expiry_date: ${e.message}`);
    }

    try {
      await db.collection('discounts').createIndex({ is_featured: 1, created_at: -1 });
      results.push('discounts.is_featured_created_at index created');
    } catch (e: any) {
      results.push(`discounts.is_featured: ${e.message}`);
    }

    // Create indexes for coupons collection
    try {
      await db.collection('coupons').createIndex({ brand_id: 1 });
      results.push('coupons.brand_id index created');
    } catch (e: any) {
      results.push(`coupons.brand_id: ${e.message}`);
    }

    try {
      await db.collection('coupons').createIndex({ is_active: 1, expiry_date: 1 });
      results.push('coupons.is_active_expiry_date index created');
    } catch (e: any) {
      results.push(`coupons.is_active: ${e.message}`);
    }

    // Create indexes for brands collection
    try {
      await db.collection('brands').createIndex({ slug: 1 }, { unique: true });
      results.push('brands.slug index created');
    } catch (e: any) {
      results.push(`brands.slug: ${e.message}`);
    }

    try {
      await db.collection('brands').createIndex({ category_ids: 1 });
      results.push('brands.category_ids index created');
    } catch (e: any) {
      results.push(`brands.category_ids: ${e.message}`);
    }

    // Create indexes for categories collection
    try {
      await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
      results.push('categories.slug index created');
    } catch (e: any) {
      results.push(`categories.slug: ${e.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database optimization completed',
      results 
    });
  } catch (error: any) {
    console.error('Optimization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
