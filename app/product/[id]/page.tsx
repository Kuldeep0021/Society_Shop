'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingCart, ChevronRight, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getProduct } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProduct(id),
      fetch(`/api/reviews?productId=${id}`).then(res => res.json())
    ])
      .then(([p, rData]) => {
        setProduct(p);
        if (rData.reviews) {
          setReviews(rData.reviews);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    addItem(product, qty);
    toast.success(`${qty} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product || !product.inStock) return;
    addItem(product, qty);
    router.push('/cart');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('Please login to review');
      return;
    }
    if (!newReview.trim()) return;
    
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!.id,
          rating,
          comment: newReview
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setReviews([data.review, ...reviews]);
      setNewReview('');
      setRating(5);
      toast.success('Review submitted!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium">Product not found</p>
        <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6 flex-wrap gap-1">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="hover:text-foreground">{product.category}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <Card className="overflow-hidden rounded-2xl">
          <div className="relative aspect-square bg-muted">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </Card>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <Badge className={product.inStock ? 'bg-emerald-600' : 'bg-red-500'}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold mt-3">{product.name}</h1>
            <p className="text-muted-foreground mt-1">{product.category} · {product.unit}</p>
          </div>

          <p className="text-3xl font-bold text-emerald-700">₹{product.price}</p>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQty((q) => q + 1)}
                disabled={product.stockCount > 0 && qty >= product.stockCount}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              Total: ₹{product.price * qty}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
            >
              Buy Now
            </Button>
            <Button
              onClick={handleToggleWishlist}
              variant="outline"
              className="px-3"
            >
              <Heart className={`h-5 w-5 ${product && isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-16 max-w-4xl border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        {/* Add Review */}
        {user ? (
          <Card className="p-4 mb-8 bg-muted/30">
            <h3 className="font-medium mb-3">Write a review</h3>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(i => (
                <Star 
                  key={i} 
                  onClick={() => setRating(i)}
                  className={`h-5 w-5 cursor-pointer ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <textarea 
              className="w-full p-3 border rounded-md resize-none mb-3" 
              rows={3} 
              placeholder="Share your thoughts about this product..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
            ></textarea>
            <Button onClick={submitReview} disabled={submittingReview} className="bg-emerald-600 hover:bg-emerald-700">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Card>
        ) : (
          <Card className="p-4 mb-8 bg-muted/30 text-center">
            <p className="text-muted-foreground mb-4">Please log in to write a review for this product.</p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/login">Login to Review</Link>
            </Button>
          </Card>
        )}
        
        {/* Review List */}
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id || review.id} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 uppercase">
                  {review.userName?.[0] || review.user?.[0] || 'U'}
                </div>
                <span className="font-medium">{review.userName || review.user}</span>
                <span className="text-muted-foreground text-sm ml-auto">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}
                </span>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
