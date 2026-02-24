import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
];

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const isValidPhone = phone.replace(/\D/g, '').length === 10;
  const canSubmit = isValidPhone && termsAccepted;

  const handleSendOtp = () => {
    if (!canSubmit) return;
    navigate({
      to: '/otp-verification',
      state: { phone: `${countryCode}${phone}` } as any,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <div
        className="h-56 flex items-end justify-center pb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <img src="/assets/generated/splash-bg.dim_390x844.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-3 overflow-hidden">
            <img src="/assets/generated/logo.dim_256x256.png" alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="text-white/80 text-sm mt-1">Sign in to sell your scrap</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8 pb-6">
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">Enter your phone number</h2>
            <p className="text-muted-foreground text-sm mt-1">We'll send you a verification code</p>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Phone Number</Label>
            <div className="flex gap-2">
              {/* Country Code Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex items-center gap-1 px-3 py-3 border border-input rounded-lg bg-card text-sm font-medium min-h-[44px] hover:bg-muted transition-colors"
                >
                  <span>{COUNTRY_CODES.find(c => c.code === countryCode)?.flag}</span>
                  <span>{countryCode}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                {showCountryPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[160px]">
                    {COUNTRY_CODES.map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setCountryCode(c.code); setShowCountryPicker(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                        <span className="text-muted-foreground ml-auto">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Input
                type="tel"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 min-h-[44px] text-base"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={v => setTermsAccepted(!!v)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I agree to the{' '}
              <span className="text-primary font-medium">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary font-medium">Privacy Policy</span>
            </Label>
          </div>

          {/* Send OTP Button */}
          <Button
            onClick={handleSendOtp}
            disabled={!canSubmit}
            className="w-full min-h-[52px] text-base font-semibold rounded-xl"
            style={{ background: canSubmit ? 'oklch(0.527 0.154 150)' : undefined }}
          >
            <Phone className="w-4 h-4 mr-2" />
            Send OTP
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to receive SMS messages for verification
          </p>
        </div>
      </div>
    </div>
  );
}
