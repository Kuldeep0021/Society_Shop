'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { getSlots, saveSlot, deleteSlot } from '@/lib/data';
import { DeliverySlot } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminSlotsPage() {
  return (
    <AdminGuard>
      <SlotsContent />
    </AdminGuard>
  );
}

function SlotsContent() {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    getSlots().then((s) => {
      setSlots(s);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!newLabel.trim()) {
      toast.error('Enter a slot label');
      return;
    }
    setAdding(true);
    try {
      const slot: DeliverySlot = {
        id: 'slot-' + Date.now(),
        label: newLabel.trim(),
        isActive: true,
      };
      await saveSlot(slot);
      setNewLabel('');
      toast.success('Slot added');
      load();
    } catch {
      toast.error('Failed to add slot');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (slot: DeliverySlot) => {
    await saveSlot({ ...slot, isActive: !slot.isActive });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this delivery slot?')) return;
    await deleteSlot(id);
    toast.success('Slot removed');
    load();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold">Delivery Slots</h1>
      </div>

      {/* Add new slot */}
      <Card className="p-4 mb-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="new-slot">Add new slot</Label>
            <Input
              id="new-slot"
              placeholder="e.g. Afternoon (1-3 PM)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={adding} className="bg-emerald-600 hover:bg-emerald-700">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Add
          </Button>
        </div>
      </Card>

      {/* Slots list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No delivery slots configured.</Card>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <Card key={slot.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium">{slot.label}</p>
                  <p className={`text-xs ${slot.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {slot.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={slot.isActive}
                  onCheckedChange={() => handleToggle(slot)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(slot.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
