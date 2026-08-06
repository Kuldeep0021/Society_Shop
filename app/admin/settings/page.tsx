'use client';

import { useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Admin Settings</h1>
        </div>
        <SettingsForm />
      </div>
    </AdminGuard>
  );
}

function SettingsForm() {
  const { user, updateAdminProfile } = useAuth();
  
  // Pre-fill with existing user data if available
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: { name?: string; email?: string; password?: string } = {};
      if (name && name !== user?.name) updates.name = name;
      if (email && email !== user?.email) updates.email = email;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save');
        setLoading(false);
        return;
      }

      await updateAdminProfile(updates);
      toast.success('Profile updated successfully!');
      setPassword(''); // Clear password field after saving
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/requires-recent-login') {
        toast.error('Security alert: You must log out and log back in before changing your email or password.');
      } else {
        toast.error(err?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Store Admin"
          />
          <p className="text-xs text-muted-foreground">This name is used internally.</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <p className="text-xs text-muted-foreground">Used for logging into the dashboard.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Leave blank to keep current password"
          />
          <p className="text-xs text-muted-foreground">Must be at least 6 characters.</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </form>
    </Card>
  );
}
