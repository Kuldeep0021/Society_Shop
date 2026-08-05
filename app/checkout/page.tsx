'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, Lock, MapPin, Clock, CreditCard, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getSlots, createOrder, clearCart } from '@/lib/data';
import { openRazorpayCheckout } from '@/lib/razorpay-client';
import { DeliverySlot, Order, OrderStatus, PaymentMethod } from '@/lib/types';
import { TOWERS } from '@/data/sampleProducts';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalAmount, clear } = useCart();
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [tower, setTower] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [slot, setSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  useEffect(() => {
    getSlots()
      .then((s) => {
        setSlots(s.filter((x) => x.isActive));
        if (s.length > 0) setSlot(s[0].label);
      })
      .finally(() => setLoadingSlots(false));
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <Lock className="h-14 w-14 mx-auto text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mt-4">Login required</h1>
        <p className="text-muted-foreground mt-2">Please login to place an order.</p>
        <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const validate = () => {
    if (!tower) {
      toast.error('Select your tower/block');
      return false;
    }
    if (!flatNumber.trim()) {
      toast.error('Enter your flat number');
      return false;
    }
    if (!slot) {
      toast.error('Select a delivery slot');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validate() || !user) return;
    setPlacing(true);

    try {
      const order: Order = {
        id: 'order-' + Date.now(),
        userId: user.uid,
        items,
        totalAmount,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'unpaid',
        deliveryAddress: { tower, flatNumber: flatNumber.trim() },
        deliverySlot: slot,
        createdAt: Date.now(),
        statusHistory: [{ status: 'pending', timestamp: Date.now() }],
        customerPhone: user.phone,
      };

      if (paymentMethod === 'online') {
        // Create Razorpay order via API route.
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount, orderId: order.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create payment order');

        order.razorpayOrderId = data.orderId;

        // Open Razorpay checkout.
        await new Promise<void>((resolve, reject) => {
          openRazorpayCheckout({
            amount: totalAmount * 100,
            orderId: data.orderId,
            name: 'Society General Store',
            description: `Order for ${tower}-${flatNumber}`,
            prefill: { name: user.name, contact: user.phone },
            onSuccess: async (response) => {
              // Verify payment on server.
              try {
                const verifyRes = await fetch('/api/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok) throw new Error(verifyData.error);
                order.razorpayPaymentId = response.razorpay_payment_id;
                order.paymentStatus = 'paid';
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            onDismiss: () => reject(new Error('Payment cancelled')),
          }).catch(reject);
        });
      }

      // Save order to Firestore (or demo store).
      const createdId = await createOrder(order);
      await clearCart(user.uid);
      clear();
      toast.success('Order placed successfully!');
      router.push(`/orders/${createdId}`);
    } catch (err: any) {
      if (err?.message !== 'Payment cancelled') {
        toast.error(err?.message || 'Failed to place order');
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order summary */}
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-emerald-700">₹{totalAmount}</span>
          </div>
        </div>
      </Card>

      {/* Delivery address */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Delivery Address</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tower">Tower / Block</Label>
            <Select value={tower} onValueChange={setTower}>
              <SelectTrigger id="tower">
                <SelectValue placeholder="Select tower" />
              </SelectTrigger>
              <SelectContent>
                {TOWERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    Tower {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="flat">Flat Number</Label>
            <Input
              id="flat"
              placeholder="e.g. 302"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Delivery slot */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Delivery Slot</h2>
        </div>
        {loadingSlots ? (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <RadioGroup value={slot} onValueChange={setSlot} className="flex flex-col gap-2">
            {slots.map((s) => (
              <div key={s.id} className="flex items-center space-x-2">
                <RadioGroupItem value={s.label} id={s.id} />
                <Label htmlFor={s.id} className="cursor-pointer font-normal">
                  {s.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </Card>

      {/* Payment method */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Payment Method</h2>
        </div>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
          className="flex flex-col gap-3"
        >
          <label
            htmlFor="pay-cod"
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50' : 'border-border'
            }`}
          >
            <RadioGroupItem value="cod" id="pay-cod" />
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Pay with cash when your order arrives</p>
            </div>
          </label>
          <label
            htmlFor="pay-online"
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              paymentMethod === 'online' ? 'border-emerald-600 bg-emerald-50' : 'border-border'
            }`}
          >
            <RadioGroupItem value="online" id="pay-online" />
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Pay Online (UPI/Card)</p>
              <p className="text-xs text-muted-foreground">Pay securely via Razorpay</p>
            </div>
          </label>
        </RadioGroup>
      </Card>

      <Button
        onClick={placeOrder}
        disabled={placing}
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-base"
      >
        {placing ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : (
          <CheckCircle2 className="h-5 w-5 mr-2" />
        )}
        {placing ? 'Placing order...' : `Place Order · ₹${totalAmount}`}
      </Button>
    </div>
  );
}
