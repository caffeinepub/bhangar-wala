import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Fingerprint, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const isLoggingIn = loginStatus === 'logging-in';

  const handleSignIn = async () => {
    setError('');
    try {
      await login();
      // After login, check if user has a profile
      // We need to wait a tick for the actor to be ready with the new identity
      setTimeout(async () => {
        try {
          if (actor) {
            const profile = await actor.getCallerUserProfile();
            if (profile) {
              queryClient.setQueryData(['currentUserProfile'], profile);
              navigate({ to: '/home' });
            } else {
              navigate({ to: '/profile-setup' });
            }
          } else {
            navigate({ to: '/profile-setup' });
          }
        } catch {
          navigate({ to: '/profile-setup' });
        }
      }, 500);
    } catch (err: any) {
      if (err?.message !== 'UserInterrupt') {
        setError('Sign in failed. Please try again.');
      }
    }
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
      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col">
        <div className="flex-1 space-y-6">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground">Welcome Back!</h2>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Sign in securely using your Google, Apple, Microsoft account, or a passkey
            </p>
          </div>

          {/* Sign-in options illustration */}
          <div className="flex justify-center gap-4 py-2">
            {[
              { label: 'Google', color: 'bg-red-50 text-red-500', letter: 'G' },
              { label: 'Apple', color: 'bg-gray-100 text-gray-800', letter: '' },
              { label: 'Microsoft', color: 'bg-blue-50 text-blue-600', letter: 'M' },
              { label: 'Passkey', color: 'bg-primary-light text-primary', icon: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-sm border border-border`}
                title={item.label}
              >
                {item.icon ? (
                  <Fingerprint className="w-5 h-5" />
                ) : item.label === 'Apple' ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                ) : (
                  <span className="font-bold text-sm">{item.letter}</span>
                )}
              </div>
            ))}
          </div>

          {/* Sign In Button */}
          <Button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="w-full min-h-[56px] text-base font-semibold rounded-2xl shadow-md"
            style={{ background: 'oklch(0.527 0.154 150)' }}
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In
              </span>
            )}
          </Button>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          {/* Info */}
          <div className="bg-muted/60 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">How it works</p>
            <ul className="space-y-1.5">
              {[
                'Tap "Sign In" to open the secure login popup',
                'Choose Google, Apple, Microsoft, or a passkey',
                'You\'re in — no password needed!',
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

        {/* Footer */}
        <div className="pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <span className="text-primary font-medium">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary font-medium">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
