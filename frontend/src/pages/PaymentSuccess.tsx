import React from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircle, Home, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useGetBookingItems,
  useGetPaymentByBookingId,
  useGetScrapRatesWithCategories,
  useGetScrapCategories,
  PaymentMethod,
} from '../hooks/useQueries';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { bookingId?: number; amount?: number };
  const bookingId = search.bookingId ? Number(search.bookingId) : 0;
  const amount = search.amount ? Number(search.amount) : 0;

  const { data: items = [] } = useGetBookingItems(bookingId);
  const { data: payment } = useGetPaymentByBookingId(bookingId);
  const { data: rates = [] } = useGetScrapRatesWithCategories();
  const { data: categories = [] } = useGetScrapCategories();

  const getRate = (categoryId: number) =>
    rates.find(r => r.categoryId === categoryId);

  const getCategoryName = (categoryId: number) =>
    categories.find(c => c.id === categoryId)?.name || `Category #${categoryId}`;

  const displayAmount = payment?.amount ?? amount;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Success Header */}
      <div
        className="px-4 pt-8 pb-10 text-center"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white">Payment Successful!</h1>
        <p className="text-white/80 text-sm mt-2">Your scrap has been picked up and payment received.</p>
        <div className="mt-4 bg-white/20 rounded-2xl px-6 py-3 inline-block">
          <p className="text-white/70 text-xs">Amount Paid</p>
          <p className="font-heading text-3xl font-bold text-white">₹{displayAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-32">
        {/* Receipt */}
        {items.length > 0 && (
          <div className="receipt-card bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-primary-light">
              <p className="font-heading font-bold text-primary text-sm">Receipt</p>
              <p className="text-xs text-muted-foreground">Booking #{bookingId}</p>
            </div>
            <div className="divide-y divide-border">
              {items.map(item => {
                const rate = getRate(item.categoryId);
                const weight = item.finalWeight ?? item.estimatedWeight;
                const subtotal = rate ? weight * rate.pricePerKg : 0;
                return (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground leading-tight">{getCategoryName(item.categoryId)}</p>
                      <p className="text-xs text-muted-foreground">{weight} kg × ₹{rate?.pricePerKg ?? 0}/kg</p>
                    </div>
                    <p className="font-semibold text-sm text-foreground">₹{subtotal.toFixed(0)}</p>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-primary-light border-t border-primary/20 flex items-center justify-between">
              <p className="font-heading font-bold text-primary">Total</p>
              <p className="font-heading text-xl font-bold text-primary">₹{displayAmount.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Payment Details */}
        {payment && (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
            <p className="font-heading font-bold text-sm text-foreground">Payment Details</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium text-foreground capitalize">
                {payment.method === PaymentMethod.cash ? 'Cash' : 'UPI'}
              </span>
            </div>
            {payment.transactionId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-medium text-foreground text-xs">{payment.transactionId}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600 capitalize">{payment.status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 space-y-3">
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => navigate({ to: '/rate-service', search: { bookingId } })}
        >
          <Star className="w-4 h-4 mr-2" />
          Rate Service
        </Button>
        <Button
          className="w-full rounded-xl"
          onClick={() => navigate({ to: '/home' })}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
