import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Simple auth check
    const { secret } = await request.json();
    if (secret !== 'fix-dates-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const results: any = {
      discounts: { found: 0, updated: 0 },
      coupons: { found: 0, updated: 0 },
      giveaways: { found: 0, updated: 0 },
    };

    // Fix discounts
    const discounts = await db.collection('discounts').find({ 
      expiry_date: { $type: 'string' } 
    }).toArray();
    results.discounts.found = discounts.length;
    
    for (const d of discounts) {
      if (d.expiry_date && typeof d.expiry_date === 'string') {
        const dateObj = new Date(d.expiry_date);
        if (!isNaN(dateObj.getTime())) {
          await db.collection('discounts').updateOne(
            { _id: d._id },
            { $set: { expiry_date: dateObj } }
          );
          results.discounts.updated++;
        }
      }
    }

    // Fix coupons
    const coupons = await db.collection('coupons').find({ 
      expiry_date: { $type: 'string' } 
    }).toArray();
    results.coupons.found = coupons.length;
    
    for (const c of coupons) {
      if (c.expiry_date && typeof c.expiry_date === 'string') {
        const dateObj = new Date(c.expiry_date);
        if (!isNaN(dateObj.getTime())) {
          await db.collection('coupons').updateOne(
            { _id: c._id },
            { $set: { expiry_date: dateObj } }
          );
          results.coupons.updated++;
        }
      }
    }

    // Fix giveaways
    const giveaways = await db.collection('giveaways').find({ 
      expiry_date: { $type: 'string' } 
    }).toArray();
    results.giveaways.found = giveaways.length;
    
    for (const g of giveaways) {
      if (g.expiry_date && typeof g.expiry_date === 'string') {
        const dateObj = new Date(g.expiry_date);
        if (!isNaN(dateObj.getTime())) {
          await db.collection('giveaways').updateOne(
            { _id: g._id },
            { $set: { expiry_date: dateObj } }
          );
          results.giveaways.updated++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Date migration completed',
      results 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
