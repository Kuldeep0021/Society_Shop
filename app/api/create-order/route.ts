// Razorpay create-order API route.
// Creates a Razorpay order on the server and returns the order ID.
//
// CONFIG: Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in `.env.local`.
// Until configured, this returns a mock order (demo mode).

import { NextRequest, NextResponse } from 'next/server';
import { razorpay, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Demo mode: return a mock order ID.
    if (!isRazorpayConfigured || !razorpay) {
      return NextResponse.json({
        orderId: 'order_demo_' + (orderId || Date.now()),
        amount: amount * 100,
        currency: 'INR',
        demo: true,
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert rupees to paise
      currency: 'INR',
      receipt: orderId || 'order_' + Date.now(),
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create order' },
      { status: 500 },
    );
  }
}
