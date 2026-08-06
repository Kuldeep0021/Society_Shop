import { ShoppingBasket } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBasket className="h-5 w-5 text-emerald-600" />
            Society General Store
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Your neighbourhood store, delivered to your doorstep.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground flex-wrap justify-center">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/login" className="hover:text-foreground">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
