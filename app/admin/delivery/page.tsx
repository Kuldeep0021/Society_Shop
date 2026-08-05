'use client';

import { useEffect, useState } from 'react';
import { Truck, CheckCircle2, Phone, MapPin, Clock, Loader2 } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { subscribeToAllOrders, updateOrderStatus } from '@/lib/data';
import { toMillis } from '@/lib/data';
import { Order } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminDeliveryPage() {
  return (
    <AdminGuard>
      <DeliveryContent />
    </AdminGuard>
  );
}

function DeliveryContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAllOrders((all) => {
      setOrders(all.filter((o) => o.status === 'out_for_delivery'));
      setLoading(false);
    });
    return unsub;
  }, []);

  const markDelivered = async (id: string) => {
    setMarking(id);
    try {
      await updateOrderStatus(id, 'delivered');
      toast.success('Order marked as delivered. Email sent to customer.');
      // Trigger delivery email notification.
      await fetch('/api/send-delivery-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      }).catch(() => {});
    } catch {
      toast.error('Failed to update order');
    } finally {
      setMarking(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Truck className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold">Delivery Management</h1>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">No orders out for delivery right now.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-emerald-600">
                      <Truck className="h-3 w-3 mr-1" /> Out for Delivery
                    </Badge>
                    <span className="text-sm font-medium">#{order.id.slice(-8)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">
                      Tower {order.deliveryAddress.tower}, Flat {order.deliveryAddress.flatNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" />
                    {order.deliverySlot}
                  </div>

                  {order.customerPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="h-4 w-4" />
                      {order.customerPhone}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items · ₹{order.totalAmount}
                  </div>
                </div>

                <Button
                  onClick={() => markDelivered(order.id)}
                  disabled={marking === order.id}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {marking === order.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Mark Delivered
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
