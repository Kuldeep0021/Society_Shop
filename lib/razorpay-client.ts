// Browser-side Razorpay checkout helper.
// Loads the Razorpay checkout.js script and opens the payment modal.
//
// CONFIG: Set NEXT_PUBLIC_RAZORPAY_KEY_ID in `.env.local` (public key, safe to expose).

export interface RazorpayOptions {
  amount: number; // in paise
  orderId: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  onDismiss: () => void;
}

export function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER';
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayOptions) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Failed to load Razorpay checkout script');
  }
  const rzp = new (window as any).Razorpay({
    key: getRazorpayKeyId(),
    amount: options.amount,
    currency: 'INR',
    order_id: options.orderId,
    name: options.name,
    description: options.description,
    prefill: options.prefill,
    handler: options.onSuccess,
    modal: {
      ondismiss: options.onDismiss,
    },
    theme: { color: '#10b981' },
  });
  rzp.open();
}
