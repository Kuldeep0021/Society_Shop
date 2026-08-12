import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DiscountCode from '@/models/DiscountCode';

// POST /api/discounts/validate
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const discount = await DiscountCode.findOne({ code: code.toUpperCase() });

    if (!discount) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 });
    }

    if (!discount.isActive) {
      return NextResponse.json({ error: 'This code is no longer active' }, { status: 400 });
    }

    if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'This code has expired' }, { status: 400 });
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 });
    }

    return NextResponse.json(discount);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
