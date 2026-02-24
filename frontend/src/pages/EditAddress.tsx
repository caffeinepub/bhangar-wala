import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAddressById, useUpdateAddress } from '../hooks/useQueries';

export default function EditAddress() {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/layout/edit-address/$id' });
  const addressId = id ? BigInt(id) : null;

  const { data: address, isLoading } = useGetAddressById(addressId);
  const updateAddress = useUpdateAddress();

  const [addressLabel, setAddressLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    if (address) {
      setAddressLabel(address.addressLabel);
      setStreet(address.street);
      setCity(address.city);
      setPincode(address.pincode);
    }
  }, [address]);

  const canSave = street.trim() && city.trim() && pincode.trim().length === 6;

  const handleSave = async () => {
    if (!canSave || !addressId) return;
    await updateAddress.mutateAsync({
      id: addressId,
      addressLabel,
      street: street.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      lat: address?.lat ?? null,
      lng: address?.lng ?? null,
    });
    navigate({ to: '/addresses' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/addresses' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-white">Edit Address</h1>
        <p className="text-white/80 text-sm mt-1">Update your pickup location</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
        ) : (
          <>
            {/* Map Placeholder */}
            <div
              className="h-36 rounded-2xl flex items-center justify-center border border-border overflow-hidden"
              style={{ background: 'linear-gradient(135deg, oklch(0.92 0.06 150) 0%, oklch(0.88 0.04 150) 100%)' }}
            >
              <div className="flex flex-col items-center gap-2 text-primary">
                <MapPin className="w-8 h-8" />
                <p className="text-sm font-medium">Map picker coming soon</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address Label</Label>
              <Select value={addressLabel} onValueChange={setAddressLabel}>
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">🏠 Home</SelectItem>
                  <SelectItem value="Work">💼 Work</SelectItem>
                  <SelectItem value="Other">📍 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Street Address *</Label>
              <Input
                placeholder="e.g. 123, MG Road, Andheri West"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="min-h-[48px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  placeholder="Mumbai"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="min-h-[48px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input
                  placeholder="400001"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  className="min-h-[48px]"
                />
              </div>
            </div>

            {updateAddress.isError && (
              <p className="text-destructive text-sm">Failed to update address. Please try again.</p>
            )}
          </>
        )}
      </div>

      <div className="px-4 pb-6 pt-2 border-t border-border bg-card">
        <Button
          onClick={handleSave}
          disabled={!canSave || updateAddress.isPending || isLoading}
          className="w-full min-h-[52px] text-base font-semibold rounded-xl"
          style={{ background: canSave ? 'oklch(0.527 0.154 150)' : undefined }}
        >
          {updateAddress.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </span>
          ) : (
            'Update Address'
          )}
        </Button>
      </div>
    </div>
  );
}
