import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Recycle, ChevronLeft, CheckCircle2, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRegisterScrapShop, useGetScrapCategories } from '../hooks/useQueries';

type LangCode = 'en' | 'hi' | 'mr' | 'gu' | 'mw';

const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mw', label: 'Marwadi', native: 'मारवाड़ी' },
];

type Translations = {
  title: string;
  subtitle: string;
  ownerName: string;
  ownerNamePlaceholder: string;
  shopName: string;
  shopNamePlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  city: string;
  cityPlaceholder: string;
  area: string;
  areaPlaceholder: string;
  pincode: string;
  pincodePlaceholder: string;
  streetAddress: string;
  streetAddressPlaceholder: string;
  scrapCategories: string;
  preferredLanguage: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successMessage: string;
  viewStatus: string;
  required: string;
  invalidPhone: string;
  invalidPincode: string;
  selectCategory: string;
  loadingCategories: string;
};

const T: Record<LangCode, Translations> = {
  en: {
    title: 'Register Your Scrap Shop',
    subtitle: 'Join Bhangar Wala network as a verified scrap dealer',
    ownerName: 'Owner Name',
    ownerNamePlaceholder: 'Enter owner full name',
    shopName: 'Shop Name',
    shopNamePlaceholder: 'Enter shop / business name',
    phone: 'Phone Number',
    phonePlaceholder: '+91 XXXXX XXXXX',
    email: 'Email (Optional)',
    emailPlaceholder: 'shop@example.com',
    city: 'City',
    cityPlaceholder: 'e.g. Mumbai',
    area: 'Area / Locality',
    areaPlaceholder: 'e.g. Andheri West',
    pincode: 'Pincode',
    pincodePlaceholder: '6-digit pincode',
    streetAddress: 'Street Address',
    streetAddressPlaceholder: 'Shop no., building, street name',
    scrapCategories: 'Scrap Categories Handled',
    preferredLanguage: 'Preferred Language',
    submit: 'Submit Registration',
    submitting: 'Submitting…',
    successTitle: 'Registration Submitted!',
    successMessage: 'Your shop registration is under review. You will be notified within 24–48 hours.',
    viewStatus: 'View Status',
    required: 'This field is required',
    invalidPhone: 'Enter a valid 10-digit phone number',
    invalidPincode: 'Enter a valid 6-digit pincode',
    selectCategory: 'Select at least one category',
    loadingCategories: 'Loading categories…',
  },
  hi: {
    title: 'अपनी कबाड़ दुकान रजिस्टर करें',
    subtitle: 'भंगार वाला नेटवर्क में एक सत्यापित कबाड़ डीलर के रूप में जुड़ें',
    ownerName: 'मालिक का नाम',
    ownerNamePlaceholder: 'मालिक का पूरा नाम दर्ज करें',
    shopName: 'दुकान का नाम',
    shopNamePlaceholder: 'दुकान / व्यवसाय का नाम दर्ज करें',
    phone: 'फोन नंबर',
    phonePlaceholder: '+91 XXXXX XXXXX',
    email: 'ईमेल (वैकल्पिक)',
    emailPlaceholder: 'shop@example.com',
    city: 'शहर',
    cityPlaceholder: 'जैसे मुंबई',
    area: 'क्षेत्र / मोहल्ला',
    areaPlaceholder: 'जैसे अंधेरी वेस्ट',
    pincode: 'पिनकोड',
    pincodePlaceholder: '6 अंकों का पिनकोड',
    streetAddress: 'सड़क का पता',
    streetAddressPlaceholder: 'दुकान नं., इमारत, सड़क का नाम',
    scrapCategories: 'संभाले जाने वाले कबाड़ की श्रेणियाँ',
    preferredLanguage: 'पसंदीदा भाषा',
    submit: 'रजिस्ट्रेशन जमा करें',
    submitting: 'जमा हो रहा है…',
    successTitle: 'रजिस्ट्रेशन जमा हो गया!',
    successMessage: 'आपकी दुकान का रजिस्ट्रेशन समीक्षाधीन है। 24–48 घंटों में सूचित किया जाएगा।',
    viewStatus: 'स्थिति देखें',
    required: 'यह फ़ील्ड आवश्यक है',
    invalidPhone: 'वैध 10 अंकों का फोन नंबर दर्ज करें',
    invalidPincode: 'वैध 6 अंकों का पिनकोड दर्ज करें',
    selectCategory: 'कम से कम एक श्रेणी चुनें',
    loadingCategories: 'श्रेणियाँ लोड हो रही हैं…',
  },
  mr: {
    title: 'तुमची भंगार दुकान नोंदणी करा',
    subtitle: 'भंगार वाला नेटवर्कमध्ये सत्यापित भंगार डीलर म्हणून सामील व्हा',
    ownerName: 'मालकाचे नाव',
    ownerNamePlaceholder: 'मालकाचे पूर्ण नाव प्रविष्ट करा',
    shopName: 'दुकानाचे नाव',
    shopNamePlaceholder: 'दुकान / व्यवसायाचे नाव प्रविष्ट करा',
    phone: 'फोन नंबर',
    phonePlaceholder: '+91 XXXXX XXXXX',
    email: 'ईमेल (पर्यायी)',
    emailPlaceholder: 'shop@example.com',
    city: 'शहर',
    cityPlaceholder: 'उदा. मुंबई',
    area: 'परिसर / वस्ती',
    areaPlaceholder: 'उदा. अंधेरी वेस्ट',
    pincode: 'पिनकोड',
    pincodePlaceholder: '6 अंकी पिनकोड',
    streetAddress: 'रस्त्याचा पत्ता',
    streetAddressPlaceholder: 'दुकान क्र., इमारत, रस्त्याचे नाव',
    scrapCategories: 'हाताळल्या जाणाऱ्या भंगाराच्या श्रेणी',
    preferredLanguage: 'पसंतीची भाषा',
    submit: 'नोंदणी सादर करा',
    submitting: 'सादर होत आहे…',
    successTitle: 'नोंदणी सादर झाली!',
    successMessage: 'तुमच्या दुकानाची नोंदणी पुनरावलोकनाधीन आहे. 24–48 तासांत कळवले जाईल.',
    viewStatus: 'स्थिती पहा',
    required: 'हे फील्ड आवश्यक आहे',
    invalidPhone: 'वैध 10 अंकी फोन नंबर प्रविष्ट करा',
    invalidPincode: 'वैध 6 अंकी पिनकोड प्रविष्ट करा',
    selectCategory: 'किमान एक श्रेणी निवडा',
    loadingCategories: 'श्रेणी लोड होत आहेत…',
  },
  gu: {
    title: 'તમારી ભંગાર દુકાન નોંધણી કરો',
    subtitle: 'ભંગાર વાળા નેટવર્કમાં ચકાસાયેલ ભંગાર ડીલર તરીકે જોડાઓ',
    ownerName: 'માલિકનું નામ',
    ownerNamePlaceholder: 'માલિકનું પૂરું નામ દાખલ કરો',
    shopName: 'દુકાનનું નામ',
    shopNamePlaceholder: 'દુકાન / વ્યવસાયનું નામ દાખલ કરો',
    phone: 'ફોન નંબર',
    phonePlaceholder: '+91 XXXXX XXXXX',
    email: 'ઈમેઈલ (વૈકલ્પિક)',
    emailPlaceholder: 'shop@example.com',
    city: 'શહેર',
    cityPlaceholder: 'દા.ત. મુંબઈ',
    area: 'વિસ્તાર / મહોલ્લો',
    areaPlaceholder: 'દા.ત. અંધેરી વેસ્ટ',
    pincode: 'પિનકોડ',
    pincodePlaceholder: '6 અંકનો પિનકોડ',
    streetAddress: 'શેરી સરનામું',
    streetAddressPlaceholder: 'દુકાન નં., ઇમારત, શેરીનું નામ',
    scrapCategories: 'સંભાળવામાં આવતી ભંગારની શ્રેણીઓ',
    preferredLanguage: 'પ્રિય ભાષા',
    submit: 'નોંધણી સબમિટ કરો',
    submitting: 'સબમિટ થઈ રહ્યું છે…',
    successTitle: 'નોંધણી સબમિટ થઈ!',
    successMessage: 'તમારી દુકાનની નોંધણી સમીક્ષા હેઠળ છે. 24–48 કલાકમાં જાણ કરવામાં આવશે.',
    viewStatus: 'સ્થિતિ જુઓ',
    required: 'આ ફીલ્ડ જરૂરી છે',
    invalidPhone: 'માન્ય 10 અંકનો ફોન નંબર દાખલ કરો',
    invalidPincode: 'માન્ય 6 અંકનો પિનકોડ દાખલ કરો',
    selectCategory: 'ઓછામાં ઓછી એક શ્રેણી પસંદ કરો',
    loadingCategories: 'શ્રેણીઓ લોડ થઈ રહી છે…',
  },
  mw: {
    title: 'आपणी भंगार दुकान रजिस्टर करो',
    subtitle: 'भंगार वाला नेटवर्क में एक प्रमाणित भंगार डीलर के रूप में जुड़ो',
    ownerName: 'मालिक रो नाम',
    ownerNamePlaceholder: 'मालिक रो पूरो नाम भरो',
    shopName: 'दुकान रो नाम',
    shopNamePlaceholder: 'दुकान / धंधो रो नाम भरो',
    phone: 'फोन नंबर',
    phonePlaceholder: '+91 XXXXX XXXXX',
    email: 'ईमेल (वैकल्पिक)',
    emailPlaceholder: 'shop@example.com',
    city: 'शहर',
    cityPlaceholder: 'जियां मुंबई',
    area: 'इलाको / मोहल्लो',
    areaPlaceholder: 'जियां अंधेरी वेस्ट',
    pincode: 'पिनकोड',
    pincodePlaceholder: '6 अंकां रो पिनकोड',
    streetAddress: 'सड़क रो पतो',
    streetAddressPlaceholder: 'दुकान नं., इमारत, सड़क रो नाम',
    scrapCategories: 'संभाळी जाणी भंगार री श्रेणियां',
    preferredLanguage: 'पसंदीदा भाषा',
    submit: 'रजिस्ट्रेशन जमा करो',
    submitting: 'जमा हो रह्यो है…',
    successTitle: 'रजिस्ट्रेशन जमा हो गयो!',
    successMessage: 'आपणी दुकान री रजिस्ट्रेशन समीक्षाधीन है। 24–48 घंटां में बताया जावेगो।',
    viewStatus: 'स्थिति देखो',
    required: 'यो फ़ील्ड जरूरी है',
    invalidPhone: 'सही 10 अंकां रो फोन नंबर भरो',
    invalidPincode: 'सही 6 अंकां रो पिनकोड भरो',
    selectCategory: 'कम से कम एक श्रेणी चुणो',
    loadingCategories: 'श्रेणियां लोड हो रही हैं…',
  },
};

