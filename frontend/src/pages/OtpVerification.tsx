import { useState, useRef, useEffect } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function OtpVerification() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const phone = (routerState.location.state as any)?.phone || '';
  const { login, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: userProfile, isFetched: profileFetched } = useGetCallerUserProfile();

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // After login, check profile
  useEffect(() => {
    if (identity && profileFetched && verifying) {
      setVerifying(false);
      if (userProfile === null) {
        navigate({ to: '/profile-setup', state: { phone } as any });
      } else {
        navigate({ to: '/home' });
      }
    }
  }, [identity, profileFetched, userProfile, verifying, navigate, phone]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setVerifying(true);
    setError('');
    // Trigger Internet Identity login
    login();
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isLoggingIn = loginStatus === 'logging-in';
  const otpComplete = otp.every(d => d !== '');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div
        className="h-48 flex flex-col justify-end pb-6 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/login' })}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-white">
          <h1 className="font-heading text-2xl font-bold">Verify OTP</h1>
          <p className="text-white/80 text-sm mt-1">
            Sent to {phone || 'your phone'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 pb-6 space-y-6">
        <div>
          <p className="text-muted-foreground text-sm">Enter the 6-digit code sent to your phone number</p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-card transition-all outline-none
                ${digit ? 'border-primary text-primary' : 'border-border text-foreground'}
                focus:border-primary focus:ring-2 focus:ring-primary/20
                ${error ? 'border-destructive' : ''}
              `}
            />
          ))}
        </div>

        {/* Demo hint */}
        <div className="flex items-start gap-2 bg-primary-light rounded-xl px-4 py-3 border border-primary/20">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-primary font-medium">
            Enter any 6-digit code to verify (e.g. 123456)
          </p>
        </div>

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        {/* Timer */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="flex items-center gap-2 mx-auto text-primary font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Resend OTP
            </button>
          ) : (
            <p className="text-muted-foreground text-sm">
              Resend OTP in <span className="text-primary font-semibold">{timer}s</span>
            </p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={!otpComplete || isLoggingIn || verifying}
          className="w-full min-h-[52px] text-base font-semibold rounded-xl"
          style={{ background: 'oklch(0.527 0.154 150)' }}
        >
          {isLoggingIn || verifying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            'Verify & Continue'
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Didn't receive the code? Check your SMS inbox or try resending.
        </p>
      </div>
    </div>
  );
}
