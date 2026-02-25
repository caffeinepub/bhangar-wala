import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Search, X, CalendarCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllBookings } from '../hooks/useQueries';
import type { AdminBooking } from '../hooks/useQueries';
import { BookingStatus } from '../backend';

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [BookingStatus.pending]: { label: 'Pending', variant: 'secondary' },
  [BookingStatus.confirmed]: { label: 'Confirmed', variant: 'default' },
  [BookingStatus.partner_assigned]: { label: 'Assigned', variant: 'default' },
  [BookingStatus.on_the_way]: { label: 'On the Way', variant: 'default' },
  [BookingStatus.arrived]: { label: 'Arrived', variant: 'default' },
  [BookingStatus.completed]: { label: 'Completed', variant: 'default' },
  [BookingStatus.cancelled]: { label: 'Cancelled', variant: 'destructive' },
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  [BookingStatus.pending]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  [BookingStatus.confirmed]: 'bg-blue-100 text-blue-700 border-blue-200',
  [BookingStatus.partner_assigned]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [BookingStatus.on_the_way]: 'bg-purple-100 text-purple-700 border-purple-200',
  [BookingStatus.arrived]: 'bg-orange-100 text-orange-700 border-orange-200',
  [BookingStatus.completed]: 'bg-green-100 text-green-700 border-green-200',
  [BookingStatus.cancelled]: 'bg-red-100 text-red-700 border-red-200',
};

const ALL_STATUSES = [
  { key: 'all', label: 'All' },
  { key: BookingStatus.pending, label: 'Pending' },
  { key: BookingStatus.confirmed, label: 'Confirmed' },
  { key: BookingStatus.partner_assigned, label: 'Assigned' },
  { key: BookingStatus.on_the_way, label: 'On Way' },
  { key: BookingStatus.arrived, label: 'Arrived' },
  { key: BookingStatus.completed, label: 'Completed' },
  { key: BookingStatus.cancelled, label: 'Cancelled' },
];

function formatDate(ts: bigint) {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function BookingRow({ ab, onClick }: { ab: AdminBooking; onClick: () => void }) {
  const { booking, userProfile, partner } = ab;
  const statusCfg = STATUS_CONFIG[booking.status];
  const statusColor = STATUS_COLORS[booking.status];

  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:bg-muted/30 active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-sm text-foreground">#{booking.id.toString()}</p>
          <p className="text-xs text-muted-foreground">
            {userProfile ? `${userProfile.name} · ${userProfile.phone}` : 'Unknown User'}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
          {statusCfg.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>📅 {formatDate(booking.scheduledTime)}</span>
        <span>🚛 {partner ? partner.name : 'No partner'}</span>
        <span className="font-semibold text-foreground">₹{booking.totalEstimatedAmount.toFixed(0)}</span>
      </div>
    </button>
  );
}

export default function AdminBookings() {
  const navigate = useNavigate();
  const { data: allBookings = [], isLoading } = useGetAllBookings();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = allBookings;
    if (statusFilter !== 'all') {
      list = list.filter((ab) => ab.booking.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((ab) => {
        const idMatch = ab.booking.id.toString().includes(q);
        const phoneMatch = ab.userProfile?.phone?.toLowerCase().includes(q) ?? false;
        const nameMatch = ab.userProfile?.name?.toLowerCase().includes(q) ?? false;
        return idMatch || phoneMatch || nameMatch;
      });
    }
    return list;
  }, [allBookings, statusFilter, search]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.35 0.12 150) 0%, oklch(0.25 0.10 200) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/admin' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-white">All Bookings</h1>
        <p className="text-white/70 text-sm">{allBookings.length} total bookings</p>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 rounded-xl"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ALL_STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                statusFilter === s.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarCheck className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No bookings found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ab) => (
              <BookingRow
                key={ab.booking.id.toString()}
                ab={ab}
                onClick={() => navigate({ to: '/booking-details/$id', params: { id: ab.booking.id.toString() } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
