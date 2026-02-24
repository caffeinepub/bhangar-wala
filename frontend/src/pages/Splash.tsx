import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Splash() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();

  useEffect(() => {
    if (isInitializing) return;

    const timer = setTimeout(() => {
      if (identity) {
        navigate({ to: '/home' });
      } else {
        navigate({ to: '/login' });
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [identity, isInitializing, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)',
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="/assets/generated/splash-bg.dim_390x844.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full border-2 border-white/20 animate-pulse-ring" />
        <div className="absolute w-48 h-48 rounded-full border-2 border-white/30 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Logo & Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="animate-bounce-in">
          <div className="w-28 h-28 rounded-3xl bg-white shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/assets/generated/logo.dim_256x256.png"
              alt="Bhangar Wala Logo"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <h1 className="font-heading text-4xl font-bold text-white tracking-tight">Bhangar Wala</h1>
          <p className="text-white/80 text-base mt-2 font-medium">♻️ Sell Scrap. Earn Cash. Go Green.</p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3 mt-4 animate-fade-in-up" style={{ animationDelay: '0.6s', opacity: 0 }}>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/80"
                style={{
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-white/60 text-xs">Loading...</p>
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-white/50 text-xs">
        Version 1.0.0
      </div>
    </div>
  );
}