// Category name translations for common scrap categories
const CATEGORY_TRANSLATIONS: Record<LangCode, Record<string, string>> = {
  en: {},
  hi: {
    Paper: 'कागज़',
    Metal: 'धातु',
    Plastic: 'प्लास्टिक',
    Electronics: 'इलेक्ट्रॉनिक्स',
    Newspaper: 'अखबार',
    Cardboard: 'गत्ता',
    Iron: 'लोहा',
    Copper: 'तांबा',
    'PET Bottles': 'पीईटी बोतलें',
    'Hard Plastic': 'कठोर प्लास्टिक',
    Mobile: 'मोबाइल',
    Laptop: 'लैपटॉप',
  },
  mr: {
    Paper: 'कागद',
    Metal: 'धातू',
    Plastic: 'प्लास्टिक',
    Electronics: 'इलेक्ट्रॉनिक्स',
    Newspaper: 'वर्तमानपत्र',
    Cardboard: 'पुठ्ठा',
    Iron: 'लोखंड',
    Copper: 'तांबे',
    'PET Bottles': 'पीईटी बाटल्या',
    'Hard Plastic': 'कठीण प्लास्टिक',
    Mobile: 'मोबाइल',
    Laptop: 'लॅपटॉप',
  },
  gu: {
    Paper: 'કાગળ',
    Metal: 'ધાતુ',
    Plastic: 'પ્લાસ્ટિક',
    Electronics: 'ઇલેક્ટ્રોનિક્સ',
    Newspaper: 'છાપું',
    Cardboard: 'પૂઠું',
    Iron: 'લોખંડ',
    Copper: 'તાંબુ',
    'PET Bottles': 'પીઈટી બોટલ',
    'Hard Plastic': 'સખત પ્લાસ્ટિક',
    Mobile: 'મોબાઇલ',
    Laptop: 'લેપટોપ',
  },
  mw: {
    Paper: 'कागज',
    Metal: 'धातु',
    Plastic: 'प्लास्टिक',
    Electronics: 'इलेक्ट्रॉनिक्स',
    Newspaper: 'अखबार',
    Cardboard: 'गत्तो',
    Iron: 'लोहो',
    Copper: 'तांबो',
    'PET Bottles': 'पीईटी बोतलां',
    'Hard Plastic': 'कठोर प्लास्टिक',
    Mobile: 'मोबाइल',
    Laptop: 'लैपटॉप',
  },
};

