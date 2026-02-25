import { useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  HeadphonesIcon,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Recycle,
  Store,
  ArrowLeft,
  BarChart3,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllBookings, useGetAllPartners, useGetAllSupportTickets, TicketStatus } from '../hooks/useQueries';
import { BookingStatus } from '../backend';

const ADMIN_HEADER_GRADIENT = 'linear-gradient(135deg, oklch(0.28 0.10 150) 0%, oklch(0.20 0.08 200) 100%)';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3 shadow-xs">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold font-heading text-foreground leading-tight">{value}</p>
        )}
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function NavCard({
  icon: Icon,
  label,
  description,
  path,
  color,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  color: string;
  badge?: string | number;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate({ to: path })}
      className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-3 text-left hover:bg-muted/40 active:scale-[0.98] transition-all shadow-xs"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {badge !== undefined && badge !== 0 && (
        <span className="bg-accent text-accent-foreground text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5 shrink-0">
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: allBookings = [], isLoading: bookingsLoading } = useGetAllBookings();
  const { data: allPartners = [], isLoading: partnersLoading } = useGetAllPartners();
  const { data: allTickets = [], isLoading: ticketsLoading } = useGetAllSupportTickets();

  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(
    (ab) => ab.booking.status === BookingStatus.pending || ab.booking.status === BookingStatus.confirmed
  ).length;
  const activePartners = allPartners.filter((p) => p.active).length;
  const totalRevenue = allBookings.reduce((sum, ab) => {
    const amt = ab.booking.totalFinalAmount ?? ab.booking.totalEstimatedAmount;
    return sum + amt;
  }, 0);
  const openTickets = allTickets.filter((t) => t.status === TicketStatus.open).length;
  const completedBookings = allBookings.filter((ab) => ab.booking.status === BookingStatus.completed).length;

  const isLoading = bookingsLoading || partnersLoading || ticketsLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-10" style={{ background: ADMIN_HEADER_GRADIENT }}>
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate({ to: '/home' })}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Bhangar Wala</p>
              <h1 className="font-heading text-lg font-bold text-white leading-tight">Admin Panel</h1>
            </div>
          </div>
        </div>

        {/* Overview pill */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
          <BarChart3 className="w-4 h-4 text-emerald-300" />
          <span className="text-white/90 text-sm font-medium">Dashboard Overview</span>
          {isLoading && (
            <span className="ml-auto w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 -mt-4">
        {/* Stats Grid */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Summary</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={CalendarCheck}
              label="Total Bookings"
              value={totalBookings}
              sub="All time"
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              isLoading={bookingsLoading}
            />
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={isLoading ? '—' : `₹${totalRevenue.toFixed(0)}`}
              sub="Estimated"
              color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              isLoading={bookingsLoading}
            />
            <StatCard
              icon={Users}
              label="Active Partners"
              value={`${activePartners}/${allPartners.length}`}
              sub="Online now"
              color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              isLoading={partnersLoading}
            />
            <StatCard
              icon={Clock}
              label="Pending Bookings"
              value={pendingBookings}
              sub="Needs action"
              color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
              isLoading={bookingsLoading}
            />
          </div>
        </div>

        {/* Extra stats row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={completedBookings}
            sub="Bookings"
            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            isLoading={bookingsLoading}
          />
          <StatCard
            icon={HeadphonesIcon}
            label="Open Tickets"
            value={openTickets}
            sub="Support"
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            isLoading={ticketsLoading}
          />
        </div>

        {/* Navigation */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Manage</p>
          <div className="space-y-2">
            <NavCard
              icon={CalendarCheck}
              label="All Bookings"
              description="View and manage all customer bookings"
              path="/admin/bookings"
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              badge={pendingBookings > 0 ? pendingBookings : undefined}
            />
            <NavCard
              icon={Users}
              label="Partners"
              description="Add, edit, and toggle partner status"
              path="/admin/partners"
              color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            />
            <NavCard
              icon={IndianRupee}
              label="Scrap Rates"
              description="Update per-kg pricing for categories"
              path="/admin/rates"
              color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            />
            <NavCard
              icon={HeadphonesIcon}
              label="Support Tickets"
              description="Review and resolve customer tickets"
              path="/admin/support-tickets"
              color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              badge={openTickets > 0 ? openTickets : undefined}
            />
            <NavCard
              icon={Store}
              label="Shop Registrations"
              description="Review and approve scrap shop applications"
              path="/admin/shop-registrations"
              color="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
            />
          </div>
        </div>

        {/* Quick info banner */}
        <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 flex items-start gap-3">
          <LayoutDashboard className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            You are viewing the <span className="font-semibold text-foreground">Admin Panel</span>. Changes made here affect all users in real time.
          </p>
        </div>

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
