import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Package, Bell, ChevronRight, Loader2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useGetCallerUserProfile,
  useGetScrapCategories,
  useGetUserBookings,
  BookingStatus,
} from '../hooks/useQueries';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  [BookingStatus.pending]: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  [BookingStatus.confirmed]: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  [BookingStatus.partner_assigned]: { label: 'Partner Assigned', color: 'bg-purple-100 text-purple-800' },
  [BookingStatus.on_the_way]: { label: 'On the Way', color: 'bg-orange-100 text-orange-800' },
  [BookingStatus.arrived]: { label: 'Arrived', color: 'bg-teal-100 text-teal-800' },
  [BookingStatus.completed]: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  [BookingStatus.cancelled]: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

const CATEGORY_ICONS: Record<string, string> = {
  Paper: '📰',
  Metal: '🔩',
  Plastic: '♻️',
  Electronics: '📱',
  Newspaper: '📰',
  Cardboard: '📦',
  Iron: '🔩',
  Copper: '🪙',
  'PET Bottles': '🍶',
  'Hard Plastic': '🪣',
  Mobile: '📱',
  Laptop: '💻',
};

export default function Home() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const { data: categories = [], isLoading: categoriesLoading } = useGetScrapCategories();
  const { data: bookings = [], isLoading: bookingsLoading } = useGetUserBookings();

  const parentCategories = categories.filter((c) => c.parentId == null);
  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">{profile?.name || 'User'} 👋</h1>
          </div>
          <button
            onClick={() => navigate({ to: '/notifications' })}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Hero CTA */}
        <div
          className="bg-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition-colors"
          onClick={() => navigate({ to: '/book-pickup' })}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">Book Scrap Pickup</p>
              <p className="text-primary-foreground/70 text-sm">Schedule a free pickup today</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Scrap Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Scrap Categories</h2>
          </div>
          {categoriesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {parentCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate({ to: '/book-pickup' })}
                  className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl border border-border hover:border-primary/40 transition-colors"
                >
                  <span className="text-2xl">{CATEGORY_ICONS[cat.name] || '♻️'}</span>
                  <span className="text-xs text-foreground font-medium text-center leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Rates Banner */}
        <section
          className="bg-primary/10 rounded-xl p-4 border border-primary/20 cursor-pointer"
          onClick={() => navigate({ to: '/book-pickup' })}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Today's Scrap Rates</p>
              <p className="text-xs text-muted-foreground">Iron ₹30/kg · Copper ₹450/kg · Paper ₹12/kg</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
          </div>
        </section>

        {/* Recent Bookings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Recent Bookings</h2>
            {bookings.length > 0 && (
              <button
                onClick={() => navigate({ to: '/bookings' })}
                className="text-xs text-primary font-medium"
              >
                View All
              </button>
            )}
          </div>
          {bookingsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No bookings yet</p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => navigate({ to: '/book-pickup' })}
              >
                Book Now
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => {
                const cfg = STATUS_CONFIG[booking.status] || { label: booking.status, color: 'bg-gray-100 text-gray-800' };
                return (
                  <div
                    key={booking.id}
                    className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() =>
                      navigate({
                        to: '/booking-details/$id',
                        params: { id: booking.id.toString() },
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground text-sm">Booking #{booking.id}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking.address.city}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(booking.scheduledTime).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="font-medium text-foreground">
                        ₹{booking.totalEstimatedAmount.toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
