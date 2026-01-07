import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Discount, Coupon, Giveaway } from '@/lib/models';

// POST /api/track/click - Track clicks on deals
export async function POST(request: NextRequest) {
  try {
    const { type, id } = await request.json();

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    await connectDB();

    let result;
    switch (type) {
      case 'discount':
        result = await Discount.findOneAndUpdate(
          { id },
          { $inc: { click_count: 1 } },
          { new: true }
        );
        break;
      case 'coupon':
        result = await Coupon.findOneAndUpdate(
          { id },
          { $inc: { click_count: 1 } },
          { new: true }
        );
        break;
      case 'giveaway':
        result = await Giveaway.findOneAndUpdate(
          { id },
          { $inc: { click_count: 1 } },
          { new: true }
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, click_count: result.click_count });
  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}
