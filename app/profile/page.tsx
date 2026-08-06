'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, User, Heart, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      // Load wishlist from local storage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <Lock className="h-14 w-14 mx-auto text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mt-4">Login required</h1>
        <p className="text-muted-foreground mt-2">Please login to view your profile.</p>
        <Button onClick={() => router.push('/login')} className="mt-6 bg-emerald-600 hover:bg-emerald-700">
          Go to Login
        </Button>
      </div>
    );
  }

  const handleUpdateProfile = () => {
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile Details
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="w-4 h-4 mr-2" />
            Wishlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-emerald-600" />
              Account Settings
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Phone number cannot be changed directly.</p>
              </div>
              
              <Button 
                onClick={handleUpdateProfile} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              My Wishlist
            </h2>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Your wishlist is empty.</p>
                <Button onClick={() => router.push('/')} variant="outline" className="mt-4">
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 flex flex-col">
                    <div className="aspect-square relative rounded-md overflow-hidden bg-muted mb-4">
                      {/* Using img for simplicity in wishlist, next/image is better for prod */}
                      <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <h3 className="font-medium line-clamp-1">{item.name}</h3>
                    <p className="font-bold mt-2">₹{item.price}</p>
                    <Button 
                      onClick={() => router.push(`/product/${item.id}`)} 
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      View Product
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
