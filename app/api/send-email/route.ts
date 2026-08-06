import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { orderId, amount, customerEmail, customerName } = await req.json();

    // Nodemailer configuration using environment variables from .env.local
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL || 'shrishyammart01@gmail.com',
        pass: process.env.SMTP_PASSWORD || 'dummy_password',
      },
    });

    const mailOptions = {
      from: '"Society Store" <shrishyammart01@gmail.com>',
      to: customerEmail || 'shrishyammart01@gmail.com', // Send to customer, fallback to admin
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #059669;">Thank you for your order!</h2>
          <p>Hi ${customerName || 'Customer'},</p>
          <p>We've successfully received your order <strong>#${orderId}</strong>.</p>
          <p>Total Amount: <strong>₹${amount}</strong></p>
          <p>We will prepare your items for delivery soon.</p>
          <br/>
          <p>Best regards,<br/>Society Store Team</p>
        </div>
      `,
    };

    // Send the email (Wrapped in try/catch to not break checkout if email fails)
    await transporter.sendMail(mailOptions);
    console.log('Successfully sent email for:', mailOptions.subject);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
