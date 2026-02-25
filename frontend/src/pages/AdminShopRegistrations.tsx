import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Recycle,
  ChevronLeft,
  Search,
  Store,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllScrapShops, useUpdateScrapShopStatus } from '../hooks/useQueries';
import { ScrapShopStatus, type ScrapShop } from '../backend';
import { toast } from 'sonner';

const ADMIN_HEADER_GRADIENT = 'linear-gradient(135deg, oklch(0.35 0.12 150) 0%, oklch(0.25 0.10 200) 100%)';

type FilterType = 'all' | ScrapShopStatus;

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
  mw: 'Marwadi',
};

function getLanguageLabel(lang: ScrapShop['preferredLanguage']): string {
  if (lang.__kind__ === 'other') return lang.other;
  return LANGUAGE_LABELS[lang.__kind__] || lang.__kind__;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_CONFIG = {
  [ScrapShopStatus.pending]: {
    label: 'Pending',
    icon: Clock,
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  [ScrapShopStatus.approved]: {
    label: 'Approved',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  [ScrapShopStatus.rejected]: {
    label: 'Rejected',
    icon: XCircle,
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

function ShopCard({ shop }: { shop: ScrapShop }) {
  const updateStatus = useUpdateScrapShopStatus();
  const cfg = STATUS_CONFIG[shop.registrationStatus];
  const StatusIcon = cfg.icon;

  const handleApprove = async () => {
    try {
      await updateStatus.mutateAsync({ id: shop.id, status: ScrapShopStatus.approved });
      toast.success(`${shop.shopName} approved`);
    } catch {
      toast.error('Failed to approve shop');
    }
  };

  const handleReject = async () => {
    try {
      await updateStatus.mutateAsync({ id: shop.id, status: ScrapShopStatus.rejected });
      toast.success(`${shop.shopName} rejected`);
    } catch {
      toast.error('Failed to reject shop');
    }
  };

  const isPending = shop.registrationStatus === ScrapShopStatus.pending;
  const isActing = updateStatus.isPending;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Store className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm text-foreground leading-tight">{shop.shopName}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.badgeClass}`}>
              <StatusIcon className="w-3 h-3" />
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{shop.ownerName}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{shop.phone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{shop.city}, {shop.area}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{formatDate(shop.registeredAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">Lang:</span>
          <span>{getLanguageLabel(shop.preferredLanguage)}</span>
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
        {shop.streetAddress}, {shop.area}, {shop.city} – {shop.pincode}
      </p>

      {/* Categories */}
      {shop.scrapCategoriesHandled.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {shop.scrapCategoriesHandled.map((catId) => (
            <span
              key={catId.toString()}
              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
            >
              Cat #{catId.toString()}
            </span>
          ))}
        </div>
      )}

      {/* Email */}
      {shop.email && (
        <p className="text-xs text-muted-foreground">✉ {shop.email}</p>
      )}

      {/* Actions for pending */}
      {isPending && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleApprove}
            disabled={isActing}
          >
            {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleReject}
            disabled={isActing}
          >
            {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminShopRegistrations() {
  const navigate = useNavigate();
  const { data: shops = [], isLoading } = useGetAllScrapShops();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = shops.filter((shop) => {
    const matchesFilter =
      filter === 'all' || shop.registrationStatus === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      shop.shopName.toLowerCase().includes(q) ||
      shop.phone.toLowerCase().includes(q) ||
      shop.city.toLowerCase().includes(q) ||
      shop.ownerName.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: shops.length,
    [ScrapShopStatus.pending]: shops.filter((s) => s.registrationStatus === ScrapShopStatus.pending).length,
    [ScrapShopStatus.approved]: shops.filter((s) => s.registrationStatus === ScrapShopStatus.approved).length,
    [ScrapShopStatus.rejected]: shops.filter((s) => s.registrationStatus === ScrapShopStatus.rejected).length,
  };

  const filterOptions: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: ScrapShopStatus.pending, label: 'Pending', count: counts[ScrapShopStatus.pending] },
    { key: ScrapShopStatus.approved, label: 'Approved', count: counts[ScrapShopStatus.approved] },
    { key: ScrapShopStatus.rejected, label: 'Rejected', count: counts[ScrapShopStatus.rejected] },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-8" style={{ background: ADMIN_HEADER_GRADIENT }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate({ to: '/admin' })}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Recycle className="w-6 h-6 text-white" />
            <span className="text-white font-heading font-bold text-lg">Admin Panel</span>
          </div>
        </div>
        <h1 className="text-white font-heading font-bold text-xl leading-tight">Shop Registrations</h1>
        <p className="text-white/70 text-sm mt-1">Review and manage scrap shop applications</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shop, phone, city…"
            className="pl-9"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                filter === opt.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary/50'
              }`}
            >
              {opt.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === opt.key ? 'bg-white/20' : 'bg-muted'
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <Store className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No registrations found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center pb-4">
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
