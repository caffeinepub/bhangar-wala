import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Recycle, ChevronLeft, Clock, CheckCircle2, XCircle, Globe, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetScrapShopByPhone } from '../hooks/useQueries';
import { ScrapShopStatus } from '../backend';

type LangCode = 'en' | 'hi' | 'mr' | 'gu' | 'mw';

const LANGUAGES: { code: LangCode; native: string }[] = [
  { code: 'en', native: 'English' },
  { code: 'hi', native: 'हिंदी' },
  { code: 'mr', native: 'मराठी' },
  { code: 'gu', native: 'ગુજરાતી' },
  { code: 'mw', native: 'मारवाड़ी' },
];

type StatusTranslations = {
  pageTitle: string;
  registeredOn: string;
  statusLabel: string;
  pending: string;
  approved: string;
  rejected: string;
  pendingNote: string;
  approvedNote: string;
  rejectedNote: string;
  goHome: string;
  reRegister: string;
  noShop: string;
  noShopSub: string;
  registerNow: string;
  preferredLanguage: string;
};

const T: Record<LangCode, StatusTranslations> = {
  en: {
    pageTitle: 'Registration Status',
    registeredOn: 'Registered on',
    statusLabel: 'Status',
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    pendingNote: 'Your registration is under review. Our team will verify your details within 24–48 hours.',
    approvedNote: 'Congratulations! Your shop has been approved. You are now a verified Bhangar Wala dealer.',
    rejectedNote: 'Your registration was not approved. Please re-register with correct details.',
    goHome: 'Go to Home',
    reRegister: 'Re-register',
    noShop: 'No Registration Found',
    noShopSub: 'You have not registered your scrap shop yet.',
    registerNow: 'Register Now',
    preferredLanguage: 'Language',
  },
  hi: {
    pageTitle: 'रजिस्ट्रेशन स्थिति',
    registeredOn: 'रजिस्ट्रेशन तिथि',
    statusLabel: 'स्थिति',
    pending: 'समीक्षाधीन',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    pendingNote: 'आपका रजिस्ट्रेशन समीक्षाधीन है। हमारी टीम 24–48 घंटों में आपके विवरण की जांच करेगी।',
    approvedNote: 'बधाई हो! आपकी दुकान स्वीकृत हो गई है। आप अब एक सत्यापित भंगार वाला डीलर हैं।',
    rejectedNote: 'आपका रजिस्ट्रेशन स्वीकृत नहीं हुआ। कृपया सही विवरण के साथ पुनः रजिस्टर करें।',
    goHome: 'होम पर जाएं',
    reRegister: 'पुनः रजिस्टर करें',
    noShop: 'कोई रजिस्ट्रेशन नहीं मिला',
    noShopSub: 'आपने अभी तक अपनी कबाड़ दुकान रजिस्टर नहीं की है।',
    registerNow: 'अभी रजिस्टर करें',
    preferredLanguage: 'भाषा',
  },
  mr: {
    pageTitle: 'नोंदणी स्थिती',
    registeredOn: 'नोंदणी तारीख',
    statusLabel: 'स्थिती',
    pending: 'पुनरावलोकनाधीन',
    approved: 'मंजूर',
    rejected: 'नाकारले',
    pendingNote: 'तुमची नोंदणी पुनरावलोकनाधीन आहे. आमची टीम 24–48 तासांत तुमचे तपशील तपासेल.',
    approvedNote: 'अभिनंदन! तुमची दुकान मंजूर झाली आहे. तुम्ही आता एक सत्यापित भंगार वाला डीलर आहात.',
    rejectedNote: 'तुमची नोंदणी मंजूर झाली नाही. कृपया योग्य तपशीलांसह पुन्हा नोंदणी करा.',
    goHome: 'होमवर जा',
    reRegister: 'पुन्हा नोंदणी करा',
    noShop: 'कोणतीही नोंदणी आढळली नाही',
    noShopSub: 'तुम्ही अद्याप तुमची भंगार दुकान नोंदणी केलेली नाही.',
    registerNow: 'आता नोंदणी करा',
    preferredLanguage: 'भाषा',
  },
  gu: {
    pageTitle: 'નોંધણી સ્થિતિ',
    registeredOn: 'નોંધણી તારીખ',
    statusLabel: 'સ્થિતિ',
    pending: 'સમીક્ષા હેઠળ',
    approved: 'મંજૂર',
    rejected: 'નામંજૂર',
    pendingNote: 'તમારી નોંધણી સમીક્ષા હેઠળ છે. અમારી ટીમ 24–48 કલાકમાં તમારી વિગતો ચકાસશે.',
    approvedNote: 'અભિનંદન! તમારી દુકાન મંજૂર થઈ ગઈ છે. તમે હવે ચકાસાયેલ ભંગાર વાળા ડીલર છો.',
    rejectedNote: 'તમારી નોંધણી મંજૂર થઈ નથી. કૃપા કરીને સાચી વિગતો સાથે ફરીથી નોંધણી કરો.',
    goHome: 'હોમ પર જાઓ',
    reRegister: 'ફરીથી નોંધણી કરો',
    noShop: 'કોઈ નોંધણી મળી નથી',
    noShopSub: 'તમે હજી સુધી તમારી ભંગાર દુકાન નોંધણી કરી નથી.',
    registerNow: 'હવે નોંધણી કરો',
    preferredLanguage: 'ભાષા',
  },
  mw: {
    pageTitle: 'रजिस्ट्रेशन री स्थिति',
    registeredOn: 'रजिस्ट्रेशन री तारीख',
    statusLabel: 'स्थिति',
    pending: 'समीक्षाधीन',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    pendingNote: 'आपणी रजिस्ट्रेशन समीक्षाधीन है। म्हारी टीम 24–48 घंटां में आपणी जानकारी जांचेगी।',
    approvedNote: 'बधाई हो! आपणी दुकान स्वीकृत हो गई है। आप अब एक प्रमाणित भंगार वाला डीलर हो।',
    rejectedNote: 'आपणी रजिस्ट्रेशन स्वीकृत नहीं हुई। कृपया सही जानकारी के साथ फिर से रजिस्टर करो।',
    goHome: 'होम पर जाओ',
    reRegister: 'फिर से रजिस्टर करो',
    noShop: 'कोई रजिस्ट्रेशन नहीं मिली',
    noShopSub: 'आपणे अभी तक आपणी भंगार दुकान रजिस्टर नहीं करी है।',
    registerNow: 'अभी रजिस्टर करो',
    preferredLanguage: 'भाषा',
  },
};

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ShopRegisterStatus() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<LangCode>('en');
  const t = T[lang];

  const phone = (() => {
    try {
      return localStorage.getItem('bw_phone') || localStorage.getItem('userPhone') || '';
    } catch {
      return '';
    }
  })();

  const { data: shop, isLoading } = useGetScrapShopByPhone(phone);

  const statusConfig = {
    [ScrapShopStatus.pending]: {
      label: t.pending,
      note: t.pendingNote,
      icon: Clock,
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      iconClass: 'text-amber-500',
      bgClass: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
    },
    [ScrapShopStatus.approved]: {
      label: t.approved,
      note: t.approvedNote,
      icon: CheckCircle2,
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      iconClass: 'text-emerald-500',
      bgClass: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800',
    },
    [ScrapShopStatus.rejected]: {
      label: t.rejected,
      note: t.rejectedNote,
      icon: XCircle,
      badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      iconClass: 'text-red-500',
      bgClass: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
    },
  };

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
        <h1 className="text-white font-heading font-bold text-xl">{t.pageTitle}</h1>
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

      <div className="flex-1 px-4 py-6 space-y-5">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : !shop ? (
          /* No shop found */
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Store className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold font-heading text-foreground">{t.noShop}</h2>
            <p className="text-muted-foreground text-sm">{t.noShopSub}</p>
            <Button onClick={() => navigate({ to: '/shop-register' })} className="mt-2">
              {t.registerNow}
            </Button>
          </div>
        ) : (
          <>
            {/* Shop Info Card */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg font-heading text-foreground leading-tight">
                    {shop.shopName}
                  </h2>
                  <p className="text-sm text-muted-foreground">{shop.ownerName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {shop.area}, {shop.city} – {shop.pincode}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {t.registeredOn}: {formatDate(shop.registeredAt)}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    statusConfig[shop.registrationStatus].badgeClass
                  }`}
                >
                  {statusConfig[shop.registrationStatus].label}
                </span>
              </div>
            </div>

            {/* Status Detail Card */}
            {(() => {
              const cfg = statusConfig[shop.registrationStatus];
              const Icon = cfg.icon;
              return (
                <div className={`rounded-2xl border p-4 space-y-3 ${cfg.bgClass}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${cfg.iconClass}`} />
                    <p className="text-sm font-medium text-foreground leading-relaxed">{cfg.note}</p>
                  </div>
                  {shop.registrationStatus === ScrapShopStatus.approved && (
                    <Button
                      className="w-full"
                      onClick={() => navigate({ to: '/home' })}
                    >
                      {t.goHome}
                    </Button>
                  )}
                  {shop.registrationStatus === ScrapShopStatus.rejected && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate({ to: '/shop-register' })}
                    >
                      {t.reRegister}
                    </Button>
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center pb-6 px-4">
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
  );
}
