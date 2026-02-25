import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Calendar, Package, CheckCircle, Plus, Minus, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetCallerUserProfile, useGetScrapCategories, useGetScrapRates, useCreateBooking } from '../hooks/useQueries';
import type { Address } from '../backend';

interface ScrapItem {
  categoryId: number;
  categoryName: string;
  estimatedWeight: number;
  pricePerKg: number;
}

const STEPS = ['Address', 'Schedule', 'Items', 'Confirm'];

function getNext7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

const TIME_SLOTS = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

export default function BookPickup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [scrapItems, setScrapItems] = useState<ScrapItem[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: categories = [] } = useGetScrapCategories();
  const { data: rates = [] } = useGetScrapRates();
  const createBookingMutation = useCreateBooking();

  const addresses: Address[] = profile?.addresses || [];

  // Leaf categories (those with a parentId) are the ones with rates
  const leafCategories = categories.filter((c) => c.parentId != null);

  function getPriceForCategory(categoryId: number): number {
    const rate = rates.find((r) => r.categoryId === categoryId);
    return rate?.pricePerKg || 0;
  }

  function addItem(categoryId: number, categoryName: string) {
    const existing = scrapItems.find((i) => i.categoryId === categoryId);
    if (existing) return;
    const pricePerKg = getPriceForCategory(categoryId);
    setScrapItems((prev) => [
      ...prev,
      { categoryId, categoryName, estimatedWeight: 1, pricePerKg },
    ]);
  }

  function removeItem(categoryId: number) {
    setScrapItems((prev) => prev.filter((i) => i.categoryId !== categoryId));
  }

  function updateWeight(categoryId: number, delta: number) {
    setScrapItems((prev) =>
      prev.map((i) =>
        i.categoryId === categoryId
          ? { ...i, estimatedWeight: Math.max(0.5, +(i.estimatedWeight + delta).toFixed(1)) }
          : i
      )
    );
  }

  const totalEstimatedAmount = scrapItems.reduce(
    (sum, item) => sum + item.estimatedWeight * item.pricePerKg,
    0
  );

  function getScheduledDate(): Date | null {
    if (!selectedDay || !selectedTimeSlot) return null;
    const [timePart, meridiem] = selectedTimeSlot.split(' ');
    const [hourStr, minuteStr] = timePart.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    const date = new Date(selectedDay);
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  async function handleConfirmBooking() {
    setBookingError(null);

    if (!selectedAddress) {
      setBookingError('Please select a pickup address.');
      return;
    }
    if (!selectedDay || !selectedTimeSlot) {
      setBookingError('Please select a pickup date and time.');
      return;
    }
    if (scrapItems.length === 0) {
      setBookingError('Please add at least one scrap item.');
      return;
    }

    const scheduledDate = getScheduledDate();
    if (!scheduledDate) {
      setBookingError('Invalid schedule. Please select date and time again.');
      return;
    }

    try {
      const booking = await createBookingMutation.mutateAsync({
        address: selectedAddress,
        scheduledTime: scheduledDate,
        items: scrapItems.map((item) => ({
          categoryId: item.categoryId,
          estimatedWeight: item.estimatedWeight,
        })),
        totalEstimatedAmount,
      });

      navigate({ to: '/booking-confirmation', search: { bookingId: booking.id } });
    } catch (err: any) {
      setBookingError(err?.message || 'Failed to create booking. Please try again.');
    }
  }

  function canProceed(): boolean {
    if (step === 0) return !!selectedAddress;
    if (step === 1) return !!selectedDay && !!selectedTimeSlot;
    if (step === 2) return scrapItems.length > 0;
    return true;
  }

  const days = getNext7Days();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => (step > 0 ? setStep(step - 1) : navigate({ to: '/home' }))}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Book Pickup</h1>
        </div>
        {/* Step indicator */}
        <div className="flex items-center mt-4 gap-1">
          {STEPS.map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    idx < step
                      ? 'bg-white text-primary border-white'
                      : idx === step
                      ? 'bg-primary-foreground text-primary border-primary-foreground'
                      : 'bg-transparent text-primary-foreground border-primary-foreground/40'
                  }`}
                >
                  {idx < step ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-[10px] mt-0.5 text-primary-foreground/80">{label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mb-4 ${idx < step ? 'bg-white' : 'bg-primary-foreground/30'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {/* Step 0: Address */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Select Pickup Address</h2>
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No saved addresses found.</p>
                <Button onClick={() => navigate({ to: '/add-address' })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <button
                    key={Number(addr.id)}
                    onClick={() => setSelectedAddress(addr)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                      selectedAddress && Number(selectedAddress.id) === Number(addr.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">
                          {addr.addressLabel || 'Home'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.street}, {addr.city} - {addr.pincode}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => navigate({ to: '/add-address' })}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-primary/40 text-primary flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add New Address</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Schedule */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Select Pickup Schedule</h2>
            <p className="text-sm text-muted-foreground mb-3">Choose a date</p>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {days.map((day: Date) => {
                const isSelected =
                  selectedDay?.toDateString() === day.toDateString();
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 min-w-[60px] transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground'
                    }`}
                  >
                    <span className="text-xs font-medium">
                      {day.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-bold">{day.getDate()}</span>
                    <span className="text-xs">
                      {day.toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground mb-3">Choose a time slot</p>
            <div className="grid grid-cols-2 gap-3">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    selectedTimeSlot === slot
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Items */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Select Scrap Items</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tap an item to add it, then adjust the estimated weight.
            </p>
            <div className="space-y-2 mb-6">
              {leafCategories.map((cat) => {
                const added = scrapItems.find((i) => i.categoryId === cat.id);
                const price = getPriceForCategory(cat.id);
                return (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      added ? 'border-primary bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">₹{price}/kg</p>
                      </div>
                      {added ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateWeight(cat.id, -0.5)}
                            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold text-foreground">
                            {added.estimatedWeight} kg
                          </span>
                          <button
                            onClick={() => updateWeight(cat.id, 0.5)}
                            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(cat.id)}
                            className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(cat.id, cat.name)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {scrapItems.length > 0 && (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-sm font-semibold text-foreground mb-2">Summary</p>
                {scrapItems.map((item) => (
                  <div key={item.categoryId} className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.categoryName} × {item.estimatedWeight} kg</span>
                    <span>₹{(item.estimatedWeight * item.pricePerKg).toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-primary/20 mt-2 pt-2 flex justify-between font-semibold text-foreground">
                  <span>Estimated Total</span>
                  <span>₹{totalEstimatedAmount.toFixed(0)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Confirm Booking</h2>

            {/* Address */}
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Pickup Address</span>
              </div>
              {selectedAddress && (
                <p className="text-sm text-muted-foreground">
                  {selectedAddress.street}, {selectedAddress.city} - {selectedAddress.pincode}
                </p>
              )}
            </div>

            {/* Schedule */}
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Schedule</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedDay?.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}{' '}
                at {selectedTimeSlot}
              </p>
            </div>

            {/* Items */}
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Scrap Items</span>
              </div>
              {scrapItems.map((item) => (
                <div key={item.categoryId} className="flex justify-between text-sm text-muted-foreground py-1">
                  <span>{item.categoryName} × {item.estimatedWeight} kg</span>
                  <span>₹{(item.estimatedWeight * item.pricePerKg).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold text-foreground text-sm">
                <span>Estimated Total</span>
                <span>₹{totalEstimatedAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Error */}
            {bookingError && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{bookingError}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Final amount will be calculated after weighing at pickup.
            </p>
          </div>
        )}
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
        {step < 3 ? (
          <Button
            className="w-full"
            disabled={!canProceed()}
            onClick={() => setStep(step + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={createBookingMutation.isPending}
            onClick={handleConfirmBooking}
          >
            {createBookingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
