import { useNavigate, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, Phone, MessageCircle, X, Star, CheckCircle, Circle, Truck, MapPin, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetBookingById, useGetPartnerById, useUpdateBookingStatus } from '../hooks/useQueries';
import { BookingStatus } from '../backend';

const STATUS_STEPS = [
  { key: BookingStatus.pending, label: 'Booked', icon: '📋' },
  { key: BookingStatus.confirmed, label: 'Confirmed', icon: '✔️' },
  { key: BookingStatus.partner_assigned, label: 'Partner Assigned', icon: '👷' },
  { key: BookingStatus.on_the_way, label: 'On the Way', icon: '🚛' },
  { key: BookingStatus.arrived, label: 'Arrived', icon: '📍' },
  { key: BookingStatus.completed, label: 'Completed', icon: '✅' },
];

const STATUS_ORDER: BookingStatus[] = [
  BookingStatus.pending,
  BookingStatus.confirmed,
  BookingStatus.partner_assigned,
  BookingStatus.on_the_way,
  BookingStatus.arrived,
  BookingStatus.completed,
];

const NEXT_STATUS_MAP: Partial<Record<BookingStatus, BookingStatus>> = {
  [BookingStatus.pending]: BookingStatus.confirmed,
  [BookingStatus.confirmed]: BookingStatus.partner_assigned,
  [BookingStatus.partner_assigned]: BookingStatus.on_the_way,
  [BookingStatus.on_the_way]: BookingStatus.arrived,
  [BookingStatus.arrived]: BookingStatus.completed,
};

export default function TrackPickup() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const bookingIdStr = (routerState.location.state as any)?.bookingId || '';
  const bookingId = bookingIdStr ? BigInt(bookingIdStr) : null;

  const { data: booking, isLoading: bookingLoading } = useGetBookingById(bookingId);
  const partnerId = booking?.partnerId ?? null;
  const { data: partner, isLoading: partnerLoading } = useGetPartnerById(partnerId);
  const updateStatus = useUpdateBookingStatus();

  const currentStatus = booking?.status ?? BookingStatus.pending;
  const currentStatusIndex = STATUS_ORDER.indexOf(currentStatus);

  // Cancel is only available before arrived/completed/cancelled
  const canCancel =
    booking &&
    booking.status !== BookingStatus.arrived &&
    booking.status !== BookingStatus.completed &&
    booking.status !== BookingStatus.cancelled;

  // Simulate next status button
  const nextStatus = NEXT_STATUS_MAP[currentStatus];
  const canSimulate =
    !!nextStatus &&
    booking?.status !== BookingStatus.completed &&
    booking?.status !== BookingStatus.cancelled;

  const handleCancel = async () => {
    if (!bookingId) return;
    await updateStatus.mutateAsync({ id: bookingId, status: BookingStatus.cancelled });
    navigate({ to: '/home' });
  };

  const handleSimulateNext = () => {
    if (!bookingId || !nextStatus) return;
    updateStatus.mutate({ id: bookingId, status: nextStatus });
  };

  const handlePayment = () => {
    navigate({ to: '/payment', state: { bookingId: bookingIdStr } as any });
  };

  // Partner card state
  const hasPartnerId = !!booking?.partnerId;
  const isPartnerLoading = hasPartnerId && partnerLoading;
  const showPartnerAssigning = !bookingLoading && !hasPartnerId;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-4"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/home' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-white">Track Pickup</h1>
        <p className="text-white/80 text-sm">Booking #{bookingIdStr}</p>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-52 bg-muted overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, oklch(0.92 0.06 150) 0%, oklch(0.88 0.04 150) 100%)' }}
        >
          <div className="relative w-full h-full">
            {/* Grid lines */}
            {[...Array(6)].map((_, i) => (
              <div key={`h${i}`} className="absolute w-full h-px bg-primary/10" style={{ top: `${(i + 1) * 16}%` }} />
            ))}
            {[...Array(8)].map((_, i) => (
              <div key={`v${i}`} className="absolute h-full w-px bg-primary/10" style={{ left: `${(i + 1) * 12}%` }} />
            ))}
            {/* Roads */}
            <div className="absolute top-1/2 left-0 right-0 h-3 bg-white/60 -translate-y-1/2" />
            <div className="absolute left-1/3 top-0 bottom-0 w-3 bg-white/60" />
            {/* Location markers */}
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg animate-bounce">
                <Truck className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="absolute top-1/3 right-1/4">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </div>
            {/* Map label */}
            <div className="absolute bottom-3 left-3 bg-white/80 rounded-lg px-2 py-1">
              <p className="text-xs font-medium text-foreground">Live Tracking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Status Timeline */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-4">PICKUP STATUS</p>
          {bookingLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {STATUS_STEPS.map((step, i) => {
                const isDone = i <= currentStatusIndex;
                const isCurrent = i === currentStatusIndex;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isDone ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {isDone ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.icon} {step.label}
                      </p>
                      {isCurrent && <p className="text-xs text-primary font-medium">Current Status</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Partner Card */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">YOUR PARTNER</p>

          {isPartnerLoading ? (
            /* Loading skeleton while fetching partner details */
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : showPartnerAssigning ? (
            /* No partner assigned yet */
            <div className="flex items-center gap-3 py-1">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Partner being assigned…</p>
                <p className="text-xs text-muted-foreground">We're finding the best partner for you</p>
              </div>
            </div>
          ) : partner ? (
            /* Partner data available */
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-xl">
                👷
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{partner.name}</p>
                <p className="text-xs text-muted-foreground">{partner.vehicle}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-xs font-medium">{partner.rating}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${partner.phone}`}
                  className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 text-primary" />
                </a>
                <a
                  href={`https://wa.me/${partner.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </a>
              </div>
            </div>
          ) : (
            /* Fallback skeleton */
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          )}
        </div>

        {/* Dev: Simulate Next Status */}
        {canSimulate && (
          <button
            onClick={handleSimulateNext}
            disabled={updateStatus.isPending}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground hover:bg-muted/70 transition-colors disabled:opacity-50"
          >
            <span className="text-xs font-medium">
              {updateStatus.isPending ? 'Updating status…' : `Simulate: → ${nextStatus?.replace(/_/g, ' ')}`}
            </span>
            {updateStatus.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {booking?.status === BookingStatus.arrived && (
            <Button
              onClick={handlePayment}
              className="w-full min-h-[52px] text-base font-semibold rounded-xl"
              style={{ background: 'oklch(0.769 0.188 70)' }}
            >
              Proceed to Payment
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateStatus.isPending}
              className="w-full min-h-[52px] text-base font-semibold rounded-xl border-destructive text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
