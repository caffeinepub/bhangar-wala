import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGetAllBookings } from '../hooks/useQueries';
import type { AdminBooking } from '../hooks/useQueries';
import { BookingStatus } from '../hooks/useQueries';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [BookingStatus.pending]: { label: 'Pending', variant: 'secondary' },
  [BookingStatus.confirmed]: { label: 'Confirmed', variant: 'default' },
  [BookingStatus.partner_assigned]: { label: 'Partner Assigned', variant: 'default' },
  [BookingStatus.on_the_way]: { label: 'On the Way', variant: 'default' },
  [BookingStatus.arrived]: { label: 'Arrived', variant: 'default' },
  [BookingStatus.completed]: { label: 'Completed', variant: 'outline' },
  [BookingStatus.cancelled]: { label: 'Cancelled', variant: 'destructive' },
};

const STATUS_FILTERS = ['All', 'pending', 'confirmed', 'partner_assigned', 'on_the_way', 'arrived', 'completed', 'cancelled'];

export default function AdminBookings() {
  const navigate = useNavigate();
  const { data: allBookings = [], isLoading } = useGetAllBookings();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  let list: AdminBooking[] = allBookings;

  if (statusFilter !== 'All') {
    list = list.filter((ab) => ab.booking.status === statusFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter((ab) => {
      const idMatch = ab.booking.id.toString().includes(q);
      const phoneMatch = ab.userProfile?.phoneNumber?.toLowerCase().includes(q) ?? false;
      const nameMatch = ab.userProfile?.name?.toLowerCase().includes(q) ?? false;
      return idMatch || phoneMatch || nameMatch;
    });
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">All Bookings</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
          <Input
            placeholder="Search by ID or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60"
          />
        </div>
      </header>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-border">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s === 'All' ? 'All' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No bookings found.</div>
        ) : (
          <div className="space-y-3">
            {list.map((ab) => {
              const cfg = STATUS_CONFIG[ab.booking.status] || { label: ab.booking.status, variant: 'secondary' as const };
              return (
                <div
                  key={ab.booking.id.toString()}
                  className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => navigate({ to: '/booking-details/$id', params: { id: ab.booking.id.toString() } })}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Booking #{ab.booking.id}</p>
                      {ab.userProfile && (
                        <p className="text-xs text-muted-foreground">
                          {ab.userProfile.name} · {ab.userProfile.phoneNumber}
                        </p>
                      )}
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDate(ab.booking.scheduledTime)}</span>
                    <span className="font-medium text-foreground">
                      ₹{ab.booking.totalEstimatedAmount.toFixed(0)}
                    </span>
                  </div>
                  {ab.partner && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Partner: {ab.partner.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
