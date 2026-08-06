'use client';

import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import { ReactNode } from 'react';
import { AppUser } from '@/lib/types';

// We wrap the entire app in SessionProvider
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  let user: AppUser | null = null;
  let isAdmin = false;

  if (session?.user) {
    const sUser = session.user as any;
    user = {
      uid: sUser.id,
      name: sUser.name || 'User',
      email: sUser.email,
      phone: '', // Phone is no longer primary
    };
    isAdmin = sUser.role === 'admin';
  }

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return { user, loading, isAdmin, logout };
}
