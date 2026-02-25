import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Package, Calendar, Star, Phone, MessageCircle, IndianRupee, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetBookingById,
  useGetAddressById,
  useGetBookingItems,
  useGetScrapCategories,
  useGetScrapRates,
  useGetPartnerById,
  useGetPaymentByBookingId,
  PaymentMethod,
} from '../hooks/useQueries';
import { BookingStatus } from '../backend';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  [BookingStatus.pending]: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [BookingStatus.confirmed]: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800' },
  [BookingStatus.partner_assigned]: { label: 'Partner Assigned', bg: 'bg-purple-100', text: 'text-purple-800' },
  [BookingStatus.on_the_way]: { label: 'On the Way', bg: 'bg-orange-100', text: 'text-orange-800' },
  [BookingStatus.arrived]: { label: 'Arrived', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  [BookingStatus.completed]: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-800' },
  [BookingStatus.cancelled]: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function BookingDetails() {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/layout/booking-details/$id' });
  const bookingId = id ? BigInt(id) : null;

  const { data: booking, isLoading: bookingLoading } = useGetBookingById(bookingId);
  const { data: address } = useGetAddressById(booking?.addressId ?? null);
  const { data: items = [] } = useGetBookingItems(bookingId);
  const { data: categories = [] } = useGetScrapCategories();
  const { data: rates = [] } = useGetScrapRates();
  const { data: partner } = useGetPartnerById(booking?.partnerId ?? null);
  const { data: payment } = useGetPaymentByBookingId(bookingId);

  const getCategoryName = (categoryId: bigint) =>
    categories.find(c => c.id.toString() === categoryId.toString())?.name || 'Unknown';

  const getRate = (categoryId: bigint) =>
    rates.find(r => r.categoryId.toString() === categoryId.toString())?.pricePerKg || 0;

  const scheduledDate = booking ? new Date(Number(booking.scheduledTime) / 1_000_000) : null;
  const statusCfg = booking ? (STATUS_CONFIG[booking.status] || STATUS_CONFIG[BookingStatus.pending]) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/bookings' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-white">Booking Details</h1>
            <p className="text-white/80 text-sm">#{id}</p>
          </div>
          {statusCfg && (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {bookingLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : (
          <>
            {/* Address */}
            {address && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">PICKUP ADDRESS</p>
                    <p className="font-semibold text-foreground mt-0.5">{address.addressLabel}</p>
                    <p className="text-sm text-muted-foreground">{address.street}, {address.city} - {address.pincode}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule */}
            {scheduledDate && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">SCHEDULED TIME</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {scheduledDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scrap Items */}
            {items.length > 0 && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-primary-light">
                  <p className="font-heading font-bold text-primary text-sm">SCRAP ITEMS</p>
                </div>
                <div className="p-4 space-y-3">
                  {items.map(item => {
                    const w = item.finalWeight ?? item.estimatedWeight;
                    const r = getRate(item.categoryId);
                    return (
                      <div key={item.id.toString()} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{getCategoryName(item.categoryId)}</p>
                            <p className="text-xs text-muted-foreground">{w} kg × ₹{r}/kg</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-primary">₹{(w * r).toFixed(2)}</p>
                      </div>
                    );
                  })}
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <p className="font-bold text-foreground">Estimated Total</p>
                    </div>
                    <p className="font-heading text-lg font-bold text-primary">₹{booking?.totalEstimatedAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Partner */}
            {partner && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground font-medium mb-3">PICKUP PARTNER</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-xl">👷</div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{partner.name}</p>
                    <p className="text-xs text-muted-foreground">{partner.vehicle}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <span className="text-xs font-medium">{partner.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${partner.phone}`} className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </a>
                    <a href={`https://wa.me/${partner.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Payment */}
            {payment && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-green-50">
                  <p className="font-heading font-bold text-green-700 text-sm">PAYMENT DETAILS</p>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="font-bold text-primary">₹{payment.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="text-sm font-medium text-foreground">{payment.method === PaymentMethod.upi ? 'UPI' : 'Cash'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">Completed</span>
                  </div>
                </div>
              </div>
            )}

            {/* Support */}
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/support' })}
              className="w-full min-h-[48px] rounded-xl border-secondary text-secondary"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
