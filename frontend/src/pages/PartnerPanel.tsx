import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Truck, Phone, MapPin, Package, ChevronRight, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGetPartnerByPhone,
  useGetBookingsByPartnerId,
  usePartnerAcceptBooking,
  usePartnerUpdateBookingStatus,
  BookingStatus,
} from '../hooks/useQueries';
import type { Booking } from '../hooks/useQueries';

const STATUS_LABELS: Record<string, string> = {
  [BookingStatus.pending]: 'Pending',
  [BookingStatus.confirmed]: 'Confirmed',
  [BookingStatus.partner_assigned]: 'Assigned to You',
  [BookingStatus.on_the_way]: 'On the Way',
  [BookingStatus.arrived]: 'Arrived',
  [BookingStatus.completed]: 'Completed',
  [BookingStatus.cancelled]: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  [BookingStatus.pending]: 'bg-yellow-100 text-yellow-700',
  [BookingStatus.confirmed]: 'bg-blue-100 text-blue-700',
  [BookingStatus.partner_assigned]: 'bg-indigo-100 text-indigo-700',
  [BookingStatus.on_the_way]: 'bg-purple-100 text-purple-700',
  [BookingStatus.arrived]: 'bg-orange-100 text-orange-700',
  [BookingStatus.completed]: 'bg-green-100 text-green-700',
  [BookingStatus.cancelled]: 'bg-red-100 text-red-700',
};

const NEXT_STATUS_LABEL: Partial<Record<string, string>> = {
  [BookingStatus.partner_assigned]: 'Start Journey',
  [BookingStatus.on_the_way]: 'Mark Arrived',
  [BookingStatus.arrived]: 'Complete Pickup',
};

const NEXT_STATUS_MAP: Partial<Record<string, BookingStatus>> = {
  [BookingStatus.partner_assigned]: BookingStatus.on_the_way,
  [BookingStatus.on_the_way]: BookingStatus.arrived,
  [BookingStatus.arrived]: BookingStatus.completed,
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BookingCard({
  booking,
  partnerId,
}: {
  booking: Booking;
  partnerId: number;
}) {
  const acceptBooking = usePartnerAcceptBooking();
  const updateStatus = usePartnerUpdateBookingStatus();

  const isAcceptable = booking.status === BookingStatus.confirmed && !booking.partnerId;
  const hasNextStep = booking.status in NEXT_STATUS_LABEL;
  const isActing = acceptBooking.isPending || updateStatus.isPending;

  const handleAccept = async () => {
    try {
      await acceptBooking.mutateAsync({ bookingId: booking.id, partnerId });
      toast.success('Booking accepted!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to accept booking');
    }
  };

  const handleAdvance = async () => {
    const nextStatus = NEXT_STATUS_MAP[booking.status];
    if (!nextStatus) return;
    try {
      await updateStatus.mutateAsync({ bookingId: booking.id, status: nextStatus, partnerId });
      toast.success('Status updated!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-foreground">Booking #{booking.id}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(booking.scheduledTime)}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[booking.status] || ''}`}>
          {STATUS_LABELS[booking.status] || booking.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{booking.address?.city || `Address #${booking.addressId}`}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Package className="w-3.5 h-3.5 shrink-0" />
        <span>Est. ₹{booking.totalEstimatedAmount.toFixed(0)}</span>
      </div>

      {isAcceptable && (
        <Button
          size="sm"
          className="w-full"
          onClick={handleAccept}
          disabled={isActing}
        >
          {isActing ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Accept Booking
            </>
          )}
        </Button>
      )}

      {hasNextStep && (
        <Button
          size="sm"
          variant="outline"
          className="w-full border-primary text-primary"
          onClick={handleAdvance}
          disabled={isActing}
        >
          {isActing ? (
            <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-1" />
              {NEXT_STATUS_LABEL[booking.status]}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default function PartnerPanel() {
  const navigate = useNavigate();
  const [phoneInput, setPhoneInput] = useState('');
  const [savedPhone, setSavedPhone] = useState(() => {
    try { return localStorage.getItem('partnerPhone') || ''; } catch { return ''; }
  });

  const { data: partner, isLoading: partnerLoading } = useGetPartnerByPhone(savedPhone);
  const { data: bookings = [], isLoading: bookingsLoading } = useGetBookingsByPartnerId(
    partner ? partner.id : null
  );

  const handleSetPhone = () => {
    const trimmed = phoneInput.trim();
    if (!trimmed) return;
    try { localStorage.setItem('partnerPhone', trimmed); } catch {}
    setSavedPhone(trimmed);
    setPhoneInput('');
  };

  const activeBookings = bookings.filter(
    b => b.status !== BookingStatus.completed && b.status !== BookingStatus.cancelled
  );
  const completedBookings = bookings.filter(b => b.status === BookingStatus.completed);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-6 pb-8"
        style={{ background: 'linear-gradient(135deg, oklch(0.35 0.12 150) 0%, oklch(0.25 0.10 200) 100%)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest">Bhangar Wala</p>
            <h1 className="font-heading text-xl font-bold text-white leading-tight">Partner Panel</h1>
          </div>
        </div>
        {partner && (
          <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
            <p className="text-white font-semibold text-sm">{partner.name}</p>
            <p className="text-white/70 text-xs">{partner.vehicle} · ⭐ {partner.rating.toFixed(1)}</p>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 -mt-3">
        {/* Phone Setup */}
        {!savedPhone ? (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <p className="font-semibold text-sm text-foreground">Enter Your Phone Number</p>
            <p className="text-xs text-muted-foreground">Enter the phone number registered as a partner to view your bookings.</p>
            <div className="flex gap-2">
              <Input
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="+91-9876543210"
                inputMode="tel"
                className="flex-1"
              />
              <Button onClick={handleSetPhone} disabled={!phoneInput.trim()}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : partnerLoading ? (
          <Skeleton className="h-20 rounded-2xl" />
        ) : !partner ? (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <p className="font-semibold text-sm text-foreground">Partner Not Found</p>
            <p className="text-xs text-muted-foreground">No partner found for <strong>{savedPhone}</strong>. Please check the number.</p>
            <Button variant="outline" size="sm" onClick={() => { setSavedPhone(''); try { localStorage.removeItem('partnerPhone'); } catch {} }}>
              Change Number
            </Button>
          </div>
        ) : (
          <>
            {/* Active Bookings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Bookings</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                  {activeBookings.length}
                </span>
              </div>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-6 text-center">
                  <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active bookings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map(b => (
                    <BookingCard key={b.id} booking={b} partnerId={partner.id} />
                  ))}
                </div>
              )}
            </div>

            {/* Completed */}
            {completedBookings.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Completed ({completedBookings.length})
                </p>
                <div className="space-y-3">
                  {completedBookings.slice(0, 3).map(b => (
                    <BookingCard key={b.id} booking={b} partnerId={partner.id} />
                  ))}
                </div>
              </div>
            )}

            {/* Change number */}
            <div className="flex items-center gap-2 pt-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground flex-1">{savedPhone}</span>
              <button
                onClick={() => { setSavedPhone(''); try { localStorage.removeItem('partnerPhone'); } catch {} }}
                className="text-xs text-primary underline"
              >
                Change
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
