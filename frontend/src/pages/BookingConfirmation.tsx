import { useEffect } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Package, Calendar, Star, Phone, Navigation, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetBookingById,
  useGetAddressById,
  useGetBookingItems,
  useGetScrapCategories,
  useAssignPartnerToBooking,
  useUpdateBookingStatus,
  useGetPartnerById,
} from '../hooks/useQueries';
import { BookingStatus } from '../backend';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const bookingIdStr = (routerState.location.state as any)?.bookingId || '';
  const bookingId = bookingIdStr ? BigInt(bookingIdStr) : null;

  const { data: booking, isLoading: bookingLoading } = useGetBookingById(bookingId);
  const { data: address } = useGetAddressById(booking?.addressId ?? null);
  const { data: items = [] } = useGetBookingItems(bookingId);
  const { data: categories = [] } = useGetScrapCategories();
  const assignPartner = useAssignPartnerToBooking();
  const updateStatus = useUpdateBookingStatus();
  const partnerId = booking?.partnerId ?? null;
  const { data: partner, isLoading: partnerLoading } = useGetPartnerById(partnerId);

  // Auto-assign a partner when booking is confirmed
  useEffect(() => {
    if (booking && !booking.partnerId && bookingId) {
      assignPartner.mutate({ bookingId, partnerId: BigInt(1) });
    }
  }, [booking?.id.toString()]);

  const handleCancel = async () => {
    if (!bookingId) return;
    await updateStatus.mutateAsync({ id: bookingId, status: BookingStatus.cancelled });
    navigate({ to: '/home' });
  };

  const scheduledDate = booking ? new Date(Number(booking.scheduledTime) / 1_000_000) : null;

  const getCategoryName = (categoryId: bigint) => {
    return categories.find(c => c.id.toString() === categoryId.toString())?.name || 'Unknown';
  };

  if (!bookingId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Booking not found</p>
        <Button onClick={() => navigate({ to: '/home' })}>Go Home</Button>
      </div>
    );
  }

  // Determine partner card state
  const hasPartnerId = !!booking?.partnerId;
  const isPartnerLoading = hasPartnerId && partnerLoading;
  const showPartnerAssigning = !bookingLoading && !hasPartnerId;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/home' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center text-white">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="font-heading text-xl font-bold">Booking Confirmed!</h1>
          <p className="text-white/80 text-sm mt-1">Booking #{bookingIdStr}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {bookingLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : (
          <>
            {/* Booking Details */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 space-y-3">
                {address && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup Address</p>
                      <p className="text-sm font-semibold text-foreground">{address.addressLabel}</p>
                      <p className="text-xs text-muted-foreground">{address.street}, {address.city} - {address.pincode}</p>
                    </div>
                  </div>
                )}
                <div className="h-px bg-border" />
                {items.map(item => (
                  <div key={item.id.toString()} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Scrap Item</p>
                      <p className="text-sm font-semibold text-foreground">{getCategoryName(item.categoryId)}</p>
                      <p className="text-xs text-muted-foreground">~{item.estimatedWeight} kg</p>
                    </div>
                  </div>
                ))}
                <div className="h-px bg-border" />
                {scheduledDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Scheduled Time</p>
                      <p className="text-sm font-semibold text-foreground">
                        {scheduledDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-xs text-muted-foreground">{scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Estimated Earnings</p>
                  <p className="font-heading text-xl font-bold text-primary">₹{booking?.totalEstimatedAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Partner Card */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground font-medium mb-3">ASSIGNED PARTNER</p>

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
                <div className="flex items-center gap-3 py-2">
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
                      <span className="text-xs font-medium text-foreground">{partner.rating}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${partner.phone}`}
                    className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                  </a>
                </div>
              ) : (
                /* Fallback skeleton (e.g. partner id exists but data not yet loaded) */
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate({ to: '/track-pickup', state: { bookingId: bookingIdStr } as any })}
                className="w-full min-h-[52px] text-base font-semibold rounded-xl"
                style={{ background: 'oklch(0.527 0.154 150)' }}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Track Pickup
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateStatus.isPending}
                className="w-full min-h-[52px] text-base font-semibold rounded-xl border-destructive text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Booking
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
