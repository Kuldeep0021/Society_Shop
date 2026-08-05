'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    if (!product.inStock) {
      toast.error('This item is out of stock');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Card className="group overflow-hidden border-border/60 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <Badge
            className={`absolute top-2 left-2 ${product.inStock ? 'bg-emerald-600' : 'bg-red-500'}`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">{product.unit}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-emerald-700">₹{product.price}</span>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
