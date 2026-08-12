'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  toggleWishlist: async () => {},
  isInWishlist: () => false,
  loading: true,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch('/api/wishlist')
        .then((res) => res.json())
        .then((data) => {
          setWishlist(data.wishlist || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    
    // Optimistic update
    const isCurrentlyIn = wishlist.includes(productId);
    setWishlist((prev) =>
      isCurrentlyIn ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWishlist(data.wishlist || []);
      toast.success(isCurrentlyIn ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err: any) {
      // Revert optimistic update
      setWishlist((prev) =>
        isCurrentlyIn ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
      toast.error(err.message || 'Failed to update wishlist');
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
