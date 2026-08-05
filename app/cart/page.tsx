'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, totalAmount, totalItems } = useCart();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mt-4">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Browse products and add items to your cart.</p>
        <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Your Cart ({totalItems})</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.productId} className="p-3 flex items-center gap-3">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.unit}</p>
              <p className="text-sm font-semibold text-emerald-700 mt-0.5">₹{item.price}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between text-lg">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">₹{totalAmount}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-muted-foreground">Delivery</span>
          <span className="font-medium text-emerald-600">Free</span>
        </div>
        <div className="border-t mt-3 pt-3 flex items-center justify-between">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg text-emerald-700">₹{totalAmount}</span>
        </div>
        <Button
          asChild
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 h-11"
        >
          <Link href="/checkout">
            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </Card>
    </div>
  );
}
