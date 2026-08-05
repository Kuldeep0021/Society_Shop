'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChefHat, Truck, XCircle, Package, Clock } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subscribeToAllOrders, updateOrderStatus } from '@/lib/data';
import { toMillis } from '@/lib/data';
import { Order, OrderStatus, ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <OrdersContent />
    </AdminGuard>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllOrders((o) => {
      setOrders(o);
      setLoading(false);
    });
    return unsub;
  }, []);

  const grouped = ORDER_STATUSES.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status);
      return acc;
    },
    {} as Record<OrderStatus, Order[]>,
  );

  const changeStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Order ${ORDER_STATUS_LABELS[status]}`);

      // Send delivery email when marked delivered.
      if (status === 'delivered') {
        fetch('/api/send-delivery-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id }),
        }).catch(() => {});
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const StatusButton = ({
    status,
    label,
    icon: Icon,
    variant = 'default',
  }: {
    status: OrderStatus;
    label: string;
    icon: any;
    variant?: 'default' | 'outline' | 'destructive';
  }) => (
    <Button
      size="sm"
      variant={variant}
      onClick={() => changeStatus(orders[0]?.id || '', status)}
      className="bg-emerald-600 hover:bg-emerald-700"
      data-status-action={status}
    >
      <Icon className="h-3.5 w-3.5 mr-1" />
      {label}
    </Button>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>

      <Tabs defaultValue="pending">
        <TabsList className="w-full justify-start overflow-x-auto no-scrollbar h-auto flex-wrap">
          {ORDER_STATUSES.map((status) => (
            <TabsTrigger key={status} value={status} className="gap-1.5">
              {ORDER_STATUS_LABELS[status]}
              <Badge variant="secondary" className="ml-1">
                {grouped[status]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {ORDER_STATUSES.map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            {grouped[status]?.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No {ORDER_STATUS_LABELS[status].toLowerCase()} orders.
              </Card>
            ) : (
              <div className="space-y-3">
                {grouped[status].map((order) => (
                  <OrderCard key={order.id} order={order} onStatusChange={changeStatus} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
              #{order.id.slice(-8)}
            </Link>
            <Badge variant="outline">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</Badge>
            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Tower {order.deliveryAddress.tower}-{order.deliveryAddress.flatNumber} · {order.deliverySlot}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(toMillis(order.createdAt)).toLocaleString()}
          </p>
          <div className="mt-2 text-sm">
            {order.items.map((item) => (
              <span key={item.productId} className="text-muted-foreground">
                {item.name} × {item.quantity},{' '}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-emerald-700">₹{order.totalAmount}</p>
          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
        </div>
      </div>

      {/* Status action buttons */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
        {order.status === 'pending' && (
          <ActionButton
            label="Accept"
            icon={CheckCircle2}
            onClick={() => onStatusChange(order.id, 'accepted')}
          />
        )}
        {order.status === 'accepted' && (
          <ActionButton
            label="Start Preparing"
            icon={ChefHat}
            onClick={() => onStatusChange(order.id, 'preparing')}
          />
        )}
        {order.status === 'preparing' && (
          <ActionButton
            label="Out for Delivery"
            icon={Truck}
            onClick={() => onStatusChange(order.id, 'out_for_delivery')}
          />
        )}
        {order.status === 'out_for_delivery' && (
          <ActionButton
            label="Mark Delivered"
            icon={CheckCircle2}
            onClick={() => onStatusChange(order.id, 'delivered')}
          />
        )}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <ActionButton
            label="Cancel"
            icon={XCircle}
            variant="destructive"
            onClick={() => onStatusChange(order.id, 'cancelled')}
          />
        )}
      </div>
    </Card>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  variant = 'default',
}: {
  label: string;
  icon: any;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}) {
  return (
    <Button
      size="sm"
      variant={variant === 'destructive' ? 'destructive' : 'default'}
      onClick={onClick}
      className={variant === 'default' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
    >
      <Icon className="h-3.5 w-3.5 mr-1" />
      {label}
    </Button>
  );
}
