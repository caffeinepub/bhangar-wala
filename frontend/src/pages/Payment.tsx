import { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, IndianRupee, Smartphone, Banknote, Check, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGetBookingItems,
  useGetScrapCategories,
  useGetScrapRates,
  useCreatePayment,
  useUpdateBookingStatus,
  useUpdateBookingItemFinalWeight,
} from '../hooks/useQueries';
import { BookingStatus, PaymentMethod } from '../backend';

const UPI_ID = 'bhangarwala@upi';

export default function Payment() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const bookingIdStr = (routerState.location.state as any)?.bookingId || '';
  const bookingId = bookingIdStr ? BigInt(bookingIdStr) : null;

  const { data: items = [], isLoading: itemsLoading } = useGetBookingItems(bookingId);
  const { data: categories = [] } = useGetScrapCategories();
  const { data: rates = [] } = useGetScrapRates();
  const createPayment = useCreatePayment();
  const updateStatus = useUpdateBookingStatus();
  const updateFinalWeight = useUpdateBookingItemFinalWeight();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.cash);
  const [finalWeights, setFinalWeights] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const getCategoryName = (categoryId: bigint) =>
    categories.find(c => c.id.toString() === categoryId.toString())?.name || 'Unknown';

  const getRate = (categoryId: bigint) =>
    rates.find(r => r.categoryId.toString() === categoryId.toString())?.pricePerKg || 0;

  const getFinalWeight = (item: { id: bigint; estimatedWeight: number }) => {
    const override = finalWeights[item.id.toString()];
    return override !== undefined ? parseFloat(override) || 0 : item.estimatedWeight;
  };

  const totalAmount = items.reduce((sum, item) => {
    const w = getFinalWeight(item);
    const r = getRate(item.categoryId);
    return sum + w * r;
  }, 0);

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy UPI ID');
    }
  };

  const handleConfirmPayment = async () => {
    if (!bookingId) return;
    try {
      // Update final weights for each item
      for (const item of items) {
        const override = finalWeights[item.id.toString()];
        if (override !== undefined) {
          await updateFinalWeight.mutateAsync({ id: item.id, finalWeight: parseFloat(override) || item.estimatedWeight });
        }
      }
      // Create payment record
      await createPayment.mutateAsync({
        bookingId,
        amount: totalAmount,
        method: paymentMethod,
        transactionId: null,
      });
      // Update booking status to completed
      await updateStatus.mutateAsync({ id: bookingId, status: BookingStatus.completed });

      navigate({ to: '/payment-success', state: { bookingId: bookingIdStr, amount: totalAmount, method: paymentMethod } as any });
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  const isProcessing = createPayment.isPending || updateStatus.isPending || updateFinalWeight.isPending;

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
        <p className="text-white/80 text-sm">Booking #{bookingIdStr}</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Items & Final Weight */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-primary-light">
            <p className="font-heading font-bold text-primary text-sm">Scrap Items</p>
          </div>
          {itemsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map(item => {
                const w = getFinalWeight(item);
                const r = getRate(item.categoryId);
                const lineTotal = w * r;
                return (
                  <div key={item.id.toString()} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">{getCategoryName(item.categoryId)}</p>
                      <p className="text-sm font-bold text-primary">₹{lineTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Final Weight (kg)</Label>
                        <Input
                          type="number"
                          value={finalWeights[item.id.toString()] ?? item.estimatedWeight.toString()}
                          onChange={e => setFinalWeights(prev => ({ ...prev, [item.id.toString()]: e.target.value }))}
                          min="0.1"
                          step="0.1"
                          className="min-h-[40px] text-sm mt-1"
                          inputMode="decimal"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Rate</p>
                        <p className="text-sm font-medium text-foreground">₹{r}/kg</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-primary-light rounded-2xl border border-primary/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            <p className="font-heading font-bold text-foreground">Total Amount</p>
          </div>
          <p className="font-heading text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</p>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <p className="font-heading font-bold text-foreground text-sm">Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod(PaymentMethod.cash)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === PaymentMethod.cash ? 'border-primary bg-primary-light' : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <Banknote className={`w-6 h-6 ${paymentMethod === PaymentMethod.cash ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-sm font-semibold ${paymentMethod === PaymentMethod.cash ? 'text-primary' : 'text-foreground'}`}>Cash</p>
              <p className="text-xs text-muted-foreground">Pay at pickup</p>
            </button>
            <button
              onClick={() => setPaymentMethod(PaymentMethod.upi)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === PaymentMethod.upi ? 'border-primary bg-primary-light' : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <Smartphone className={`w-6 h-6 ${paymentMethod === PaymentMethod.upi ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-sm font-semibold ${paymentMethod === PaymentMethod.upi ? 'text-primary' : 'text-foreground'}`}>UPI</p>
              <p className="text-xs text-muted-foreground">Instant transfer</p>
            </button>
          </div>
        </div>

        {/* UPI QR Code Section */}
        {paymentMethod === PaymentMethod.upi && (
          <div className="bg-card rounded-2xl border border-border p-5 flex flex-col items-center gap-4">
            <p className="font-heading font-bold text-foreground text-sm self-start">Scan & Pay</p>
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-border">
              <img
                src="/assets/generated/upi-qr-placeholder.dim_256x256.png"
                alt="UPI QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">UPI ID</p>
              <p className="font-mono text-base font-bold text-foreground">{UPI_ID}</p>
              <p className="text-sm text-muted-foreground">
                Amount: <span className="font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleCopyUpiId}
              className="w-full rounded-xl border-primary text-primary min-h-[44px]"
            >
              {copied ? (
                <span className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4" />
                  Copied!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy UPI ID
                </span>
              )}
            </Button>
          </div>
        )}

        {createPayment.isError && (
          <p className="text-destructive text-sm text-center">Payment failed. Please try again.</p>
        )}
      </div>

      {/* Confirm Button */}
      <div className="px-4 pb-6 pt-2 border-t border-border bg-card">
        <Button
          onClick={handleConfirmPayment}
          disabled={isProcessing || items.length === 0}
          className="w-full min-h-[52px] text-base font-semibold rounded-xl"
          style={{ background: 'oklch(0.527 0.154 150)' }}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Confirm Payment · ₹{totalAmount.toFixed(2)}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
