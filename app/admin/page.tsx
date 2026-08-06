'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  IndianRupee,
  Clock,
  Truck,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  Settings,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllOrders } from '@/lib/data';
import { toMillis } from '@/lib/data';
import { Order } from '@/lib/types';

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}

function DashboardContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => toMillis(o.createdAt) >= startOfToday.getTime());
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingDeliveries = orders.filter(
    (o) => o.status === 'out_for_delivery' || o.status === 'preparing',
  ).length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const stats = [
    {
      label: "Today's Orders",
      value: todayOrders.length,
      icon: ShoppingCart,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: "Today's Revenue",
      value: `₹${todayRevenue}`,
      icon: IndianRupee,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Out for Delivery',
      value: pendingDeliveries,
      icon: Truck,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const quickLinks = [
    { href: '/admin/products', label: 'Manage Products', icon: Package, desc: 'Add, edit, or remove products' },
    { href: '/admin/orders', label: 'Manage Orders', icon: ShoppingCart, desc: 'Update order status' },
    { href: '/admin/delivery', label: 'Delivery', icon: Truck, desc: 'Track out-for-delivery orders' },
    { href: '/admin/slots', label: 'Delivery Slots', icon: Clock, desc: 'Configure time slots' },
    { href: '/admin/settings', label: 'Admin Settings', icon: Settings, desc: 'Update profile and password' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-4">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                </Card>
              );
            })}
      </div>

      {/* Quick links */}
      <h2 className="font-semibold mb-3">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{link.label}</p>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <h2 className="font-semibold mt-8 mb-3">Recent Orders</h2>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No orders yet.</Card>
      ) : (
        <div className="space-y-2">
          {orders.slice(0, 5).map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="p-3 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div>
                  <p className="text-sm font-medium">#{order.id.slice(-8)}</p>
                  <p className="text-xs text-muted-foreground">
                    Tower {order.deliveryAddress.tower}-{order.deliveryAddress.flatNumber} ·{' '}
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-700">₹{order.totalAmount}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
