import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, Package, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyBookings } from '../hooks/useQueries';
import { BookingStatus } from '../backend';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  [BookingStatus.pending]: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [BookingStatus.confirmed]: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800' },
  [BookingStatus.partner_assigned]: { label: 'Assigned', bg: 'bg-purple-100', text: 'text-purple-800' },
  [BookingStatus.on_the_way]: { label: 'On the Way', bg: 'bg-orange-100', text: 'text-orange-800' },
  [BookingStatus.arrived]: { label: 'Arrived', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  [BookingStatus.completed]: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-800' },
  [BookingStatus.cancelled]: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: BookingStatus.pending, label: 'Pending' },
  { key: BookingStatus.completed, label: 'Completed' },
  { key: BookingStatus.cancelled, label: 'Cancelled' },
];

export default function Bookings() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: bookings = [], isLoading } = useGetMyBookings();

  const filtered = useMemo(() => {
    let list = [...bookings].sort((a, b) => Number(b.scheduledTime) - Number(a.scheduledTime));
    if (activeFilter !== 'all') {
      list = list.filter(b => b.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.id.toString().includes(q) ||
        b.addressId.toString().includes(q)
      );
    }
    return list;
  }, [bookings, activeFilter, search]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <h1 className="font-heading text-xl font-bold text-white">My Bookings</h1>
        <p className="text-white/80 text-sm mt-1">{bookings.length} total bookings</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by booking ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <img
              src="/assets/generated/empty-bookings.dim_320x240.png"
              alt="No bookings"
              className="w-40 h-auto opacity-80"
            />
            <p className="text-muted-foreground text-sm text-center">
              {search || activeFilter !== 'all' ? 'No bookings match your filter.' : 'No bookings yet.\nBook your first pickup!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => {
              const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG[BookingStatus.pending];
              const date = new Date(Number(booking.scheduledTime) / 1_000_000);
              return (
                <button
                  key={booking.id.toString()}
                  onClick={() => navigate({ to: '/booking-details/$id', params: { id: booking.id.toString() } })}
                  className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-card transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Booking #{booking.id.toString()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isNaN(date.getTime()) ? 'Scheduled' : formatDistanceToNow(date, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-primary">₹{booking.totalEstimatedAmount.toFixed(0)}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
