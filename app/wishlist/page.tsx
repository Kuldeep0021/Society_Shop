'use client';

import { useState, useEffect } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { getProducts } from '@/lib/data';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistLoading) return;
    
    getProducts()
      .then((allProducts) => {
        const wished = allProducts.filter((p) => wishlist.includes(p.id));
        setProducts(wished);
      })
      .finally(() => setLoading(false));
  }, [wishlist, wishlistLoading]);

  if (wishlistLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save items you love by clicking the heart icon.</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
