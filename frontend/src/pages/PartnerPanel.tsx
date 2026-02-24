import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Phone, MapPin, Clock, Package, ChevronRight, Truck, CheckCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGetPartnerByPhone,
  useGetBookingsByPartnerId,
  useGetAddressById,
  useGetBookingItems,
  useGetScrapCategories,
  usePartnerAcceptBooking,
  usePartnerUpdateBookingStatus,
} from '../hooks/useQueries';
import { BookingStatus, type Booking } from '../backend';

const PARTNER_PHONE_KEY = 'partner_phone';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  [BookingStatus.pending]: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> },
  [BookingStatus.confirmed]: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3" /> },
  [BookingStatus.partner_assigned]: { label: 'Assigned', color: 'bg-purple-100 text-purple-800', icon: <UserCheck className="w-3 h-3" /> },
  [BookingStatus.on_the_way]: { label: 'On the Way', color: 'bg-orange-100 text-orange-800', icon: <Truck className="w-3 h-3" /> },
  [BookingStatus.arrived]: { label: 'Arrived', color: 'bg-teal-100 text-teal-800', icon: <MapPin className="w-3 h-3" /> },
  [BookingStatus.completed]: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
  [BookingStatus.cancelled]: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <ChevronRight className="w-3 h-3" /> },
};

function getNextStatusLabel(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.partner_assigned: return 'Mark On the Way';
    case BookingStatus.on_the_way: return 'Mark Arrived';
    case BookingStatus.arrived: return 'Mark Completed';
    default: return 'Update Status';
  }
}

