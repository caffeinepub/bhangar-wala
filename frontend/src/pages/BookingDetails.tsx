import React from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Calendar, Package, Phone, Star, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useGetBookingById,
  useGetBookingItems,
  useGetPartnerById,
  useGetPaymentByBookingId,
  useGetScrapCategories,
  useGetScrapRates,
  BookingStatus,
  PaymentMethod,
} from '../hooks/useQueries';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [BookingStatus.pending]: { label: 'Pending', variant: 'secondary' },
  [BookingStatus.confirmed]: { label: 'Confirmed', variant: 'default' },
  [BookingStatus.partner_assigned]: { label: 'Partner Assigned', variant: 'default' },
  [BookingStatus.on_the_way]: { label: 'On the Way', variant: 'default' },
  [BookingStatus.arrived]: { label: 'Arrived', variant: 'default' },
  [BookingStatus.completed]: { label: 'Completed', variant: 'outline' },
  [BookingStatus.cancelled]: { label: 'Cancelled', variant: 'destructive' },
};

export default function BookingDetails() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const bookingId = params.id ? parseInt(params.id, 10) : 0;

  const { data: booking, isLoading: bookingLoading } = useGetBookingById(bookingId);
  const { data: items = [] } = useGetBookingItems(bookingId);
  const { data: categories = [] } = useGetScrapCategories();
  const { data: rates = [] } = useGetScrapRates();
  const { data: partner } = useGetPartnerById(booking?.partnerId ?? null);
  const { data: payment } = useGetPaymentByBookingId(bookingId);

  function getCategoryName(categoryId: number): string {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || `Category ${categoryId}`;
  }

  function getRate(categoryId: number): number {
    const rate = rates.find((r) => r.categoryId === categoryId);
    return rate?.pricePerKg || 0;
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: '/bookings' })}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Booking Details</h1>
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
        <Button onClick={() => navigate({ to: '/bookings' })}>Back to Bookings</Button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[booking.status] || { label: booking.status, variant: 'secondary' as const };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/bookings' })}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Booking #{booking.id}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-foreground">Status</p>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
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
          {(items.length > 0 ? items : booking.items || []).map((item) => {
            const r = getRate(item.categoryId);
            const weight = item.finalWeight ?? item.estimatedWeight;
            return (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <p className="text-sm font-medium text-foreground">
                  {getCategoryName(item.categoryId)}
                </p>
                <span className="text-muted-foreground">
                  {weight} kg × ₹{r} = ₹{(weight * r).toFixed(0)}
                </span>
              </div>
            );
          })}
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold text-foreground text-sm">
            <span>Estimated Total</span>
            <span>₹{booking.totalEstimatedAmount.toFixed(0)}</span>
          </div>
        </div>

        {/* Partner */}
        {partner && (
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Partner</p>
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
          </div>
        )}

        {/* Payment */}
        {payment && (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Payment</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium text-foreground">₹{payment.amount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium text-foreground capitalize">
                {payment.method === PaymentMethod.cash ? 'Cash' : 'UPI'}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-foreground capitalize">{payment.status}</span>
            </div>
          </div>
        )}
      </main>

      {booking.status === BookingStatus.completed && !payment && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
          <Button
            className="w-full"
            onClick={() => navigate({ to: '/payment', search: { bookingId: booking.id } })}
          >
            <CreditCard className="w-4 h-4 mr-2" /> Make Payment
          </Button>
        </div>
      )}
    </div>
  );
}
