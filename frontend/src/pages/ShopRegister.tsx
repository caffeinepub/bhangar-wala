import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Store, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRegisterScrapShop } from '../hooks/useQueries';

type Language = 'en' | 'hi' | 'mr' | 'gu' | 'mw';

const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'mw', label: 'Marwadi', nativeLabel: 'मारवाड़ी' },
];

const SCRAP_CATEGORIES = [
  { id: 1, name: 'Paper' },
  { id: 2, name: 'Metal' },
  { id: 3, name: 'Plastic' },
  { id: 4, name: 'Electronics' },
  { id: 5, name: 'Newspaper' },
  { id: 6, name: 'Cardboard' },
  { id: 7, name: 'Iron' },
  { id: 8, name: 'Copper' },
  { id: 9, name: 'PET Bottles' },
  { id: 10, name: 'Hard Plastic' },
  { id: 11, name: 'Mobile' },
  { id: 12, name: 'Laptop' },
];

const TRANSLATIONS: Record<Language, {
  title: string;
  subtitle: string;
  ownerName: string;
  shopName: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  pincode: string;
  streetAddress: string;
  categories: string;
  submit: string;
  required: string;
}> = {
  en: {
    title: 'Register Your Scrap Shop',
    subtitle: 'Join our network of scrap dealers',
    ownerName: 'Owner Name',
    shopName: 'Shop Name',
    phone: 'Phone Number',
    email: 'Email (optional)',
    city: 'City',
    area: 'Area / Locality',
    pincode: 'Pincode',
    streetAddress: 'Street Address',
    categories: 'Scrap Categories Handled',
    submit: 'Register Shop',
    required: 'This field is required',
  },
  hi: {
    title: 'अपनी कबाड़ दुकान रजिस्टर करें',
    subtitle: 'हमारे कबाड़ डीलर नेटवर्क से जुड़ें',
    ownerName: 'मालिक का नाम',
    shopName: 'दुकान का नाम',
    phone: 'फोन नंबर',
    email: 'ईमेल (वैकल्पिक)',
    city: 'शहर',
    area: 'क्षेत्र / इलाका',
    pincode: 'पिनकोड',
    streetAddress: 'सड़क का पता',
    categories: 'संभाले जाने वाले कबाड़ की श्रेणियां',
    submit: 'दुकान रजिस्टर करें',
    required: 'यह फ़ील्ड आवश्यक है',
  },
  mr: {
    title: 'तुमची भंगार दुकान नोंदवा',
    subtitle: 'आमच्या भंगार डीलर नेटवर्कमध्ये सामील व्हा',
    ownerName: 'मालकाचे नाव',
    shopName: 'दुकानाचे नाव',
    phone: 'फोन नंबर',
    email: 'ईमेल (पर्यायी)',
    city: 'शहर',
    area: 'परिसर / वसाहत',
    pincode: 'पिनकोड',
    streetAddress: 'रस्त्याचा पत्ता',
    categories: 'हाताळल्या जाणाऱ्या भंगाराच्या श्रेणी',
    submit: 'दुकान नोंदवा',
    required: 'हे फील्ड आवश्यक आहे',
  },
  gu: {
    title: 'તમારી ભંગાર દુકાન નોંધો',
    subtitle: 'અમારા ભંગાર ડીલર નેટવર્કમાં જોડાઓ',
    ownerName: 'માલિકનું નામ',
    shopName: 'દુકાનનું નામ',
    phone: 'ફોન નંબર',
    email: 'ઈમેઈલ (વૈકલ્પિક)',
    city: 'શહેર',
    area: 'વિસ્તાર / વિભાગ',
    pincode: 'પિનકોડ',
    streetAddress: 'શેરી સરનામું',
    categories: 'સંભાળવામાં આવતી ભંગારની શ્રેણીઓ',
    submit: 'દુકાન નોંધો',
    required: 'આ ક્ષેત્ર જરૂરી છે',
  },
  mw: {
    title: 'आपणी भंगार दुकान रजिस्टर करो',
    subtitle: 'हमारा भंगार डीलर नेटवर्क में जुड़ो',
    ownerName: 'मालिक रो नाम',
    shopName: 'दुकान रो नाम',
    phone: 'फोन नंबर',
    email: 'ईमेल (वैकल्पिक)',
    city: 'शहर',
    area: 'इलाको',
    pincode: 'पिनकोड',
    streetAddress: 'गली रो पतो',
    categories: 'भंगार री श्रेणियां',
    submit: 'दुकान रजिस्टर करो',
    required: 'यो फील्ड जरूरी है',
  },
};

