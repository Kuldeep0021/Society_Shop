'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDiscountsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New discount state
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user === null) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }

    fetchDiscounts();
  }, [user, isAdmin, router]);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/discounts');
      const data = await res.json();
      if (data.discounts) {
        setDiscounts(data.discounts);
      }
    } catch (err) {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;
    
    setCreating(true);
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          type,
          value: Number(value),
          minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
          isActive,
          validUntil: validUntil ? new Date(validUntil).getTime() : undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('Discount code created successfully');
      setCode('');
      setValue('');
      setMinOrderValue('');
      setValidUntil('');
      fetchDiscounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create discount');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;
    
    try {
      const res = await fetch(`/api/discounts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Discount deleted');
      fetchDiscounts();
    } catch (err) {
      toast.error('Failed to delete discount');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-2 mb-8">
        <Tag className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold">Manage Discount Codes</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="md:col-span-1">
          <Card className="p-5">
            <h2 className="font-semibold mb-4 text-lg">Create New Code</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <Input 
                  id="code" 
                  placeholder="e.g. SUMMER50" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Discount Value</Label>
                <Input 
                  id="value" 
                  type="number" 
                  min="1" 
                  placeholder={type === 'percentage' ? 'e.g. 10 for 10%' : 'e.g. 100 for ₹100'} 
                  value={value} 
                  onChange={(e) => setValue(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrder">Min Order Value (₹) (Optional)</Label>
                <Input 
                  id="minOrder" 
                  type="number" 
                  min="0"
                  placeholder="e.g. 500" 
                  value={minOrderValue} 
                  onChange={(e) => setMinOrderValue(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Expiry Date (Optional)</Label>
                <Input 
                  id="validUntil" 
                  type="date" 
                  value={validUntil} 
                  onChange={(e) => setValidUntil(e.target.value)} 
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Code
              </Button>
            </form>
          </Card>
        </div>

        {/* Codes List */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="p-4 font-medium">Code</th>
                    <th className="p-4 font-medium">Discount</th>
                    <th className="p-4 font-medium">Min Order</th>
                    <th className="p-4 font-medium">Expiry</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {discounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No discount codes found. Create one to get started!
                      </td>
                    </tr>
                  ) : (
                    discounts.map((discount) => (
                      <tr key={discount._id} className="hover:bg-muted/30">
                        <td className="p-4 font-bold text-emerald-700">{discount.code}</td>
                        <td className="p-4">
                          {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                        </td>
                        <td className="p-4">
                          {discount.minOrderValue ? `₹${discount.minOrderValue}` : '-'}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {discount.validUntil ? new Date(discount.validUntil).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(discount._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