function getCategoryName(name: string, lang: LangCode): string {
  if (lang === 'en') return name;
  return CATEGORY_TRANSLATIONS[lang][name] || name;
}

interface FormErrors {
  ownerName?: string;
  shopName?: string;
  phone?: string;
  city?: string;
  area?: string;
  pincode?: string;
  streetAddress?: string;
  scrapCategories?: string;
}

export default function ShopRegister() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<LangCode>('en');
  const t = T[lang];

  const { data: categories = [], isLoading: categoriesLoading } = useGetScrapCategories();
  const registerMutation = useRegisterScrapShop();

  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState(() => {
    try {
      const stored = localStorage.getItem('bw_phone') || localStorage.getItem('userPhone') || '';
      return stored;
    } catch {
      return '';
    }
  });
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!ownerName.trim()) newErrors.ownerName = t.required;
    if (!shopName.trim()) newErrors.shopName = t.required;
    if (!phone.trim() || !/^\+?[0-9]{10,13}$/.test(phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = t.invalidPhone;
    }
    if (!city.trim()) newErrors.city = t.required;
    if (!area.trim()) newErrors.area = t.required;
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      newErrors.pincode = t.invalidPincode;
    }
    if (!streetAddress.trim()) newErrors.streetAddress = t.required;
    if (selectedCategories.size === 0) newErrors.scrapCategories = t.selectCategory;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryToggle = (id: number) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (errors.scrapCategories) {
      setErrors((e) => ({ ...e, scrapCategories: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await registerMutation.mutateAsync({
        ownerName: ownerName.trim(),
        shopName: shopName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        area: area.trim(),
        pincode: pincode.trim(),
        streetAddress: streetAddress.trim(),
        scrapCategoriesHandled: Array.from(selectedCategories).map((id) => BigInt(id)),
        rawLanguage: lang,
      });
      setSubmitted(true);
    } catch {
      // error handled by mutation state
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-foreground">{t.successTitle}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{t.successMessage}</p>
          <Button
            className="w-full mt-4"
            onClick={() => navigate({ to: '/shop-register/status' })}
          >
            {t.viewStatus}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-6 pb-8"
        style={{ background: 'linear-gradient(135deg, oklch(0.35 0.14 150) 0%, oklch(0.28 0.10 180) 100%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate({ to: '/home' })}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Recycle className="w-6 h-6 text-white" />
            <span className="text-white font-heading font-bold text-lg">Bhangar Wala</span>
          </div>
        </div>
        <h1 className="text-white font-heading font-bold text-xl leading-tight">{t.title}</h1>
        <p className="text-white/70 text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Language Selector */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t.preferredLanguage}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                lang === l.code
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary/50'
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-4 py-5 space-y-5 pb-10">
        {/* Owner Name */}
        <div className="space-y-1.5">
          <Label htmlFor="ownerName" className="text-sm font-medium">
            {t.ownerName} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ownerName"
            value={ownerName}
            onChange={(e) => {
              setOwnerName(e.target.value);
              if (errors.ownerName) setErrors((er) => ({ ...er, ownerName: undefined }));
            }}
            placeholder={t.ownerNamePlaceholder}
            className={errors.ownerName ? 'border-destructive' : ''}
          />
          {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName}</p>}
        </div>

        {/* Shop Name */}
        <div className="space-y-1.5">
          <Label htmlFor="shopName" className="text-sm font-medium">
            {t.shopName} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="shopName"
            value={shopName}
            onChange={(e) => {
              setShopName(e.target.value);
              if (errors.shopName) setErrors((er) => ({ ...er, shopName: undefined }));
            }}
            placeholder={t.shopNamePlaceholder}
            className={errors.shopName ? 'border-destructive' : ''}
          />
          {errors.shopName && <p className="text-xs text-destructive">{errors.shopName}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium">
            {t.phone} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((er) => ({ ...er, phone: undefined }));
            }}
            placeholder={t.phonePlaceholder}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">
            {t.email}
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
          />
        </div>

        {/* City & Area */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-medium">
              {t.city} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors((er) => ({ ...er, city: undefined }));
              }}
              placeholder={t.cityPlaceholder}
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area" className="text-sm font-medium">
              {t.area} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                if (errors.area) setErrors((er) => ({ ...er, area: undefined }));
              }}
              placeholder={t.areaPlaceholder}
              className={errors.area ? 'border-destructive' : ''}
            />
            {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
          </div>
        </div>

        {/* Pincode */}
        <div className="space-y-1.5">
          <Label htmlFor="pincode" className="text-sm font-medium">
            {t.pincode} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pincode"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
              if (errors.pincode) setErrors((er) => ({ ...er, pincode: undefined }));
            }}
            placeholder={t.pincodePlaceholder}
            inputMode="numeric"
            className={errors.pincode ? 'border-destructive' : ''}
          />
          {errors.pincode && <p className="text-xs text-destructive">{errors.pincode}</p>}
        </div>

        {/* Street Address */}
        <div className="space-y-1.5">
          <Label htmlFor="streetAddress" className="text-sm font-medium">
            {t.streetAddress} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="streetAddress"
            value={streetAddress}
            onChange={(e) => {
              setStreetAddress(e.target.value);
              if (errors.streetAddress) setErrors((er) => ({ ...er, streetAddress: undefined }));
            }}
            placeholder={t.streetAddressPlaceholder}
            className={errors.streetAddress ? 'border-destructive' : ''}
          />
          {errors.streetAddress && <p className="text-xs text-destructive">{errors.streetAddress}</p>}
        </div>

        {/* Scrap Categories */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t.scrapCategories} <span className="text-destructive">*</span>
          </Label>
          {categoriesLoading ? (
            <p className="text-sm text-muted-foreground">{t.loadingCategories}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const id = Number(cat.id);
                const checked = selectedCategories.has(id);
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => handleCategoryToggle(id)}
                      className="shrink-0"
                    />
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {getCategoryName(cat.name, lang)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {errors.scrapCategories && (
            <p className="text-xs text-destructive">{errors.scrapCategories}</p>
          )}
        </div>

        {/* Submit Error */}
        {registerMutation.isError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3">
            <p className="text-sm text-destructive">
              {registerMutation.error instanceof Error
                ? registerMutation.error.message
                : 'Registration failed. Please try again.'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </Button>
      </form>
    </div>
  );
}
