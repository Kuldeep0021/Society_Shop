'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <Lock className="h-14 w-14 mx-auto text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mt-4">Admin Login Required</h1>
        <p className="text-muted-foreground mt-2">Please login with an admin account.</p>
        <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <Lock className="h-14 w-14 mx-auto text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mt-4">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You do not have admin access. Contact the shop owner.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to Store</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
