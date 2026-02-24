import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, MapPin, Package, Calendar, IndianRupee, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAddresses, useGetScrapCategories, useGetScrapRates, useCreateBooking, useAddBookingItem } from '../hooks/useQueries';
import type { Address, ScrapCategory } from '../backend';

const TIME_SLOTS = [
  { id: '9-11', label: '9:00 AM – 11:00 AM' },
  { id: '11-1', label: '11:00 AM – 1:00 PM' },
  { id: '2-4', label: '2:00 PM – 4:00 PM' },
  { id: '4-6', label: '4:00 PM – 6:00 PM' },
];

function getNext7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

const STEPS = ['Address', 'Scrap', 'Schedule', 'Confirm'];

export default function BookPickup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScrapCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<ScrapCategory | null>(null);
  const [weight, setWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');

  const { data: addresses = [], isLoading: addressesLoading } = useGetAddresses();
  const { data: categories = [], isLoading: categoriesLoading } = useGetScrapCategories();
  const { data: rates = [] } = useGetScrapRates();
  const createBooking = useCreateBooking();
  const addBookingItem = useAddBookingItem();

  const parentCategories = categories.filter(c => !c.parentId);
  const subCategories = selectedCategory
    ? categories.filter(c => c.parentId && c.parentId.toString() === selectedCategory.id.toString())
    : [];

  const activeCategory = selectedSubCategory || selectedCategory;
  const rate = activeCategory
    ? rates.find(r => r.categoryId.toString() === activeCategory.id.toString())
    : null;
  const estimatedPrice = rate && weight ? parseFloat(weight) * rate.pricePerKg : 0;

  const days = getNext7Days();

  const canProceed = [
    !!selectedAddress,
    !!(activeCategory && weight && parseFloat(weight) > 0),
    !!(selectedDate && selectedSlot),
    true,
  ][step];

  const handleConfirm = async () => {
    if (!selectedAddress || !activeCategory || !selectedDate || !selectedSlot) return;

    const slotHour = selectedSlot === '9-11' ? 9 : selectedSlot === '11-1' ? 11 : selectedSlot === '2-4' ? 14 : 16;
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(slotHour, 0, 0, 0);
    const scheduledTime = BigInt(scheduledDate.getTime()) * BigInt(1_000_000);

    try {
      const booking = await createBooking.mutateAsync({
        addressId: selectedAddress.id,
        scheduledTime,
        totalEstimatedAmount: estimatedPrice,
      });

      await addBookingItem.mutateAsync({
        bookingId: booking.id,
        categoryId: activeCategory.id,
        estimatedWeight: parseFloat(weight),
      });

      navigate({
        to: '/booking-confirmation',
        state: { bookingId: booking.id.toString() } as any,
      });
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6 relative"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate({ to: '/home' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-white">Book Pickup</h1>

        {/* Progress */}
        <div className="flex items-center gap-1 mt-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                i < step ? 'bg-white text-primary' : i === step ? 'bg-white text-primary ring-2 ring-white/50' : 'bg-white/30 text-white'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-white' : 'text-white/60'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-white' : 'bg-white/30'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 py-6 space-y-4">
        {/* Step 0: Address */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-foreground text-lg">Select Pickup Address</h2>
            {addressesLoading ? (
              <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">No saved addresses. Add one to continue.</p>
                <Button variant="outline" onClick={() => navigate({ to: '/add-address' })} className="rounded-xl border-primary text-primary">
                  <Plus className="w-4 h-4 mr-2" /> Add Address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <button
                    key={addr.id.toString()}
                    onClick={() => setSelectedAddress(addr)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAddress?.id.toString() === addr.id.toString()
                        ? 'border-primary bg-primary-light'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedAddress?.id.toString() === addr.id.toString() ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{addr.addressLabel}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{addr.street}, {addr.city} - {addr.pincode}</p>
                      </div>
                      {selectedAddress?.id.toString() === addr.id.toString() && (
                        <Check className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => navigate({ to: '/add-address' })}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-border text-center text-muted-foreground hover:border-primary hover:text-primary transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add New Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Scrap */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-foreground text-lg">Select Scrap Type</h2>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory?.id.toString() || ''}
                onValueChange={val => {
                  const cat = parentCategories.find(c => c.id.toString() === val);
                  setSelectedCategory(cat || null);
                  setSelectedSubCategory(null);
                }}
              >
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map(cat => (
                    <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Sub-category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {subCategories.map(sub => {
                    const subRate = rates.find(r => r.categoryId.toString() === sub.id.toString());
                    return (
                      <button
                        key={sub.id.toString()}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedSubCategory?.id.toString() === sub.id.toString()
                            ? 'border-primary bg-primary-light'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium text-sm text-foreground">{sub.name}</p>
                        {subRate && <p className="text-xs text-primary font-bold mt-0.5">₹{subRate.pricePerKg}/kg</p>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Estimated Weight (kg)</Label>
              <Input
                type="number"
                placeholder="e.g. 5.5"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                min="0.1"
                step="0.1"
                className="min-h-[48px] text-base"
                inputMode="decimal"
              />
            </div>

            {activeCategory && weight && parseFloat(weight) > 0 && rate && (
              <div className="p-4 rounded-xl bg-primary-light border border-primary/20">
                <p className="text-sm text-muted-foreground">Estimated Price</p>
                <p className="font-heading text-2xl font-bold text-primary mt-1">₹{estimatedPrice.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeCategory.name} × {weight} kg × ₹{rate.pricePerKg}/kg
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-foreground text-lg">Schedule Pickup</h2>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {days.map((day: Date) => {
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border-2 min-w-[60px] transition-all ${
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <span className={`text-xs font-medium ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {isToday ? 'Today' : day.toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                      <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {day.getDate()}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {day.toLocaleDateString('en', { month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Time Slot</Label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedSlot === slot.id ? 'border-primary bg-primary-light' : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <p className={`text-sm font-medium ${selectedSlot === slot.id ? 'text-primary' : 'text-foreground'}`}>
                      {slot.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-foreground text-lg">Confirm Booking</h2>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-primary-light">
                <p className="font-heading font-bold text-primary text-sm">Booking Summary</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup Address</p>
                    <p className="text-sm font-medium text-foreground">{selectedAddress?.addressLabel}</p>
                    <p className="text-xs text-muted-foreground">{selectedAddress?.street}, {selectedAddress?.city}</p>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Scrap Details</p>
                    <p className="text-sm font-medium text-foreground">{activeCategory?.name}</p>
                    <p className="text-xs text-muted-foreground">~{weight} kg</p>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Scheduled Time</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-muted-foreground">{TIME_SLOTS.find(s => s.id === selectedSlot)?.label}</p>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Estimated Earnings</p>
                  </div>
                  <p className="font-heading text-xl font-bold text-primary">₹{estimatedPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              * Final amount may vary based on actual weight measured at pickup
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="px-4 pb-6 pt-2 border-t border-border bg-card">
        {step < 3 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed}
            className="w-full min-h-[52px] text-base font-semibold rounded-xl"
            style={{ background: canProceed ? 'oklch(0.527 0.154 150)' : undefined }}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={createBooking.isPending || addBookingItem.isPending}
            className="w-full min-h-[52px] text-base font-semibold rounded-xl"
            style={{ background: 'oklch(0.527 0.154 150)' }}
          >
            {createBooking.isPending || addBookingItem.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Confirming...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Confirm Booking
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
