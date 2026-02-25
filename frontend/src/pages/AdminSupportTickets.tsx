import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, HeadphonesIcon, CheckCircle2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useGetAllSupportTickets, useUpdateSupportTicketStatus, TicketStatus } from '../hooks/useQueries';
import type { SupportTicket } from '../hooks/useQueries';

function formatRelativeTime(ts: bigint): string {
  const now = Date.now();
  const ticketMs = Number(ts) / 1_000_000;
  const diffMs = now - ticketMs;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(ticketMs).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function TicketCard({
  ticket,
  onToggle,
  isToggling,
}: {
  ticket: SupportTicket;
  onToggle: (id: bigint, current: TicketStatus) => void;
  isToggling: boolean;
}) {
  const isResolved = ticket.status === TicketStatus.resolved;

  return (
    <div className={`bg-card rounded-2xl border p-4 transition-all ${isResolved ? 'border-border opacity-70' : 'border-primary/30'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isResolved ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isResolved
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {isResolved ? 'Resolved' : 'Open'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{formatRelativeTime(ticket.timestamp)}</span>
          <Switch
            checked={isResolved}
            onCheckedChange={() => onToggle(ticket.id, ticket.status)}
            disabled={isToggling}
          />
        </div>
      </div>

      <p className="font-semibold text-sm text-foreground mb-1">{ticket.subject}</p>
      <p className="text-xs text-muted-foreground line-clamp-3">{ticket.message}</p>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Ticket #{ticket.id.toString()} · User: {ticket.userId.toString().slice(0, 12)}…
        </p>
      </div>
    </div>
  );
}

export default function AdminSupportTickets() {
  const navigate = useNavigate();
  const { data: tickets = [], isLoading } = useGetAllSupportTickets();
  const updateStatus = useUpdateSupportTicketStatus();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const sorted = [...tickets].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const filtered = sorted.filter((t) => {
    if (filter === 'open') return t.status === TicketStatus.open;
    if (filter === 'resolved') return t.status === TicketStatus.resolved;
    return true;
  });

  const openCount = tickets.filter((t) => t.status === TicketStatus.open).length;

  const handleToggle = async (id: bigint, current: TicketStatus) => {
    const newStatus = current === TicketStatus.open ? TicketStatus.resolved : TicketStatus.open;
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success(`Ticket marked as ${newStatus === TicketStatus.resolved ? 'resolved' : 'open'}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update ticket');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.35 0.12 150) 0%, oklch(0.25 0.10 200) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/admin' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-white">Support Tickets</h1>
        <p className="text-white/70 text-sm">
          {openCount} open · {tickets.length} total
        </p>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Filter Chips */}
        <div className="flex gap-2">
          {(['all', 'open', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HeadphonesIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No tickets found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {filter !== 'all' ? 'Try switching the filter' : 'No support tickets yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ticket) => (
              <TicketCard
                key={ticket.id.toString()}
                ticket={ticket}
                onToggle={handleToggle}
                isToggling={updateStatus.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
