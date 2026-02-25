import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { ArrowLeft, QrCode, Banknote, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGetBookingById,
  useGetBookingItems,
  useGetScrapRatesWithCategories,
  useCreatePayment,
  useUpdateBookingStatus,
  PaymentMethod,
} from '../hooks/useQueries';
import { BookingStatus } from '../backend';

function formatCurrency(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = (location.state as any)?.bookingId
    ? BigInt((location.state as any).bookingId)
    : null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.cash);
  const [finalWeights, setFinalWeights] = useState<Record<string, string>>({});
  const [upiCopied, setUpiCopied] = useState(false);

  const { data: booking, isLoading: bookingLoading } = useGetBookingById(bookingId);
  const { data: bookingItems = [], isLoading: itemsLoading } = useGetBookingItems(bookingId);
  const { data: rates = [] } = useGetScrapRatesWithCategories();
  const createPayment = useCreatePayment();
  const updateStatus = useUpdateBookingStatus();

  const isLoading = bookingLoading || itemsLoading;

  const getRate = (categoryId: bigint) =>
    rates.find(r => r.categoryId.toString() === categoryId.toString());

  const lineItems = bookingItems.map(item => {
    const rate = getRate(item.categoryId);
    const weight = parseFloat(finalWeights[item.id.toString()] ?? '') || item.estimatedWeight;
    const subtotal = rate ? weight * rate.pricePerKg : 0;
    return { item, rate, weight, subtotal };
  });

  const totalAmount = lineItems.reduce((sum, li) => sum + li.subtotal, 0);

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText('bhangarwala@upi');
      setUpiCopied(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setUpiCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handlePay = async () => {
    if (!bookingId || !booking) return;
    try {
      await createPayment.mutateAsync({
        bookingId,
        amount: totalAmount,
        method: paymentMethod,
        transactionId: paymentMethod === PaymentMethod.upi ? `UPI-${Date.now()}` : null,
      });
      await updateStatus.mutateAsync({ id: bookingId, status: BookingStatus.completed });
      navigate({ to: '/payment-success', state: { bookingId: bookingId.toString(), amount: totalAmount } as any });
    } catch (err: any) {
      toast.error(err?.message || 'Payment failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="px-4 pt-4 pb-6" style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}>
          <Skeleton className="h-8 w-8 rounded-full mb-3" />
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="px-4 py-5 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

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
        <h1 className="font-heading text-xl font-bold text-white">Payment</h1>
        <p className="text-white/80 text-sm">Booking #{bookingId?.toString()}</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-32">
        {/* Line Items */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-primary-light">
            <p className="font-heading font-bold text-primary text-sm">Scrap Items</p>
          </div>
          <div className="divide-y divide-border">
            {lineItems.map(({ item, rate, weight, subtotal }) => (
              <div key={item.id.toString()} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-foreground">
                    {rate?.categoryName || `Category #${item.categoryId}`}
                  </p>
                  <p className="font-bold text-sm text-primary">{formatCurrency(subtotal)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Final Weight (kg)</p>
                    <Input
                      type="number"
                      value={finalWeights[item.id.toString()] ?? item.estimatedWeight.toString()}
                      onChange={e => setFinalWeights(fw => ({ ...fw, [item.id.toString()]: e.target.value }))}
                      min="0.1"
                      step="0.1"
                      className="h-9 text-sm"
                      inputMode="decimal"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="text-sm font-medium text-foreground">₹{rate?.pricePerKg ?? 0}/kg</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-primary-light border-t border-primary/20 flex items-center justify-between">
            <p className="font-heading font-bold text-primary">Total</p>
            <p className="font-heading text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <p className="font-heading font-bold text-sm text-foreground">Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod(PaymentMethod.cash)}
              className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                paymentMethod === PaymentMethod.cash
                  ? 'border-primary bg-primary-light'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <Banknote className={`w-5 h-5 ${paymentMethod === PaymentMethod.cash ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${paymentMethod === PaymentMethod.cash ? 'text-primary' : 'text-foreground'}`}>
                Cash
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod(PaymentMethod.upi)}
              className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                paymentMethod === PaymentMethod.upi
                  ? 'border-primary bg-primary-light'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <QrCode className={`w-5 h-5 ${paymentMethod === PaymentMethod.upi ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${paymentMethod === PaymentMethod.upi ? 'text-primary' : 'text-foreground'}`}>
                UPI
              </span>
            </button>
          </div>

          {/* UPI QR Section */}
          {paymentMethod === PaymentMethod.upi && (
            <div className="mt-3 space-y-3">
              <div className="flex justify-center">
                <img
                  src="/assets/generated/upi-qr-placeholder.dim_256x256.png"
                  alt="UPI QR Code"
                  className="w-48 h-48 rounded-xl border border-border"
                />
              </div>
              <div className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs text-muted-foreground">UPI ID</p>
                  <p className="text-sm font-semibold text-foreground">bhangarwala@upi</p>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg"
                >
                  {upiCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {upiCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center justify-between bg-primary-light rounded-xl px-3 py-2">
                <p className="text-xs text-muted-foreground">Amount to Pay</p>
                <p className="font-heading font-bold text-primary">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-background border-t border-border">
        <Button
          onClick={handlePay}
          disabled={createPayment.isPending || updateStatus.isPending}
          className="w-full min-h-[52px] text-base font-semibold rounded-xl"
          style={{ background: 'oklch(0.527 0.154 150)' }}
        >
          {createPayment.isPending || updateStatus.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay ${formatCurrency(totalAmount)}`
          )}
        </Button>
      </div>
    </div>
  );
}
