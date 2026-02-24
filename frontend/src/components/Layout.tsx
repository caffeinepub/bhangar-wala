import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Clock, User, HelpCircle, Bell, MapPin } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/bookings', label: 'Bookings', icon: Clock },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/support', label: 'Support', icon: HelpCircle },
];

// Pages that should NOT show the bottom nav
const HIDE_NAV_PATHS = ['/book-pickup', '/booking-confirmation', '/track-pickup', '/payment', '/payment-success', '/rate-service', '/addresses', '/add-address', '/notifications'];

export default function Layout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { identity, isInitializing } = useInternetIdentity();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: '/login' });
    }
  }, [identity, isInitializing, navigate]);

  const hideNav = HIDE_NAV_PATHS.some(p => currentPath.startsWith(p)) || currentPath.startsWith('/edit-address') || currentPath.startsWith('/booking-details');
  const isBookingDetailsPage = currentPath.startsWith('/booking-details');

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/logo.dim_256x256.png" alt="Bhangar Wala" className="w-8 h-8 rounded-lg" />
            <div>
              <h1 className="font-heading font-bold text-sm text-primary leading-none">Bhangar Wala</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Mumbai, MH</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: '/notifications' })}
            className="relative p-2 rounded-full hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${!hideNav ? 'pb-20' : ''}`}>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-card border-t border-border shadow-bottom safe-bottom">
          <div className="flex items-center justify-around px-2 py-2">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive = currentPath === path || (path === '/home' && currentPath === '/');
              return (
                <button
                  key={path}
                  onClick={() => navigate({ to: path as any })}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[60px] min-h-[52px] justify-center ${
                    isActive
                      ? 'text-primary bg-primary-light'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  aria-label={label}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-primary font-semibold' : ''}`}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
