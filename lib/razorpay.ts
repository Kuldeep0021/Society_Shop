// Razorpay server-side client.
//
// CONFIG: Add your Razorpay Key ID and Key Secret in `.env.local`.
//   RAZORPAY_KEY_ID=
//   RAZORPAY_KEY_SECRET=
//
// The browser also needs the Key ID (public, safe to expose):
//   NEXT_PUBLIC_RAZORPAY_KEY_ID=
//
// Until configured, the API routes run in DEMO MODE and return a mock order.

import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export const isRazorpayConfigured = Boolean(keyId && keySecret);

export const razorpay = isRazorpayConfigured
  ? new Razorpay({ key_id: keyId!, key_secret: keySecret! })
  : null;

export const razorpayKeyId = keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
