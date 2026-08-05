'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, ShoppingCart, Truck, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/data';
import { CATEGORIES, Product, Category } from '@/lib/types';

// Dynamically import the 3D background (client-only, no SSR).
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-emerald-50/50 to-transparent" />
  ),
});

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <div className="relative">
      <ThreeBackground />

      {/* Hero section */}
      <section className="container mx-auto px-4 pt-12 pb-8 text-center relative">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Your Society Store,
          <span className="block text-emerald-600">Delivered to Your Door</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          Daily essentials, groceries, and household items from the general store right inside your residential society. Order in minutes.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 shadow-sm">
            <Clock className="h-4 w-4 text-emerald-600" />
            Delivery within 30 mins
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 shadow-sm">
            <Truck className="h-4 w-4 text-emerald-600" />
            Free society delivery
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 shadow-sm">
            <ShoppingCart className="h-4 w-4 text-emerald-600" />
            COD & online payment
          </div>
        </div>
      </section>

      {/* Search & filter */}
      <section className="container mx-auto px-4 pb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur border-emerald-100"
          />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2 justify-center flex-wrap">
          <CategoryChip label="All" active={category === 'All'} onClick={() => setCategory('All')} />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
            />
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No products found</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={`rounded-full whitespace-nowrap ${
        active ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white/70 backdrop-blur'
      }`}
    >
      {label}
    </Button>
  );
}
