import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save, IndianRupee, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useGetScrapRatesWithCategories, useUpdateScrapRate } from '../hooks/useQueries';
import type { ScrapRateWithCategory } from '../hooks/useQueries';

function RateRow({ rate }: { rate: ScrapRateWithCategory }) {
  const [price, setPrice] = useState(rate.pricePerKg.toString());
  const updateRate = useUpdateScrapRate();

  const handleSave = async () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    try {
      await updateRate.mutateAsync({ categoryId: rate.categoryId, pricePerKg: newPrice });
      toast.success(`Rate for ${rate.categoryName} updated to ₹${newPrice}/kg`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update rate');
    }
  };

  const isDirty = parseFloat(price) !== rate.pricePerKg;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="font-medium text-sm text-foreground">{rate.categoryName}</p>
        <p className="text-xs text-muted-foreground">Category ID: {rate.categoryId.toString()}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-28">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
          <Input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            min="0.1"
            step="0.5"
            className="pl-7 min-h-[40px] text-sm"
            inputMode="decimal"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">/kg</span>
        <Button
          onClick={handleSave}
          disabled={updateRate.isPending || !isDirty}
          size="sm"
          className="min-h-[40px] rounded-lg px-3"
          style={{ background: isDirty ? 'oklch(0.527 0.154 150)' : undefined }}
          variant={isDirty ? 'default' : 'outline'}
        >
          {updateRate.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AdminRates() {
  const navigate = useNavigate();
  const { data: rates = [], isLoading } = useGetScrapRatesWithCategories();

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
        <h1 className="font-heading text-xl font-bold text-white">Scrap Rate Management</h1>
        <p className="text-white/80 text-sm">Admin Panel</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-3 bg-primary-light rounded-2xl border border-primary/20 p-4">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">Changes apply immediately</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Updated rates will apply to all new bookings. Existing bookings are not affected.
            </p>
          </div>
        </div>

        {/* Rates Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-primary-light flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            <p className="font-heading font-bold text-primary text-sm">Current Rates</p>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : rates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No scrap rates found.</p>
            </div>
          ) : (
            <div className="px-4">
              {rates.map(rate => (
                <RateRow key={rate.id.toString()} rate={rate} />
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center px-4">
          Only admin users can update scrap rates. Changes are saved to the blockchain immediately.
        </p>
      </div>
    </div>
  );
}
