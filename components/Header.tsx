'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBasket, ShoppingCart, User, LayoutDashboard, LogOut, Search, Heart, ListOrdered, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, isAdmin, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');

  const isAdminPage = pathname?.startsWith('/admin');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-4">
          <ShoppingBasket className="h-6 w-6 text-emerald-600" />
          <span className="hidden sm:inline">Society Store</span>
        </Link>
        
        {!isAdminPage && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        )}

        <nav className="flex items-center gap-1 sm:gap-2">
          {isAdminPage && (
            <>
              <NavLink href="/admin" label="Dashboard" active={pathname === '/admin'} />
              <NavLink href="/admin/products" label="Products" active={pathname === '/admin/products'} />
              <NavLink href="/admin/orders" label="Orders" active={pathname === '/admin/orders'} />
              <NavLink href="/admin/delivery" label="Delivery" active={pathname === '/admin/delivery'} />
              <NavLink href="/admin/slots" label="Slots" active={pathname === '/admin/slots'} />
              <NavLink href="/admin/discounts" label="Discounts" active={pathname === '/admin/discounts'} />
            </>
          )}

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 rounded-full border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline-block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <ListOrdered className="mr-2 h-4 w-4" /> My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist">
                    <Heart className="mr-2 h-4 w-4" /> My Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`hidden md:inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {label}
    </Link>
  );
}
