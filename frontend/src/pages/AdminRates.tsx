import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetScrapRatesWithCategories, useUpdateScrapRate } from '../hooks/useQueries';
import type { ScrapRateWithCategory } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function AdminRates() {
  const navigate = useNavigate();
  const { data: rates = [], isLoading } = useGetScrapRatesWithCategories();
  const updateRate = useUpdateScrapRate();

  const [editedRates, setEditedRates] = useState<Record<number, string>>({});

  useEffect(() => {
    if (rates.length > 0) {
      const initial: Record<number, string> = {};
      rates.forEach((r) => {
        initial[r.categoryId] = r.pricePerKg.toString();
      });
      setEditedRates(initial);
    }
  }, [rates]);

  async function handleSave(rate: ScrapRateWithCategory) {
    const newPrice = parseFloat(editedRates[rate.categoryId] || '0');
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    await updateRate.mutateAsync({ categoryId: rate.categoryId, pricePerKg: newPrice });
    toast.success(`Rate for ${rate.categoryName} updated to ₹${newPrice}/kg`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Scrap Rates</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {/* Info banner */}
        <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-primary">
            Changes to scrap rates apply immediately to all new bookings.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {rates.map((rate) => (
              <div key={rate.categoryId} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{rate.categoryName}</p>
                    <p className="text-xs text-muted-foreground">Category ID: {rate.categoryId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editedRates[rate.categoryId] ?? rate.pricePerKg.toString()}
                      onChange={(e) =>
                        setEditedRates((prev) => ({
                          ...prev,
                          [rate.categoryId]: e.target.value,
                        }))
                      }
                      className="w-24 text-right"
                    />
                    <span className="text-sm text-muted-foreground">/kg</span>
                    <Button
                      size="sm"
                      onClick={() => handleSave(rate)}
                      disabled={updateRate.isPending}
                    >
                      {updateRate.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
