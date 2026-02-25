import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Plus, Edit2, Loader2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useGetPartners, useAddPartner, useUpdatePartner } from '../hooks/useQueries';
import type { Partner } from '../hooks/useQueries';

interface PartnerFormData {
  name: string;
  phone: string;
  vehicle: string;
  active: boolean;
}

export default function AdminPartners() {
  const navigate = useNavigate();
  const { data: partners = [], isLoading } = useGetPartners();
  const addPartner = useAddPartner();
  const updatePartner = useUpdatePartner();

  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    phone: '',
    vehicle: '',
    active: true,
  });

  function openAddForm() {
    setEditingPartner(null);
    setFormData({ name: '', phone: '', vehicle: '', active: true });
    setShowForm(true);
  }

  function openEditForm(partner: Partner) {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      phone: partner.phone,
      vehicle: partner.vehicle,
      active: partner.active,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingPartner) {
      await updatePartner.mutateAsync({
        id: editingPartner.id,
        name: formData.name,
        phone: formData.phone,
        vehicle: formData.vehicle,
        rating: editingPartner.rating,
        active: formData.active,
      });
    } else {
      await addPartner.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        vehicle: formData.vehicle,
        rating: 0,
        active: formData.active,
      });
    }
    setShowForm(false);
  }

  async function handleToggleActive(partner: Partner) {
    await updatePartner.mutateAsync({
      id: partner.id,
      name: partner.name,
      phone: partner.phone,
      vehicle: partner.vehicle,
      rating: partner.rating,
      active: !partner.active,
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: '/admin' })}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Partners</h1>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={openAddForm}
            className="text-primary"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{partner.name}</p>
                      <Badge variant={partner.active ? 'default' : 'secondary'}>
                        {partner.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{partner.phone}</p>
                    <p className="text-sm text-muted-foreground">{partner.vehicle}</p>
                    <p className="text-sm text-muted-foreground">⭐ {partner.rating}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={partner.active}
                      onCheckedChange={() => handleToggleActive(partner)}
                      disabled={updatePartner.isPending}
                    />
                    <button
                      onClick={() => openEditForm(partner)}
                      className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-background rounded-t-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {editingPartner ? 'Edit Partner' : 'Add Partner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicle">Vehicle</Label>
                <Input
                  id="vehicle"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(v) => setFormData({ ...formData, active: v })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={addPartner.isPending || updatePartner.isPending}
                >
                  {(addPartner.isPending || updatePartner.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingPartner ? 'Save' : 'Add'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
