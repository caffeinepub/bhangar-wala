import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Plus, Star, Phone, Truck, Edit2, X, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useGetAllPartners, useAdminAddPartner, useAdminUpdatePartner, useTogglePartnerActive } from '../hooks/useQueries';
import type { Partner } from '../hooks/useQueries';

interface PartnerFormData {
  name: string;
  phone: string;
  vehicle: string;
  rating: string;
  active: boolean;
}

const EMPTY_FORM: PartnerFormData = {
  name: '',
  phone: '',
  vehicle: '',
  rating: '5.0',
  active: true,
};

function PartnerCard({
  partner,
  onEdit,
  onToggle,
  isToggling,
}: {
  partner: Partner;
  onEdit: (p: Partner) => void;
  onToggle: (id: bigint, active: boolean) => void;
  isToggling: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{partner.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{partner.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs text-muted-foreground">{partner.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={partner.active}
            onCheckedChange={() => onToggle(partner.id, partner.active)}
            disabled={isToggling}
          />
          <button
            onClick={() => onEdit(partner)}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          {partner.phone}
        </span>
        <span className="flex items-center gap-1">
          <Truck className="w-3 h-3" />
          {partner.vehicle}
        </span>
        <span
          className={`ml-auto px-2 py-0.5 rounded-full font-semibold text-xs ${
            partner.active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {partner.active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}

function PartnerForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial: PartnerFormData;
  onSubmit: (data: PartnerFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<PartnerFormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerFormData, string>>>({});

  const validate = () => {
    const errs: Partial<Record<keyof PartnerFormData, string>> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\+?[\d\-]{10,15}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid phone number';
    if (!form.vehicle.trim()) errs.vehicle = 'Vehicle type is required';
    const r = parseFloat(form.rating);
    if (isNaN(r) || r < 0 || r > 5) errs.rating = 'Rating must be 0–5';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <p className="font-heading font-bold text-sm text-foreground">
          {initial.name ? 'Edit Partner' : 'Add New Partner'}
        </p>
        <button type="button" onClick={onCancel} className="p-1 text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="pname" className="text-xs">Name *</Label>
          <Input
            id="pname"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Partner full name"
            className="mt-1"
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="pphone" className="text-xs">Phone *</Label>
          <Input
            id="pphone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+91-9876543210"
            inputMode="tel"
            className="mt-1"
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="pvehicle" className="text-xs">Vehicle Type *</Label>
          <Input
            id="pvehicle"
            value={form.vehicle}
            onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
            placeholder="Mini Truck / Tempo / Cycle Cart"
            className="mt-1"
          />
          {errors.vehicle && <p className="text-xs text-destructive mt-1">{errors.vehicle}</p>}
        </div>

        <div>
          <Label htmlFor="prating" className="text-xs">Initial Rating (0–5)</Label>
          <Input
            id="prating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            className="mt-1"
          />
          {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating}</p>}
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="pactive" className="text-xs">Active</Label>
          <Switch
            id="pactive"
            checked={form.active}
            onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1 rounded-xl">
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function AdminPartners() {
  const navigate = useNavigate();
  const { data: partners = [], isLoading } = useGetAllPartners();
  const addPartner = useAdminAddPartner();
  const updatePartner = useAdminUpdatePartner();
  const toggleActive = useTogglePartnerActive();

  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const handleEdit = (p: Partner) => {
    setEditingPartner(p);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingPartner(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPartner(null);
  };

  const handleSubmit = async (data: PartnerFormData) => {
    const rating = parseFloat(data.rating);
    try {
      if (editingPartner) {
        await updatePartner.mutateAsync({
          id: editingPartner.id,
          name: data.name,
          phone: data.phone,
          vehicle: data.vehicle,
          rating,
          active: data.active,
        });
        toast.success('Partner updated successfully');
      } else {
        await addPartner.mutateAsync({
          name: data.name,
          phone: data.phone,
          vehicle: data.vehicle,
          rating,
          active: data.active,
        });
        toast.success('Partner added successfully');
      }
      setShowForm(false);
      setEditingPartner(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save partner');
    }
  };

  const handleToggle = async (id: bigint, currentActive: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, active: !currentActive });
      toast.success('Partner status updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  const formInitial: PartnerFormData = editingPartner
    ? {
        name: editingPartner.name,
        phone: editingPartner.phone,
        vehicle: editingPartner.vehicle,
        rating: editingPartner.rating.toString(),
        active: editingPartner.active,
      }
    : EMPTY_FORM;

  const isMutating = addPartner.isPending || updatePartner.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.35 0.12 150) 0%, oklch(0.25 0.10 200) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/admin' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-white">Partners</h1>
        <p className="text-white/70 text-sm">
          {partners.filter((p) => p.active).length} active · {partners.length} total
        </p>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Add Form */}
        {showForm && (
          <PartnerForm
            initial={formInitial}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isMutating}
          />
        )}

        {/* Partners List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No partners yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Add your first partner below</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partners.map((p) => (
              <PartnerCard
                key={p.id.toString()}
                partner={p}
                onEdit={handleEdit}
                onToggle={handleToggle}
                isToggling={toggleActive.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {!showForm && (
        <div className="fixed bottom-6 right-4">
          <Button
            onClick={handleAdd}
            className="rounded-full w-14 h-14 shadow-lg"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
