'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/lib/data';
import { Order, ORDER_STATUS_LABELS } from '@/lib/types';
import { toMillis } from '@/lib/data';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getUserOrders(user.uid)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <Package className="h-14 w-14 mx-auto text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mt-4">Login to view orders</h1>
        <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <Package className="h-14 w-14 mx-auto text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mt-4">No orders yet</h1>
        <p className="text-muted-foreground mt-2">Your order history will appear here.</p>
        <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={
                      order.status === 'delivered'
                        ? 'bg-emerald-600'
                        : order.status === 'cancelled'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(toMillis(order.createdAt)).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">
                  {order.items.reduce((s, i) => s + i.quantity, 0)} items · {order.deliveryAddress.tower}-{order.deliveryAddress.flatNumber}
                </p>
                <p className="text-sm font-bold text-emerald-700 mt-1">₹{order.totalAmount}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