function BookingCard({ booking, partnerId }: { booking: Booking; partnerId: bigint }) {
  const { data: address } = useGetAddressById(booking.addressId);
  const { data: items = [] } = useGetBookingItems(booking.id);
  const { data: categories = [] } = useGetScrapCategories();
  const acceptBooking = usePartnerAcceptBooking();
  const updateStatus = usePartnerUpdateBookingStatus();

  const getCategoryName = (categoryId: bigint) =>
    categories.find(c => c.id.toString() === categoryId.toString())?.name || 'Unknown';

  const scheduledDate = new Date(Number(booking.scheduledTime) / 1_000_000);
  const statusKey = booking.status as unknown as string;
  const statusCfg = STATUS_CONFIG[statusKey] || { label: statusKey, color: 'bg-gray-100 text-gray-800', icon: null };

  const canAccept = booking.status === BookingStatus.confirmed;
  const canAdvance = [BookingStatus.partner_assigned, BookingStatus.on_the_way, BookingStatus.arrived].includes(booking.status as BookingStatus);

  const handleAccept = async () => {
    try {
      await acceptBooking.mutateAsync({ bookingId: booking.id, partnerId });
      toast.success('Booking accepted!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to accept booking');
    }
  };

  const handleAdvance = async () => {
    try {
      await updateStatus.mutateAsync({ bookingId: booking.id, partnerId });
      toast.success('Status updated!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-border bg-primary-light flex items-center justify-between">
        <div>
          <p className="font-heading font-bold text-primary text-sm">Booking #{booking.id.toString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {scheduledDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            {' · '}
            {scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Address */}
        {address ? (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{address.street}</p>
              <p className="text-xs text-muted-foreground">{address.city}, {address.pincode}</p>
            </div>
          </div>
        ) : (
          <Skeleton className="h-10 rounded-lg" />
        )}

        {/* Scrap Items */}
        {items.length > 0 && (
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {items.map(item => (
                <span key={item.id.toString()} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {getCategoryName(item.categoryId)} · {item.estimatedWeight}kg
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Estimated Amount */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Est. Amount</p>
          <p className="font-bold text-primary">₹{booking.totalEstimatedAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      {(canAccept || canAdvance) && (
        <div className="px-4 pb-4">
          {canAccept && (
            <Button
              onClick={handleAccept}
              disabled={acceptBooking.isPending}
              className="w-full min-h-[44px] rounded-xl"
              style={{ background: 'oklch(0.527 0.154 150)' }}
            >
              {acceptBooking.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Accepting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Accept Booking
                </span>
              )}
            </Button>
          )}
          {canAdvance && (
            <Button
              onClick={handleAdvance}
              disabled={updateStatus.isPending}
              className="w-full min-h-[44px] rounded-xl"
              variant="outline"
            >
              {updateStatus.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  {getNextStatusLabel(booking.status as BookingStatus)}
                </span>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function PartnerPanel() {
  const navigate = useNavigate();
  const [partnerPhone, setPartnerPhone] = useState(() => localStorage.getItem(PARTNER_PHONE_KEY) || '');
  const [phoneInput, setPhoneInput] = useState(() => localStorage.getItem(PARTNER_PHONE_KEY) || '');

  const { data: partner, isLoading: partnerLoading, error: partnerError } = useGetPartnerByPhone(partnerPhone);
  const partnerId = partner ? partner.id : null;
  const { data: bookings = [], isLoading: bookingsLoading } = useGetBookingsByPartnerId(partnerId);

  const handleSetPhone = () => {
    const trimmed = phoneInput.trim();
    localStorage.setItem(PARTNER_PHONE_KEY, trimmed);
    setPartnerPhone(trimmed);
    toast.success('Partner phone updated');
  };

  const activeBookings = bookings.filter(b =>
    b.status !== BookingStatus.completed && b.status !== BookingStatus.cancelled
  );
  const completedBookings = bookings.filter(b =>
    b.status === BookingStatus.completed || b.status === BookingStatus.cancelled
  );

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
        <h1 className="font-heading text-xl font-bold text-white">Partner Panel</h1>
        <p className="text-white/80 text-sm">Manage your assigned pickups</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Partner Phone Setup */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <p className="font-heading font-bold text-foreground text-sm">Partner Identity</p>
          <p className="text-xs text-muted-foreground">
            Enter your registered partner phone number to view your assigned bookings.
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Phone Number</Label>
              <Input
                type="tel"
                placeholder="+91-9876543210"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSetPhone}
                className="min-h-[44px] rounded-xl px-4"
                style={{ background: 'oklch(0.527 0.154 150)' }}
              >
                Set
              </Button>
            </div>
          </div>

          {/* Demo hint */}
          <div className="bg-primary-light rounded-xl px-3 py-2 border border-primary/20">
            <p className="text-xs text-primary font-medium">
              Demo partners: +91-9876543210, +91-9876543211, +91-9876543213, +91-9876543214
            </p>
          </div>
        </div>

        {/* Partner Info */}
        {partnerPhone && (
          <>
            {partnerLoading ? (
              <Skeleton className="h-16 rounded-2xl" />
            ) : partner ? (
              <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-bold text-foreground">{partner.name}</p>
                  <p className="text-xs text-muted-foreground">{partner.vehicle} · ⭐ {partner.rating}</p>
                </div>
                <Badge variant={partner.active ? 'default' : 'secondary'} className="text-xs">
                  {partner.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ) : (
              <div className="bg-destructive/10 rounded-2xl border border-destructive/20 p-4 text-center">
                <p className="text-sm text-destructive font-medium">No partner found with this phone number.</p>
                <p className="text-xs text-muted-foreground mt-1">Please check the number and try again.</p>
              </div>
            )}
          </>
        )}

        {/* Bookings */}
        {partner && partnerId && (
          <>
            {/* Active Bookings */}
            <div>
              <p className="font-heading font-bold text-foreground mb-3">
                Active Bookings
                {activeBookings.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({activeBookings.length})</span>
                )}
              </p>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No active bookings assigned to you.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map(booking => (
                    <BookingCard key={booking.id.toString()} booking={booking} partnerId={partnerId} />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Bookings */}
            {completedBookings.length > 0 && (
              <div>
                <p className="font-heading font-bold text-foreground mb-3">
                  Completed
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({completedBookings.length})</span>
                </p>
                <div className="space-y-3">
                  {completedBookings.map(booking => (
                    <BookingCard key={booking.id.toString()} booking={booking} partnerId={partnerId} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