export default function ShopRegister() {
  const navigate = useNavigate();
  const registerShop = useRegisterScrapShop();

  const [language, setLanguage] = useState<Language>('en');
  const t = TRANSLATIONS[language];

  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState(() => {
    try {
      const session = localStorage.getItem('bhangar_auth_session');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.phone || '';
      }
    } catch {}
    return '';
  });
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function toggleCategory(id: number) {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!ownerName.trim()) newErrors.ownerName = t.required;
    if (!shopName.trim()) newErrors.shopName = t.required;
    if (!phone.trim()) newErrors.phone = t.required;
    if (!city.trim()) newErrors.city = t.required;
    if (!area.trim()) newErrors.area = t.required;
    if (!pincode.trim()) newErrors.pincode = t.required;
    if (!streetAddress.trim()) newErrors.streetAddress = t.required;
    if (selectedCategories.size === 0) newErrors.categories = t.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await registerShop.mutateAsync({
      ownerName: ownerName.trim(),
      shopName: shopName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      area: area.trim(),
      pincode: pincode.trim(),
      streetAddress: streetAddress.trim(),
      scrapCategoriesHandled: Array.from(selectedCategories),
      preferredLanguage: language,
    });

    setSubmitted(true);
    setTimeout(() => navigate({ to: '/shop-register/status' }), 1500);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <CheckCircle className="w-16 h-16 text-primary" />
        <h2 className="font-heading text-xl font-bold text-foreground text-center">Registration Submitted!</h2>
        <p className="text-muted-foreground text-center text-sm">
          Your shop registration is under review. We'll notify you once approved.
        </p>
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-white">{t.title}</h1>
            <p className="text-white/80 text-sm">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 pb-32">
        {/* Language Selector */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Language / भाषा</p>
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  language === lang.code
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:border-primary/50'
                }`}
              >
                {lang.nativeLabel}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Owner Name */}
          <div className="space-y-1.5">
            <Label>{t.ownerName} *</Label>
            <Input
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              placeholder={t.ownerName}
            />
            {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName}</p>}
          </div>

          {/* Shop Name */}
          <div className="space-y-1.5">
            <Label>{t.shopName} *</Label>
            <Input
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              placeholder={t.shopName}
            />
            {errors.shopName && <p className="text-xs text-destructive">{errors.shopName}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label>{t.phone} *</Label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              inputMode="tel"
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label>{t.email}</Label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="shop@example.com"
              type="email"
            />
          </div>

          {/* City & Area */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t.city} *</Label>
              <Input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder={t.city}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t.area} *</Label>
              <Input
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder={t.area}
              />
              {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
            </div>
          </div>

          {/* Pincode */}
          <div className="space-y-1.5">
            <Label>{t.pincode} *</Label>
            <Input
              value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="400001"
              inputMode="numeric"
            />
            {errors.pincode && <p className="text-xs text-destructive">{errors.pincode}</p>}
          </div>

          {/* Street Address */}
          <div className="space-y-1.5">
            <Label>{t.streetAddress} *</Label>
            <Textarea
              value={streetAddress}
              onChange={e => setStreetAddress(e.target.value)}
              placeholder={t.streetAddress}
              rows={2}
              className="resize-none"
            />
            {errors.streetAddress && <p className="text-xs text-destructive">{errors.streetAddress}</p>}
          </div>

          {/* Scrap Categories */}
          <div className="space-y-2">
            <Label>{t.categories} *</Label>
            <div className="grid grid-cols-2 gap-2">
              {SCRAP_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-2.5 rounded-xl border-2 text-left text-sm font-medium transition-colors ${
                    selectedCategories.has(cat.id)
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {errors.categories && <p className="text-xs text-destructive">{errors.categories}</p>}
          </div>

          <Button
            type="submit"
            className="w-full min-h-[52px] text-base font-semibold rounded-xl"
            disabled={registerShop.isPending}
          >
            {registerShop.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </span>
            ) : (
              t.submit
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
