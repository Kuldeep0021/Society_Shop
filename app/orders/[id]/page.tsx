'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, Package, Truck, Clock, ChefHat, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { subscribeToOrder } from '@/lib/data';
import { toMillis } from '@/lib/data';
import {
  Order,
  OrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_PROGRESS,
} from '@/lib/types';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'Order Placed', icon: Package },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToOrder(id, (o) => {
      setOrder(o);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-48 w-full rounded-xl mb-4" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium">Order not found</p>
        <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const progressValue = ORDER_PROGRESS[order.status];
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to orders
      </Link>

      {/* Status header */}
      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Order #{order.id.slice(-8)}</p>
            <h1 className="text-2xl font-bold mt-1">{ORDER_STATUS_LABELS[order.status]}</h1>
          </div>
          <Badge
            className={
              order.status === 'delivered'
                ? 'bg-emerald-600'
                : isCancelled
                ? 'bg-red-500'
                : 'bg-amber-500'
            }
          >
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50">
            <XCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm text-red-700">This order has been cancelled.</p>
          </div>
        ) : (
          <>
            <Progress value={progressValue} className="h-2 mb-4" />
            <div className="flex justify-between">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const completed = idx <= currentStepIdx;
                return (
                  <div key={step.status} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        completed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs text-center ${
                        completed ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Order details */}
      <Card className="p-5 mb-4">
        <h2 className="font-semibold mb-3">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">₹{item.price} × {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-emerald-700">₹{order.totalAmount}</span>
        </div>
      </Card>

      {/* Delivery & payment info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-emerald-600" />
            <h3 className="font-medium text-sm">Delivery Address</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Tower {order.deliveryAddress.tower}, Flat {order.deliveryAddress.flatNumber}
          </p>
          <div className="flex items-center gap-2 mt-3 mb-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <h3 className="font-medium text-sm">Delivery Slot</h3>
          </div>
          <p className="text-sm text-muted-foreground">{order.deliverySlot}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium text-sm mb-3">Payment</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Placed on</span>
              <span className="text-xs">
                {new Date(toMillis(order.createdAt)).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
