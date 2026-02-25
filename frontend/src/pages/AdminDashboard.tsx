import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Package,
  Users,
  TrendingUp,
  MessageSquare,
  Star,
  Settings,
  Loader2,
  BarChart2,
  Store,
} from 'lucide-react';
import {
  useGetAllBookings,
  useGetPartners,
  useGetSupportTickets,
  BookingStatus,
} from '../hooks/useQueries';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: allBookings = [], isLoading: bookingsLoading } = useGetAllBookings();
  const { data: partners = [], isLoading: partnersLoading } = useGetPartners();
  const { data: tickets = [] } = useGetSupportTickets();

  const activeBookings = allBookings.filter(
    (ab) => ab.booking.status === BookingStatus.pending || ab.booking.status === BookingStatus.confirmed
  ).length;

  const totalRevenue = allBookings.reduce((sum, ab) => {
    const amt = ab.booking.totalFinalAmount ?? ab.booking.totalEstimatedAmount;
    return sum + amt;
  }, 0);

  const completedBookings = allBookings.filter((ab) => ab.booking.status === BookingStatus.completed).length;
  const activePartners = partners.filter((p) => p.active).length;
  const openTickets = tickets.filter((t) => t.status === 'open').length;

  const stats = [
    { label: 'Active Bookings', value: activeBookings, icon: Package, color: 'text-blue-600' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Completed', value: completedBookings, icon: BarChart2, color: 'text-purple-600' },
    { label: 'Active Partners', value: activePartners, icon: Users, color: 'text-orange-600' },
  ];

  const navCards = [
    { label: 'All Bookings', icon: Package, to: '/admin/bookings' },
    { label: 'Partners', icon: Users, to: '/admin/partners' },
    { label: 'Scrap Rates', icon: Settings, to: '/admin/rates' },
    { label: 'Support Tickets', icon: MessageSquare, to: '/admin/support-tickets', badge: openTickets > 0 ? openTickets : undefined },
    { label: 'Shop Registrations', icon: Store, to: '/admin/shop-registrations' },
    { label: 'Ratings', icon: Star, to: '/admin/ratings' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Bhangar Wala Management</p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {/* Stats */}
        {bookingsLoading || partnersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Cards */}
        <h2 className="text-base font-semibold text-foreground mb-3">Management</h2>
        <div className="grid grid-cols-2 gap-3">
          {navCards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate({ to: card.to })}
              className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/40 transition-colors relative"
            >
              <card.icon className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              {card.badge !== undefined && (
                <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {card.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
