import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
];

export default function Login() {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    setError('');
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to continue');
      return;
    }

    setLoading(true);
    const fullPhone = `${countryCode}${digits}`;
    // Store phone in sessionStorage for OTP verification page
    sessionStorage.setItem('otp_phone', fullPhone);

    // Simulate a brief delay before navigating
    setTimeout(() => {
      setLoading(false);
      navigate({ to: '/otp-verification' });
    }, 400);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(val);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <div
        className="h-64 flex items-end justify-center pb-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <img src="/assets/generated/splash-bg.dim_390x844.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src="/assets/generated/logo.dim_256x256.png" alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">Bhangar Wala</h1>
          <p className="text-white/80 text-sm mt-1">♻️ Sell Scrap. Earn Cash. Go Green.</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 pb-8 flex flex-col">
        <div className="flex-1 space-y-6">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground">Enter Your Phone</h2>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              We'll send a one-time password to verify your number
            </p>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Phone className="w-3.5 h-3.5" />
              Phone Number
            </Label>
            <div className="flex gap-2">
              {/* Country Code Selector */}
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="h-12 px-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shrink-0"
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>

              {/* Phone Number Input */}
              <input
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`flex-1 h-12 px-4 rounded-xl border bg-card text-foreground text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all
                  ${error && !phoneNumber ? 'border-destructive' : 'border-border focus:border-primary'}
                `}
              />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={val => {
                setTermsAccepted(!!val);
                if (error) setError('');
              }}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I agree to the{' '}
              <span className="text-primary font-medium">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary font-medium">Privacy Policy</span>
            </Label>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Send OTP Button */}
          <Button
            onClick={handleSendOtp}
            disabled={loading || !phoneNumber}
            className="w-full min-h-[56px] text-base font-semibold rounded-2xl shadow-md"
            style={{ background: 'oklch(0.527 0.154 150)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending OTP...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send OTP
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>

          {/* Info */}
          <div className="bg-muted/60 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">How it works</p>
            <ul className="space-y-1.5">
              {[
                'Enter your mobile number with country code',
                'Tap "Send OTP" to receive a verification code',
                'Enter the code to log in — no password needed!',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
