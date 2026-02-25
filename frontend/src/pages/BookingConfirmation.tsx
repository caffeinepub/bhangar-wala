import React from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Calendar, Package, Phone, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetBookingById,
  useGetBookingItems,
  useGetPartnerById,
  useGetScrapCategories,
  useCancelBooking,
  BookingStatus,
} from '../hooks/useQueries';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { bookingId?: number };
  const bookingId = search.bookingId ? Number(search.bookingId) : 0;

  const { data: booking, isLoading: bookingLoading } = useGetBookingById(bookingId);
  const { data: items = [] } = useGetBookingItems(bookingId);
  const { data: categories = [] } = useGetScrapCategories();
  const { data: partner, isLoading: partnerLoading } = useGetPartnerById(
    booking?.partnerId ?? null
  );
  const cancelBooking = useCancelBooking();

  function getCategoryName(categoryId: number): string {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || `Category ${categoryId}`;
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  async function handleCancel() {
    if (confirm('Cancel this booking?')) {
      await cancelBooking.mutateAsync(bookingId);
      navigate({ to: '/bookings' });
    }
  }

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: '/home' })}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Booking Confirmation</h1>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-muted-foreground mb-4">Booking not found.</p>
        <Button onClick={() => navigate({ to: '/home' })}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/home' })}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Booking Confirmed!</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-4">
        {/* Booking ID */}
        <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
          <p className="text-sm text-muted-foreground">Booking ID</p>
          <p className="text-2xl font-bold text-primary">#{booking.id}</p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{booking.status}</p>
        </div>

        {/* Address */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Pickup Address</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.address.street}, {booking.address.city} - {booking.address.pincode}
          </p>
        </div>

        {/* Schedule */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Scheduled</span>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(booking.scheduledTime)}</p>
        </div>

        {/* Items */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Scrap Items</span>
          </div>
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-muted-foreground py-1">
                <p className="text-sm font-semibold text-foreground">
                  {getCategoryName(item.categoryId)}
                </p>
                <span>{item.estimatedWeight} kg</span>
              </div>
            ))
          ) : (
            booking.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-muted-foreground py-1">
                <p className="text-sm font-semibold text-foreground">
                  {getCategoryName(item.categoryId)}
                </p>
                <span>{item.estimatedWeight} kg</span>
              </div>
            ))
          )}
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold text-foreground text-sm">
            <span>Estimated Total</span>
            <span>₹{booking.totalEstimatedAmount.toFixed(0)}</span>
          </div>
        </div>

        {/* Partner */}
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-semibold text-foreground mb-2">Assigned Partner</p>
          {partnerLoading ? (
            <Skeleton className="h-12 rounded-lg" />
          ) : partner ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{partner.name}</p>
                <p className="text-xs text-muted-foreground">{partner.vehicle}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-muted-foreground">{partner.rating}</span>
                </div>
              </div>
              <a href={`tel:${partner.phone}`}>
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-1" /> Call
                </Button>
              </a>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Partner being assigned…</p>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleCancel}
          disabled={cancelBooking.isPending || booking.status === BookingStatus.cancelled}
        >
          {cancelBooking.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel'}
        </Button>
        <Button
          className="flex-1"
          onClick={() => navigate({ to: '/track-pickup', search: { bookingId: booking.id } })}
        >
          Track Pickup
        </Button>
      </div>
    </div>
  );
}
