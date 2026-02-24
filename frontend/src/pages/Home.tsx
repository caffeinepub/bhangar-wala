import { useNavigate } from '@tanstack/react-router';
import { Plus, ChevronRight, Package, Newspaper, Cpu, Recycle, Layers, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCallerUserProfile, useGetScrapCategories, useGetMyBookings } from '../hooks/useQueries';
import { BookingStatus } from '../backend';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Paper': <Newspaper className="w-6 h-6" />,
  'Metal': <Layers className="w-6 h-6" />,
  'Plastic': <Recycle className="w-6 h-6" />,
  'Electronics': <Cpu className="w-6 h-6" />,
  'Newspaper': <Newspaper className="w-5 h-5" />,
  'Cardboard': <Package className="w-5 h-5" />,
  'Iron': <Layers className="w-5 h-5" />,
  'Copper': <Zap className="w-5 h-5" />,
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  [BookingStatus.pending]: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  [BookingStatus.confirmed]: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  [BookingStatus.partner_assigned]: { label: 'Partner Assigned', color: 'bg-purple-100 text-purple-800' },
  [BookingStatus.on_the_way]: { label: 'On the Way', color: 'bg-orange-100 text-orange-800' },
  [BookingStatus.arrived]: { label: 'Arrived', color: 'bg-indigo-100 text-indigo-800' },
  [BookingStatus.completed]: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  [BookingStatus.cancelled]: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function Home() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: categories = [], isLoading: categoriesLoading } = useGetScrapCategories();
  const { data: bookings = [], isLoading: bookingsLoading } = useGetMyBookings();

  const firstName = profile?.name?.split(' ')[0] || 'there';
  const parentCategories = categories.filter(c => !c.parentId);
  const recentBookings = [...bookings]
    .sort((a, b) => Number(b.scheduledTime) - Number(a.scheduledTime))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <div className="px-5 pt-5 pb-16">
          <div className="flex items-start justify-between">
            <div>
              {profileLoading ? (
                <Skeleton className="h-6 w-32 bg-white/20" />
              ) : (
                <h2 className="font-heading text-xl font-bold text-white">
                  Hello, {firstName}! 👋
                </h2>
              )}
              <p className="text-white/80 text-sm mt-1">Ready to sell your scrap today?</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Today's Rate</p>
              <p className="text-white font-bold text-sm">Iron: ₹30/kg</p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="absolute right-0 bottom-0 w-40 h-24 opacity-30">
          <img src="/assets/generated/home-hero.dim_780x320.png" alt="" className="w-full h-full object-cover object-right" />
        </div>

        {/* Book Pickup CTA Card */}
        <div className="mx-4 -mb-8 relative z-10">
          <div className="bg-card rounded-2xl shadow-card-hover p-4 flex items-center justify-between">
            <div>
              <p className="font-heading font-bold text-foreground text-base">Schedule a Pickup</p>
              <p className="text-muted-foreground text-xs mt-0.5">Get instant cash for your scrap</p>
            </div>
            <Button
              onClick={() => navigate({ to: '/book-pickup' })}
              className="rounded-xl min-h-[44px] px-5 font-semibold"
              style={{ background: 'oklch(0.527 0.154 150)' }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Book Now
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-12 pb-4 space-y-6">
        {/* Scrap Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-foreground text-base">Scrap Categories</h3>
            <span className="text-xs text-muted-foreground">Tap to book</span>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {parentCategories.map(cat => (
                <button
                  key={cat.id.toString()}
                  onClick={() => navigate({ to: '/book-pickup' })}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary-light transition-all min-h-[72px] justify-center"
                >
                  <div className="text-primary">
                    {CATEGORY_ICONS[cat.name] || <Package className="w-6 h-6" />}
                  </div>
                  <span className="text-xs font-medium text-foreground text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Rates Banner */}
        <div className="rounded-2xl overflow-hidden border border-accent/30 bg-accent-light">
          <div className="p-4">
            <p className="font-heading font-bold text-foreground text-sm mb-2">📊 Today's Scrap Rates</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Newspaper', rate: '₹12/kg' },
                { name: 'Iron', rate: '₹30/kg' },
                { name: 'PET Bottles', rate: '₹15/kg' },
                { name: 'Copper', rate: '₹450/kg' },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-foreground">{item.name}</span>
                  <span className="text-xs font-bold text-primary">{item.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-foreground text-base">Recent Bookings</h3>
            {bookings.length > 0 && (
              <button
                onClick={() => navigate({ to: '/bookings' })}
                className="flex items-center gap-1 text-primary text-xs font-medium"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {bookingsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <img src="/assets/generated/empty-bookings.dim_320x240.png" alt="No bookings" className="w-40 h-auto opacity-80" />
              <p className="text-muted-foreground text-sm text-center">No bookings yet.<br />Book your first pickup!</p>
              <Button
                onClick={() => navigate({ to: '/book-pickup' })}
                variant="outline"
                className="rounded-xl border-primary text-primary"
              >
                Book Pickup
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(booking => {
                const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG[BookingStatus.pending];
                const date = new Date(Number(booking.scheduledTime) / 1_000_000);
                return (
                  <button
                    key={booking.id.toString()}
                    onClick={() => navigate({ to: '/booking-details/$id', params: { id: booking.id.toString() } })}
                    className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-card transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">Booking #{booking.id.toString()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isNaN(date.getTime()) ? 'Scheduled' : formatDistanceToNow(date, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-xs font-bold text-primary">₹{booking.totalEstimatedAmount.toFixed(0)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-2 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bhangar Wala. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'bhangar-wala')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
