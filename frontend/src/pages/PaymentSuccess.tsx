import { useEffect, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Star, Download, Package, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetBookingItems, useGetScrapCategories, useGetScrapRates, useGetPaymentByBookingId, PaymentMethod } from '../hooks/useQueries';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const state = routerState.location.state as any;
  const bookingIdStr = state?.bookingId || '';
  const bookingId = bookingIdStr ? BigInt(bookingIdStr) : null;

  const [animDone, setAnimDone] = useState(false);

  const { data: items = [] } = useGetBookingItems(bookingId);
  const { data: categories = [] } = useGetScrapCategories();
  const { data: rates = [] } = useGetScrapRates();
  const { data: payment } = useGetPaymentByBookingId(bookingId);

  useEffect(() => {
    const t = setTimeout(() => setAnimDone(true), 800);
    return () => clearTimeout(t);
  }, []);

  const getCategoryName = (categoryId: bigint) =>
    categories.find(c => c.id.toString() === categoryId.toString())?.name || 'Unknown';

  const getRate = (categoryId: bigint) =>
    rates.find(r => r.categoryId.toString() === categoryId.toString())?.pricePerKg || 0;

  const totalAmount = payment?.amount ?? (state?.amount || 0);
  const method = payment?.method ?? state?.method;

  const receiptDate = new Date();
  const receiptDateStr = receiptDate.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const receiptTimeStr = receiptDate.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Success Animation Header */}
      <div
        className="px-4 pt-8 pb-8 flex flex-col items-center no-print"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        {/* Animated checkmark */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center animate-circle-scale">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <svg viewBox="0 0 52 52" className="w-12 h-12">
                <circle cx="26" cy="26" r="25" fill="none" stroke="oklch(0.527 0.154 150)" strokeWidth="2" />
                <path
                  fill="none"
                  stroke="oklch(0.527 0.154 150)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l8 8 16-16"
                  className="animate-checkmark-draw"
                />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="font-heading text-2xl font-bold text-white">Payment Successful!</h1>
        <p className="text-white/80 text-sm mt-1">Your scrap has been collected</p>
        <p className="font-heading text-3xl font-bold text-white mt-3">₹{Number(totalAmount).toFixed(2)}</p>
        <p className="text-white/70 text-xs mt-1">
          via {method === PaymentMethod.upi ? 'UPI' : 'Cash'}
        </p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Receipt Card */}
        <div className="receipt-card bg-card rounded-2xl border border-border overflow-hidden">
          {/* Receipt Header */}
          <div className="p-5 border-b border-border bg-primary-light">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/assets/generated/logo.dim_256x256.png"
                alt="Bhangar Wala"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <p className="font-heading font-bold text-primary text-base">Bhangar Wala</p>
                <p className="text-xs text-muted-foreground">Scrap Collection Service</p>
              </div>
            </div>
            <div className="h-px bg-primary/20 mb-3" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Receipt No.</p>
                <p className="font-mono font-bold text-foreground text-sm">#{bookingIdStr || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{receiptDateStr}</p>
                <p className="text-xs text-muted-foreground">{receiptTimeStr}</p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-4">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border mb-2">
              <p className="text-xs font-semibold text-muted-foreground col-span-2">Item</p>
              <p className="text-xs font-semibold text-muted-foreground text-right">Wt (kg)</p>
              <p className="text-xs font-semibold text-muted-foreground text-right">Amount</p>
            </div>

            {/* Item Rows */}
            <div className="space-y-2 mb-3">
              {items.map(item => {
                const weight = item.finalWeight ?? item.estimatedWeight;
                const rate = getRate(item.categoryId);
                const lineTotal = weight * rate;
                return (
                  <div key={item.id.toString()} className="grid grid-cols-4 gap-2 items-center">
                    <div className="col-span-2 flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm text-foreground leading-tight">{getCategoryName(item.categoryId)}</p>
                        <p className="text-xs text-muted-foreground">₹{rate}/kg</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground text-right">{weight.toFixed(2)}</p>
                    <p className="text-sm font-medium text-foreground text-right">₹{lineTotal.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-border mb-3" />

            {/* Grand Total */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary" />
                <p className="font-bold text-foreground">Total Paid</p>
              </div>
              <p className="font-heading text-xl font-bold text-primary">₹{Number(totalAmount).toFixed(2)}</p>
            </div>

            {/* Payment Details */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium text-foreground">{method === PaymentMethod.upi ? 'UPI' : 'Cash'}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Status</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  ✓ Paid
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">Thank you for using Bhangar Wala</p>
            <p className="text-xs text-muted-foreground mt-0.5">♻️ Together we make a greener tomorrow</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 no-print">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full min-h-[48px] rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>

          <Button
            onClick={() => navigate({ to: '/rate-service', state: { bookingId: bookingIdStr } as any })}
            variant="outline"
            className="w-full min-h-[48px] rounded-xl border-accent text-accent"
          >
            <Star className="w-4 h-4 mr-2" />
            Rate Your Experience
          </Button>

          <Button
            onClick={() => navigate({ to: '/home' })}
            className="w-full min-h-[52px] text-base font-semibold rounded-xl"
            style={{ background: 'oklch(0.527 0.154 150)' }}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center pb-4 no-print">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>{' '}
          · © {new Date().getFullYear()} Bhangar Wala
        </p>
      </div>
    </div>
  );
}
