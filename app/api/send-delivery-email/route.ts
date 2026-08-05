// SendGrid delivery email API route.
// Called when an order status changes to "delivered".
// Fetches the user's email from Firestore (users/{userId}) and sends a
// friendly order-delivered email via SendGrid.
//
// CONFIG: Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in `.env.local`.
//   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
//   SENDGRID_FROM_EMAIL=orders@yourstore.com
//
// For server-side Firestore access (reading the order + user email):
//   FIREBASE_CLIENT_EMAIL=
//   FIREBASE_PRIVATE_KEY=
//
// This same logic can be deployed as a Firebase Cloud Function.
// See functions/sendDeliveryEmail.js for the Cloud Functions version.

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminDb, isAdminConfigured } from '@/lib/firebase-admin';
import * as demo from '@/lib/store';

// CONFIG: Set these in `.env.local`
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const isSmtpConfigured = Boolean(SMTP_EMAIL && SMTP_PASSWORD);
const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD?.replace(/ /g, ''), // Ensure no spaces in app password
      },
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Fetch order (Firestore Admin or demo store).
    let order: any;
    if (isAdminConfigured && adminDb) {
      const snap = await adminDb.collection('orders').doc(orderId).get();
      if (!snap.exists) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      order = { id: snap.id, ...snap.data() };
    } else {
      order = demo.demoGetOrder(orderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    }

    // Fetch user email from users/{userId}.
    let userEmail: string | undefined;
    if (isAdminConfigured && adminDb) {
      const userSnap = await adminDb.collection('users').doc(order.userId).get();
      if (userSnap.exists) {
        userEmail = (userSnap.data() as any).email;
      }
    } else {
      const user = demo.demoGetUser();
      userEmail = user?.email || undefined;
    }

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        message: 'No email on file for this customer. Email not sent.',
      });
    }

    // Build email content.
    const itemsList = (order.items || [])
      .map((i: any) => `${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`)
      .join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Your order has been delivered!</h2>
        <p>Hi there,</p>
        <p>Great news — your order from <strong>Society General Store</strong> has been delivered.</p>
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Order Details</h3>
        <p><strong>Order ID:</strong> #${String(orderId).slice(-8)}</p>
        <p><strong>Delivered to:</strong> Tower ${order.deliveryAddress.tower}, Flat ${order.deliveryAddress.flatNumber}</p>
        <p><strong>Items:</strong></p>
        <pre style="background: #f9fafb; padding: 12px; border-radius: 8px; font-family: Arial, sans-serif;">${itemsList}</pre>
        <p><strong>Total:</strong> ₹${order.totalAmount}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
          Thank you for shopping with Society General Store!
        </p>
      </div>
    `;

    // Demo mode: log instead of sending.
    if (!isSmtpConfigured || !transporter) {
      console.log('[DEMO] Delivery email would be sent to:', userEmail);
      console.log('[DEMO] Email subject: Order Delivered — Society General Store');
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'SMTP not configured. Email logged to console.',
      });
    }

    await transporter.sendMail({
      to: userEmail,
      from: `"Society General Store" <${SMTP_EMAIL}>`,
      subject: `Order Delivered — Society General Store (#${String(orderId).slice(-8)})`,
      html,
    });

    return NextResponse.json({ success: true, message: 'Email sent' });
  } catch (error: any) {
    console.error('Send delivery email error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send email' },
      { status: 500 },
    );
  }
}
