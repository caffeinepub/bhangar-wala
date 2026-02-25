import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetUserAddresses, useUpdateAddress } from '../hooks/useQueries';

const ADDRESS_LABELS = [
  { value: 'Home', emoji: '🏠' },
  { value: 'Work', emoji: '💼' },
  { value: 'Other', emoji: '📍' },
];

export default function EditAddress() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const addressId = params.id ? parseInt(params.id, 10) : 0;

  const { data: addresses = [] } = useGetUserAddresses();
  const updateAddressMutation = useUpdateAddress();

  const [addressLabel, setAddressLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (addresses.length > 0 && !loaded) {
      const addr = addresses.find((a) => Number(a.id) === addressId);
      if (addr) {
        setAddressLabel(addr.addressLabel || 'Home');
        setStreet(addr.street);
        setCity(addr.city);
        setPincode(addr.pincode);
        setLoaded(true);
      }
    }
  }, [addresses, addressId, loaded]);

  async function handleSave() {
    setError(null);

    if (!street.trim()) {
      setError('Street address is required.');
      return;
    }
    if (!city.trim()) {
      setError('City is required.');
      return;
    }
    if (!pincode.trim()) {
      setError('Pincode is required.');
      return;
    }

    try {
      await updateAddressMutation.mutateAsync({
        id: BigInt(addressId),
        street: street.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        addressLabel,
        lat: undefined,
        lng: undefined,
      });
      navigate({ to: '/addresses' });
    } catch (err: any) {
      setError(err?.message || 'Failed to update address. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/addresses' })}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Edit Address</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {/* Map placeholder */}
        <div className="bg-primary/10 rounded-2xl h-36 flex flex-col items-center justify-center mb-6 border border-primary/20">
          <MapPin className="w-8 h-8 text-primary mb-2" />
          <p className="text-sm text-primary font-medium">Map picker coming soon</p>
        </div>

        {/* Address Label */}
        <div className="mb-5">
          <Label className="text-sm font-semibold text-foreground mb-2 block">Address Label</Label>
          <div className="flex gap-2">
            {ADDRESS_LABELS.map((lbl) => (
              <button
                key={lbl.value}
                onClick={() => setAddressLabel(lbl.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                  addressLabel === lbl.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <span>{lbl.emoji}</span>
                <span>{lbl.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Street Address */}
        <div className="mb-4">
          <Label htmlFor="street" className="text-sm font-semibold text-foreground mb-1.5 block">
            Street Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="street"
            placeholder="e.g. 123 Main Street, Sector 5"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>

        {/* City & Pincode */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label htmlFor="city" className="text-sm font-semibold text-foreground mb-1.5 block">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pincode" className="text-sm font-semibold text-foreground mb-1.5 block">
              Pincode <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pincode"
              placeholder="e.g. 400001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={updateAddressMutation.isPending}
        >
          {updateAddressMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
