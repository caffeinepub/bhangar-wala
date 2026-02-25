import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Package, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGetUserBookings, BookingStatus } from '../hooks/useQueries';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [BookingStatus.pending]: { label: 'Pending', variant: 'secondary' },
  [BookingStatus.confirmed]: { label: 'Confirmed', variant: 'default' },
  [BookingStatus.partner_assigned]: { label: 'Partner Assigned', variant: 'default' },
  [BookingStatus.on_the_way]: { label: 'On the Way', variant: 'default' },
  [BookingStatus.arrived]: { label: 'Arrived', variant: 'default' },
  [BookingStatus.completed]: { label: 'Completed', variant: 'outline' },
  [BookingStatus.cancelled]: { label: 'Cancelled', variant: 'destructive' },
};

const STATUS_FILTERS = ['All', ...Object.keys(STATUS_CONFIG)];

export default function Bookings() {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useGetUserBookings();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  let filtered = bookings;
  if (statusFilter !== 'All') {
    filtered = filtered.filter((b) => b.status === statusFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((b) => b.id.toString().includes(q));
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
          <button onClick={() => navigate({ to: '/home' })}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">My Bookings</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
          <Input
            placeholder="Search by booking ID..."
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground">
              {statusFilter !== 'All' ? 'No bookings with this status.' : 'Book your first scrap pickup!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status] || { label: booking.status, variant: 'secondary' as const };
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
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-foreground">Booking #{booking.id}</p>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {booking.address.street}, {booking.address.city}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{formatDate(booking.scheduledTime)}</span>
                    <span className="font-medium text-foreground">
                      ₹{booking.totalEstimatedAmount.toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
