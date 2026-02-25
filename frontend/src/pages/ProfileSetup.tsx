import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Camera, User, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActor } from '../hooks/useActor';
import { ExternalBlob } from '../utils/blobStorage';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { actor } = useActor();

  // Read phone from localStorage auth session set during OTP verification
  const authSession = (() => {
    try {
      const raw = localStorage.getItem('auth_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const sessionPhone = authSession?.phone || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(sessionPhone);
  const [imagePreview, setImagePreview] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes);
      blob.getDirectURL();
    } catch {
      // ignore upload errors for profile photo
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !actor) return;

    setErrorMsg('');
    setSaving(true);

    try {
      // Use the phone number directly as the userId (e.g. '+918779030070')
      const userId = phone.trim();

      // Build optional address — pass null if all fields are empty
      const hasAddress = street.trim() || city.trim() || pincode.trim();
      const address = hasAddress
        ? {
            id: BigInt(0),
            street: street.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            addressLabel: 'Home',
            lat: undefined,
            lng: undefined,
          }
        : null;

      const result = await actor.createUserProfile(userId, name.trim(), address);

      if (result.__kind__ === 'ok') {
        // Persist auth session flag so Splash screen recognises the user
        try {
          const existing = localStorage.getItem('auth_session');
          const session = existing ? JSON.parse(existing) : {};
          localStorage.setItem('auth_session', JSON.stringify({ ...session, verified: true, phone: userId }));
        } catch {
          // ignore storage errors
        }
        navigate({ to: '/home' });
      } else if (result.__kind__ === 'alreadyExists') {
        // Profile already exists — treat as success and navigate home
        navigate({ to: '/home' });
      } else {
        // #invalidId
        setErrorMsg('Invalid phone number. Please go back and try again.');
      }
    } catch (err) {
      setErrorMsg('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isLoading = saving || uploading;
  const canSave = name.trim().length > 0 && phone.trim().length > 0 && !isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div
        className="h-40 flex flex-col justify-end pb-6 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <div className="text-white">
          <h1 className="font-heading text-2xl font-bold">Set Up Profile</h1>
          <p className="text-white/80 text-sm mt-1">Tell us a bit about yourself</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-8 space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted border-4 border-primary/20 overflow-hidden flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <p className="text-xs text-muted-foreground">Tap to add profile photo</p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input
            placeholder="Enter your full name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="min-h-[48px]"
          />
        </div>

        {/* Phone (required, pre-filled from session) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            Phone Number *
          </Label>
          <Input
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="min-h-[48px]"
            inputMode="tel"
          />
        </div>

        {/* Address Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-medium px-2">Home Address (Optional)</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input placeholder="e.g. 123, MG Road, Andheri" value={street} onChange={e => setStreet(e.target.value)} className="min-h-[48px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>City</Label>
              <Input placeholder="Mumbai" value={city} onChange={e => setCity(e.target.value)} className="min-h-[48px]" />
            </div>
            <div className="space-y-2">
              <Label>Pincode</Label>
              <Input placeholder="400001" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" className="min-h-[48px]" />
            </div>
          </div>
        </div>

        {errorMsg && (
          <p className="text-destructive text-sm text-center">{errorMsg}</p>
        )}

        <Button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full min-h-[52px] text-base font-semibold rounded-xl"
          style={{ background: 'oklch(0.527 0.154 150)' }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Save & Continue
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
