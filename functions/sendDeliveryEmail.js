// Firebase Cloud Functions version of the delivery email notification.
// Deploy this to Firebase Cloud Functions (or use the Next.js API route at
// /api/send-delivery-email as an alternative).
//
// To deploy:
//   1. npm install -g firebase-tools
//   2. firebase login
//   3. firebase init functions  (select this project)
//   4. Copy this file to functions/index.js
//   5. cd functions && npm install @sendgrid/mail firebase-admin firebase-functions
//   6. firebase deploy --only functions
//
// CONFIG: Set these env vars on the Cloud Function (firebase functions:secrets:set):
//   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
//   SENDGRID_FROM_EMAIL=orders@yourstore.com
//
// This function triggers automatically when an order's status changes to
// "delivered" in Firestore.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
const db = admin.firestore();

// CONFIG: Set SENDGRID_API_KEY via `firebase functions:secrets:set SENDGRID_API_KEY`
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'orders@societystore.com';

/**
 * Triggers when an order document is updated in Firestore.
 * Sends a delivery email when the status becomes "delivered".
 */
exports.onOrderStatusChange = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only send when status transitions TO "delivered".
    if (before.status === 'delivered' || after.status !== 'delivered') {
      return null;
    }

    const orderId = context.params.orderId;

    // Fetch the user's email from users/{userId}.
    const userDoc = await db.collection('users').doc(after.userId).get();
    const userEmail = userDoc.exists ? userDoc.data().email : null;

    if (!userEmail) {
      console.log('No email on file for user', after.userId);
      return null;
    }

    const itemsList = (after.items || [])
      .map((i) => `${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`)
      .join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Your order has been delivered!</h2>
        <p>Hi there,</p>
        <p>Great news — your order from <strong>Society General Store</strong> has been delivered.</p>
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Order Details</h3>
        <p><strong>Order ID:</strong> #${orderId.slice(-8)}</p>
        <p><strong>Delivered to:</strong> Tower ${after.deliveryAddress.tower}, Flat ${after.deliveryAddress.flatNumber}</p>
        <p><strong>Items:</strong></p>
        <pre style="background: #f9fafb; padding: 12px; border-radius: 8px; font-family: Arial, sans-serif;">${itemsList}</pre>
        <p><strong>Total:</strong> ₹${after.totalAmount}</p>
        <p><strong>Payment:</strong> ${after.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>
        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
          Thank you for shopping with Society General Store!
        </p>
      </div>
    `;

    try {
      await sgMail.send({
        to: userEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: `Order Delivered — Society General Store (#${orderId.slice(-8)})`,
        html,
      });
      console.log('Delivery email sent to', userEmail);
    } catch (err) {
      console.error('Failed to send delivery email:', err);
    }

    return null;
  });
