// Razorpay payment verification API route.
// Verifies the payment signature sent by Razorpay checkout.
//
// CONFIG: RAZORPAY_KEY_SECRET must be set in `.env.local`.
// Until configured, this accepts all payments (demo mode only).

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Demo mode: accept without verification.
    if (!isRazorpayConfigured) {
      return NextResponse.json({
        verified: true,
        demo: true,
        message: 'Demo mode: payment verification skipped.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Verification failed' },
      { status: 500 },
    );
  }
}
